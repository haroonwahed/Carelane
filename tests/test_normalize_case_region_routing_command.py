from datetime import date, timedelta
from io import StringIO

from django.contrib.auth.models import User
from django.core.management import call_command
from django.test import TestCase

from contracts.models import CaseIntakeProcess, MunicipalityConfiguration, Organization, RegionalConfiguration


class NormalizeCaseRegionRoutingCommandTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='routing-admin', password='testpass123')
        self.organization = Organization.objects.create(name='Routing Org', slug='routing-org')
        self.municipality = MunicipalityConfiguration.objects.create(
            organization=self.organization,
            municipality_name='Utrecht',
            municipality_code='UTR',
            created_by=self.user,
        )
        self.region = RegionalConfiguration.objects.create(
            organization=self.organization,
            region_name='Regio Utrecht',
            region_code='RU',
            created_by=self.user,
        )
        self.region.served_municipalities.add(self.municipality)

    def test_normalize_backfills_missing_case_routing(self):
        intake = CaseIntakeProcess.objects.create(
            organization=self.organization,
            title='Legacy routing intake',
            status=CaseIntakeProcess.ProcessStatus.INTAKE,
            urgency=CaseIntakeProcess.Urgency.MEDIUM,
            preferred_care_form=CaseIntakeProcess.CareForm.OUTPATIENT,
            start_date=date.today(),
            target_completion_date=date.today() + timedelta(days=7),
            case_coordinator=self.user,
            gemeente=self.municipality,
            preferred_region=self.region,
            preferred_region_type=self.region.region_type,
        )

        CaseIntakeProcess.objects.filter(pk=intake.pk).update(
            herkomst_gemeente=None,
            verantwoordelijke_gemeente=None,
            verblijfsgemeente=None,
            zorgregio=None,
            plaatsingsregio=None,
            contractregio=None,
            escalatie_regio=None,
            responsibility_reason='',
            responsibility_last_reviewed_at=None,
            requires_revalidation=False,
        )

        out = StringIO()
        call_command(
            'normalize_case_region_routing',
            slug='routing-org',
            stdout=out,
            verbosity=0,
        )

        intake.refresh_from_db()
        self.assertEqual(intake.herkomst_gemeente_id, self.municipality.id)
        self.assertEqual(intake.verantwoordelijke_gemeente_id, self.municipality.id)
        self.assertEqual(intake.verblijfsgemeente_id, self.municipality.id)
        self.assertEqual(intake.zorgregio_id, self.region.id)
        self.assertEqual(intake.plaatsingsregio_id, self.region.id)
        self.assertEqual(intake.contractregio_id, self.region.id)
        self.assertEqual(intake.escalatie_regio_id, self.region.id)
        self.assertTrue(intake.responsibility_reason)
        self.assertIsNotNone(intake.responsibility_last_reviewed_at)
        self.assertFalse(intake.requires_revalidation)
        self.assertIn('updated=1', out.getvalue())

    def test_normalize_dry_run_reports_without_mutating(self):
        intake = CaseIntakeProcess.objects.create(
            organization=self.organization,
            title='Dry run legacy routing intake',
            status=CaseIntakeProcess.ProcessStatus.INTAKE,
            urgency=CaseIntakeProcess.Urgency.MEDIUM,
            preferred_care_form=CaseIntakeProcess.CareForm.OUTPATIENT,
            start_date=date.today(),
            target_completion_date=date.today() + timedelta(days=7),
            case_coordinator=self.user,
            gemeente=self.municipality,
            preferred_region=self.region,
            preferred_region_type=self.region.region_type,
        )

        CaseIntakeProcess.objects.filter(pk=intake.pk).update(
            herkomst_gemeente=None,
            verantwoordelijke_gemeente=None,
            verblijfsgemeente=None,
            zorgregio=None,
            plaatsingsregio=None,
            contractregio=None,
            escalatie_regio=None,
            responsibility_reason='',
            responsibility_last_reviewed_at=None,
            requires_revalidation=False,
        )

        out = StringIO()
        call_command(
            'normalize_case_region_routing',
            slug='routing-org',
            dry_run=True,
            stdout=out,
            verbosity=0,
        )

        intake.refresh_from_db()
        self.assertIsNone(intake.herkomst_gemeente_id)
        self.assertIsNone(intake.verantwoordelijke_gemeente_id)
        self.assertIsNone(intake.zorgregio_id)
        self.assertIn('dry_run=True', out.getvalue())

    def test_normalize_marks_unroutable_cases_as_incomplete(self):
        intake = CaseIntakeProcess.objects.create(
            organization=self.organization,
            title='Unroutable legacy routing intake',
            status=CaseIntakeProcess.ProcessStatus.INTAKE,
            urgency=CaseIntakeProcess.Urgency.MEDIUM,
            preferred_care_form=CaseIntakeProcess.CareForm.OUTPATIENT,
            start_date=date.today(),
            target_completion_date=date.today() + timedelta(days=7),
            case_coordinator=self.user,
        )
        CaseIntakeProcess.objects.filter(pk=intake.pk).update(
            gemeente=None,
            preferred_region=None,
            regio=None,
            herkomst_gemeente=None,
            verantwoordelijke_gemeente=None,
            verblijfsgemeente=None,
            zorgregio=None,
            plaatsingsregio=None,
            contractregio=None,
            escalatie_regio=None,
            responsibility_reason='',
            responsibility_last_reviewed_at=None,
            requires_revalidation=False,
        )

        call_command('normalize_case_region_routing', slug='routing-org', verbosity=0)
        intake.refresh_from_db()

        self.assertTrue(intake.requires_revalidation)
        self.assertIn('Onvoldoende regiogegevens', intake.responsibility_reason)
        self.assertIsNotNone(intake.responsibility_last_reviewed_at)
