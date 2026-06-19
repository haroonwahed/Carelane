from django.views.generic import ListView, DetailView, CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import HttpResponseForbidden
from django.urls import reverse_lazy
from django.contrib import messages
from uuid import uuid4

from ..models import Document, CaseIntakeProcess
from ..forms import DocumentForm
from ..middleware import log_action
from ..permissions import CaseAction, can_access_case_action
from ..tenancy import get_user_organization, scope_queryset_for_organization, set_organization_on_instance
from .mixins import TenantScopedQuerysetMixin, TenantAssignCreateMixin
from ._utils import _case_detail_tab_href


class DocumentListView(TenantScopedQuerysetMixin, LoginRequiredMixin, ListView):
    model = Document
    template_name = 'contracts/document_list.html'
    context_object_name = 'documents'
    paginate_by = 25

    def get_queryset(self):
        org = self.get_organization()
        qs = scope_queryset_for_organization(
            Document.objects.select_related('contract', 'matter', 'client', 'uploaded_by'),
            org,
        )
        q = self.request.GET.get('q')
        doc_type = self.request.GET.get('type')
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(tags__icontains=q))
        if doc_type:
            qs = qs.filter(document_type=doc_type)
        return qs.order_by('-created_at')

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        org = self.get_organization()
        all_docs = scope_queryset_for_organization(Document.objects.all(), org)
        editable_document_ids = set()
        document_rows = []
        for doc in ctx['documents']:
            case_href = None
            intake = None
            if doc.contract:
                intake = getattr(doc.contract, 'due_diligence_process', None)
                if intake:
                    case_href = _case_detail_tab_href(intake.pk, 'documenten')

            if not doc.contract or can_access_case_action(self.request.user, doc.contract, CaseAction.EDIT):
                editable_document_ids.add(doc.pk)

            document_rows.append({
                'document': doc,
                'case_href': case_href,
                'can_edit': doc.pk in editable_document_ids,
            })

        ctx.update({
            'total_documents': all_docs.count(),
            'review_documents': all_docs.filter(status=Document.Status.REVIEW).count(),
            'draft_documents': all_docs.filter(status=Document.Status.DRAFT).count(),
            'editable_document_ids': editable_document_ids,
            'document_rows': document_rows,
        })
        return ctx


class DocumentDetailView(TenantScopedQuerysetMixin, LoginRequiredMixin, DetailView):
    model = Document
    template_name = 'contracts/document_detail.html'
    context_object_name = 'document'

    def get_queryset(self):
        org = self.get_organization()
        return scope_queryset_for_organization(Document.objects.all(), org)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['versions'] = Document.objects.filter(parent_document=self.object).order_by('-version')
        ctx['can_edit_document'] = (not self.object.contract) or can_access_case_action(
            self.request.user,
            self.object.contract,
            CaseAction.EDIT,
        )
        return ctx


class DocumentCreateView(TenantAssignCreateMixin, LoginRequiredMixin, CreateView):
    model = Document
    form_class = DocumentForm
    template_name = 'contracts/document_form.html'
    success_url = reverse_lazy('carelane:document_list')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        if self.request.method == 'POST' and kwargs.get('data') is not None:
            data = kwargs['data'].copy()
            document_type = data.get('document_type')
            if (
                document_type in {
                    Document.DocType.CONTRACT,
                    Document.DocType.AMENDMENT,
                    Document.DocType.CORRESPONDENCE,
                }
                and not str(data.get('external_handoff_reference') or '').strip()
            ):
                data['external_handoff_reference'] = f'carelane://auto-generated/document-handoff/{uuid4().hex}'
                kwargs['data'] = data
        return kwargs

    def form_valid(self, form):
        set_organization_on_instance(form.instance, get_user_organization(self.request.user))
        if form.instance.contract and not can_access_case_action(self.request.user, form.instance.contract, CaseAction.EDIT):
            return HttpResponseForbidden('Je hebt geen rechten om documenten aan deze casus toe te voegen.')
        form.instance.uploaded_by = self.request.user
        response = super().form_valid(form)
        log_action(self.request.user, 'CREATE', 'Document', self.object.id, str(self.object), request=self.request)
        messages.success(self.request, f'Document "{self.object.title}" is toegevoegd.')
        return response


class DocumentUpdateView(TenantScopedQuerysetMixin, LoginRequiredMixin, UpdateView):
    model = Document
    form_class = DocumentForm
    template_name = 'contracts/document_form.html'
    success_url = reverse_lazy('carelane:document_list')

    def get_queryset(self):
        org = self.get_organization()
        return scope_queryset_for_organization(Document.objects.all(), org)

    def dispatch(self, request, *args, **kwargs):
        document = self.get_object()
        if document.contract and not can_access_case_action(request.user, document.contract, CaseAction.EDIT):
            return HttpResponseForbidden('Je hebt geen rechten om documenten van deze casus te bewerken.')
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        response = super().form_valid(form)
        log_action(self.request.user, 'UPDATE', 'Document', self.object.id, str(self.object), request=self.request)
        return response
