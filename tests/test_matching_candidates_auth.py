"""
Integration tests: matching_candidates_api authorization.

Verified gates:
- GEMEENTE role (member without profile)  → 200
- ADMIN role (owner/admin membership)      → 200
- ZORGAANBIEDER role (CLIENT profile)      → 403
- Unauthenticated                          → 302 (redirect to login)
- Cross-org user                           → 404 (case not in their org)
"""
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse

from contracts.models import (
    CareCase,
    CaseAssessment,
    CaseIntakeProcess,
    Organization,
    OrganizationMembership,
    UserProfile,
)

MINIMAL_WORKFLOW_SUMMARY = {
    'context': 'Test samenvatting voor matching auth test.',
    'risks': ['test_risk'],
    'missing_information': '',
    'risks_none_ack': False,
}


def _make_ready_intake(organization, user):
    intake = CaseIntakeProcess.objects.create(
        organization=organization,
        title='Auth Test Intake',
        status=CaseIntakeProcess.ProcessStatus.INTAKE,
        urgency=CaseIntakeProcess.Urgency.MEDIUM,
        preferred_care_form=CaseIntakeProcess.CareForm.OUTPATIENT,
        start_date=date.today(),
        target_completion_date=date.today() + timedelta(days=7),
        case_coordinator=user,
    )
    intake.ensure_case_record(created_by=user)
    CaseAssessment.objects.create(
        due_diligence_process=intake,
        assessment_status=CaseAssessment.AssessmentStatus.APPROVED_FOR_MATCHING,
        matching_ready=True,
        assessed_by=user,
        workflow_summary=MINIMAL_WORKFLOW_SUMMARY,
    )
    return intake


class MatchingCandidatesAuthTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.owner_user = User.objects.create_user('auth_owner', 'owner@test.com', 'pass')
        self.gemeente_user = User.objects.create_user('auth_gemeente', 'gemeente@test.com', 'pass')
        self.provider_user = User.objects.create_user('auth_provider', 'provider@test.com', 'pass')
        self.other_org_user = User.objects.create_user('auth_other', 'other@test.com', 'pass')

        self.organization = Organization.objects.create(name='Auth Test Org', slug='auth-test-org')
        self.other_org = Organization.objects.create(name='Other Auth Org', slug='other-auth-org')

        OrganizationMembership.objects.create(
            organization=self.organization,
            user=self.owner_user,
            role=OrganizationMembership.Role.OWNER,
            is_active=True,
        )
        OrganizationMembership.objects.create(
            organization=self.organization,
            user=self.gemeente_user,
            role=OrganizationMembership.Role.MEMBER,
            is_active=True,
        )
        OrganizationMembership.objects.create(
            organization=self.organization,
            user=self.provider_user,
            role=OrganizationMembership.Role.MEMBER,
            is_active=True,
        )
        UserProfile.objects.update_or_create(
            user=self.provider_user,
            defaults={'role': UserProfile.Role.CLIENT},
        )
        OrganizationMembership.objects.create(
            organization=self.other_org,
            user=self.other_org_user,
            role=OrganizationMembership.Role.OWNER,
            is_active=True,
        )

        self.intake = _make_ready_intake(self.organization, self.owner_user)
        self.case_id = self.intake.contract_id

    def _url(self):
        return reverse('carelane:matching_candidates_api', kwargs={'case_id': self.case_id})

    def test_admin_role_can_read_matching_candidates(self):
        self.client.login(username='auth_owner', password='pass')
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn('matches', body)

    def test_gemeente_role_can_read_matching_candidates(self):
        self.client.login(username='auth_gemeente', password='pass')
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn('matches', body)

    def test_zorgaanbieder_role_is_denied(self):
        self.client.login(username='auth_provider', password='pass')
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, 403)
        body = response.json()
        self.assertFalse(body.get('ok', True))

    def test_unauthenticated_is_redirected(self):
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, 302)

    def test_cross_org_user_gets_404(self):
        # other_org_user resolves their OWN org, case not in that org → 404
        self.client.login(username='auth_other', password='pass')
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, 404)
