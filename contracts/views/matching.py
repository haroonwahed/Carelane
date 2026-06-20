from django.utils import timezone
from django.contrib import messages
from django.db.models import Q, Count, Avg
from django.utils.dateparse import parse_date
from datetime import timedelta, date
from math import asin, cos, radians, sin, sqrt
from collections import defaultdict
import logging

from ..models import (
    CaseIntakeProcess, Client, PlacementRequest, ProviderProfile, AuditLog,
    RegionalConfiguration, MunicipalityConfiguration,
    CaseAssessment, CareSignal, CaseDecisionLog,
)
from ..middleware import log_action
from ..permissions import can_manage_organization
from ..tenancy import get_user_organization, scope_queryset_for_organization
from ..provider_metrics import (
    build_provider_behavior_metrics, calculate_provider_behavior_modifier,
    describe_behavior_influence, derive_behavior_signals, label_behavior_signals,
)
from ..provider_location import provider_location_payload as _provider_location_payload
from ..zorgbehoefte_taxonomy import format_taxonomy_explainability
from ..case_intelligence import (
    calculate_provider_response_sla, derive_provider_response_ownership, evaluate_case_intelligence,
)
from ..governance import (
    build_matching_recommendation_payload, detect_and_log_sla_transition, log_case_decision_event,
)
from ..case_timeline import record_gemeente_validation_to_provider_review_boundary
from ..provider_matching_service import MatchContext, MatchEngine
from ..operational_decision_contract import build_operational_decision_for_intake
from ..operational_decision_presenter import present_operational_decision
from ..workflow_state_machine import (
    WAITLIST_PROPOSAL_NOTES_MARKER, WorkflowAction, WorkflowRole, WorkflowState,
    derive_workflow_state, evaluate_transition, log_transition_event,
    normalize_provider_rejection_states, resolve_actor_role,
)
from ._utils import _coerce_coordinate, _extract_coordinates, _to_bool_filter, _urgency_rank
from contracts.workflow_bus import emit_placement_status_changed, emit_intake_status_changed
from django.core.exceptions import ValidationError

logger = logging.getLogger(__name__)


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


def _provider_profile_age_bands(profile):
    if not profile:
        return []
    bands = []
    if profile.target_age_0_4:
        bands.append('0_4')
    if profile.target_age_4_12:
        bands.append('4_12')
    if profile.target_age_12_18:
        bands.append('12_18')
    if profile.target_age_18_plus:
        bands.append('18_PLUS')
    return bands


def _provider_profile_care_forms(profile):
    if not profile:
        return []
    forms = []
    if profile.offers_outpatient:
        forms.append(CaseIntakeProcess.CareForm.OUTPATIENT)
    if profile.offers_day_treatment:
        forms.append(CaseIntakeProcess.CareForm.DAY_TREATMENT)
    if profile.offers_residential:
        forms.append(CaseIntakeProcess.CareForm.RESIDENTIAL)
    if profile.offers_crisis:
        forms.append(CaseIntakeProcess.CareForm.CRISIS)
    return forms


def _provider_profile_match_surface(profile):
    if not profile:
        return {
            'age_bands': [],
            'age_summary': 'Leeftijd nog niet ingericht',
            'care_forms': [],
            'care_form_summary': 'Zorgvormen nog niet ingesteld',
            'gender_restriction': '',
            'gender_summary': 'Geen geslachtsbeperking opgegeven',
            'specialization_summary': 'Specialisaties nog niet ingesteld',
            'contra_summary': 'Geen contra-indicaties opgegeven',
            'profile_summary': {
                'age_bands': [],
                'care_forms': [],
                'gender_restriction': '',
                'specializations': [],
                'contra_indicaties': [],
            },
        }

    age_bands = _provider_profile_age_bands(profile)
    care_forms = _provider_profile_care_forms(profile)
    specializations = [line.strip() for line in str(getattr(profile, 'specialisaties', '') or '').splitlines() if line.strip()]
    contra = [line.strip() for line in str(getattr(profile, 'contra_indicaties', '') or '').split(',') if line.strip()]
    gender_restriction = (getattr(profile, 'geslacht_beperking', '') or '').strip()

    age_label_map = {
        '0_4': '0-4',
        '4_12': '4-12',
        '12_18': '12-18',
        '18_PLUS': '18+',
    }
    care_form_label_map = {
        CaseIntakeProcess.CareForm.OUTPATIENT: 'Ambulant',
        CaseIntakeProcess.CareForm.DAY_TREATMENT: 'Dagbehandeling',
        CaseIntakeProcess.CareForm.RESIDENTIAL: 'Residentieel',
        CaseIntakeProcess.CareForm.CRISIS: 'Crisisopvang',
    }

    return {
        'age_bands': age_bands,
        'age_summary': ', '.join(age_label_map[band] for band in age_bands) if age_bands else 'Leeftijd nog niet ingericht',
        'care_forms': care_forms,
        'care_form_summary': ', '.join(care_form_label_map[form] for form in care_forms) if care_forms else 'Zorgvormen nog niet ingesteld',
        'gender_restriction': gender_restriction,
        'gender_summary': gender_restriction or 'Geen geslachtsbeperking opgegeven',
        'specialization_summary': ', '.join(specializations[:3]) if specializations else 'Specialisaties nog niet ingesteld',
        'contra_summary': ', '.join(contra[:3]) if contra else 'Geen contra-indicaties opgegeven',
        'profile_summary': {
            'age_bands': age_bands,
            'care_forms': care_forms,
            'gender_restriction': gender_restriction,
            'specializations': specializations,
            'contra_indicaties': contra,
        },
    }


def _provider_profile_supports_age_band(profile, age_band):
    if not age_band:
        return True
    return age_band in _provider_profile_age_bands(profile)


def _provider_profile_supports_care_form(profile, care_form):
    if not care_form:
        return True
    return care_form in _provider_profile_care_forms(profile)


def _provider_capacity_filter_key(suggestion):
    free_slots = suggestion.get('free_slots')
    avg_wait_days = suggestion.get('avg_wait_days')
    if free_slots is None:
        return 'unknown'
    if free_slots <= 0:
        return 'full'
    if free_slots <= 2 or (avg_wait_days is not None and avg_wait_days > 21):
        return 'limited'
    return 'direct'


def _provider_region_fit_key(suggestion):
    if suggestion.get('region_match'):
        return 'exact'
    if suggestion.get('region_type_match'):
        return 'compatible'
    return 'review'


def _provider_form_match(profile, intake):
    return {
        CaseIntakeProcess.CareForm.OUTPATIENT: profile.offers_outpatient,
        CaseIntakeProcess.CareForm.DAY_TREATMENT: profile.offers_day_treatment,
        CaseIntakeProcess.CareForm.RESIDENTIAL: profile.offers_residential,
        CaseIntakeProcess.CareForm.CRISIS: profile.offers_crisis,
    }.get(intake.preferred_care_form, False)


