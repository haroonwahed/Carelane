from django.shortcuts import redirect
from django.http import HttpResponseForbidden
from django.contrib import messages
from django.utils import timezone
from datetime import timedelta, date

from ..models import (
    CareCase, CaseIntakeProcess, CaseAssessment, Deadline, Workflow, PlacementRequest,
)
from ..permissions import CaseAction, can_access_case_action, can_manage_organization
from ..tenancy import scope_queryset_for_organization
from ..workflow_state_machine import resolve_actor_role
from ..workflow_bus import emit_assessment_status_changed
from ._utils import _redirect_to_safe_next_or_default

AUTO_INTAKE_TASKS = {
    CaseIntakeProcess.ProcessStatus.INTAKE: {
        'title': 'Intake afronden',
        'task_type': Deadline.TaskType.INTAKE_COMPLETE,
        'priority': Deadline.Priority.HIGH,
        'source': Deadline.GenerationSource.INTAKE,
    },
    CaseIntakeProcess.ProcessStatus.MATCHING: {
        'title': 'Match selecteren',
        'task_type': Deadline.TaskType.SELECT_MATCH,
        'priority': Deadline.Priority.URGENT,
        'source': Deadline.GenerationSource.MATCHING,
    },
}

PHASE_TO_PROCESS_STATUS = {
    CareCase.CasePhase.INTAKE: CaseIntakeProcess.ProcessStatus.INTAKE,
    CareCase.CasePhase.MATCHING: CaseIntakeProcess.ProcessStatus.MATCHING,
    CareCase.CasePhase.PROVIDER_BEOORDELING: CaseIntakeProcess.ProcessStatus.MATCHING,
    CareCase.CasePhase.PLAATSING: CaseIntakeProcess.ProcessStatus.DECISION,
    CareCase.CasePhase.ACTIEF: CaseIntakeProcess.ProcessStatus.COMPLETED,
    CareCase.CasePhase.AFGEROND: CaseIntakeProcess.ProcessStatus.COMPLETED,
}


def _intake_is_archived(intake):
    if intake is None:
        return False
    if getattr(intake, 'status', None) == CaseIntakeProcess.ProcessStatus.ARCHIVED:
        return True
    case_record = getattr(intake, 'case_record', None)
    return bool(case_record and getattr(case_record, 'lifecycle_stage', None) == 'ARCHIVED')


def _active_case_intakes_queryset(org):
    qs = scope_queryset_for_organization(CaseIntakeProcess.objects.all(), org)
    if org:
        return qs.exclude(status=CaseIntakeProcess.ProcessStatus.ARCHIVED)
    return qs.none()


def _can_archive_intake(user, intake):
    if intake is None or intake.organization is None:
        return False
    if intake.status != CaseIntakeProcess.ProcessStatus.COMPLETED:
        return False
    return can_manage_organization(user, intake.organization)


def _redirect_if_archived_intake(request, intake, fallback_url):
    if _intake_is_archived(intake):
        messages.error(request, 'Deze casus is gearchiveerd en alleen-lezen.')
        return _redirect_to_safe_next_or_default(request, fallback_url)
    return None


def _can_edit_intake(user, intake):
    if intake is None:
        return False
    if _intake_is_archived(intake):
        return False

    linked_case = intake.case_record
    if linked_case is not None:
        return can_access_case_action(user, linked_case, CaseAction.EDIT)

    if intake.organization and can_manage_organization(user, intake.organization):
        return True

    return bool(intake.case_coordinator_id and intake.case_coordinator_id == user.id)


def _require_workflow_actor_role(request, *, intake, allowed_roles: set, failure_message: str):
    actor_role = resolve_actor_role(user=request.user, organization=getattr(intake, 'organization', None))
    if actor_role not in allowed_roles:
        messages.error(request, failure_message)
        return actor_role, HttpResponseForbidden('Deze rol mag deze workflow-actie niet uitvoeren.')
    return actor_role, None


def _can_edit_assessment(user, assessment):
    if assessment is None:
        return False

    if _can_edit_intake(user, assessment.intake):
        return True

    return bool(assessment.assessed_by_id and assessment.assessed_by_id == user.id)


def _resolve_task_due_date(*, base_date=None, fallback_days=2):
    if base_date:
        return base_date
    return date.today() + timedelta(days=fallback_days)


