from django.views.generic import ListView, CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import HttpResponseForbidden
from django.urls import reverse_lazy, reverse
from django.contrib import messages
from django.db import models
from django.utils import timezone
from datetime import date
from django.contrib.auth import get_user_model

from ..models import Deadline, CaseIntakeProcess, AuditLog
from ..forms import DeadlineForm
from ..middleware import log_action
from ..permissions import CaseAction, can_access_case_action
from ..tenancy import get_user_organization
from .mixins import TenantScopedQuerysetMixin, TenantAssignCreateMixin
from ._utils import _resolve_deadline_case, _redirect_to_safe_next_or_default, _case_detail_tab_href
from .case_flow import sync_automatic_deadlines_for_organization

User = get_user_model()


class DeadlineListView(LoginRequiredMixin, ListView):
    model = Deadline
    template_name = 'contracts/deadline_list.html'
    context_object_name = 'deadlines'
    paginate_by = 25

    def get_organization(self):
        """Get organization for current user, cached on request."""
        if not hasattr(self.request, '_cached_organization'):
            self.request._cached_organization = get_user_organization(self.request.user)
        return self.request._cached_organization

    def get_queryset(self):
        org = self.get_organization()
        sync_automatic_deadlines_for_organization(org, user=self.request.user)
        qs = Deadline.objects.select_related('due_diligence_process', 'assigned_to', 'case_record').for_organization(org)
        show = self.request.GET.get('show', 'mine')
        if show == 'mine':
            qs = qs.filter(assigned_to=self.request.user, is_completed=False)
        elif show == 'today':
            qs = qs.filter(is_completed=False, due_date=date.today())
        elif show == 'overdue':
            qs = qs.filter(is_completed=False, due_date__lt=date.today())
        elif show == 'high':
            qs = qs.filter(is_completed=False, priority__in=[Deadline.Priority.HIGH, Deadline.Priority.URGENT])
        elif show == 'all':
            pass
        else:
            qs = qs.filter(assigned_to=self.request.user, is_completed=False)

        owner = self.request.GET.get('owner', 'all')
        if owner == 'mine':
            qs = qs.filter(assigned_to=self.request.user)

        priority_rank = models.Case(
            models.When(priority=Deadline.Priority.URGENT, then=models.Value(0)),
            models.When(priority=Deadline.Priority.HIGH, then=models.Value(1)),
            models.When(priority=Deadline.Priority.MEDIUM, then=models.Value(2)),
            default=models.Value(3),
            output_field=models.IntegerField(),
        )
        return qs.annotate(priority_rank=priority_rank).order_by('is_completed', 'priority_rank', 'due_date', 'due_time')

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        org = self.get_organization()
        org_deadlines = Deadline.objects.for_organization(org)
        owner = self.request.GET.get('owner', 'all')
        stats_qs = org_deadlines
        if owner == 'mine':
            stats_qs = stats_qs.filter(assigned_to=self.request.user)

        today_value = date.today()
        ctx['today_count'] = stats_qs.filter(is_completed=False, due_date=today_value).count()
        ctx['overdue_count'] = stats_qs.filter(is_completed=False, due_date__lt=today_value).count()
        ctx['high_priority_count'] = stats_qs.filter(is_completed=False, priority__in=[Deadline.Priority.HIGH, Deadline.Priority.URGENT]).count()
        ctx['my_open_count'] = org_deadlines.filter(assigned_to=self.request.user, is_completed=False).count()
        ctx['all_count'] = stats_qs.count()
        ctx['completed_count'] = stats_qs.filter(is_completed=True).count()
        ctx['show'] = self.request.GET.get('show', 'mine')
        ctx['owner'] = owner
        ctx['today'] = today_value
        task_rows = []
        for deadline in ctx['deadlines']:
            if deadline.is_completed:
                row_status = 'Afgerond'
                row_status_class = 'bg-green-100 text-green-800'
            elif deadline.is_overdue:
                row_status = 'Te laat'
                row_status_class = 'bg-red-100 text-red-800'
            elif deadline.due_date == today_value:
                row_status = 'Vandaag'
                row_status_class = 'bg-orange-100 text-orange-800'
            else:
                row_status = 'Open'
                row_status_class = 'bg-blue-100 text-blue-800'

            linked_case = None
            if deadline.intake:
                linked_case = getattr(deadline.intake, 'contract', None)
                open_href = _case_detail_tab_href(deadline.intake.pk, 'taken')
                case_title = deadline.intake.title
            elif deadline.case_record:
                linked_case = deadline.case_record
                open_href = reverse('carelane:case_detail', kwargs={'pk': deadline.case_record.pk})
                case_title = deadline.case_record.title
            else:
                open_href = None
                case_title = 'Niet gekoppeld'

            if deadline.priority == Deadline.Priority.URGENT:
                priority_class = 'bg-red-100 text-red-800'
            elif deadline.priority == Deadline.Priority.HIGH:
                priority_class = 'bg-orange-100 text-orange-800'
            elif deadline.priority == Deadline.Priority.MEDIUM:
                priority_class = 'bg-yellow-100 text-yellow-800'
            else:
                priority_class = 'bg-gray-100 text-gray-600'

            task_rows.append({
                'deadline': deadline,
                'case_title': case_title,
                'open_href': open_href,
                'row_status': row_status,
                'row_status_class': row_status_class,
                'priority_class': priority_class,
                'can_edit': (linked_case is None) or can_access_case_action(self.request.user, linked_case, CaseAction.EDIT),
            })

        ctx['task_rows'] = task_rows
        return ctx