def _resolved_intake_urgency(intake):
    urgency = (getattr(intake, 'urgency', '') or '').strip()
    if urgency:
        return urgency
    try:
        return (intake.derive_operational_urgency() or '').strip()
    except Exception:
        return ''


def _provider_urgency_match(profile, intake):
    return {
        CaseIntakeProcess.Urgency.LOW: profile.handles_low_urgency,
        CaseIntakeProcess.Urgency.MEDIUM: profile.handles_medium_urgency,
        CaseIntakeProcess.Urgency.HIGH: profile.handles_high_urgency,
        CaseIntakeProcess.Urgency.CRISIS: profile.handles_crisis_urgency,
    }.get(_resolved_intake_urgency(intake), False)


def _capacity_status_label(free_slots):
    if free_slots > 3:
        return 'available', 'Capaciteit beschikbaar'
    if free_slots > 0:
        return 'limited', 'Capaciteit beperkt'
    return 'full', 'Geen directe capaciteit'


def _performance_status_label(wait_days):
    if wait_days <= 14:
        return 'good', 'Korte wachttijd'
    if wait_days <= 28:
        return 'acceptable', 'Acceptabele wachttijd'
    return 'slow', 'Relatief lange wachttijd'


def _first_related(queryset_or_manager):
    if queryset_or_manager is None:
        return None

    try:
        return queryset_or_manager.all().first()
    except AttributeError:
        return None


def _haversine_distance_km(latitude_a, longitude_a, latitude_b, longitude_b):
    if None in {latitude_a, longitude_a, latitude_b, longitude_b}:
        return None

    radius_km = 6371.0
    latitude_delta = radians(latitude_b - latitude_a)
    longitude_delta = radians(longitude_b - longitude_a)
    start_latitude = radians(latitude_a)
    end_latitude = radians(latitude_b)

    arc = sin(latitude_delta / 2) ** 2 + cos(start_latitude) * cos(end_latitude) * sin(longitude_delta / 2) ** 2
    return round(2 * radius_km * asin(sqrt(arc)), 1)


def _preferred_region_label(intake):
    preferred_region = getattr(intake, 'preferred_region', None)
    if preferred_region:
        return preferred_region.region_name
    return getattr(intake, 'region', '') or getattr(intake, 'region_name', '') or ''


def _build_case_location(intake):
    preferred_region = getattr(intake, 'preferred_region', None)
    municipality = _first_related(preferred_region.served_municipalities) if preferred_region else None
    region_label = _preferred_region_label(intake)
    municipality_label = municipality.municipality_name if municipality else ''
    location_label = municipality_label or region_label or 'Casuslocatie onbekend'

    sources = [intake]
    linked_case = getattr(intake, 'case_record', None)
    if linked_case is not None:
        sources.append(linked_case)
        linked_client = getattr(linked_case, 'client', None)
        if linked_client is not None:
            sources.append(linked_client)
    if preferred_region is not None:
        sources.append(preferred_region)
    if municipality is not None:
        sources.append(municipality)

    latitude = None
    longitude = None
    for source in sources:
        latitude, longitude = _extract_coordinates(source)
        if latitude is not None and longitude is not None:
            break

    return {
        'label': location_label,
        'latitude': latitude,
        'longitude': longitude,
        'region_label': region_label,
        'municipality_label': municipality_label,
        'has_coordinates': latitude is not None and longitude is not None,
    }


def _provider_specialization_summary(profile):
    categories = [category.name for category in list(profile.target_care_categories.all())[:2]]
    if categories:
        return ', '.join(categories)

    offered_forms = []
    if profile.offers_outpatient:
        offered_forms.append('Ambulant')
    if profile.offers_day_treatment:
        offered_forms.append('Dagbehandeling')
    if profile.offers_residential:
        offered_forms.append('Residentieel')
    if profile.offers_crisis:
        offered_forms.append('Crisisopvang')
    if offered_forms:
        return ', '.join(offered_forms[:2])

    if profile.special_facilities:
        return profile.special_facilities.splitlines()[0][:80]
    return 'Algemene zorgondersteuning'


def _build_matching_explanation(*, match_score, category_match, urgency_match, care_form_match, region_match, region_type_match, free_slots, average_wait_days, specialization_summary, tradeoff):
    capacity_status, capacity_label = _capacity_status_label(free_slots)
    performance_status, performance_label = _performance_status_label(average_wait_days)

    if match_score >= 80 and free_slots > 0 and care_form_match and urgency_match:
        confidence = 'high'
        confidence_reason = 'Sterke fit op zorgvorm, urgentie en operationele haalbaarheid.'
    elif match_score >= 55:
        confidence = 'medium'
        confidence_reason = 'Passende optie, maar met expliciete handmatige controle op capaciteit of regio.'
    else:
        confidence = 'low'
        confidence_reason = 'Aanbeveling is bruikbaar als alternatief, maar vraagt nadrukkelijke validatie.'

    trade_offs = []
    if tradeoff:
        trade_offs.append(tradeoff)

    verify_manually = []
    if not region_match:
        verify_manually.append('Controleer of de casus praktisch uitvoerbaar is binnen de gewenste regio.')
    if capacity_status != 'available':
        verify_manually.append('Bevestig actuele capaciteit voordat je toewijst.')
    if performance_status == 'slow':
        verify_manually.append('Beoordeel of de wachttijd verdedigbaar is voor deze casus.')
    if not verify_manually:
        verify_manually.append('Bevestig intake-fit en uitvoerbaarheid in de casuswerkruimte.')

    fit_summary_parts = []
    if category_match:
        fit_summary_parts.append('categorie')
    if urgency_match:
        fit_summary_parts.append('urgentie')
    if care_form_match:
        fit_summary_parts.append('zorgvorm')
    if region_match:
        fit_summary_parts.append('regio')
    fit_summary = 'Sterke fit op ' + ', '.join(fit_summary_parts[:3]) if fit_summary_parts else 'Handmatige beoordeling nodig om de fit te bevestigen.'

    return {
        'fit_summary': fit_summary,
        'factors': {
            'specialization': {
                'status': 'match' if category_match else 'review',
                'detail': 'Categorie match aanwezig.' if category_match else specialization_summary,
            },
            'urgency': {
                'status': 'match' if urgency_match else 'review',
                'detail': 'Urgentie past binnen het aanbiederprofiel.' if urgency_match else 'Controleer of deze aanbieder de urgentie aankan.',
            },
            'care_form': {
                'status': 'match' if care_form_match else 'review',
                'detail': 'Gevraagde zorgvorm is beschikbaar.' if care_form_match else 'Zorgvorm vraagt aanvullende controle.',
            },
            'region': {
                'status': 'exact' if region_match else 'compatible' if region_type_match else 'review',
                'detail': 'Voorkeursregio sluit aan.' if region_match else 'Regiotype sluit aan, maar exacte locatie moet worden bevestigd.' if region_type_match else 'Geen harde geografische bevestiging beschikbaar.',
            },
            'capacity': {
                'status': capacity_status,
                'detail': capacity_label if free_slots <= 0 else f'{capacity_label} ({free_slots} vrije plekken).',
            },
            'performance': {
                'status': performance_status,
                'detail': f'{performance_label} ({average_wait_days} dagen).',
            },
        },
        'confidence': confidence,
        'confidence_reason': confidence_reason,
        'trade_offs': trade_offs,
        'verify_manually': verify_manually,
        'behavior_consideration': 'Niet toegepast op ranking (onvoldoende nabijheid of historie)',
        'behavior_influence': ['Limited provider history, behavioral influence kept neutral'],
    }