def sync_intake_auto_tasks(process, user=None):
    task_config = AUTO_INTAKE_TASKS.get(process.status)
    auto_tasks = Deadline.objects.filter(due_diligence_process=process, auto_generated=True)

    if not task_config:
        auto_tasks.filter(is_completed=False).update(
            is_completed=True,
            completed_at=timezone.now(),
            completed_by=user,
        )
        return

    due_date = _resolve_task_due_date(
        base_date=process.target_completion_date,
        fallback_days=3,
    )

    current_task, created = Deadline.objects.get_or_create(
        due_diligence_process=process,
        auto_generated=True,
        generation_source=task_config['source'],
        task_type=task_config['task_type'],
        defaults={
            'title': task_config['title'],
            'description': f'Automatisch aangemaakt vanuit {task_config["source"].lower()} voor {process.title}.',
            'priority': task_config['priority'],
            'due_date': due_date,
            'assigned_to': process.case_coordinator,
            'created_by': user,
        },
    )

    update_fields = []
    if current_task.title != task_config['title']:
        current_task.title = task_config['title']
        update_fields.append('title')
    if current_task.priority != task_config['priority']:
        current_task.priority = task_config['priority']
        update_fields.append('priority')
    if current_task.due_date != due_date:
        current_task.due_date = due_date
        update_fields.append('due_date')
    if current_task.assigned_to_id != process.case_coordinator_id:
        current_task.assigned_to = process.case_coordinator
        update_fields.append('assigned_to')
    if update_fields:
        current_task.save(update_fields=update_fields)

    auto_tasks.exclude(pk=current_task.pk).filter(is_completed=False).update(
        is_completed=True,
        completed_at=timezone.now(),
        completed_by=user,
    )


def sync_case_phase_auto_tasks(case, user=None):
    phase_task = None
    if case.case_phase == CareCase.CasePhase.PLAATSING:
        phase_task = {
            'title': 'Plaatsing bevestigen',
            'task_type': Deadline.TaskType.CONFIRM_PLACEMENT,
            'priority': Deadline.Priority.URGENT,
            'source': Deadline.GenerationSource.PLACEMENT,
        }

    auto_tasks = Deadline.objects.filter(case_record=case, auto_generated=True)

    if not phase_task:
        auto_tasks.filter(is_completed=False).update(
            is_completed=True,
            completed_at=timezone.now(),
            completed_by=user,
        )
        return

    due_date = _resolve_task_due_date(fallback_days=1)
    current_task, created = Deadline.objects.get_or_create(
        case_record=case,
        auto_generated=True,
        generation_source=phase_task['source'],
        task_type=phase_task['task_type'],
        defaults={
            'title': phase_task['title'],
            'description': f'Automatisch aangemaakt vanuit plaatsing voor {case.title}.',
            'priority': phase_task['priority'],
            'due_date': due_date,
            'assigned_to': case.created_by,
            'created_by': user,
        },
    )

    update_fields = []
    if current_task.title != phase_task['title']:
        current_task.title = phase_task['title']
        update_fields.append('title')
    if current_task.priority != phase_task['priority']:
        current_task.priority = phase_task['priority']
        update_fields.append('priority')
    if current_task.due_date != due_date:
        current_task.due_date = due_date
        update_fields.append('due_date')
    if current_task.assigned_to_id != case.created_by_id:
        current_task.assigned_to = case.created_by
        update_fields.append('assigned_to')
    if update_fields:
        current_task.save(update_fields=update_fields)

    auto_tasks.exclude(pk=current_task.pk).filter(is_completed=False).update(
        is_completed=True,
        completed_at=timezone.now(),
        completed_by=user,
    )


def sync_automatic_deadlines_for_organization(org, user=None):
    if not org:
        return
    for process in _active_case_intakes_queryset(org).select_related('case_coordinator'):
        sync_intake_auto_tasks(process, user=user)
    for case in CareCase.objects.filter(organization=org):
        sync_case_phase_auto_tasks(case, user=user)


def _coerce_case_process_defaults(case):
    start_date = case.start_date or case.created_at.date() or date.today()
    target_date = case.end_date or start_date + timedelta(days=14)
    return {
        'organization': case.organization,
        'contract': case,
        'title': case.title,
        'status': PHASE_TO_PROCESS_STATUS.get(case.case_phase, CaseIntakeProcess.ProcessStatus.INTAKE),
        'case_coordinator': case.created_by if case.created_by_id else None,
        'start_date': start_date,
        'target_completion_date': target_date,
        'assessment_summary': case.content or '',
        'description': case.content or '',
    }


