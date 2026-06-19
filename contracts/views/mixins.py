from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponseForbidden
from django.urls import reverse
from django.contrib import messages

from ..tenancy import get_user_organization, scope_queryset_for_organization, set_organization_on_instance
from ..models import CaseIntakeProcess, Deadline, CareSignal, Document
from ..forms import DeadlineForm, CareSignalForm, DocumentForm
from ..middleware import log_action
from ._utils import _log_pilot_issue, _merge_document_context_tags


class TenantScopedQuerysetMixin:
    """Mixin to automatically scope querysets to the user's organization.

    Caches organization in request to avoid repeated lookups.
    Use self.get_organization() to access cached org in any view method.
    """
    def get_organization(self):
        """Get organization for current user, cached on request."""
        if not hasattr(self.request, '_cached_organization'):
            self.request._cached_organization = get_user_organization(self.request.user)
        return self.request._cached_organization

    def get_queryset(self):
        queryset = super().get_queryset()
        org = self.get_organization()
        return scope_queryset_for_organization(queryset, org)


class TenantAssignCreateMixin:
    def form_valid(self, form):
        set_organization_on_instance(form.instance, get_user_organization(self.request.user))
        return super().form_valid(form)


class _CaseScopedIntakeMixin(TenantScopedQuerysetMixin):
    intake = None

    def _load_intake(self):
        if self.intake is None:
            org = get_user_organization(self.request.user)
            self.intake = get_object_or_404(
                scope_queryset_for_organization(CaseIntakeProcess.objects.select_related('contract'), org),
                pk=self.kwargs['pk'],
            )
        return self.intake

    def dispatch(self, request, *args, **kwargs):
        from .case_flow import _can_edit_intake
        intake = self._load_intake()
        if not _can_edit_intake(request.user, intake):
            _log_pilot_issue(
                request,
                category='case_scoped_create_forbidden',
                detail=f'intake={intake.pk}',
            )
            return HttpResponseForbidden('Je hebt geen rechten om deze casus bij te werken.')
        return super().dispatch(request, *args, **kwargs)


class CaseScopedDeadlineCreateView(_CaseScopedIntakeMixin):
    """Case-scoped wrapper around DeadlineCreateView.

    Inherits the concrete DeadlineCreateView base at class creation time via
    _rebuild_case_scoped_views() called from __init__.py after all submodules load.
    Defined here as a single-parent stub; __init__.py replaces it with the
    correct multi-parent version once DeadlineCreateView is available.
    """

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        if self.request.method in ('POST', 'PUT'):
            data = kwargs.get('data', self.request.POST).copy()
            data['due_diligence_process'] = str(self._load_intake().pk)
            kwargs['data'] = data
        return kwargs

    def get_initial(self):
        initial = super().get_initial()
        initial['due_diligence_process'] = self._load_intake()
        return initial

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        intake = self._load_intake()
        form.initial['due_diligence_process'] = intake.pk
        return form

    def form_valid(self, form):
        intake = self._load_intake()
        form.instance.due_diligence_process = intake
        if intake.contract_id:
            form.instance.case_record = intake.case_record
        response = super().form_valid(form)
        messages.success(self.request, f'Taak toegevoegd aan casus "{intake.title}".')
        return response

    def get_success_url(self):
        return f"{reverse('carelane:case_detail', kwargs={'pk': self._load_intake().pk})}?tab=taken"


class CaseScopedCareSignalCreateView(_CaseScopedIntakeMixin):
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        if self.request.method in ('POST', 'PUT'):
            data = kwargs.get('data', self.request.POST).copy()
            data['due_diligence_process'] = str(self._load_intake().pk)
            kwargs['data'] = data
        return kwargs

    def get_initial(self):
        initial = super().get_initial()
        initial['due_diligence_process'] = self._load_intake()
        return initial

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        intake = self._load_intake()
        form.initial['due_diligence_process'] = intake.pk
        return form

    def form_valid(self, form):
        intake = self._load_intake()
        form.instance.due_diligence_process = intake
        if intake.contract_id:
            form.instance.case_record = intake.case_record
        response = super().form_valid(form)
        messages.success(self.request, f'Signaal toegevoegd aan casus "{intake.title}".')
        return response

    def get_success_url(self):
        return f"{reverse('carelane:case_detail', kwargs={'pk': self._load_intake().pk})}?tab=signalen"


class CaseScopedDocumentCreateView(_CaseScopedIntakeMixin):
    def dispatch(self, request, *args, **kwargs):
        intake = self._load_intake()
        if not intake.contract_id:
            messages.error(request, 'Koppel eerst een casusrecord voordat je documenten toevoegt.')
            return redirect('carelane:case_detail', pk=intake.pk)
        return super().dispatch(request, *args, **kwargs)

    def get_initial(self):
        initial = super().get_initial()
        intake = self._load_intake()
        phase = (self.request.GET.get('phase') or '').strip()
        event = (self.request.GET.get('event') or '').strip()
        if intake.contract_id:
            initial['contract'] = intake.case_record
        if phase or event:
            initial['tags'] = _merge_document_context_tags(initial.get('tags', ''), phase=phase, event=event)
        return initial

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        intake = self._load_intake()
        phase = (self.request.GET.get('phase') or '').strip()
        event = (self.request.GET.get('event') or '').strip()
        phase_label = {
            'aanvraag': 'Aanvraag',
            'beoordeling': 'Beoordeling door aanbieder',
            'matching': 'Matching',
            'intake_aanbieder': 'Intake aanbieder',
            'plaatsing': 'Plaatsing',
        }.get(phase, phase)
        ctx['intake'] = intake
        ctx['document_context_phase'] = phase_label
        ctx['document_context_event'] = event
        ctx['cancel_href'] = f"{reverse('carelane:case_detail', kwargs={'pk': intake.pk})}?tab=documenten"
        return ctx

    def form_valid(self, form):
        intake = self._load_intake()
        phase = (self.request.GET.get('phase') or '').strip()
        event = (self.request.GET.get('event') or '').strip()
        form.instance.contract = intake.case_record
        if phase or event:
            form.instance.tags = _merge_document_context_tags(form.instance.tags, phase=phase, event=event)
        response = super().form_valid(form)
        messages.success(self.request, f'Document toegevoegd aan casus "{intake.title}".')
        return response

    def get_success_url(self):
        intake = self._load_intake()
        phase = (self.request.GET.get('phase') or '').strip()
        event = (self.request.GET.get('event') or '').strip()
        url = f"{reverse('carelane:case_detail', kwargs={'pk': intake.pk})}?tab=documenten"
        if phase:
            url += f'&phase={phase}'
        if event:
            url += f'&event={event}'
        return url
