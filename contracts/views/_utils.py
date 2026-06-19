from django.shortcuts import redirect
from django.utils.cache import patch_cache_control
from django.utils.http import url_has_allowed_host_and_scheme
from django.urls import reverse
from datetime import timedelta, date
from math import asin, cos, radians, sin, sqrt
import logging

from ..models import CaseIntakeProcess

logger = logging.getLogger(__name__)


def _coerce_coordinate(value, *, minimum, maximum):
    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return None

    if numeric_value < minimum or numeric_value > maximum:
        return None
    return round(numeric_value, 6)


def _extract_coordinates(source):
    if source is None:
        return None, None

    candidate_pairs = (
        ('latitude', 'longitude'),
        ('lat', 'lng'),
        ('lat', 'lon'),
    )

    for latitude_attr, longitude_attr in candidate_pairs:
        if not hasattr(source, latitude_attr) or not hasattr(source, longitude_attr):
            continue

        latitude = _coerce_coordinate(getattr(source, latitude_attr, None), minimum=-90, maximum=90)
        longitude = _coerce_coordinate(getattr(source, longitude_attr, None), minimum=-180, maximum=180)
        if latitude is not None and longitude is not None:
            return latitude, longitude

    return None, None


def _split_csv_tags(raw_tags):
    if not raw_tags:
        return []
    return [part.strip() for part in raw_tags.split(',') if part.strip()]


def _extract_document_phase_event(tags):
    phase = ''
    event = ''
    for part in _split_csv_tags(tags):
        if part.startswith('phase:') and not phase:
            phase = part.split(':', 1)[1].strip()
        if part.startswith('event:') and not event:
            event = part.split(':', 1)[1].strip()
    return phase, event


def _merge_document_context_tags(existing_tags, *, phase='', event=''):
    tags = _split_csv_tags(existing_tags)
    context_tokens = []
    if phase:
        context_tokens.append(f'phase:{phase}')
    if event:
        context_tokens.append(f'event:{event}')

    for token in context_tokens:
        if token not in tags:
            tags.append(token)

    return ','.join(tags)


def _flow_stage_for_intake_status(intake_status):
    flow_stage_map = {
        CaseIntakeProcess.ProcessStatus.INTAKE: 'aanvraag',
        CaseIntakeProcess.ProcessStatus.MATCHING: 'matching',
        CaseIntakeProcess.ProcessStatus.DECISION: 'intake_aanbieder',
        CaseIntakeProcess.ProcessStatus.COMPLETED: 'plaatsing',
        CaseIntakeProcess.ProcessStatus.ON_HOLD: 'aanvraag',
    }
    return flow_stage_map.get(intake_status, 'aanvraag')


def _redirect_to_safe_next_or_default(request, fallback_url):
    next_url = request.POST.get('next')
    if next_url and url_has_allowed_host_and_scheme(
        url=next_url,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure(),
    ):
        return redirect(next_url)
    return redirect(fallback_url)


def _case_detail_tab_href(intake_id, tab):
    return f"{reverse('carelane:case_detail', kwargs={'pk': intake_id})}?tab={tab}"


def _resolve_deadline_case(deadline):
    if getattr(deadline, 'case_record_id', None):
        return deadline.case_record
    process = getattr(deadline, 'due_diligence_process', None)
    if process and getattr(process, 'contract_id', None):
        return process.case_record
    return None


def _resolve_signal_case(signal):
    if getattr(signal, 'case_record_id', None):
        return signal.case_record
    process = getattr(signal, 'due_diligence_process', None)
    if process and getattr(process, 'contract_id', None):
        return process.case_record
    return None


def _disable_response_caching(response):
    patch_cache_control(
        response,
        no_cache=True,
        no_store=True,
        must_revalidate=True,
        private=True,
        max_age=0,
    )
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response


def _log_pilot_issue(request, *, category, detail, level='warning'):
    user = getattr(request, 'user', None)
    user_label = getattr(user, 'username', 'anonymous') if user and getattr(user, 'is_authenticated', False) else 'anonymous'
    log_method = getattr(logger, level, logger.warning)
    log_method(
        'pilot.%s user=%s path=%s detail=%s',
        category,
        user_label,
        getattr(request, 'path', '-'),
        detail,
    )


def _coerce_sla_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _to_bool_filter(value):
    return str(value or '').strip().lower() in {'1', 'true', 'yes', 'on'}


def _urgency_rank(urgency_code):
    ranks = {
        str(CaseIntakeProcess.Urgency.CRISIS): 4,
        str(CaseIntakeProcess.Urgency.HIGH): 3,
        str(CaseIntakeProcess.Urgency.MEDIUM): 2,
        str(CaseIntakeProcess.Urgency.LOW): 1,
    }
    return ranks.get(str(urgency_code or '').strip().upper(), 0)


def _resolved_intake_urgency(intake):
    urgency = (getattr(intake, 'urgency', '') or '').strip()
    if urgency:
        return urgency
    try:
        return (intake.derive_operational_urgency() or '').strip()
    except Exception:
        return ''