def _build_matching_map_context(intake, suggestions, *, selected_provider_id=None):
    case_location = _build_case_location(intake)
    provider_markers = []

    for rank, suggestion in enumerate(suggestions[:5], start=1):
        provider_location = suggestion.get('location') or {}
        distance_km = _haversine_distance_km(
            case_location.get('latitude'),
            case_location.get('longitude'),
            provider_location.get('latitude'),
            provider_location.get('longitude'),
        )
        provider_markers.append(
            {
                'provider_id': suggestion['provider_id'],
                'provider_name': suggestion['provider_name'],
                'rank': rank,
                'emphasis': 'primary' if rank == 1 else 'secondary',
                'match_score': suggestion['match_score'],
                'fit_score': suggestion['fit_score'],
                'geo_fit_score': 100 if suggestion.get('region_match') else None,
                'capacity_status': suggestion.get('capacity_status'),
                'capacity_status_label': suggestion.get('capacity_label'),
                'specialization_summary': suggestion.get('specialization_summary'),
                'distance_km': distance_km,
                'distance_label': f'{distance_km} km vanaf casus' if distance_km is not None else '',
                'location_label': provider_location.get('label') or 'Locatie ontbreekt',
                'region_label': provider_location.get('region_label') or '',
                'latitude': provider_location.get('latitude'),
                'longitude': provider_location.get('longitude'),
                'has_coordinates': bool(provider_location.get('has_coordinates')),
            }
        )

    providers_with_coordinates = [marker for marker in provider_markers if marker['has_coordinates']]
    has_case_coordinates = case_location['has_coordinates']
    can_render_map = bool(has_case_coordinates and providers_with_coordinates)
    has_partial_geo = bool(has_case_coordinates or providers_with_coordinates)
    has_candidates = bool(provider_markers)

    limitations = []
    if not case_location['has_coordinates']:
        limitations.append('Casus mist geo.')
    if has_candidates and not providers_with_coordinates:
        limitations.append('Aanbieders missen geo.')
    if has_candidates and not any(marker['distance_label'] for marker in provider_markers):
        limitations.append('Afstand volgt zodra geo compleet is.')

    if not has_candidates:
        empty_state = {
            'title': 'Nog geen kaart',
            'message': 'Start matching om kandidaten te tonen.',
        }
    elif can_render_map:
        empty_state = {
            'title': '',
            'message': '',
        }
    elif has_partial_geo:
        empty_state = {
            'title': 'Kaart deels beschikbaar',
            'message': 'Er is geo, maar nog niet genoeg voor een volle kaart.',
        }
    else:
        empty_state = {
            'title': 'Nog geen geo',
            'message': 'Voeg geo toe om de kaart te tonen.',
        }

    return {
        'integration': {
            'library': 'mapbox-gl-js',
            'mode': 'shell',
            'library_available': False,
        },
        'summary': {
            'candidate_count': len(provider_markers),
            'providers_with_coordinates': len(providers_with_coordinates),
            'has_case_coordinates': has_case_coordinates,
            'can_render_map': can_render_map,
            'has_partial_geo': has_partial_geo,
        },
        'case_location': case_location,
        'provider_markers': provider_markers,
        'selected_provider_id': selected_provider_id,
        'empty_state': empty_state,
        'limitations': limitations,
    }


def _behavior_tiebreak_weight(distance_from_top):
    if distance_from_top <= 5:
        return 1.0
    if distance_from_top <= 10:
        return 0.6
    if distance_from_top <= 15:
        return 0.3
    return 0.0


def _build_provider_outcome_context(provider_id):
    metrics = build_provider_behavior_metrics(provider_id)
    total_cases = int(metrics.get('total_cases') or 0)
    if total_cases <= 0:
        return None

    acceptance_rate = metrics.get('acceptance_rate')
    intake_success_rate = metrics.get('intake_success_rate')

    evidence_level = 'sufficient' if total_cases >= 3 else 'limited'
    evidence_label = 'Voldoende historie' if evidence_level == 'sufficient' else 'Beperkte historie'

    if evidence_level == 'sufficient':
        summary = f'Gebaseerd op {total_cases} eerdere plaatsingen bij deze aanbieder.'
        warning = None
    else:
        summary = f'Gebaseerd op {total_cases} eerdere plaatsing(en); signalen zijn indicatief.'
        warning = 'Historische signalen zijn indicatief en vragen extra handmatige verificatie.'

    acceptance_label = None
    if acceptance_rate is not None:
        acceptance_label = f'Acceptatiegraad: {round(acceptance_rate * 100)}%'

    quality_label = 'Risico op uitval: onvoldoende data'
    if intake_success_rate is not None:
        dropout_risk = max(0, min(100, round((1 - intake_success_rate) * 100)))
        quality_label = f'Risico op uitval: {dropout_risk}%'

    return {
        'evidence_level': evidence_level,
        'evidence_label': evidence_label,
        'summary': summary,
        'acceptance_label': acceptance_label,
        'quality_label': quality_label,
        'warning': warning,
    }


