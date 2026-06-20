"""
Tests for WorkflowBus signal dispatch and workflow_notifications routing.

Covers:
- emit_* helpers fire the correct signal with correct kwargs
- workflow_receivers call notification functions
- notification functions gate on the right phase/status transitions
- decision_engine threshold three-layer precedence (code → settings → DB)
"""
from unittest.mock import MagicMock, call, patch

from django.test import TestCase, override_settings

from contracts.workflow_bus import (
    WorkflowBus,
    emit_assessment_status_changed,
    emit_case_phase_changed,
    emit_intake_status_changed,
    emit_placement_response_status_changed,
    emit_placement_status_changed,
)


# ── WorkflowBus emit helpers ──────────────────────────────────────────────────

class TestEmitHelpers(TestCase):

    def test_emit_case_phase_changed_fires_signal(self):
        mock_case = MagicMock()
        mock_case.__class__ = type('CareCase', (), {})
        received = []

        def handler(sender, *, case, old_phase, new_phase, **kw):
            received.append((old_phase, new_phase))

        WorkflowBus.CASE_PHASE_CHANGED.connect(handler)
        try:
            emit_case_phase_changed(case=mock_case, old_phase='intake', new_phase='matching')
            self.assertEqual(received, [('intake', 'matching')])
        finally:
            WorkflowBus.CASE_PHASE_CHANGED.disconnect(handler)

    def test_emit_no_op_when_state_unchanged(self):
        received = []
        WorkflowBus.CASE_PHASE_CHANGED.connect(lambda **kw: received.append(1))
        try:
            emit_case_phase_changed(case=MagicMock(), old_phase='intake', new_phase='intake')
            self.assertEqual(received, [])
        finally:
            WorkflowBus.CASE_PHASE_CHANGED.disconnect(lambda **kw: received.append(1))

    def test_emit_intake_status_changed_fires(self):
        received = []

        def handler(sender, *, intake, old_status, new_status, **kw):
            received.append(new_status)

        WorkflowBus.INTAKE_STATUS_CHANGED.connect(handler)
        try:
            emit_intake_status_changed(intake=MagicMock(), old_status='INTAKE', new_status='MATCHING')
            self.assertEqual(received, ['MATCHING'])
        finally:
            WorkflowBus.INTAKE_STATUS_CHANGED.disconnect(handler)

    def test_emit_placement_response_status_changed_fires(self):
        received = []

        def handler(sender, *, placement, old_response_status, new_response_status, **kw):
            received.append(new_response_status)

        WorkflowBus.PLACEMENT_RESPONSE_STATUS_CHANGED.connect(handler)
        try:
            emit_placement_response_status_changed(
                placement=MagicMock(), old_response_status='PENDING', new_response_status='ACCEPTED',
            )
            self.assertEqual(received, ['ACCEPTED'])
        finally:
            WorkflowBus.PLACEMENT_RESPONSE_STATUS_CHANGED.disconnect(handler)

    def test_emit_assessment_status_changed_no_op_same(self):
        received = []
        WorkflowBus.ASSESSMENT_STATUS_CHANGED.connect(lambda **kw: received.append(1))
        try:
            emit_assessment_status_changed(assessment=MagicMock(), old_status='DRAFT', new_status='DRAFT')
            self.assertEqual(received, [])
        finally:
            WorkflowBus.ASSESSMENT_STATUS_CHANGED.disconnect(lambda **kw: received.append(1))


# ── workflow_notifications routing ────────────────────────────────────────────

