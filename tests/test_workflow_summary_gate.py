from datetime import date, timedelta

from django.test import TestCase

from contracts.models import CaseAssessment, CaseIntakeProcess, Organization
from contracts.workflow_summary_gate import (
    ensure_workflow_summary_for_matching,
    workflow_summary_can_bootstrap,
    workflow_summary_complete,
)


class WorkflowSummaryGateTests(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="Gate Org", slug="gate-org")

    def test_bootstrap_from_intake_assessment_summary(self):
        intake = CaseIntakeProcess.objects.create(
            organization=self.organization,
            title="Bootstrap casus",
            status=CaseIntakeProcess.ProcessStatus.INTAKE,
            urgency=CaseIntakeProcess.Urgency.MEDIUM,
            start_date=date.today(),
            target_completion_date=date.today() + timedelta(days=7),
            assessment_summary="Dit is een intake samenvatting met voldoende context voor matching.",
        )
        assessment = CaseAssessment.objects.create(
            due_diligence_process=intake,
            assessment_status=CaseAssessment.AssessmentStatus.DRAFT,
        )

        self.assertTrue(workflow_summary_can_bootstrap(assessment=assessment, intake=intake))
        ok, err = ensure_workflow_summary_for_matching(assessment=assessment, intake=intake)
        self.assertTrue(ok, err)
        self.assertTrue(workflow_summary_complete(assessment=assessment, intake=intake)[0])
        self.assertGreaterEqual(len((assessment.workflow_summary or {}).get("context", "")), 24)
        self.assertTrue((assessment.workflow_summary or {}).get("risks_none_ack"))
