from django.views.generic import ListView, DetailView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseForbidden
from django.db.models import Q
from django.urls import reverse_lazy, reverse
from django.contrib import messages

from ..models import PlacementRequest, CaseIntakeProcess
from ..forms import PlacementRequestForm
from ..middleware import log_action
from ..permissions import CaseAction, can_access_case_action
from ..tenancy import get_user_organization, scope_queryset_for_organization
from ..operational_decision_contract import build_operational_decision_for_intake
from ..operational_decision_presenter import present_operational_decision
from .mixins import TenantScopedQuerysetMixin
from ._utils import _to_bool_filter, _urgency_rank


def _placement_phase_label(placement):
    if placement.status == PlacementRequest.Status.APPROVED:
        return 'Plaatsing bevestigd'
    if placement.status == PlacementRequest.Status.IN_REVIEW:
        return 'Aanbieder beoordeelt'
    if placement.status == PlacementRequest.Status.NEEDS_INFO:
        return 'Aanvullende informatie nodig'
    if placement.status == PlacementRequest.Status.REJECTED:
        return 'Opnieuw matchen'
    return 'Indicatie voorbereiding'


class PlacementRequestListView(TenantScopedQuerysetMixin, LoginRequiredMixin, ListView):
    model = PlacementRequest
    template_name = 'contracts/placement_list.html'
    context_object_name = 'placements'
    paginate_by = 25

    def get_queryset(self):
        org = self.get_organization()
        qs = PlacementRequest.objects.for_organization(org).select_related(
            'due_diligence_process', 'proposed_provider', 'selected_provider'
        ).order_by('-updated_at')

        q = self.request.GET.get('q')
        if q:
            qs = qs.filter(
                Q(due_diligence_process__title__icontains=q)
                | Q(proposed_provider__name__icontains=q)
                | Q(selected_provider__name__icontains=q)
            ).distinct()

        status = self.request.GET.get('status')
        if status:
            qs = qs.filter(status=status)

        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        org = self.get_organization()
        all_qs = PlacementRequest.objects.for_organization(org)
        provider_response_copy = {
            'pending': 'In afwachting: reactie uitstaand',
            'rejected': 'Afgewezen: aanbieder heeft afgewezen',
            'waitlist': 'Wachtlijst: plaatsing vertraagd',
            'no_capacity': 'Geen capaciteit: geen plek beschikbaar',
            'accepted': 'Geaccepteerd: aanbieder bevestigd',
            'needs_info': 'Aanvullende info nodig',
        }
        editable_placement_ids = set()
        stalled_count = 0
        escalation_count = 0
        derived_strip = None
        placement_rows = []
        for placement in ctx['placements']:
            linked_case = placement.intake.case_record if placement.intake else None
            if linked_case is None or can_access_case_action(self.request.user, linked_case, CaseAction.EDIT):
                editable_placement_ids.add(placement.pk)

            decision = build_operational_decision_for_intake(placement.intake.pk) if placement.intake else None
            decision_payload = decision.to_dict() if decision else {}

            attention_band_value = decision_payload.get('attention_band') or 'monitor'
            bottleneck_state_value = decision_payload.get('bottleneck_state') or 'none'

            response_state = (decision_payload.get('provider_response_state') or placement.provider_response_status or '').lower()
            response_label = provider_response_copy.get(response_state, placement.get_provider_response_status_display())

            blocker_label = (decision_payload.get('blocker_label') or '').strip()
            fallback_stall_reason = response_label or 'Plaatsing wacht op vervolgactie'
            stall_reason = blocker_label or fallback_stall_reason

            is_stalled = bool(decision_payload.get('is_stalled')) or response_state in {
                'pending', 'rejected', 'waitlist', 'no_capacity', 'needs_info'
            } or bottleneck_state_value == 'placement'
            if is_stalled and not stall_reason:
                stall_reason = 'Plaatsing wacht op vervolgactie'

            presented_decision = present_operational_decision(
                decision_payload,
                action_defaults={
                    'label': 'Stuur herinnering' if is_stalled else 'Monitor plaatsing',
                    'reason': stall_reason,
                    'url': reverse('carelane:placement_detail', kwargs={'pk': placement.pk}),
                },
                impact_defaults={
                    'text': (
                        'Versnelt besluitvorming bij stagnerende plaatsing'
                        if is_stalled
                        else 'Houdt plaatsing op koers'
                    ),
                    'type': 'accelerating',
                },
                fallback_reason=stall_reason,
            )

            escalation_recommended = presented_decision['escalation_recommended']
            escalation_reason = (decision_payload.get('escalation_reason') or '').strip()
            if escalation_recommended and not escalation_reason:
                escalation_reason = 'Escalatie aanbevolen'

            if is_stalled:
                stalled_count += 1
            if escalation_recommended:
                escalation_count += 1

            if not derived_strip:
                strip_payload = decision_payload.get('operational_strip') or {}
                strip_message = (strip_payload.get('message') or '').strip()
                if strip_message:
                    derived_strip = {
                        'severity': (strip_payload.get('severity') or 'warning').strip().lower(),
                        'message': strip_message,
                    }

            placement_rows.append({
                'placement': placement,
                'phase_label': _placement_phase_label(placement),
                'provider_name': (
                    placement.selected_provider.name
                    if placement.selected_provider
                    else placement.proposed_provider.name
                    if placement.proposed_provider
                    else '—'
                ),
                'status_label': placement.get_status_display(),
                'provider_response_label': response_label,
                'stall_reason': stall_reason,
                'is_stalled': is_stalled,
                'primary_signal': presented_decision['primary_signal'],
                'secondary_signal': presented_decision['secondary_signal'],
                'action_block': presented_decision['action_block'],
                'priority_indicator': presented_decision['priority_indicator'],
                'badges': presented_decision['badges'],
                'recommended_action': presented_decision['recommended_action'],
                'impact_summary': presented_decision['impact_summary'],
                'attention_band': presented_decision['attention_band'],
                'bottleneck_badge': presented_decision['bottleneck_badge'],
                'signal_chips': presented_decision['signal_chips'],
                'escalation_recommended': presented_decision['escalation_recommended'],
                'escalation_reason': escalation_reason,
            })

        placement_operational_strip = derived_strip
        if not placement_operational_strip and escalation_count > 0:
            placement_operational_strip = {
                'severity': 'critical',
                'message': f'{escalation_count} plaatsingen vragen escalatie om doorstroom te beschermen',
            }
        elif not placement_operational_strip and stalled_count > 1:
            placement_operational_strip = {
                'severity': 'warning',
                'message': f'{stalled_count} plaatsingen staan stil door uitblijvende providerreactie',
            }

        ctx.update({
            'total_count': all_qs.count(),
            'approved_count': all_qs.filter(status=PlacementRequest.Status.APPROVED).count(),
            'in_review_count': all_qs.filter(status=PlacementRequest.Status.IN_REVIEW).count(),
            'status_choices': PlacementRequest.Status.choices,
            'search_query': self.request.GET.get('q', ''),
            'editable_placement_ids': editable_placement_ids,
            'placement_rows': placement_rows,
            'placement_operational_strip': placement_operational_strip,
            'decision_data_integrity_ok': all(
                ((not row['is_stalled']) or bool(row['stall_reason']))
                and bool(row['recommended_action'].get('label'))
                and bool(row['impact_summary'].get('text'))
                and len(row['signal_chips']) <= 2
                for row in placement_rows
            ),
        })
        return ctx