class TestNotificationRouting(TestCase):
    """notify_* functions gate on correct status values and call send_mail."""

    def _make_intake(self, org_notification_email='regie@gemeente.nl', title='Testzaak'):
        org = MagicMock()
        org.notification_email = org_notification_email
        org.contact_email = ''
        intake = MagicMock()
        intake.organization = org
        intake.title = title
        return intake

    def _make_placement(self, intake, provider_email='contact@aanbieder.nl'):
        provider = MagicMock()
        provider.primary_contact_email = provider_email
        provider.email = ''
        provider.name = 'TestAanbieder BV'
        placement = MagicMock()
        placement.due_diligence_process = intake
        placement.selected_provider = provider
        placement.proposed_provider = None
        return placement

    def _make_case(self, intake):
        case = MagicMock()
        case.due_diligence_process = intake
        return case

    @patch('contracts.workflow_notifications.send_mail')
    def test_provider_review_requested_fires_on_provider_beoordeling(self, mock_mail):
        from contracts.workflow_notifications import notify_provider_review_requested
        from contracts.models import CareCase, PlacementRequest

        intake = self._make_intake()
        case = self._make_case(intake)
        placement = self._make_placement(intake)

        with patch('contracts.models.PlacementRequest.objects') as mock_qs:
            mock_qs.filter.return_value.exclude.return_value.order_by.return_value.first.return_value = placement
            sent = notify_provider_review_requested(
                case=case,
                old_phase=CareCase.CasePhase.MATCHING,
                new_phase=CareCase.CasePhase.PROVIDER_BEOORDELING,
            )

        self.assertEqual(sent, 1)
        mock_mail.assert_called_once()
        subject = mock_mail.call_args.kwargs['subject']
        self.assertIn('Testzaak', subject)
        self.assertIn('contact@aanbieder.nl', mock_mail.call_args.kwargs['recipient_list'])

    @patch('contracts.workflow_notifications.send_mail')
    def test_provider_review_requested_noop_on_other_phases(self, mock_mail):
        from contracts.workflow_notifications import notify_provider_review_requested
        from contracts.models import CareCase
        case = MagicMock()
        sent = notify_provider_review_requested(
            case=case,
            old_phase=CareCase.CasePhase.INTAKE,
            new_phase=CareCase.CasePhase.MATCHING,
        )
        self.assertEqual(sent, 0)
        mock_mail.assert_not_called()

    @patch('contracts.workflow_notifications.send_mail')
    def test_org_notified_on_provider_acceptance(self, mock_mail):
        from contracts.workflow_notifications import notify_org_provider_response
        from contracts.models import PlacementRequest

        intake = self._make_intake()
        placement = self._make_placement(intake)
        placement.due_diligence_process = intake

        sent = notify_org_provider_response(
            placement=placement,
            old_response_status=PlacementRequest.ProviderResponseStatus.PENDING,
            new_response_status=PlacementRequest.ProviderResponseStatus.ACCEPTED,
        )

        self.assertEqual(sent, 1)
        mock_mail.assert_called_once()
        self.assertIn('regie@gemeente.nl', mock_mail.call_args.kwargs['recipient_list'])

    @patch('contracts.workflow_notifications.send_mail')
    def test_org_notified_on_provider_rejection(self, mock_mail):
        from contracts.workflow_notifications import notify_org_provider_response
        from contracts.models import PlacementRequest

        intake = self._make_intake()
        placement = self._make_placement(intake)
        placement.due_diligence_process = intake

        sent = notify_org_provider_response(
            placement=placement,
            old_response_status=PlacementRequest.ProviderResponseStatus.PENDING,
            new_response_status=PlacementRequest.ProviderResponseStatus.REJECTED,
        )

        self.assertEqual(sent, 1)
        body = mock_mail.call_args.kwargs['message']
        self.assertIn('afgewezen', body)

    @patch('contracts.workflow_notifications.send_mail')
    def test_no_email_when_still_pending(self, mock_mail):
        from contracts.workflow_notifications import notify_org_provider_response
        from contracts.models import PlacementRequest

        intake = self._make_intake()
        placement = self._make_placement(intake)
        sent = notify_org_provider_response(
            placement=placement,
            old_response_status=None,
            new_response_status=PlacementRequest.ProviderResponseStatus.PENDING,
        )
        self.assertEqual(sent, 0)
        mock_mail.assert_not_called()

    @patch('contracts.workflow_notifications.send_mail')
    def test_placement_confirmed_notifies_both(self, mock_mail):
        from contracts.workflow_notifications import notify_placement_confirmed
        from contracts.models import CareCase, PlacementRequest

        intake = self._make_intake()
        case = self._make_case(intake)
        placement = self._make_placement(intake)

        with patch('contracts.models.PlacementRequest.objects') as mock_qs:
            mock_qs.filter.return_value.order_by.return_value.first.return_value = placement
            sent = notify_placement_confirmed(
                case=case,
                old_phase=CareCase.CasePhase.PROVIDER_BEOORDELING,
                new_phase=CareCase.CasePhase.PLAATSING,
            )

        self.assertEqual(sent, 2)  # one org + one provider
        self.assertEqual(mock_mail.call_count, 2)

    @patch('contracts.workflow_notifications.send_mail')
    def test_placement_confirmed_noop_on_wrong_phase(self, mock_mail):
        from contracts.workflow_notifications import notify_placement_confirmed
        from contracts.models import CareCase
        case = MagicMock()
        sent = notify_placement_confirmed(
            case=case,
            old_phase=CareCase.CasePhase.INTAKE,
            new_phase=CareCase.CasePhase.MATCHING,
        )
        self.assertEqual(sent, 0)
        mock_mail.assert_not_called()

    @patch('contracts.workflow_notifications.send_mail')
    def test_no_email_when_no_recipient_configured(self, mock_mail):
        from contracts.workflow_notifications import notify_placement_confirmed
        from contracts.models import CareCase, PlacementRequest

        # No org email, no provider email
        org = MagicMock()
        org.notification_email = ''
        org.contact_email = ''
        intake = MagicMock()
        intake.organization = org
        intake.title = 'Lege casus'
        case = MagicMock()
        case.due_diligence_process = intake

        provider = MagicMock()
        provider.primary_contact_email = ''
        provider.email = ''
        placement = MagicMock()
        placement.due_diligence_process = intake
        placement.selected_provider = provider
        placement.proposed_provider = None

        with patch('contracts.models.PlacementRequest.objects') as mock_qs:
            mock_qs.filter.return_value.order_by.return_value.first.return_value = placement
            sent = notify_placement_confirmed(
                case=case,
                old_phase=CareCase.CasePhase.PROVIDER_BEOORDELING,
                new_phase=CareCase.CasePhase.PLAATSING,
            )

        self.assertEqual(sent, 0)
        mock_mail.assert_not_called()

    @patch('contracts.workflow_notifications.send_mail')
    def test_assessment_approved_for_matching_notifies_org(self, mock_mail):
        from contracts.workflow_notifications import notify_assessment_approved_for_matching
        from contracts.models import CaseAssessment

        intake = self._make_intake()
        assessment = MagicMock()
        assessment.due_diligence_process = intake

        sent = notify_assessment_approved_for_matching(
            assessment=assessment,
            old_status=CaseAssessment.AssessmentStatus.DRAFT,
            new_status=CaseAssessment.AssessmentStatus.APPROVED_FOR_MATCHING,
        )
        self.assertEqual(sent, 1)
        mock_mail.assert_called_once()
        self.assertIn('regie@gemeente.nl', mock_mail.call_args.kwargs['recipient_list'])


