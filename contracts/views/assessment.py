from django.views.generic import ListView, DetailView, CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseForbidden
from django.urls import reverse_lazy, reverse
from django.db.models import Q
from django.contrib import messages

from ..models import CaseAssessment, CaseIntakeProcess
from ..forms import CaseAssessmentForm
from ..middleware import log_action
from ..tenancy import get_user_organization, scope_queryset_for_organization, set_organization_on_instance
from ..operational_decision_contract import build_operational_decision_for_intake
from ..operational_decision_presenter import present_operational_decision
from .mixins import TenantScopedQuerysetMixin, TenantAssignCreateMixin, _CaseScopedIntakeMixin
from .case_flow import _can_edit_intake, _can_edit_assessment, _active_case_intakes_queryset
from ._utils import _log_pilot_issue


class CaseAssessmentListView(TenantScopedQuerysetMixin, LoginRequiredMixin, ListView):
    """List all aanbieder beoordelingen for matching."""
    model = CaseAssessment
    template_name = 'contracts/assessment_list.html'
    context_object_name = 'assessments'
    paginate_by = 25

    def get_queryset(self):
        org = self.get_organization()
        qs = CaseAssessment.objects.filter(
            due_diligence_process__organization=org,
        ).select_related(
            'due_diligence_process', 'assessed_by'
        )

        # Filter by status
        status = self.request.GET.get('status')
        if status:
            qs = qs.filter(assessment_status=status)

        # Search by case title/ID
        q = self.request.GET.get('q')
        if q:
            qs = qs.filter(
                Q(due_diligence_process__title__icontains=q)
            ).distinct()

        return qs.order_by('-updated_at')

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        org = self.get_organization()
        org_assessments = CaseAssessment.objects.filter(due_diligence_process__organization=org)

        assessment_rows = []
        urgent_blocked_count = 0
        for assessment in ctx['assessments']:
            intake = assessment.intake
            decision = build_operational_decision_for_intake(intake.pk)
            decision_payload = decision.to_dict() if decision else {}

            presented_decision = present_operational_decision(
                decision_payload,
                action_defaults={
                    'label': 'Rond beoordeling af',
                    'reason': 'Nodig voordat matching kan starten',
                    'url': reverse('carelane:assessment_update', kwargs={'pk': assessment.pk}),
                },
                impact_defaults={
                    'text': 'Ontgrendelt vervolgstap',
                    'type': 'accelerating',
                },
            )

            attention_band_value = presented_decision['attention_band']['value']
            bottleneck_state_value = presented_decision['bottleneck_state']
            escalation_recommended = presented_decision['escalation_recommended']

            if (
                bottleneck_state_value == 'assessment'
                and attention_band_value in ['now', 'today']
            ):
                urgent_blocked_count += 1

            missing_copy = decision_payload.get('blocker_label') or 'Geen ontbrekende beoordelingsstap'
            blocked_copy = (
                (presented_decision.get('bottleneck_descriptor') or {}).get('blocked_copy')
                or 'Geen actieve blokkade voor matching'
            )

            assessment_rows.append({
                'obj': assessment,
                'intake': intake,
                'assessor': assessment.assessed_by.get_full_name() if assessment.assessed_by else '—',
                'updated_at': assessment.updated_at,
                'assessment_status_label': assessment.get_assessment_status_display(),
                'missing_copy': missing_copy,
                'blocked_copy': blocked_copy,
                'primary_signal': presented_decision['primary_signal'],
                'secondary_signal': presented_decision['secondary_signal'],
                'action_block': presented_decision['action_block'],
                'priority_indicator': presented_decision['priority_indicator'],
                'badges': presented_decision['badges'],
                'recommended_action': presented_decision['recommended_action'],
                'impact_summary': presented_decision['impact_summary'],
                'attention_band': presented_decision['attention_band'],
                'priority_rank': presented_decision['priority_rank'],
                'bottleneck_state': presented_decision['bottleneck_state'],
                'strongest_signal': presented_decision['strongest_signal'],
                'escalation_recommended': presented_decision['escalation_recommended'],
            })

        operational_strip = None
        if urgent_blocked_count > 0:
            operational_strip = {
                'severity': 'warning',
                'message': f'{urgent_blocked_count} urgente beoordelingen blokkeren doorstroom',
                'cta_label': 'Werk beoordelingen af',
                'cta_href': reverse('carelane:assessment_list') + '?status=' + CaseAssessment.AssessmentStatus.DRAFT,
            }

        ctx.update({
            'total_assessments': org_assessments.count(),
            'pending_assessments': org_assessments.filter(
                assessment_status=CaseAssessment.AssessmentStatus.DRAFT
            ).count(),
            'ready_for_matching': org_assessments.filter(
                assessment_status=CaseAssessment.AssessmentStatus.APPROVED_FOR_MATCHING
            ).count(),
            'status_choices': CaseAssessment.AssessmentStatus.choices,
            'search_query': self.request.GET.get('q', ''),
            'assessment_rows': assessment_rows,
            'beoordelingen_operational_strip': operational_strip,
            'decision_data_integrity_ok': all(
                bool(row['recommended_action'].get('label')) and bool(row['impact_summary'].get('text'))
                for row in assessment_rows
            ),
        })

        query_params = self.request.GET.copy()
        if 'page' in query_params:
            query_params.pop('page')
        ctx['query_string_without_page'] = query_params.urlencode()

        return ctx


