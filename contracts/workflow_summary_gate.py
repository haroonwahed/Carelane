"""Pilot structured-summary gate shared by API and decision engine."""
from __future__ import annotations

from contracts.models import CaseAssessment, CaseIntakeProcess

MIN_SUMMARY_CONTEXT_LEN = 24


def _resolved_intake_urgency(intake: CaseIntakeProcess) -> str:
    urgency = (getattr(intake, "urgency", "") or "").strip()
    if urgency:
        return urgency
    try:
        return (intake.derive_operational_urgency() or "").strip()
    except Exception:
        return ""


def workflow_summary_complete(
    *,
    assessment: CaseAssessment | None,
    intake: CaseIntakeProcess,
) -> tuple[bool, str]:
    """True when structured workflow_summary satisfies the matching gate."""
    if assessment is None:
        return False, 'Casusbeoordeling ontbreekt.'
    ws = assessment.workflow_summary or {}
    context = (ws.get('context') or '').strip()
    if len(context) < MIN_SUMMARY_CONTEXT_LEN:
        return False, (
            f'Samenvatting (context) moet minstens {MIN_SUMMARY_CONTEXT_LEN} tekens bevatten vóór matching.'
        )
    if not _resolved_intake_urgency(intake):
        return False, 'Urgentie is verplicht op de casus.'
    if 'risks' not in ws:
        return False, "Vul het veld risico's in (of vink aan: geen aanvullende risico's)."
    risks = ws.get('risks')
    if not isinstance(risks, list):
        return False, "Risico's moeten als lijst worden aangeleverd."
    if len(risks) == 0 and not ws.get('risks_none_ack'):
        return False, "Voeg risico's toe of bevestig expliciet dat er geen aanvullende risico's zijn."
    return True, ''


def workflow_summary_can_bootstrap(
    *,
    assessment: CaseAssessment | None,
    intake: CaseIntakeProcess,
) -> bool:
    """True when matching gate can be satisfied (existing or from intake text)."""
    if assessment is not None and workflow_summary_complete(assessment=assessment, intake=intake)[0]:
        return True
    context = _intake_summary_bootstrap_text(intake)
    return len(context) >= MIN_SUMMARY_CONTEXT_LEN and bool(_resolved_intake_urgency(intake))


def ensure_workflow_summary_for_matching(
    *,
    assessment: CaseAssessment,
    intake: CaseIntakeProcess,
) -> tuple[bool, str]:
    """Fill workflow_summary from intake text when the pilot gate is not yet satisfied."""
    ok, err = workflow_summary_complete(assessment=assessment, intake=intake)
    if ok:
        return True, ''

    context = _intake_summary_bootstrap_text(intake)
    if len(context) < MIN_SUMMARY_CONTEXT_LEN:
        return False, (
            f'Samenvatting (context) moet minstens {MIN_SUMMARY_CONTEXT_LEN} tekens bevatten vóór matching.'
        )
    urgency = _resolved_intake_urgency(intake)
    if not urgency:
        return False, 'Urgentie is verplicht op de casus.'

    ws = dict(assessment.workflow_summary or {})
    if len((ws.get('context') or '').strip()) < MIN_SUMMARY_CONTEXT_LEN:
        ws['context'] = context[:4000]
    if 'risks' not in ws:
        ws['risks'] = []
    risks = ws.get('risks')
    if not isinstance(risks, list):
        ws['risks'] = []
    if len(ws['risks']) == 0 and not ws.get('risks_none_ack'):
        ws['risks_none_ack'] = True
    if not (ws.get('urgency') or '').strip():
        ws['urgency'] = urgency
    ws.setdefault('missing_information', str(ws.get('missing_information') or '').strip())
    assessment.workflow_summary = ws
    return workflow_summary_complete(assessment=assessment, intake=intake)


def _intake_summary_bootstrap_text(intake: CaseIntakeProcess) -> str:
    for value in (
        getattr(intake, 'assessment_summary', '') or '',
        getattr(intake, 'description', '') or '',
    ):
        text = str(value).strip()
        if text:
            return text
    return ''