class DeadlineCreateView(TenantAssignCreateMixin, LoginRequiredMixin, CreateView):
    model = Deadline
    form_class = DeadlineForm
    template_name = 'contracts/deadline_form.html'
    success_url = reverse_lazy('carelane:deadline_list')

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        org = get_user_organization(self.request.user)
        if org:
            form.fields['due_diligence_process'].queryset = CaseIntakeProcess.objects.filter(
                organization=org
            ).order_by('-updated_at')
            form.fields['assigned_to'].queryset = User.objects.filter(
                organization_memberships__organization=org,
                organization_memberships__is_active=True,
            ).distinct().order_by('first_name', 'last_name', 'username')
        else:
            form.fields['due_diligence_process'].queryset = CaseIntakeProcess.objects.none()
            form.fields['assigned_to'].queryset = User.objects.none()

        selected_case = self.request.GET.get('case')
        if selected_case and selected_case.isdigit():
            form.initial['due_diligence_process'] = int(selected_case)
        return form

    def form_valid(self, form):
        from .case_flow import _can_edit_intake
        intake = form.instance.intake
        if intake and not _can_edit_intake(self.request.user, intake):
            return HttpResponseForbidden('Je hebt geen rechten om opvolgtaken voor deze casus toe te voegen.')
        form.instance.created_by = self.request.user
        response = super().form_valid(form)
        if self.object.generation_source == Deadline.GenerationSource.MANUAL:
            self.object.generation_source = Deadline.GenerationSource.MANUAL
            self.object.save(update_fields=['generation_source'])
        log_action(self.request.user, 'CREATE', 'OpvolgingTaak', self.object.id, str(self.object), request=self.request)
        return response


class DeadlineUpdateView(TenantScopedQuerysetMixin, LoginRequiredMixin, UpdateView):
    model = Deadline
    form_class = DeadlineForm
    template_name = 'contracts/deadline_form.html'
    success_url = reverse_lazy('carelane:deadline_list')

    def get_queryset(self):
        org = self.get_organization()
        if not org:
            return Deadline.objects.none()
        return Deadline.objects.for_organization(org)

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        org = get_user_organization(self.request.user)
        if org:
            form.fields['due_diligence_process'].queryset = CaseIntakeProcess.objects.filter(
                organization=org
            ).order_by('-updated_at')
            form.fields['assigned_to'].queryset = User.objects.filter(
                organization_memberships__organization=org,
                organization_memberships__is_active=True,
            ).distinct().order_by('first_name', 'last_name', 'username')
        else:
            form.fields['due_diligence_process'].queryset = CaseIntakeProcess.objects.none()
            form.fields['assigned_to'].queryset = User.objects.none()
        return form

    def dispatch(self, request, *args, **kwargs):
        deadline = self.get_object()
        linked_case = _resolve_deadline_case(deadline)
        if linked_case and not can_access_case_action(request.user, linked_case, CaseAction.EDIT):
            return HttpResponseForbidden('Je hebt geen rechten om opvolgtaken van deze casus te bewerken.')
        return super().dispatch(request, *args, **kwargs)


@login_required
@require_POST
def deadline_complete(request, pk):
    # Cache org on request for consistency
    if not hasattr(request, '_cached_organization'):
        request._cached_organization = get_user_organization(request.user)
    organization = request._cached_organization

    deadline_qs = Deadline.objects.for_organization(organization)
    from django.shortcuts import get_object_or_404
    deadline = get_object_or_404(deadline_qs, pk=pk)
    linked_case = _resolve_deadline_case(deadline)
    if linked_case and not can_access_case_action(request.user, linked_case, CaseAction.EDIT):
        return HttpResponseForbidden('Je hebt geen rechten om opvolgtaken van deze casus af te ronden.')
    deadline.is_completed = True
    deadline.completed_at = timezone.now()
    deadline.completed_by = request.user
    deadline.save()
    log_action(request.user, 'UPDATE', 'OpvolgingTaak', deadline.id, str(deadline), request=request)
    messages.success(request, f'Taak "{deadline.title}" gemarkeerd als afgerond.')
    return _redirect_to_safe_next_or_default(request, reverse('carelane:deadline_list'))
