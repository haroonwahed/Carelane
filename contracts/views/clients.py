from django.views.generic import ListView, DetailView, CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Count, Q
from django.urls import reverse_lazy, reverse

from ..models import (
    Client, CareConfiguration, CaseIntakeProcess, PlacementRequest, RegionalConfiguration,
    ProviderProfile,
)
from ..forms import ClientForm
from ..middleware import log_action
from ..tenancy import get_user_organization, scope_queryset_for_organization, set_organization_on_instance
from ..provider_workspace import build_provider_workspace_rows, build_provider_workspace_summary
from .mixins import TenantScopedQuerysetMixin, TenantAssignCreateMixin
from ._utils import _resolved_intake_urgency
from .matching import _provider_profile_match_surface

PROVIDER_AGE_BAND_FILTER_CHOICES = [
    ('', 'Alle leeftijden'),
    ('0_4', '0-4'),
    ('4_12', '4-12'),
    ('12_18', '12-18'),
    ('18_PLUS', '18+'),
]

PROVIDER_CARE_FORM_FILTER_CHOICES = [
    ('', 'Alle zorgvormen'),
    (CaseIntakeProcess.CareForm.OUTPATIENT, 'Ambulant'),
    (CaseIntakeProcess.CareForm.DAY_TREATMENT, 'Dagbehandeling'),
    (CaseIntakeProcess.CareForm.RESIDENTIAL, 'Residentieel'),
    (CaseIntakeProcess.CareForm.CRISIS, 'Crisisopvang'),
]


class ClientListView(TenantScopedQuerysetMixin, LoginRequiredMixin, ListView):
    model = Client
    template_name = 'contracts/client_list.html'
    context_object_name = 'clients'
    paginate_by = 25

    def get_queryset(self):
        org = get_user_organization(self.request.user)
        qs = scope_queryset_for_organization(Client.objects.all(), org).select_related(
            'provider_profile'
        ).prefetch_related(
            'provider_profile__served_regions',
            'wait_time_entries',
        )
        q = self.request.GET.get('q')
        status = self.request.GET.get('status')
        client_type = self.request.GET.get('type')
        region_type = self.request.GET.get('region_type')
        region_id = self.request.GET.get('region')
        care_form = self.request.GET.get('care_form')
        age_band = self.request.GET.get('age_band')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(email__icontains=q) | Q(industry__icontains=q))
        if status:
            if status == 'REJECTED_OR_INFO':
                qs = qs.filter(status__in=[PlacementRequest.Status.REJECTED, PlacementRequest.Status.NEEDS_INFO])
            else:
                qs = qs.filter(status=status)
        if client_type:
            qs = qs.filter(client_type=client_type)
        if region_type:
            qs = qs.filter(provider_profile__served_regions__region_type=region_type)
        if region_id and region_id.isdigit():
            qs = qs.filter(provider_profile__served_regions__id=int(region_id))
        if care_form == CaseIntakeProcess.CareForm.OUTPATIENT:
            qs = qs.filter(provider_profile__offers_outpatient=True)
        elif care_form == CaseIntakeProcess.CareForm.DAY_TREATMENT:
            qs = qs.filter(provider_profile__offers_day_treatment=True)
        elif care_form == CaseIntakeProcess.CareForm.RESIDENTIAL:
            qs = qs.filter(provider_profile__offers_residential=True)
        elif care_form == CaseIntakeProcess.CareForm.CRISIS:
            qs = qs.filter(provider_profile__offers_crisis=True)
        if age_band == '0_4':
            qs = qs.filter(provider_profile__target_age_0_4=True)
        elif age_band == '4_12':
            qs = qs.filter(provider_profile__target_age_4_12=True)
        elif age_band == '12_18':
            qs = qs.filter(provider_profile__target_age_12_18=True)
        elif age_band == '18_PLUS':
            qs = qs.filter(provider_profile__target_age_18_plus=True)
        return qs.distinct().order_by('name')

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        org = get_user_organization(self.request.user)
        tenant_clients = scope_queryset_for_organization(Client.objects.all(), org)
        filtered_clients = list(self.object_list)
        paginated_clients = list(ctx['clients'])
        workspace_summary = build_provider_workspace_summary(filtered_clients)

        client_stats = tenant_clients.aggregate(total=Count('id'))
        ctx['total_clients'] = client_stats['total']
        ctx['active_clients'] = workspace_summary['direct_capacity_count']
        ctx['provider_workspace_summary'] = workspace_summary
        ctx['provider_rows'] = build_provider_workspace_rows(paginated_clients)
        ctx['search_query'] = self.request.GET.get('q', '')
        ctx['selected_status'] = self.request.GET.get('status', '')
        ctx['selected_client_type'] = self.request.GET.get('type', '')
        ctx['selected_care_form'] = self.request.GET.get('care_form', '')
        ctx['selected_age_band'] = self.request.GET.get('age_band', '')
        selected_region_type = self.request.GET.get('region_type', '')
        region_qs = RegionalConfiguration.objects.filter(organization=org)
        if selected_region_type:
            region_qs = region_qs.filter(region_type=selected_region_type)
        ctx['region_type_choices'] = RegionalConfiguration._meta.get_field('region_type').choices
        ctx['care_form_choices'] = PROVIDER_CARE_FORM_FILTER_CHOICES
        ctx['age_band_choices'] = PROVIDER_AGE_BAND_FILTER_CHOICES
        ctx['selected_region_type'] = selected_region_type
        ctx['selected_region'] = self.request.GET.get('region', '')
        ctx['region_choices'] = region_qs.order_by('region_name')
        query_params = self.request.GET.copy()
        query_params.pop('page', None)
        ctx['pagination_query'] = query_params.urlencode()
        ctx['has_active_filters'] = any(
            self.request.GET.get(key)
            for key in ('q', 'status', 'type', 'region_type', 'region', 'care_form', 'age_band')
        )
        return ctx