def _build_case_intelligence_context(
    intake,
    *,
    assessment,
    placement,
    matching_preview_candidates,
    latest_assignment,
    open_signals_count,
    open_tasks_count,
    rejected_count,
):
    top_candidate = matching_preview_candidates[0] if matching_preview_candidates else None
    has_region_preference = bool(intake.preferred_region_id or intake.preferred_region_type)

    candidate_suggestions = []
    for row in matching_preview_candidates:
        candidate_suggestions.append(
            {
                'provider_id': row.get('provider_id'),
                'confidence': (row.get('explanation') or {}).get('confidence'),
                'has_capacity_issue': (row.get('free_slots') or 0) <= 0,
                'wait_days': row.get('avg_wait_days'),
                'has_region_mismatch': bool(has_region_preference and not row.get('region_match')),
            }
        )

    from ._utils import _flow_stage_for_intake_status
    case_data = {
        'phase': _flow_stage_for_intake_status(intake.status),
        'care_category': intake.care_category_main.name if intake.care_category_main else None,
        'care_category_code': intake.care_category_main.code if intake.care_category_main else None,
        'care_subcategory': intake.care_category_sub.name if intake.care_category_sub else None,
        'care_subcategory_code': intake.care_category_sub.code if intake.care_category_sub else None,
        'taxonomie_lijn': format_taxonomy_explainability(
            intake.care_category_main.name if intake.care_category_main else '',
            intake.care_category_main.code if intake.care_category_main else '',
            intake.care_category_sub.name if intake.care_category_sub else '',
            intake.care_category_sub.code if intake.care_category_sub else '',
        )[0],
        'taxonomie_code_lijn': format_taxonomy_explainability(
            intake.care_category_main.name if intake.care_category_main else '',
            intake.care_category_main.code if intake.care_category_main else '',
            intake.care_category_sub.name if intake.care_category_sub else '',
            intake.care_category_sub.code if intake.care_category_sub else '',
        )[1],
        'urgency': _resolved_intake_urgency(intake),
        'assessment_complete': bool(assessment and assessment.assessment_status == CaseAssessment.AssessmentStatus.APPROVED_FOR_MATCHING),
        'matching_run_exists': bool(matching_preview_candidates),
        'top_match_confidence': ((top_candidate or {}).get('explanation') or {}).get('confidence'),
        'top_match_has_capacity_issue': bool(top_candidate and (top_candidate.get('free_slots') or 0) <= 0),
        'top_match_wait_days': top_candidate.get('avg_wait_days') if top_candidate else None,
        'selected_provider_id': latest_assignment.selected_provider_id if latest_assignment else None,
        'placement_status': placement.status if placement else None,
        'placement_updated_at': placement.updated_at if placement else None,
        'rejected_provider_count': rejected_count,
        'open_signal_count': open_signals_count,
        'open_task_count': open_tasks_count,
        'case_updated_at': intake.updated_at,
        'candidate_suggestions': candidate_suggestions,
        'has_preferred_region': has_region_preference,
        'has_assessment_summary': bool(intake.assessment_summary),
        'has_client_age_category': bool(intake.client_age_category),
        'assessment_status': assessment.assessment_status if assessment else None,
        'assessment_status_label': assessment.get_assessment_status_display() if assessment else None,
        'assessment_matching_ready': assessment.matching_ready if assessment else None,
        'matching_updated_at': latest_assignment.updated_at if latest_assignment else None,
        'provider_response_status': getattr(placement, 'provider_response_status', None) if placement else None,
        'provider_response_recorded_at': getattr(placement, 'provider_response_recorded_at', None) if placement else None,
        'provider_response_requested_at': getattr(placement, 'provider_response_requested_at', None) if placement else None,
        'provider_response_deadline_at': getattr(placement, 'provider_response_deadline_at', None) if placement else None,
        'provider_response_last_reminder_at': getattr(placement, 'provider_response_last_reminder_at', None) if placement else None,
        'now': timezone.now(),
    }
    intelligence = evaluate_case_intelligence(case_data)

    known_flags = {
        'open_signals': False,
        'repeated_rejections': False,
        'weak_matching_quality': False,
        'capacity_risk': False,
        'long_wait_risk': False,
        'placement_stalled': False,
        'provider_response_delayed': False,
        'provider_not_responding': False,
        'high_urgency_response_delay': False,
        'rematch_recommended': False,
        'provider_no_capacity': False,
    }
    for signal in intelligence.get('risk_signals', []):
        code = signal.get('code')
        if code:
            known_flags[code] = True
    for item in intelligence.get('missing_information', []):
        code = item.get('code')
        if code:
            known_flags[code] = True

    hint_map = {
        row.get('provider_id'): row
        for row in intelligence.get('candidate_hints', [])
        if row.get('provider_id') is not None
    }

    return {
        'intelligence': intelligence,
        'intelligence_flags': known_flags,
        'candidate_hint_map': hint_map,
    }


def _build_match_context_from_intake(intake, organization):
    region_ref = ''
    if getattr(intake, 'regio', None):
        region_ref = intake.regio.region_code or intake.regio.region_name or ''
    elif getattr(intake, 'preferred_region', None):
        region_ref = intake.preferred_region.region_code or intake.preferred_region.region_name or ''

    gemeente_name = ''
    if getattr(intake, 'gemeente', None):
        gemeente_name = intake.gemeente.municipality_name

    problematiek = list(getattr(intake, 'problematiek_types', []) or [])
    contra_indicaties = [
        token.strip() for token in str(getattr(intake, 'contra_indicaties', '') or '').split(',') if token.strip()
    ]
    care_category_main = getattr(intake, 'care_category_main', None)
    care_category_sub = getattr(intake, 'care_category_sub', None)
    taxonomy_terms = [
        getattr(care_category_main, 'name', '') or '',
        getattr(care_category_main, 'code', '') or '',
        getattr(care_category_sub, 'name', '') or '',
        getattr(care_category_sub, 'code', '') or '',
    ]

    return MatchContext(
        zorgbehoefte_categorie=(getattr(care_category_main, 'name', '') or '').strip(),
        zorgbehoefte_categorie_code=(getattr(care_category_main, 'code', '') or '').strip(),
        zorgbehoefte_specifiek=(getattr(care_category_sub, 'name', '') or '').strip(),
        zorgbehoefte_specifiek_code=(getattr(care_category_sub, 'code', '') or '').strip(),
        zorgvorm=(getattr(intake, 'zorgvorm_gewenst', '') or intake.preferred_care_form or '').lower(),
        leeftijd=getattr(intake, 'leeftijd', None),
        regio=(region_ref or '').strip(),
        gemeente=(gemeente_name or '').strip(),
        complexiteit=(intake.complexity or '').lower(),
        urgentie=_resolved_intake_urgency(intake).lower(),
        problematiek=problematiek,
        specialisaties_gevraagd=[term for term in taxonomy_terms if str(term).strip()],
        crisisopvang_vereist=(_resolved_intake_urgency(intake) == CaseIntakeProcess.Urgency.CRISIS),
        setting_voorkeur=getattr(intake, 'setting_voorkeur', '') or '',
        contra_indicaties=contra_indicaties,
        max_toelaatbare_wachttijd_dagen=getattr(intake, 'max_toelaatbare_wachttijd_dagen', None),
        organization=organization,
    )


