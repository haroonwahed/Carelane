from django.views.generic import ListView, DetailView, CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseForbidden
from django.urls import reverse_lazy, reverse
from django.db.models import Q
from django.contrib import messages

from ..models import CareSignal, CaseIntakeProcess
from ..forms import CareSignalForm
from ..middleware import log_action
from ..permissions import CaseAction, can_access_case_action
from ..tenancy import get_user_organization, scope_queryset_for_organization, set_organization_on_instance
from .mixins import TenantScopedQuerysetMixin, TenantAssignCreateMixin, _CaseScopedIntakeMixin
from ._utils import _resolve_signal_case, _redirect_to_safe_next_or_default, _case_detail_tab_href
from .case_flow import _active_case_intakes_queryset


@login_required
@require_POST
def signal_update_status(request, pk):
    if not hasattr(request, '_cached_organization'):
        request._cached_organization = get_user_organization(request.user)
    organization = request._cached_organization

    signal_qs = CareSignal.objects.for_organization(organization).select_related('due_diligence_process', 'case_record')
    signal = get_object_or_404(signal_qs, pk=pk)

    linked_case = _resolve_signal_case(signal)
    if linked_case and not can_access_case_action(request.user, linked_case, CaseAction.EDIT):
        return HttpResponseForbidden('Je hebt geen rechten om signalen van deze casus te wijzigen.')

    status = request.POST.get('status')
    valid_statuses = {
        CareSignal.SignalStatus.OPEN,
        CareSignal.SignalStatus.IN_PROGRESS,
        CareSignal.SignalStatus.RESOLVED,
    }
    if status not in valid_statuses:
        messages.error(request, 'Ongeldige signaalstatus.')
        fallback_url = reverse('carelane:signal_detail', kwargs={'pk': signal.pk})
        if signal.due_diligence_process_id:
            fallback_url = f"{reverse('carelane:case_detail', kwargs={'pk': signal.due_diligence_process_id})}?tab=signalen"
        return _redirect_to_safe_next_or_default(request, fallback_url)

    if signal.status != status:
        signal.status = status
        signal.save(update_fields=['status', 'updated_at'])
        log_action(
            request.user,
            'UPDATE',
            'CareSignal',
            signal.id,
            str(signal),
            changes={'status': status},
            request=request,
        )
        messages.success(request, 'Signaalstatus bijgewerkt.')
    else:
        messages.info(request, 'Signaalstatus was al up-to-date.')

    fallback_url = reverse('carelane:signal_detail', kwargs={'pk': signal.pk})
    if signal.due_diligence_process_id:
        fallback_url = f"{reverse('carelane:case_detail', kwargs={'pk': signal.due_diligence_process_id})}?tab=signalen"
    return _redirect_to_safe_next_or_default(request, fallback_url)


# ==================== CARE SIGNAL VIEWS (Signalen) ====================

class CareSignalListView(TenantScopedQuerysetMixin, LoginRequiredMixin, ListView):
    model = CareSignal
    template_name = 'contracts/signal_list.html'
    context_object_name = 'signals'
    paginate_by = 25

    def get_queryset(self):
        org = self.get_organization()
        qs = CareSignal.objects.for_organization(org).select_related('due_diligence_process', 'assigned_to', 'case_record').order_by('-created_at')

        q = self.request.GET.get('q')
        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(due_diligence_process__title__icontains=q)
                | Q(description__icontains=q)
            ).distinct()

        status = self.request.GET.get('status')
        if status:
            qs = qs.filter(status=status)

        risk_level = self.request.GET.get('risk_level')
        if risk_level:
            qs = qs.filter(risk_level=risk_level)

        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        org = self.get_organization()
        all_qs = CareSignal.objects.for_organization(org)
        editable_signal_ids = set()
        signal_rows = []
        for signal in ctx['signals']:
            linked_case = signal.case_record or (signal.intake.case_record if signal.intake else None)
            if linked_case is None or can_access_case_action(self.request.user, linked_case, CaseAction.EDIT):
                editable_signal_ids.add(signal.pk)

            case_href = None
            intake_id = getattr(signal, 'due_diligence_process_id', None)
            if intake_id:
                case_href = _case_detail_tab_href(intake_id, 'signalen')

            signal_rows.append({
                'signal': signal,
                'case_href': case_href,
                'can_edit': signal.pk in editable_signal_ids,
            })

        ctx.update({
            'total_count': all_qs.count(),
            'open_count': all_qs.filter(status=CareSignal.SignalStatus.OPEN).count(),
            'critical_count': all_qs.filter(
                risk_level=CareSignal.RiskLevel.CRITICAL,
                status__in=[CareSignal.SignalStatus.OPEN, CareSignal.SignalStatus.IN_PROGRESS],
            ).count(),
            'status_choices': CareSignal.SignalStatus.choices,
            'risk_level_choices': CareSignal.RiskLevel.choices,
            'search_query': self.request.GET.get('q', ''),
            'editable_signal_ids': editable_signal_ids,
            'signal_rows': signal_rows,
        })
        return ctx