class CaseAssessmentDetailView(TenantScopedQuerysetMixin, LoginRequiredMixin, DetailView):
    """Show details of a specific aanbieder beoordeling."""
    model = CaseAssessment
    template_name = 'contracts/assessment_detail.html'
    context_object_name = 'assessment'

    def get_queryset(self):
        org = self.get_organization()
        return CaseAssessment.objects.filter(
            due_diligence_process__organization=org,
        ).select_related(
            'due_diligence_process', 'assessed_by'
        )

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        assessment = self.object
        intake = assessment.intake
        can_edit_assessment = _can_edit_assessment(self.request.user, assessment)
        matching_href = f"{reverse('carelane:matching_dashboard')}?intake={intake.pk}"

        matching_requirements = [
            {
                'label': 'Status op Gereed voor matching',
                'ok': assessment.assessment_status == CaseAssessment.AssessmentStatus.APPROVED_FOR_MATCHING,
            },
            {
                'label': 'Klaar voor matching staat op Ja',
                'ok': bool(assessment.matching_ready),
            },
            {
                'label': 'Minimaal 1 signaal beoordeeld',
                'ok': bool((assessment.risk_signals or '').strip()),
            },
        ]
        matching_ready = all(item['ok'] for item in matching_requirements)
        matching_missing = [item['label'] for item in matching_requirements if not item['ok']]

        ctx.update({
            'intake': intake,
            'can_edit_assessment': can_edit_assessment,
            'matching_href': matching_href,
            'matching_requirements': matching_requirements,
            'matching_ready': matching_ready,
            'matching_missing': matching_missing,
        })

        return ctx


class CaseAssessmentCreateView(TenantAssignCreateMixin, LoginRequiredMixin, CreateView):
    """Create a new aanbieder beoordeling for a care intake."""
    model = CaseAssessment
    form_class = CaseAssessmentForm
    template_name = 'contracts/assessment_form.html'

    def get_initial(self):
        initial = super().get_initial()
        # Pre-fill if linked from intake detail page
        intake_id = self.request.GET.get('intake')
        if intake_id:
            try:
                org = get_user_organization(self.request.user)
                intake = _active_case_intakes_queryset(org).get(pk=intake_id)
                initial['due_diligence_process'] = intake
            except CaseIntakeProcess.DoesNotExist:
                pass
        return initial

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update({
            'is_edit': False,
            'page_title': 'Nieuwe beoordeling door aanbieder',
            'button_text': 'Beoordeling door aanbieder aanmaken',
        })
        return ctx

    def form_valid(self, form):
        org = get_user_organization(self.request.user)
        set_organization_on_instance(form.instance, org)
        if form.instance.intake and not _can_edit_intake(self.request.user, form.instance.intake):
            _log_pilot_issue(
                self.request,
                category='assessment_create_forbidden',
                detail=f'intake={form.instance.intake.pk}',
            )
            return HttpResponseForbidden('Je hebt geen rechten om voor deze casus een beoordeling aan te maken.')
        form.instance.assessed_by = self.request.user
        if not form.instance.assessment_status:
            form.instance.assessment_status = CaseAssessment.AssessmentStatus.DRAFT
        response = super().form_valid(form)
        log_action(self.request.user, 'CREATE', 'CaseAssessment', self.object.id, str(self.object), request=self.request)
        messages.success(self.request, 'Beoordeling door aanbieder aangemaakt. Volgende stap: matching.')
        return response

    def get_success_url(self):
        return reverse('carelane:assessment_detail', kwargs={'pk': self.object.pk})


class CaseAssessmentUpdateView(TenantScopedQuerysetMixin, LoginRequiredMixin, UpdateView):
    """Update an existing aanbieder beoordeling."""
    model = CaseAssessment
    form_class = CaseAssessmentForm
    template_name = 'contracts/assessment_form.html'

    def get_queryset(self):
        org = self.get_organization()
        return CaseAssessment.objects.filter(due_diligence_process__organization=org)

    def dispatch(self, request, *args, **kwargs):
        assessment = self.get_object()
        if not _can_edit_assessment(request.user, assessment):
            _log_pilot_issue(
                request,
                category='assessment_update_forbidden',
                detail=f'assessment={assessment.pk}',
            )
            return HttpResponseForbidden('Je hebt geen rechten om deze beoordeling te bewerken.')
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update({
            'is_edit': True,
            'page_title': 'Beoordeling door aanbieder bewerken',
            'button_text': 'Wijzigingen opslaan',
        })
        return ctx

    def form_valid(self, form):
        response = super().form_valid(form)
        log_action(self.request.user, 'UPDATE', 'CaseAssessment', self.object.id, str(self.object), request=self.request)
        messages.success(self.request, 'Beoordeling door aanbieder bijgewerkt.')
        return response

    def get_success_url(self):
        return reverse('carelane:assessment_detail', kwargs={'pk': self.object.pk})