class ClientDetailView(TenantScopedQuerysetMixin, LoginRequiredMixin, DetailView):
    model = Client
    template_name = 'contracts/client_detail.html'
    context_object_name = 'client'

    def get_queryset(self):
        org = get_user_organization(self.request.user)
        return scope_queryset_for_organization(Client.objects.all(), org)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        configurations = self.object.matters.all()[:10]
        case_records = self.object.contracts.all()[:10]
        ctx['configurations'] = configurations
        ctx['case_records'] = case_records
        ctx['documents'] = self.object.documents.all()[:10]

        profile = getattr(self.object, 'provider_profile', None)
        free_slots = 0
        waiting_days = 0
        capacity_status_label = 'Beperkt'
        capacity_status_badge = 'badge-capacity-limited'
        intake_timing_label = 'Intake op korte termijn'
        operational_status_line = 'Controleer capaciteit en casusfit voor toewijzing.'

        capability_rows = []
        why_passing = []
        constraints = []
        risk_signals = []

        case_fit_summary = {
            'label': 'Geen casus geselecteerd',
            'score': None,
            'details': ['Open matching met een casuscontext om fit direct te beoordelen.'],
        }
        selected_intake = None

        if profile:
            free_slots = max(profile.max_capacity - profile.current_capacity, 0)
            waiting_days = profile.average_wait_days or 0

            if free_slots <= 0 and profile.max_capacity > 0:
                capacity_status_label = 'Vol'
                capacity_status_badge = 'badge-capacity-full'
                intake_timing_label = 'Intake tijdelijk niet beschikbaar'
                operational_status_line = 'Geen vrije plek; alternatieve aanbieder nodig.'
            elif free_slots <= 2:
                capacity_status_label = 'Beperkt'
                capacity_status_badge = 'badge-capacity-limited'
                intake_timing_label = 'Intake beperkt beschikbaar'
                operational_status_line = 'Beperkte ruimte; snel beslissen aanbevolen.'
            else:
                capacity_status_label = 'Actief'
                capacity_status_badge = 'badge-capacity-open'
                intake_timing_label = 'Intake direct mogelijk'
                operational_status_line = 'Capaciteit beschikbaar voor directe plaatsing.'

            if waiting_days > 21:
                intake_timing_label = 'Intake met wachttijd'

            offered_forms = []
            if profile.offers_outpatient:
                offered_forms.append('Ambulant')
            if profile.offers_day_treatment:
                offered_forms.append('Dagbehandeling')
            if profile.offers_residential:
                offered_forms.append('Residentieel')
            if profile.offers_crisis:
                offered_forms.append('Crisisopvang')

            supported_urgency = []
            if profile.handles_low_urgency:
                supported_urgency.append('Laag')
            if profile.handles_medium_urgency:
                supported_urgency.append('Middel')
            if profile.handles_high_urgency:
                supported_urgency.append('Hoog')
            if profile.handles_crisis_urgency:
                supported_urgency.append('Crisis')

            complexity_support = []
            if profile.handles_simple:
                complexity_support.append('Enkelvoudig')
            if profile.handles_multiple:
                complexity_support.append('Meervoudig')
            if profile.handles_high_complex:
                complexity_support.append('Hoogcomplex')

            ages = []
            if profile.target_age_0_4:
                ages.append('0-4')
            if profile.target_age_4_12:
                ages.append('4-12')
            if profile.target_age_12_18:
                ages.append('12-18')
            if profile.target_age_18_plus:
                ages.append('18+')

            capability_rows = [
                ('Zorgvormen', ', '.join(offered_forms) if offered_forms else 'Niet gespecificeerd'),
                ('Urgentie', ', '.join(supported_urgency) if supported_urgency else 'Niet gespecificeerd'),
                ('Complexiteit', ', '.join(complexity_support) if complexity_support else 'Niet gespecificeerd'),
                ('Doelgroep leeftijd', ', '.join(ages) if ages else 'Niet gespecificeerd'),
                ('Dienstgebied', profile.service_area or self.object.city or 'Niet gespecificeerd'),
            ]

            why_passing = [
                f'{free_slots} vrije plek(ken) beschikbaar' if free_slots > 0 else 'Capaciteit momenteel vol',
                f'Gemiddelde wachttijd: {waiting_days} dagen',
                'Profiel matchbaar op zorgvorm en urgentie',
            ]

            if profile.special_facilities:
                why_passing.append('Beschikt over aanvullende faciliteiten')

            if free_slots <= 0:
                constraints.append('Geen vrije plekken beschikbaar')
                risk_signals.append('Capaciteit is volledig benut')
            if waiting_days > 28:
                constraints.append('Wachttijd boven 4 weken')
                risk_signals.append('Verhoogde wachttijd voor intake')
            if not profile.offers_crisis:
                constraints.append('Geen crisisopvang in profiel')
            if not profile.special_facilities:
                constraints.append('Speciale faciliteiten niet gespecificeerd')

            intake_raw = (self.request.GET.get('intake') or '').strip()
            if intake_raw.isdigit():
                selected_intake = CaseIntakeProcess.objects.filter(
                    organization=self.object.organization,
                    pk=int(intake_raw),
                ).first()

            if selected_intake:
                form_fit = {
                    str(CaseIntakeProcess.CareForm.OUTPATIENT): profile.offers_outpatient,
                    str(CaseIntakeProcess.CareForm.DAY_TREATMENT): profile.offers_day_treatment,
                    str(CaseIntakeProcess.CareForm.RESIDENTIAL): profile.offers_residential,
                    str(CaseIntakeProcess.CareForm.CRISIS): profile.offers_crisis,
                }.get(str(selected_intake.preferred_care_form), False)
                urgency_fit = {
                    str(CaseIntakeProcess.Urgency.LOW): profile.handles_low_urgency,
                    str(CaseIntakeProcess.Urgency.MEDIUM): profile.handles_medium_urgency,
                    str(CaseIntakeProcess.Urgency.HIGH): profile.handles_high_urgency,
                    str(CaseIntakeProcess.Urgency.CRISIS): profile.handles_crisis_urgency,
                }.get(str(_resolved_intake_urgency(selected_intake)), False)

                category_fit = False
                if selected_intake.care_category_main_id:
                    category_fit = profile.target_care_categories.filter(id=selected_intake.care_category_main_id).exists()
                subcategory_fit = False
                if selected_intake.care_category_sub_id and hasattr(profile, 'target_care_subcategories'):
                    subcategory_fit = profile.target_care_subcategories.filter(id=selected_intake.care_category_sub_id).exists()

                fit_points = [form_fit, urgency_fit, category_fit, subcategory_fit]
                fit_score = int((sum(1 for p in fit_points if p) / 4) * 100)
                case_fit_summary = {
                    'label': f'Casus {selected_intake.pk}: {selected_intake.title}',
                    'score': fit_score,
                    'details': [
                        f"Zorgvorm fit: {'Ja' if form_fit else 'Nee'}",
                        f"Urgentie fit: {'Ja' if urgency_fit else 'Nee'}",
                        f"Categorie fit: {'Ja' if category_fit else 'Nee'}",
                        f"Specifieke zorgbehoefte fit: {'Ja' if subcategory_fit else 'Nee'}",
                    ],
                }
            else:
                case_fit_summary = {
                    'label': 'Geen casus geselecteerd',
                    'score': None,
                    'details': [
                        'Open deze aanbieder vanuit matching voor directe casusfit.',
                        'Gebruik Wijs toe om terug te gaan naar casusgerichte toewijzing.',
                    ],
                }

        track_record = {
            'active_cases': int(self.object.total_billed),
            'open_cases': int(self.object.outstanding_balance),
            'active_configurations': self.object.active_matters_count,
        }

        ctx['provider_profile'] = profile
        ctx['provider_free_slots'] = free_slots
        ctx['provider_wait_days'] = waiting_days
        ctx['provider_capacity_status_label'] = capacity_status_label
        ctx['provider_capacity_status_badge'] = capacity_status_badge
        ctx['provider_intake_timing_label'] = intake_timing_label
        ctx['provider_operational_status_line'] = operational_status_line
        ctx['provider_capability_rows'] = capability_rows
        ctx['provider_why_passing'] = why_passing
        ctx['provider_constraints'] = constraints
        ctx['provider_risk_signals'] = risk_signals
        ctx['selected_intake'] = selected_intake
        ctx['case_fit_summary'] = case_fit_summary
        ctx['provider_track_record'] = track_record
        ctx['provider_edit_url'] = reverse('carelane:client_update', kwargs={'pk': self.object.pk})
        ctx['provider_match_surface'] = _provider_profile_match_surface(profile)
        return ctx