def _region_pressure_summary(*, intake, provider_profiles, region_id):
    if not region_id:
        return {
            'status': 'onbekend',
            'message': 'Regionale druk niet volledig bepaalbaar',
        }

    active_statuses = {
        CaseIntakeProcess.ProcessStatus.INTAKE,
        CaseIntakeProcess.ProcessStatus.MATCHING,
        CaseIntakeProcess.ProcessStatus.DECISION,
    }
    active_cases = CaseIntakeProcess.objects.filter(
        organization=intake.organization,
        status__in=active_statuses,
    ).filter(
        Q(regio_id=region_id)
        | Q(preferred_region_id=region_id)
        | Q(zorgregio_id=region_id)
        | Q(plaatsingsregio_id=region_id)
        | Q(contractregio_id=region_id)
        | Q(escalatie_regio_id=region_id)
    ).count()

    regional_profiles = [
        profile for profile in provider_profiles
        if profile.served_regions.filter(id=region_id).exists() or profile.secondary_served_regions.filter(id=region_id).exists()
    ]
    total_free_slots = sum(max((profile.max_capacity or 0) - (profile.current_capacity or 0), 0) for profile in regional_profiles)

    if total_free_slots == 0 and active_cases > 0:
        return {
            'status': 'kritiek',
            'message': 'Beste inhoudelijke match, maar capaciteit in regio staat onder druk',
        }

    if active_cases > max(total_free_slots, 1):
        return {
            'status': 'druk',
            'message': 'Regionale capaciteit is beperkt; monitor wachttijd en escalatiepad',
        }

    return {
        'status': 'stabiel',
        'message': 'Regionale dekking en capaciteit zijn op dit moment werkbaar',
    }


def _build_canonical_matching_suggestions_for_intake(intake, organization, *, limit=5):
    ctx = _build_match_context_from_intake(intake, organization)
    results = MatchEngine.run(ctx=ctx, casus=intake, max_results=max(limit * 3, 10), persist=False)
    non_excluded = [row for row in results if not row.uitgesloten]
    if not non_excluded:
        return [], [row for row in results if row.uitgesloten]

    taxonomie_lijn, taxonomie_code_lijn = format_taxonomy_explainability(
        getattr(ctx, 'zorgbehoefte_categorie', '') or '',
        getattr(ctx, 'zorgbehoefte_categorie_code', '') or '',
        getattr(ctx, 'zorgbehoefte_specifiek', '') or '',
        getattr(ctx, 'zorgbehoefte_specifiek_code', '') or '',
    )

    provider_clients = {
        client.name.strip().lower(): client
        for client in Client.objects.filter(
            organization=organization,
            client_type='CORPORATION',
            status=Client.Status.ACTIVE,
        )
    }

    suggestions = []
    for result in non_excluded[:limit]:
        provider_name = result.zorgaanbieder.name if result.zorgaanbieder_id else 'Onbekende aanbieder'
        provider_client = provider_clients.get(provider_name.strip().lower())
        provider_profile = getattr(provider_client, 'provider_profile', None) if provider_client else None
        location = _provider_location_payload(provider_profile) if provider_profile else {
            'label': result.zorgaanbieder.short_name if result.zorgaanbieder_id else 'Locatie onbekend',
            'latitude': None,
            'longitude': None,
            'region_label': '',
            'municipality_label': '',
            'has_coordinates': False,
        }

        trade_offs = []
        for item in list(result.trade_offs or []):
            if isinstance(item, dict):
                explanation = item.get('toelichting') or item.get('factor') or ''
                if explanation:
                    trade_offs.append(str(explanation))
            elif item:
                trade_offs.append(str(item))

        suggestions.append(
            {
                'casus_id': intake.pk,
                'zorgprofiel_id': result.zorgprofiel_id,
                'zorgaanbieder_id': result.zorgaanbieder_id,
                'provider_id': provider_client.id if provider_client else None,
                'provider_name': provider_name,
                'match_score': float(result.totaalscore or 0.0),
                'fit_score': float(result.score_inhoudelijke_fit or 0.0),
                'totaalscore': float(result.totaalscore or 0.0),
                'score_inhoudelijke_fit': float(result.score_inhoudelijke_fit or 0.0),
                'score_regio_contract_fit': float(result.score_regio_contract_fit or result.score_contract_regio or 0.0),
                'score_capaciteit_wachttijd_fit': float(result.score_capaciteit_wachttijd_fit or result.score_capaciteit or 0.0),
                'score_complexiteit_veiligheid_fit': float(result.score_complexiteit_veiligheid_fit or result.score_complexiteit or 0.0),
                'score_performance_fit': float(result.score_performance_fit or result.score_performance or 0.0),
                'confidence_label': str(result.confidence_label or '').lower(),
                'fit_samenvatting': result.fit_samenvatting or '',
                'trade_offs': trade_offs,
                'verificatie_advies': result.verificatie_advies or '',
                'zorgbehoefte_categorie': ctx.zorgbehoefte_categorie or '',
                'zorgbehoefte_categorie_code': ctx.zorgbehoefte_categorie_code or '',
                'zorgbehoefte_specifiek': ctx.zorgbehoefte_specifiek or '',
                'zorgbehoefte_specifiek_code': ctx.zorgbehoefte_specifiek_code or '',
                'taxonomie_lijn': taxonomie_lijn,
                'taxonomie_code_lijn': taxonomie_code_lijn,
                'uitgesloten': bool(result.uitgesloten),
                'uitsluitreden': result.uitsluitreden or '',
                'ranking': result.ranking,
                'category_match': bool(result.score_inhoudelijke_fit >= 18),
                'urgency_match': bool(result.score_complexiteit >= 7),
                'care_form_match': bool(result.score_inhoudelijke_fit >= 8),
                'region_match': bool(result.score_contract_regio >= 10),
                'free_slots': None,
                'avg_wait_days': None,
                'reason': result.fit_samenvatting or 'Deterministische matchscore toegepast',
                'reasons': [result.fit_samenvatting] if result.fit_samenvatting else [],
                'tradeoff': '; '.join(trade_offs) if trade_offs else '',
                'capacity_status': 'available' if result.score_capaciteit >= 12 else 'limited',
                'capacity_label': 'Capaciteit meegewogen in score',
                'specialization_summary': result.fit_samenvatting or 'Inhoudelijke fit berekend',
                'distance_km': None,
                'location': location,
                'behavior_labels': [],
                'decision_hint': None,
                'decision_hint_code': None,
                'decision_comparison_to_top': '',
                'decision_trade_offs': trade_offs,
                'outcome_context': None,
                'scores': {
                    'score_inhoudelijke_fit': float(result.score_inhoudelijke_fit or 0.0),
                    'score_regio_contract_fit': float(result.score_regio_contract_fit or result.score_contract_regio or 0.0),
                    'score_capaciteit_wachttijd_fit': float(result.score_capaciteit_wachttijd_fit or result.score_capaciteit or 0.0),
                    'score_complexiteit_veiligheid_fit': float(result.score_complexiteit_veiligheid_fit or result.score_complexiteit or 0.0),
                    'score_performance_fit': float(result.score_performance_fit or result.score_performance or 0.0),
                },
                'explanation': {
                    'fit_summary': result.fit_samenvatting or 'Deterministische matchscore',
                    'factors': {
                        'specialization': {
                            'status': 'match' if result.score_inhoudelijke_fit >= 18 else 'review',
                            'detail': f"Inhoudelijke fit: {result.score_inhoudelijke_fit:.1f}/35",
                        },
                        'urgency': {
                            'status': 'match' if result.score_complexiteit >= 7 else 'review',
                            'detail': f"Complexiteit/veiligheid fit: {result.score_complexiteit_veiligheid_fit or result.score_complexiteit:.1f}/15",
                        },
                        'care_form': {
                            'status': 'match' if result.score_inhoudelijke_fit >= 8 else 'review',
                            'detail': 'Zorgvorm meegewogen in inhoudelijke fit.',
                        },
                        'region': {
                            'status': 'exact' if result.score_contract_regio >= 10 else 'review',
                            'detail': f"Regio/contract fit: {result.score_regio_contract_fit or result.score_contract_regio:.1f}/20",
                        },
                        'capacity': {
                            'status': 'available' if result.score_capaciteit >= 12 else 'limited',
                            'detail': f"Capaciteit/wachttijd fit: {result.score_capaciteit_wachttijd_fit or result.score_capaciteit:.1f}/20",
                        },
                        'performance': {
                            'status': 'good' if result.score_performance >= 6 else 'review',
                            'detail': f"Performance fit: {result.score_performance_fit or result.score_performance:.1f}/10",
                        },
                    },
                    'confidence': str(result.confidence_label or '').lower(),
                    'confidence_reason': result.verificatie_advies or 'Confidence gebaseerd op score en datacompleetheid.',
                    'trade_offs': trade_offs,
                    'verify_manually': [result.verificatie_advies] if result.verificatie_advies else ['Verifieer capaciteit en contract voorafgaand aan plaatsing.'],
                    'behavior_consideration': 'Deterministisch model toegepast met expliciete regio/contract- en capaciteitsfactoren.',
                    'behavior_influence': [],
                },
            }
        )

    return suggestions, [row for row in results if row.uitgesloten]