def ensure_case_flow(case, user=None):
    process = getattr(case, 'due_diligence_process', None)
    if not process:
        process = CaseIntakeProcess.objects.filter(contract=case).select_related('case_assessment').first()
    if not process:
        process = CaseIntakeProcess.objects.filter(
            organization=case.organization,
            contract__isnull=True,
            title=case.title,
        ).order_by('-updated_at').first()

    process_defaults = _coerce_case_process_defaults(case)
    if process is None:
        process = CaseIntakeProcess.objects.create(**process_defaults)
    else:
        update_fields = []
        for field_name, field_value in process_defaults.items():
            current_value = getattr(process, field_name)
            if field_name in {'assessment_summary', 'description'}:
                if current_value or not field_value:
                    continue
            elif field_name in {'case_coordinator', 'start_date', 'target_completion_date'}:
                if current_value:
                    continue
            if current_value != field_value:
                setattr(process, field_name, field_value)
                update_fields.append(field_name)
        if update_fields:
            process.save(update_fields=update_fields)

    assessment_defaults = {'assessed_by': user} if user else {}
    assessment, _ = CaseAssessment.objects.get_or_create(
        due_diligence_process=process,
        defaults=assessment_defaults,
    )

    workflow = Workflow.objects.filter(contract=case).order_by('created_at').first()
    if workflow is None:
        Workflow.objects.create(
            title=f'Matching {case.title}',
            description='Automatisch overzicht voor de casusflow.',
            contract=case,
            created_by=user or case.created_by,
        )

    return process, assessment


def sync_case_flow_state(case, user=None):
    process, assessment = ensure_case_flow(case, user=user)

    desired_process_status = PHASE_TO_PROCESS_STATUS.get(case.case_phase, CaseIntakeProcess.ProcessStatus.INTAKE)
    if process.status != desired_process_status:
        process.status = desired_process_status
        process.save(update_fields=['status'])

    assessment_changed = False
    _old_assessment_status = assessment.assessment_status
    if case.case_phase in [CareCase.CasePhase.MATCHING, CareCase.CasePhase.PLAATSING, CareCase.CasePhase.ACTIEF, CareCase.CasePhase.AFGEROND]:
        if not assessment.matching_ready:
            assessment.matching_ready = True
            assessment_changed = True
        if assessment.assessment_status == CaseAssessment.AssessmentStatus.DRAFT:
            assessment.assessment_status = CaseAssessment.AssessmentStatus.APPROVED_FOR_MATCHING
            assessment_changed = True
    elif case.case_phase == CareCase.CasePhase.PROVIDER_BEOORDELING and assessment.assessment_status == CaseAssessment.AssessmentStatus.DRAFT:
        assessment.assessment_status = CaseAssessment.AssessmentStatus.UNDER_REVIEW
        assessment_changed = True
    if assessment_changed:
        assessment.save(update_fields=['matching_ready', 'assessment_status'])
        emit_assessment_status_changed(
            assessment=assessment,
            old_status=_old_assessment_status,
            new_status=assessment.assessment_status,
        )

    placement = process.indications.order_by('-updated_at', '-created_at').first()
    if case.client_id:
        if placement is None:
            placement = PlacementRequest.objects.create(
                due_diligence_process=process,
                proposed_provider=case.client,
                selected_provider=case.client,
                status=PlacementRequest.Status.IN_REVIEW,
                provider_response_status=PlacementRequest.ProviderResponseStatus.PENDING,
                care_form=process.preferred_care_form,
                start_date=case.start_date,
                decision_notes='Automatisch gekoppeld vanuit de casusflow.',
            )
        else:
            placement_updates = []
            if placement.proposed_provider_id != case.client_id:
                placement.proposed_provider = case.client
                placement_updates.append('proposed_provider')
            if placement.selected_provider_id != case.client_id:
                placement.selected_provider = case.client
                placement_updates.append('selected_provider')
            if not placement.care_form and process.preferred_care_form:
                placement.care_form = process.preferred_care_form
                placement_updates.append('care_form')
            if not placement.start_date and case.start_date:
                placement.start_date = case.start_date
                placement_updates.append('start_date')
            if placement.provider_response_status == PlacementRequest.ProviderResponseStatus.ACCEPTED:
                if placement.status != PlacementRequest.Status.APPROVED:
                    placement.status = PlacementRequest.Status.APPROVED
                    placement_updates.append('status')
            elif placement.status == PlacementRequest.Status.APPROVED:
                placement.status = PlacementRequest.Status.IN_REVIEW
                placement_updates.append('status')
            if placement_updates:
                placement.save(update_fields=placement_updates)

    sync_intake_auto_tasks(process, user=user)
    return process, assessment, placement


# Backward-compatible aliases
sync_contract_phase_auto_tasks = sync_case_phase_auto_tasks
_coerce_contract_process_defaults = _coerce_case_process_defaults
ensure_contract_flow = ensure_case_flow
sync_contract_flow_state = sync_case_flow_state