class ClientCreateView(TenantAssignCreateMixin, LoginRequiredMixin, CreateView):
    model = Client
    form_class = ClientForm
    template_name = 'contracts/client_form.html'
    success_url = reverse_lazy('carelane:client_list')

    def form_valid(self, form):
        set_organization_on_instance(form.instance, get_user_organization(self.request.user))
        form.instance.created_by = self.request.user
        response = super().form_valid(form)
        profile, _ = ProviderProfile.objects.get_or_create(client=self.object)
        profile.served_regions.set(form.cleaned_data.get('served_regions', []))
        log_action(self.request.user, 'CREATE', 'Client', self.object.id, str(self.object), request=self.request)
        from django.contrib import messages
        messages.success(self.request, f'Aanbieder "{self.object.name}" is aangemaakt.')
        return response

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        org = get_user_organization(self.request.user)
        form.fields['served_regions'].queryset = RegionalConfiguration.objects.filter(organization=org).order_by('region_type', 'region_name')
        return form


class ClientUpdateView(TenantScopedQuerysetMixin, LoginRequiredMixin, UpdateView):
    model = Client
    form_class = ClientForm
    template_name = 'contracts/client_form.html'
    success_url = reverse_lazy('carelane:client_list')

    def get_queryset(self):
        org = get_user_organization(self.request.user)
        return scope_queryset_for_organization(Client.objects.all(), org)

    def form_valid(self, form):
        response = super().form_valid(form)
        profile, _ = ProviderProfile.objects.get_or_create(client=self.object)
        profile.served_regions.set(form.cleaned_data.get('served_regions', []))
        log_action(self.request.user, 'UPDATE', 'Client', self.object.id, str(self.object), request=self.request)
        from django.contrib import messages
        messages.success(self.request, f'Aanbieder "{self.object.name}" is bijgewerkt.')
        return response

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        org = get_user_organization(self.request.user)
        form.fields['served_regions'].queryset = RegionalConfiguration.objects.filter(organization=org).order_by('region_type', 'region_name')
        return form
