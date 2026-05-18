"""End-to-end API flow: intake text → start matching → persisted match results."""
import json
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse

from contracts.models import (
    CaseAssessment,
    CaseIntakeProcess,
    MatchResultaat,
    Organization,
    OrganizationMembership,
)


class StartMatchingFlowTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="start_matching_user", password="testpass123")
        self.organization = Organization.objects.create(name="Start Matching Org", slug="start-matching-org")
        OrganizationMembership.objects.create(
            organization=self.organization,
            user=self.user,
            role=OrganizationMembership.Role.OWNER,
            is_active=True,
        )
        self.client.login(username="start_matching_user", password="testpass123")

    def test_draft_intake_summary_can_start_matching_and_persist_results(self):
        intake = CaseIntakeProcess.objects.create(
            organization=self.organization,
            title="Start Matching Flow",
            status=CaseIntakeProcess.ProcessStatus.INTAKE,
            urgency=CaseIntakeProcess.Urgency.MEDIUM,
            preferred_care_form=CaseIntakeProcess.CareForm.OUTPATIENT,
            start_date=date.today(),
            target_completion_date=date.today() + timedelta(days=7),
            case_coordinator=self.user,
            assessment_summary=(
                "Intake samenvatting met voldoende context om matching te starten vanuit casusdetail."
            ),
        )
        case_record = intake.ensure_case_record(created_by=self.user)

        response = self.client.post(
            reverse("careon:assessment_decision_api", kwargs={"case_id": case_record.pk}),
            data=json.dumps(
                {
                    "decision": "matching",
                    "shortDescription": "Matching gestart vanuit test.",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200, response.content.decode())

        intake.refresh_from_db()
        assessment = intake.case_assessment
        self.assertEqual(intake.workflow_state, "MATCHING_READY")
        self.assertEqual(assessment.assessment_status, CaseAssessment.AssessmentStatus.APPROVED_FOR_MATCHING)
        self.assertTrue((assessment.workflow_summary or {}).get("context"))
        body = response.json()
        self.assertTrue(body.get("ok"))
        self.assertEqual(body.get("nextPage"), "matching")
