from django.views.generic import ListView, CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.urls import reverse_lazy
from django.db.models import Q
from django.shortcuts import redirect

from ..models import CareTask, CareCase, CareConfiguration
from ..forms import CareTaskForm
from ..permissions import CaseAction, can_access_case_action
from ..tenancy import get_user_organization, scope_queryset_for_organization
from .mixins import TenantScopedQuerysetMixin, TenantAssignCreateMixin


class CareTaskKanbanView(TenantScopedQuerysetMixin, LoginRequiredMixin, ListView):
    model = CareTask
    template_name = 'contracts/task_board.html'
    context_object_name = 'care_tasks'

    def get_queryset(self):
        org = get_user_organization(self.request.user)
        if not org:
            return CareTask.objects.none()
        return CareTask.objects.select_related('case_record', 'configuration', 'assigned_to').filter(
            Q(case_record__organization=org) | Q(configuration__organization=org)
        ).order_by('-updated_at', '-created_at')


@login_required
def task_board_redirect(request):
    return redirect('carelane:care_task_kanban')


class CareTaskCreateView(TenantAssignCreateMixin, LoginRequiredMixin, CreateView):
    model = CareTask
    form_class = CareTaskForm
    template_name = 'contracts/task_form.html'
    success_url = reverse_lazy('carelane:task_list')

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        org = get_user_organization(self.request.user)
        if org:
            form.fields['case_record'].queryset = scope_queryset_for_organization(CareCase.objects.all(), org)
            form.fields['configuration'].queryset = scope_queryset_for_organization(CareConfiguration.objects.all(), org)
        else:
            form.fields['case_record'].queryset = CareCase.objects.none()
            form.fields['configuration'].queryset = CareConfiguration.objects.none()
        return form

    def form_valid(self, form):
        org = get_user_organization(self.request.user)
        if form.instance.case_record and not can_access_case_action(self.request.user, form.instance.case_record, CaseAction.EDIT):
            return HttpResponseForbidden('Je hebt geen rechten om taken voor deze casus aan te maken.')
        if form.instance.configuration and org and form.instance.configuration.organization_id != org.id:
            return HttpResponseForbidden('Je hebt geen rechten om taken voor deze configuratie aan te maken.')
        return super().form_valid(form)


class CareTaskUpdateView(TenantScopedQuerysetMixin, LoginRequiredMixin, UpdateView):
    model = CareTask
    form_class = CareTaskForm
    template_name = 'contracts/task_form.html'
    success_url = reverse_lazy('carelane:task_list')

    def get_queryset(self):
        org = get_user_organization(self.request.user)
        if not org:
            return CareTask.objects.none()
        return CareTask.objects.filter(
            Q(case_record__organization=org) | Q(configuration__organization=org)
        )

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        org = get_user_organization(self.request.user)
        if org:
            form.fields['case_record'].queryset = scope_queryset_for_organization(CareCase.objects.all(), org)
            form.fields['configuration'].queryset = scope_queryset_for_organization(CareConfiguration.objects.all(), org)
        else:
            form.fields['case_record'].queryset = CareCase.objects.none()
            form.fields['configuration'].queryset = CareConfiguration.objects.none()
        return form

    def dispatch(self, request, *args, **kwargs):
        task = self.get_object()
        if task.case_record and not can_access_case_action(request.user, task.case_record, CaseAction.EDIT):
            return HttpResponseForbidden('Je hebt geen rechten om taken voor deze casus te bewerken.')
        org = get_user_organization(request.user)
        if task.configuration and org and task.configuration.organization_id != org.id:
            return HttpResponseForbidden('Je hebt geen rechten om taken voor deze configuratie te bewerken.')
        return super().dispatch(request, *args, **kwargs)
