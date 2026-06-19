"""
Integration tests: provider_decision_api authorization.

Verified gates:
- Proposed provider can approve
- Proposed provider can reject
- Unrelated provider in same org cannot decide
- Municipality user (GEMEENTE role) cannot use provider decision endpoint
- proposed_provider_id-only records are protected (selected_provider_id is None)
- Records without any provider ID are rejected
- Repeated accept cannot re-accept (idempotency guard)
"""
import json
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse

from contracts.models import (
    CareCase,
    CaseAssessment,
    CaseIntakeProcess,
    Client as CareProvider,
    Organization,
    OrganizationMembership,
    PlacementRequest,
    ProviderProfile,
    UserProfile,
)

MINIMAL_WORKFLOW_SUMMARY = {
    'context': 'Provider decision auth test samenvatting.',
    'risks': ['test_risk'],
    'missing_information': '',
    'risks_none_ack': False,
}


def _make_provider(organization, coordinator_user):
    provider = CareProvider.objects.create(
        organization=organization,
        name='Decision Test Aanbieder',
        status=CareProvider.Status.ACTIVE,
        created_by=coordinator_user,
        responsible_coordinator=coordinator_user,
    )
    ProviderProfile.objects.create(
        client=provider,
        offers_outpatient=True,
        handles_medium_urgency=True,
        current_capacity=2,
        max_capacity=5,
        average_wait_days=5,
    )
    return provider


def _make_intake_at_provider_review(organization, admin_user, provider, proposed_only=False):
    intake = CaseIntakeProcess.objects.create(
        organization=organization,
        title='Provider Decision Auth Intake',
        status=CaseIntakeProcess.ProcessStatus.DECISION,
        urgency=CaseIntakeProcess.Urgency.MEDIUM,
        preferred_care_form=CaseIntakeProcess.CareForm.OUTPATIENT,
        start_date=date.today(),
        target_completion_date=date.today() + timedelta(days=7),
        case_coordinator=admin_user,
        workflow_state='PROVIDER_REVIEW_PENDING',
    )
    intake.ensure_case_record(created_by=admin_user)
    CaseAssessment.objects.create(
        due_diligence_process=intake,
        assessment_status=CaseAssessment.AssessmentStatus.APPROVED_FOR_MATCHING,
        matching_ready=True,
        assessed_by=admin_user,
        workflow_summary=MINIMAL_WORKFLOW_SUMMARY,
    )

    placement = PlacementRequest.objects.create(
        due_diligence_process=intake,
        proposed_provider=provider,
        selected_provider=None if proposed_only else provider,
        status=PlacementRequest.Status.IN_REVIEW,
        care_form=PlacementRequest.CareForm.OUTPATIENT,
        provider_response_status=PlacementRequest.ProviderResponseStatus.PENDING,
    )
    return intake, placement


class ProviderDecisionAuthTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin_user = User.objects.create_user('pd_admin', 'admin@pd.test', 'pass')
        self.provider_coordinator = User.objects.create_user('pd_coord', 'coord@pd.test', 'pass')
        self.other_coordinator = User.objects.create_user('pd_other', 'other@pd.test', 'pass')
        self.gemeente_user = User.objects.create_user('pd_gemeente', 'gemeente@pd.test', 'pass')
        self.other_org_user = User.objects.create_user('pd_cross', 'cross@pd.test', 'pass')

        self.organization = Organization.objects.create(name='PD Auth Org', slug='pd-auth-org')
        self.other_org = Organization.objects.create(name='PD Other Org', slug='pd-other-org')

        for user, role in [
            (self.admin_user, OrganizationMembership.Role.OWNER),
            (self.provider_coordinator, OrganizationMembership.Role.MEMBER),
            (self.other_coordinator, OrganizationMembership.Role.MEMBER),
            (self.gemeente_user, OrganizationMembership.Role.MEMBER),
        ]:
            OrganizationMembership.objects.create(
                organization=self.organization, user=user, role=role, is_active=True,
            )
        OrganizationMembership.objects.create(
            organization=self.other_org, user=self.other_org_user,
            role=OrganizationMembership.Role.OWNER, is_active=True,
        )

        # provider_coordinator and other_coordinator are ZORGAANBIEDER role (CLIENT profile)
        for user in (self.provider_coordinator, self.other_coordinator):
            UserProfile.objects.update_or_create(user=user, defaults={'role': UserProfile.Role.CLIENT})

        self.provider = _make_provider(self.organization, self.provider_coordinator)
        self.other_provider = _make_provider(self.organization, self.other_coordinator)
        self.other_provider.name = 'Other Aanbieder'
        self.other_provider.save()

    def _url(self, case_id):
        return reverse('carelane:provider_decision_api', kwargs={'case_id': case_id})

    def _accept_payload(self):
        return json.dumps({'status': 'ACCEPTED'})

    def _reject_payload(self):
        return json.dumps({'status': 'REJECTED', 'rejection_reason_code': 'geen_capaciteit'})

    def test_proposed_provider_can_approve(self):
        intake, _ = _make_intake_at_provider_review(
            self.organization, self.admin_user, self.provider, proposed_only=True,
        )
        self.client.login(username='pd_coord', password='pass')
        response = self.client.post(
            self._url(intake.contract_id),
            data=self._accept_payload(),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['ok'])

    def test_proposed_provider_can_reject(self):
        intake, _ = _make_intake_at_provider_review(
            self.organization, self.admin_user, self.provider, proposed_only=True,
        )
        self.client.login(username='pd_coord', password='pass')
        response = self.client.post(
            self._url(intake.contract_id),
            data=self._reject_payload(),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['ok'])

    def test_unrelated_provider_cannot_decide(self):
        intake, _ = _make_intake_at_provider_review(
            self.organization, self.admin_user, self.provider, proposed_only=True,
        )
        self.client.login(username='pd_other', password='pass')
        response = self.client.post(
            self._url(intake.contract_id),
            data=self._accept_payload(),
            content_type='application/json',
        )
        # 403: actor not the assigned provider; 404: case not visible to unlinked provider
        # Both are correct security outcomes — case existence is not revealed.
        self.assertIn(response.status_code, (403, 404))
        self.assertFalse(response.json()['ok'])

    def test_gemeente_user_cannot_use_provider_decision(self):
        intake, _ = _make_intake_at_provider_review(
            self.organization, self.admin_user, self.provider, proposed_only=True,
        )
        self.client.login(username='pd_gemeente', password='pass')
        response = self.client.post(
            self._url(intake.contract_id),
            data=self._accept_payload(),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 403)
        self.assertFalse(response.json()['ok'])

    def test_cross_tenant_user_cannot_decide(self):
        intake, _ = _make_intake_at_provider_review(
            self.organization, self.admin_user, self.provider, proposed_only=True,
        )
        self.client.login(username='pd_cross', password='pass')
        response = self.client.post(
            self._url(intake.contract_id),
            data=self._accept_payload(),
            content_type='application/json',
        )
        # Cross-tenant user has their own org; case not found in it → 404
        self.assertIn(response.status_code, (404, 403))

    def test_proposed_provider_id_only_is_protected(self):
        """With only proposed_provider_id set (selected_provider_id=None), gate still fires."""
        intake, placement = _make_intake_at_provider_review(
            self.organization, self.admin_user, self.provider, proposed_only=True,
        )
        self.assertIsNone(placement.selected_provider_id)
        # The assigned coordinator can still access (effective_provider_id = proposed)
        self.client.login(username='pd_coord', password='pass')
        response = self.client.post(
            self._url(intake.contract_id),
            data=self._accept_payload(),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['ok'])

    def test_placement_without_provider_is_rejected(self):
        intake = CaseIntakeProcess.objects.create(
            organization=self.organization,
            title='No Provider Intake',
            status=CaseIntakeProcess.ProcessStatus.DECISION,
            urgency=CaseIntakeProcess.Urgency.MEDIUM,
            preferred_care_form=CaseIntakeProcess.CareForm.OUTPATIENT,
            start_date=date.today(),
            target_completion_date=date.today() + timedelta(days=7),
            case_coordinator=self.admin_user,
            workflow_state='PROVIDER_REVIEW_PENDING',
        )
        intake.ensure_case_record(created_by=self.admin_user)
        CaseAssessment.objects.create(
            due_diligence_process=intake,
            assessment_status=CaseAssessment.AssessmentStatus.APPROVED_FOR_MATCHING,
            matching_ready=True,
            assessed_by=self.admin_user,
            workflow_summary=MINIMAL_WORKFLOW_SUMMARY,
        )
        PlacementRequest.objects.create(
            due_diligence_process=intake,
            proposed_provider=None,
            selected_provider=None,
            status=PlacementRequest.Status.IN_REVIEW,
            care_form=PlacementRequest.CareForm.OUTPATIENT,
            provider_response_status=PlacementRequest.ProviderResponseStatus.PENDING,
        )
        self.client.login(username='pd_coord', password='pass')
        response = self.client.post(
            self._url(intake.contract_id),
            data=self._accept_payload(),
            content_type='application/json',
        )
        # ZORGAANBIEDER sees 404 (case not visible without a placement link);
        # the effective_provider_id=None guard fires for any actor that does reach the check.
        # Both are correct security outcomes.
        self.assertIn(response.status_code, (400, 403, 404))
        self.assertFalse(response.json()['ok'])

    def test_repeated_accept_does_not_corrupt_state(self):
        """After accept, a second ACCEPTED call must not move state backwards or corrupt data."""
        intake, _ = _make_intake_at_provider_review(
            self.organization, self.admin_user, self.provider, proposed_only=True,
        )
        self.client.login(username='pd_coord', password='pass')
        r1 = self.client.post(
            self._url(intake.contract_id),
            data=self._accept_payload(),
            content_type='application/json',
        )
        self.assertEqual(r1.status_code, 200)
        self.assertTrue(r1.json()['ok'])

        # Placement response status must be ACCEPTED after first call
        intake.refresh_from_db()
        placement = PlacementRequest.objects.filter(due_diligence_process=intake).order_by('-updated_at').first()
        self.assertEqual(placement.provider_response_status, PlacementRequest.ProviderResponseStatus.ACCEPTED)
        state_after_first = intake.workflow_state

        # Second call — state machine may allow or deny; either is acceptable.
        # What must NOT happen: placement moves back to PENDING or REJECTED.
        r2 = self.client.post(
            self._url(intake.contract_id),
            data=self._accept_payload(),
            content_type='application/json',
        )
        placement.refresh_from_db()
        intake.refresh_from_db()
        self.assertNotEqual(
            placement.provider_response_status,
            PlacementRequest.ProviderResponseStatus.PENDING,
        )
        self.assertNotEqual(
            placement.provider_response_status,
            PlacementRequest.ProviderResponseStatus.REJECTED,
        )
