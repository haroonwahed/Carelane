from __future__ import annotations

from django.core.management.base import BaseCommand

from contracts.models import CaseIntakeProcess, Organization


class Command(BaseCommand):
    help = (
        "Backfill deterministic region / municipality routing fields on existing cases. "
        "Use this after region model changes so legacy records inherit the new routing model."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--slug',
            dest='slug',
            default='',
            help='Limit normalization to one Organization.slug (default: all active organizations).',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Report cases that need routing normalization without writing changes.',
        )

    def handle(self, *args, **options):
        slug = (options.get('slug') or '').strip()
        dry_run = bool(options.get('dry_run'))

        org_qs = Organization.objects.filter(is_active=True).order_by('slug')
        if slug:
            org_qs = org_qs.filter(slug=slug)

        organizations = list(org_qs)
        if not organizations:
            self.stdout.write(self.style.WARNING('No active organizations matched the filter.'))
            return

        total_seen = 0
        total_updated = 0
        total_pending = 0
        total_unresolved = 0

        for org in organizations:
            cases = (
                CaseIntakeProcess.objects.filter(organization=org)
                .select_related(
                    'gemeente',
                    'herkomst_gemeente',
                    'verantwoordelijke_gemeente',
                    'verblijfsgemeente',
                    'regio',
                    'zorgregio',
                    'plaatsingsregio',
                    'contractregio',
                    'escalatie_regio',
                    'preferred_region',
                )
                .order_by('created_at', 'pk')
            )

            pending = 0
            updated = 0
            unresolved = 0
            seen = 0
            for case in cases:
                seen += 1
                has_source_data = any(
                    [
                        case.gemeente_id,
                        case.herkomst_gemeente_id,
                        case.verantwoordelijke_gemeente_id,
                        case.verblijfsgemeente_id,
                        case.regio_id,
                        case.zorgregio_id,
                        case.plaatsingsregio_id,
                        case.contractregio_id,
                        case.escalatie_regio_id,
                        case.preferred_region_id,
                    ]
                )
                needs_backfill = any(
                    [
                        not case.herkomst_gemeente_id,
                        not case.verantwoordelijke_gemeente_id,
                        not case.verblijfsgemeente_id,
                        not case.zorgregio_id,
                        not case.plaatsingsregio_id,
                        not case.contractregio_id,
                        not case.escalatie_regio_id,
                        not case.responsibility_reason,
                        not case.responsibility_last_reviewed_at,
                    ]
                )
                if not has_source_data:
                    unresolved += 1
                    if not dry_run:
                        case.save()
                    continue

                if needs_backfill:
                    pending += 1
                    if not dry_run:
                        case.save()
                        updated += 1

            total_seen += seen
            total_pending += pending
            total_updated += updated
            total_unresolved += unresolved

            status = 'dry-run' if dry_run else 'applied'
            self.stdout.write(
                f'{org.slug}: {status} cases={seen} pending_backfill={pending} unresolved={unresolved} updated={updated}'
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Normalized routing for {total_seen} cases across {len(organizations)} organizations. '
                f'pending_backfill={total_pending} unresolved={total_unresolved} '
                f'updated={total_updated} dry_run={dry_run}'
            )
        )