class CareSignalDetailView(TenantScopedQuerysetMixin, LoginRequiredMixin, DetailView):
    model = CareSignal
    template_name = 'contracts/signal_detail.html'
    context_object_name = 'signal'

    def get_queryset(self):
        org = self.get_organization()
        return CareSignal.objects.for_organization(org).select_related('due_diligence_process', 'assigned_to', 'case_record', 'created_by')

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        linked_case = _resolve_signal_case(self.object)
        ctx['can_edit_signal'] = (linked_case is None) or can_access_case_action(
            self.request.user,
            linked_case,
            CaseAction.EDIT,
        )
        return ctx


class CareSignalCreateView(TenantScopedQuerysetMixin, LoginRequiredMixin, CreateView):
    model = CareSignal
    form_class = CareSignalForm
    template_name = 'contracts/signal_form.html'

    def get_initial(self):
        initial = super().get_initial()
        intake_id = self.request.GET.get('intake')
        if intake_id:
            try:
                org = self.get_organization()
                intake = _active_case_intakes_queryset(org).get(pk=intake_id)
                initial['due_diligence_process'] = intake
            except CaseIntakeProcess.DoesNotExist:
                pass
        return initial

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['is_edit'] = False
        ctx['page_title'] = 'Nieuw signaal'
        return ctx

    def form_valid(self, form):
        intake = form.cleaned_data.get('due_diligence_process')
        if intake and intake.case_record and not can_access_case_action(self.request.user, intake.case_record, CaseAction.EDIT):
            return HttpResponseForbidden('Je hebt geen rechten om signalen voor deze casus toe te voegen.')
        form.instance.created_by = self.request.user
        if intake and intake.contract_id and not form.instance.case_record_id:
            form.instance.case_record = intake.case_record
        response = super().form_valid(form)
        log_action(self.request.user, 'CREATE', 'CareSignal', self.object.id, str(self.object), request=self.request)
        messages.success(self.request, 'Signaal aangemaakt.')
        return response

    def get_success_url(self):
        return reverse('carelane:signal_detail', kwargs={'pk': self.object.pk})


class CareSignalUpdateView(TenantScopedQuerysetMixin, LoginRequiredMixin, UpdateView):
    model = CareSignal
    form_class = CareSignalForm
    template_name = 'contracts/signal_form.html'

    def get_queryset(self):
        org = self.get_organization()
        return CareSignal.objects.for_organization(org)

    def dispatch(self, request, *args, **kwargs):
        signal = self.get_object()
        linked_case = _resolve_signal_case(signal)
        if linked_case and not can_access_case_action(request.user, linked_case, CaseAction.EDIT):
            return HttpResponseForbidden('Je hebt geen rechten om signalen van deze casus te bewerken.')
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['is_edit'] = True
        ctx['page_title'] = 'Signaal bewerken'
        return ctx

    def form_valid(self, form):
        response = super().form_valid(form)
        log_action(self.request.user, 'UPDATE', 'CareSignal', self.object.id, str(self.object), request=self.request)
        messages.success(self.request, 'Signaal bijgewerkt.')
        return response

    def get_success_url(self):
        return reverse('carelane:signal_detail', kwargs={'pk': self.object.pk})