def _sync_matching_signals_for_intake(intake, suggestions, excluded_results):
    if intake is None:
        return

    open_status = CareSignal.SignalStatus.OPEN
    no_match_title = f'Geen werkbare match in regio voor casus {intake.pk}'

    if not suggestions:
        CareSignal.objects.update_or_create(
            due_diligence_process=intake,
            title=no_match_title,
            defaults={
                'signal_type': CareSignal.SignalType.NO_MATCH,
                'description': 'Er is geen actieve providerdekking met contracteerbare capaciteit voor de casusregio.',
                'risk_level': CareSignal.RiskLevel.HIGH,
                'status': open_status,
            },
        )
    else:
        CareSignal.objects.filter(
            due_diligence_process=intake,
            title=no_match_title,
            signal_type=CareSignal.SignalType.NO_MATCH,
            status=open_status,
        ).update(status=CareSignal.SignalStatus.RESOLVED)

    weak_matches = [row for row in suggestions if (row.get('match_score') or 0) < 55]
    if weak_matches:
        CareSignal.objects.update_or_create(
            due_diligence_process=intake,
            title=f'Alleen zwakke matches voor casus {intake.pk}',
            defaults={
                'signal_type': CareSignal.SignalType.CAPACITY_ISSUE,
                'description': 'Beschikbare kandidaten scoren laag op gecombineerde fit/regio/capaciteit.',
                'risk_level': CareSignal.RiskLevel.MEDIUM,
                'status': open_status,
            },
        )

    urgent_threshold = int(getattr(intake, 'max_toelaatbare_wachttijd_dagen', 0) or 0)
    resolved_urgency = _resolved_intake_urgency(intake)
    if resolved_urgency in {CaseIntakeProcess.Urgency.HIGH, CaseIntakeProcess.Urgency.CRISIS} and urgent_threshold:
        top_wait = suggestions[0].get('avg_wait_days') if suggestions else None
        if top_wait is not None and top_wait > urgent_threshold:
            CareSignal.objects.update_or_create(
                due_diligence_process=intake,
                title=f'Urgente casus overschrijdt wachtnorm ({intake.pk})',
                defaults={
                    'signal_type': CareSignal.SignalType.WAIT_EXCEEDED,
                    'description': 'Urgentie en wachtnorm conflicteren met beschikbare regionale capaciteit.',
                    'risk_level': CareSignal.RiskLevel.HIGH,
                    'status': open_status,
                },
            )

    if excluded_results and len(excluded_results) >= 3:
        CareSignal.objects.update_or_create(
            due_diligence_process=intake,
            title=f'Herhaalde regionale schaarste voor profiel ({intake.pk})',
            defaults={
                'signal_type': CareSignal.SignalType.CAPACITY_ISSUE,
                'description': 'Meerdere kandidaten zijn uitgesloten door regio/contract/capaciteit.',
                'risk_level': CareSignal.RiskLevel.MEDIUM,
                'status': open_status,
            },
        )