class PlacementRequestDetailView(TenantScopedQuerysetMixin, LoginRequiredMixin, DetailView):
    model = PlacementRequest
    template_name = 'contracts/placement_detail.html'
    context_object_name = 'placement'

    def get_queryset(self):
        org = self.get_organization()
        return PlacementRequest.objects.for_organization(org).select_related(
            'due_diligence_process', 'proposed_provider', 'selected_provider'
        )

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['placement_phase_label'] = _placement_phase_label(self.object)
        linked_case = self.object.intake.case_record if self.object.intake else None
        ctx['can_edit_placement'] = (linked_case is not None) and can_access_case_action(
            self.request.user,
            linked_case,
            CaseAction.EDIT,
        )
        return ctx


class PlacementRequestUpdateView(TenantScopedQuerysetMixin, LoginRequiredMixin, UpdateView):
    model = PlacementRequest
    form_class = PlacementRequestForm
    template_name = 'contracts/placement_form.html'

    def get_queryset(self):
        org = self.get_organization()
        return PlacementRequest.objects.for_organization(org)

    def handle_no_permission(self):
        return HttpResponseForbidden('Je hebt geen rechten om plaatsing voor deze casus te wijzigen.')

    def dispatch(self, request, *args, **kwargs):
        placement = self.get_object()
        if not placement.due_diligence_process_id:
            return HttpResponseForbidden('Plaatsing zonder gekoppelde casus is alleen inspecteerbaar.')
        linked_case = placement.intake.case_record if placement.intake else None
        if linked_case is None:
            return HttpResponseForbidden('Plaatsing zonder gekoppelde casus is alleen inspecteerbaar.')
        if not can_access_case_action(request.user, linked_case, CaseAction.EDIT):
            return HttpResponseForbidden('Je hebt geen rechten om plaatsing voor deze casus te wijzigen.')
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['is_edit'] = True
        ctx['page_title'] = 'Plaatsing bewerken'
        ctx['intake'] = self.object.intake
        return ctx

    def form_valid(self, form):
        response = super().form_valid(form)
        log_action(self.request.user, 'UPDATE', 'PlacementRequest', self.object.id, str(self.object), request=self.request)
        messages.success(self.request, 'Plaatsing bijgewerkt.')
        return response

    def get_success_url(self):
        return reverse('carelane:placement_detail', kwargs={'pk': self.object.pk})