# ── Decision engine threshold precedence ─────────────────────────────────────

class TestDecisionEngineThresholds(TestCase):

    def test_defaults_match_expected_pilot_values(self):
        from contracts.decision_engine import get_decision_engine_thresholds
        with patch('contracts.governance.get_policy_values', side_effect=Exception("db down")):
            t = get_decision_engine_thresholds()
        # These are the committed pilot values; changing them needs a conscious decision.
        self.assertEqual(t['aanmelding_sla_hours'], 24)
        self.assertEqual(t['provider_response_sla_hours'], 72)
        self.assertEqual(t['urgent_idle_hours'], 48)
        self.assertEqual(t['intake_start_sla_days'], 5)
        self.assertEqual(t['repeated_rejection_count'], 2)

    @override_settings(CARELANE_SLA_AANMELDING_HOURS=12)
    def test_settings_override_hardcoded_default(self):
        from contracts.decision_engine import get_decision_engine_thresholds
        with patch('contracts.governance.get_policy_values', side_effect=Exception("db down")):
            t = get_decision_engine_thresholds()
        self.assertEqual(t['aanmelding_sla_hours'], 12)

    def test_db_policy_overrides_settings(self):
        from contracts.decision_engine import get_decision_engine_thresholds
        # DB row wins over env/settings
        def fake_policy(defaults):
            overridden = dict(defaults)
            overridden['aanmelding_sla_hours'] = 6
            return overridden

        with patch('contracts.governance.get_policy_values', side_effect=fake_policy):
            t = get_decision_engine_thresholds()
        self.assertEqual(t['aanmelding_sla_hours'], 6)

    def test_db_failure_falls_back_gracefully(self):
        from contracts.decision_engine import get_decision_engine_thresholds
        with patch('contracts.governance.get_policy_values', side_effect=Exception("network error")):
            t = get_decision_engine_thresholds()
        self.assertIn('aanmelding_sla_hours', t)
        self.assertIsInstance(t['aanmelding_sla_hours'], int)