def _build_matching_suggestions_for_intake(intake, provider_profiles, *, limit=5):
    canonical_suggestions, _excluded = _build_canonical_matching_suggestions_for_intake(
        intake,
        intake.organization,
        limit=limit,
    )
    if canonical_suggestions:
        return canonical_suggestions[:limit] if limit else canonical_suggestions

    suggestions = []
    taxonomie_lijn, taxonomie_code_lijn = format_taxonomy_explainability(
        getattr(getattr(intake, 'care_category_main', None), 'name', '') or '',
        getattr(getattr(intake, 'care_category_main', None), 'code', '') or '',
        getattr(getattr(intake, 'care_category_sub', None), 'name', '') or '',
        getattr(getattr(intake, 'care_category_sub', None), 'code', '') or '',
    )

    for profile in provider_profiles:
        score = 0
        reasons = []

        category_match = False
        if intake.care_category_main_id:
            category_match = profile.target_care_categories.filter(id=intake.care_category_main_id).exists()
            if category_match:
                score += 40
                reasons.append('Categorie match')
        subcategory_match = False
        if intake.care_category_sub_id and hasattr(profile, 'target_care_subcategories'):
            subcategory_match = profile.target_care_subcategories.filter(id=intake.care_category_sub_id).exists()
            if subcategory_match:
                score += 18
                reasons.append('Specifieke zorgbehoefte match')

        urgency_match = _provider_urgency_match(profile, intake)
        if urgency_match:
            score += 20
            reasons.append('Urgentie match')

        care_form_match = _provider_form_match(profile, intake)
        if care_form_match:
            score += 20
            reasons.append('Zorgvorm match')

        region_match = False
        region_type_match = False
        route_regions = [
            getattr(intake, 'plaatsingsregio', None),
            getattr(intake, 'contractregio', None),
            getattr(intake, 'zorgregio', None),
            intake.regio,
            intake.preferred_region,
        ]
        effective_region_id = next((region.id for region in route_regions if region is not None), None)
        route_region_ids = [region.id for region in route_regions if region is not None]
        if route_region_ids:
            for region_obj in route_regions:
                if region_obj is None:
                    continue
                region_match = (
                    profile.served_regions.filter(id=region_obj.id).exists()
                    or profile.secondary_served_regions.filter(id=region_obj.id).exists()
                )
                if region_match:
                    score += 15
                    reasons.append(f'{region_obj.region_name} match')
                    break
        elif intake.preferred_region_type:
            region_type_match = (
                profile.served_regions.filter(region_type=intake.preferred_region_type).exists()
                or profile.secondary_served_regions.filter(region_type=intake.preferred_region_type).exists()
            )
            if region_type_match:
                score += 8
                reasons.append('Regiotype match')

        free_slots = max(profile.max_capacity - profile.current_capacity, 0)
        if free_slots > 0:
            score += min(free_slots * 4, 20)
            reasons.append(f'{free_slots} vrije plekken')

        if profile.average_wait_days <= 14:
            score += 10
            reasons.append('Korte wachttijd')
        elif profile.average_wait_days <= 28:
            score += 5
            reasons.append('Acceptabele wachttijd')

        tradeoff = 'Handmatige afweging nodig'
        if free_slots <= 0:
            tradeoff = 'Geen directe capaciteit beschikbaar'
        elif profile.average_wait_days > 28:
            tradeoff = 'Lange wachttijd ondanks fit'
        elif score < 70:
            tradeoff = 'Lagere zekerheid dan topmatch'

        capacity_status, capacity_label = _capacity_status_label(free_slots)
        provider_location = _provider_location_payload(profile)
        specialization_summary = _provider_specialization_summary(profile)
        behavior_metrics = build_provider_behavior_metrics(profile.client_id)
        behavior_signals = derive_behavior_signals(behavior_metrics)
        behavior_labels = label_behavior_signals(behavior_signals)
        behavior_modifier = calculate_provider_behavior_modifier(
            behavior_metrics,
            case_context={
                'urgency': _resolved_intake_urgency(intake),
                'care_form': intake.preferred_care_form,
                'region_id': effective_region_id,
            },
        )
        explanation = _build_matching_explanation(
            match_score=min(score, 100),
            category_match=category_match,
            urgency_match=urgency_match,
            care_form_match=care_form_match,
            region_match=region_match,
            region_type_match=region_type_match,
            free_slots=free_slots,
            average_wait_days=profile.average_wait_days,
            specialization_summary=specialization_summary,
            tradeoff=tradeoff,
        )
        explanation['behavior_influence'] = describe_behavior_influence(
            behavior_metrics,
            behavior_signals,
            close_call_applied=False,
        )

        suggestions.append(
            {
                'casus_id': intake.pk,
                'zorgprofiel_id': None,
                'zorgaanbieder_id': None,
                'provider_id': profile.client_id,
                'provider_name': profile.client.name,
                'match_score': min(score, 100),
                'fit_score': min(score, 100),
                'totaalscore': min(score, 100),
                'score_inhoudelijke_fit': min(score, 35),
                'score_regio_contract_fit': 15 if region_match else 6 if region_type_match else 0,
                'score_capaciteit_wachttijd_fit': 20 if free_slots > 0 and profile.average_wait_days <= 14 else 10,
                'score_complexiteit_veiligheid_fit': 10 if urgency_match else 4,
                'score_performance_fit': 8 if profile.average_wait_days <= 21 else 5,
                'confidence_label': explanation.get('confidence') or 'medium',
                'fit_samenvatting': explanation.get('fit_summary') or '',
                'trade_offs': explanation.get('trade_offs') or [],
                'verificatie_advies': '; '.join(explanation.get('verify_manually') or []),
                'zorgbehoefte_categorie': getattr(getattr(intake, 'care_category_main', None), 'name', '') or '',
                'zorgbehoefte_categorie_code': getattr(getattr(intake, 'care_category_main', None), 'code', '') or '',
                'zorgbehoefte_specifiek': getattr(getattr(intake, 'care_category_sub', None), 'name', '') or '',
                'zorgbehoefte_specifiek_code': getattr(getattr(intake, 'care_category_sub', None), 'code', '') or '',
                'taxonomie_lijn': taxonomie_lijn,
                'taxonomie_code_lijn': taxonomie_code_lijn,
                'uitgesloten': False,
                'uitsluitreden': '',
                'ranking': None,
                'category_match': category_match,
                'urgency_match': urgency_match,
                'care_form_match': care_form_match,
                'region_match': region_match,
                'region_type_match': region_type_match,
                'free_slots': free_slots,
                'avg_wait_days': profile.average_wait_days,
                'reason': reasons[0] if reasons else 'Handmatige beoordeling nodig',
                'reasons': reasons,
                'tradeoff': tradeoff,
                'capacity_status': capacity_status,
                'capacity_label': capacity_label,
                'specialization_summary': specialization_summary,
                'distance_km': None,
                'location': provider_location,
                'behavior_labels': behavior_labels,
                'explanation': explanation,
                'decision_hint': None,
                'decision_hint_code': None,
                'decision_comparison_to_top': '',
                'decision_trade_offs': [],
                'outcome_context': _build_provider_outcome_context(profile.client_id),
                '_base_match_score': min(score, 100),
                '_behavior_modifier': behavior_modifier,
                '_behavior_metrics': behavior_metrics,
                '_behavior_signals': behavior_signals,
                'scores': {
                    'score_inhoudelijke_fit': min(score, 35),
                    'score_regio_contract_fit': 15 if region_match else 6 if region_type_match else 0,
                    'score_capaciteit_wachttijd_fit': 20 if free_slots > 0 and profile.average_wait_days <= 14 else 10,
                    'score_complexiteit_veiligheid_fit': 10 if urgency_match else 4,
                    'score_performance_fit': 8 if profile.average_wait_days <= 21 else 5,
                },
            }
        )

    if suggestions:
        top_base_score = max(row['_base_match_score'] for row in suggestions)
        for suggestion in suggestions:
            distance_from_top = top_base_score - suggestion['_base_match_score']
            proximity_weight = _behavior_tiebreak_weight(distance_from_top)
            adjustment_points = suggestion['_behavior_modifier'] * 10.0 * proximity_weight
            adjusted_score = suggestion['_base_match_score'] + adjustment_points

            suggestion['fit_score'] = suggestion['_base_match_score']
            suggestion['match_score'] = max(0.0, min(100.0, round(adjusted_score, 1)))

            if proximity_weight > 0 and abs(adjustment_points) >= 0.1:
                suggestion['explanation']['behavior_consideration'] = (
                    'Operationele betrouwbaarheid meegewogen als secundaire tie-break bij vergelijkbare basismatch'
                )
                suggestion['explanation']['behavior_influence'] = describe_behavior_influence(
                    suggestion['_behavior_metrics'],
                    suggestion['_behavior_signals'],
                    close_call_applied=True,
                )
            elif proximity_weight > 0:
                suggestion['explanation']['behavior_consideration'] = (
                    'Operationele betrouwbaarheid meegewogen, maar zonder merkbaar ranking-effect'
                )

            suggestion.pop('_base_match_score', None)
            suggestion.pop('_behavior_modifier', None)
            suggestion.pop('_behavior_metrics', None)
            suggestion.pop('_behavior_signals', None)

    suggestions.sort(
        key=lambda row: (
            -row['match_score'],
            -row['fit_score'],
            row['provider_name'].lower(),
        )
    )
    if limit:
        return suggestions[:limit]
    return suggestions


def _assign_provider_to_intake(*, request, intake, provider, source):
    can_match, match_blocker = intake.can_enter_matching()
    if not can_match:
        raise ValidationError(match_blocker)

    placement, created = PlacementRequest.objects.get_or_create(
        due_diligence_process=intake,
        defaults={
            'status': PlacementRequest.Status.IN_REVIEW,
            'proposed_provider': provider,
            'selected_provider': provider,
            'care_form': intake.preferred_care_form,
            'decision_notes': 'Automatisch toegewezen vanuit matching.',
        },
    )
    if not created:
        placement.proposed_provider = provider
        placement.selected_provider = provider
        if not placement.care_form:
            placement.care_form = intake.preferred_care_form
        _old_pl_status = placement.status
        placement.status = PlacementRequest.Status.IN_REVIEW
        allowed, blocker = placement.can_transition_to_status(PlacementRequest.Status.IN_REVIEW)
        if not allowed:
            raise ValidationError(blocker)
        placement.save(update_fields=['proposed_provider', 'selected_provider', 'care_form', 'status', 'updated_at'])
        emit_placement_status_changed(
            placement=placement, old_status=_old_pl_status,
            new_status=PlacementRequest.Status.IN_REVIEW, user=getattr(request, 'user', None),
        )

    if intake.status != CaseIntakeProcess.ProcessStatus.MATCHING:
        _old_intake_status = intake.status
        intake.status = CaseIntakeProcess.ProcessStatus.MATCHING
        intake.save(update_fields=['status', 'updated_at'])
        emit_intake_status_changed(
            intake=intake, old_status=_old_intake_status,
            new_status=CaseIntakeProcess.ProcessStatus.MATCHING,
            user=getattr(request, 'user', None),
        )

    log_action(
        request.user,
        AuditLog.Action.APPROVE,
        'MatchingAssignment',
        object_id=placement.id,
        object_repr=f'{intake.title} -> {provider.name}',
        changes={
            'intake_id': intake.id,
            'provider_id': provider.id,
            'provider_name': provider.name,
            'source': source,
        },
        request=request,
    )

    return placement


def _prepare_waitlist_proposal_for_intake(
    *,
    request,
    intake,
    provider,
    source,
    match_score=None,
):
    """Persist a gemeente-side waitlist proposal (DRAFT placement), without sending to provider review."""
    can_match, match_blocker = intake.can_enter_matching()
    if not can_match:
        raise ValidationError(match_blocker)

    notes = (
        f'{WAITLIST_PROPOSAL_NOTES_MARKER} Wachtlijstvoorstel (concept) voor {provider.name}. '
        'Nog niet verstuurd naar aanbieder; geen definitieve plaatsing.'
    )
    placement, created = PlacementRequest.objects.get_or_create(
        due_diligence_process=intake,
        defaults={
            'status': PlacementRequest.Status.DRAFT,
            'proposed_provider': provider,
            'selected_provider': provider,
            'care_form': intake.preferred_care_form,
            'decision_notes': notes,
            'provider_response_status': PlacementRequest.ProviderResponseStatus.PENDING,
        },
    )
    if not created:
        placement.proposed_provider = provider
        placement.selected_provider = provider
        placement.status = PlacementRequest.Status.DRAFT
        placement.provider_response_status = PlacementRequest.ProviderResponseStatus.PENDING
        placement.decision_notes = notes
        if not placement.care_form:
            placement.care_form = intake.preferred_care_form
        placement.save(
            update_fields=[
                'proposed_provider',
                'selected_provider',
                'care_form',
                'status',
                'provider_response_status',
                'decision_notes',
                'updated_at',
            ]
        )

    log_action(
        request.user,
        AuditLog.Action.APPROVE,
        'WaitlistProposalPrepared',
        object_id=placement.id,
        object_repr=f'{intake.title} -> {provider.name} (wachtlijst concept)',
        changes={
            'intake_id': intake.id,
            'provider_id': provider.id,
            'provider_name': provider.name,
            'source': source,
            'matching_outcome': 'WAITLIST_PROPOSAL',
            'match_score': match_score,
            'actor_role': resolve_actor_role(user=request.user, organization=intake.organization),
        },
        request=request,
    )

    _actor_role = resolve_actor_role(user=request.user, organization=intake.organization)
    log_case_decision_event(
        case_id=intake.pk,
        placement_id=placement.pk,
        event_type=CaseDecisionLog.EventType.PROVIDER_SELECTED,
        recommendation_context={
            'matching_outcome': 'WAITLIST_PROPOSAL',
            'provider_id': provider.pk,
            'provider_name': provider.name,
            'match_score': match_score,
            'capacity_state': 'no_direct_capacity',
            'actor_role': _actor_role,
        },
        user_action='waitlist_proposal_prepared',
        actor_user_id=getattr(request.user, 'id', None),
        action_source=source,
        provider_id=provider.id,
        optional_reason='Wachtlijstvoorstel (concept) vastgelegd door gemeente.',
    )

    return placement


def _matching_history_for_intake(intake, *, limit=10):
    history_qs = AuditLog.objects.filter(
        model_name__in=['MatchingAssignment', 'MatchingRecommendation'],
        changes__intake_id=intake.id,
    ).order_by('-timestamp')
    return list(history_qs[:limit])