# ── case_intelligence SLA ladder ──────────────────────────────────────────────

class TestCaseIntelligenceSlaLadder(TestCase):

    def _make_placement(self, *, response_status, sent_at_hours_ago):
        from datetime import timezone as dt_tz
        from datetime import datetime, timedelta
        ts = datetime.now(dt_tz.utc) - timedelta(hours=sent_at_hours_ago)
        placement = MagicMock()
        placement.provider_response_status = response_status
        # case_intelligence reads these fields in priority order:
        placement.provider_response_last_reminder_at = None
        placement.last_sent_at = None
        placement.provider_response_requested_at = None
        placement.requested_at = ts
        placement.updated_at = ts
        placement.needs_info_requested_at = None
        return placement

    def test_pending_on_track_within_48h(self):
        from contracts.models import PlacementRequest
        from contracts.case_intelligence import calculate_provider_response_sla
        placement = self._make_placement(
            response_status=PlacementRequest.ProviderResponseStatus.PENDING,
            sent_at_hours_ago=12,
        )
        result = calculate_provider_response_sla(placement=placement)
        self.assertEqual(result['sla_state'], 'ON_TRACK')

    def test_pending_at_risk_between_48_and_72h(self):
        from contracts.models import PlacementRequest
        from contracts.case_intelligence import calculate_provider_response_sla
        placement = self._make_placement(
            response_status=PlacementRequest.ProviderResponseStatus.PENDING,
            sent_at_hours_ago=60,
        )
        result = calculate_provider_response_sla(placement=placement)
        self.assertIn(result['sla_state'], {'AT_RISK', 'OVERDUE'})

    def test_pending_overdue_beyond_96h(self):
        from contracts.models import PlacementRequest
        from contracts.case_intelligence import calculate_provider_response_sla
        placement = self._make_placement(
            response_status=PlacementRequest.ProviderResponseStatus.PENDING,
            sent_at_hours_ago=100,
        )
        result = calculate_provider_response_sla(placement=placement)
        self.assertIn(result['sla_state'], {'OVERDUE', 'ESCALATED'})

    def test_accepted_has_zero_deadline(self):
        """ACCEPTED falls through to ON_TRACK with deadline_hours=0 (no SLA countdown)."""
        from contracts.models import PlacementRequest
        from contracts.case_intelligence import calculate_provider_response_sla
        placement = self._make_placement(
            response_status=PlacementRequest.ProviderResponseStatus.ACCEPTED,
            sent_at_hours_ago=50,
        )
        result = calculate_provider_response_sla(placement=placement)
        self.assertEqual(result['deadline_hours'], 0)
        self.assertEqual(result['next_threshold_hours'], 0)
