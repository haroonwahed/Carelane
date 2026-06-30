"""
Reset demo provider capacity counters so placement confirmation flows can be re-tested.

Each confirmed placement atomically decrements CapaciteitRecord.beschikbare_capaciteit
and open_slots. In the demo environment these counters exhaust over repeated test runs,
blocking CONFIRM_PLACEMENT with "Geen capaciteit beschikbaar."

This command resets those counters to the original seed values without touching any
case, intake, or placement records — so existing workflow state is preserved.

Usage:
    python manage.py reset_demo_capacity
    python manage.py reset_demo_capacity --dry-run
"""

from django.core.management.base import BaseCommand

DEMO_CAPACITY: dict[str, dict] = {
    "Horizon Jeugdzorg": {"beschikbare_capaciteit": 5, "open_slots": 5},
    "De Rading":         {"beschikbare_capaciteit": 4, "open_slots": 4},
    "Lijn5":             {"beschikbare_capaciteit": 4, "open_slots": 4},
    "Youké":             {"beschikbare_capaciteit": 3, "open_slots": 3},
    "Altra":             {"beschikbare_capaciteit": 3, "open_slots": 3},
    "Spirit":            {"beschikbare_capaciteit": 3, "open_slots": 3},
}


class Command(BaseCommand):
    help = "Reset demo provider capacity counters to seed values (non-destructive)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Show what would be reset without making changes.",
        )

    def handle(self, *args, **options):
        from contracts.models import CapaciteitRecord, Zorgaanbieder

        dry_run = options["dry_run"]
        updated = 0
        skipped = 0

        for provider_name, targets in DEMO_CAPACITY.items():
            try:
                za = Zorgaanbieder.objects.get(name=provider_name)
            except Zorgaanbieder.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"  skip  {provider_name!r} — Zorgaanbieder not found"))
                skipped += 1
                continue

            records = CapaciteitRecord.objects.filter(vestiging__zorgaanbieder=za)
            if not records.exists():
                self.stdout.write(self.style.WARNING(f"  skip  {provider_name!r} — no CapaciteitRecord rows"))
                skipped += 1
                continue

            beschikbaar = targets["beschikbare_capaciteit"]
            open_s = targets["open_slots"]

            if dry_run:
                for r in records:
                    self.stdout.write(
                        f"  [dry-run] {provider_name!r} record {r.pk}: "
                        f"beschikbare_capaciteit {r.beschikbare_capaciteit}→{beschikbaar}, "
                        f"open_slots {r.open_slots}→{open_s}"
                    )
            else:
                count = records.update(
                    beschikbare_capaciteit=beschikbaar,
                    open_slots=open_s,
                )
                self.stdout.write(self.style.SUCCESS(
                    f"  reset {provider_name!r}: {count} record(s) → "
                    f"beschikbaar={beschikbaar}, open_slots={open_s}"
                ))
                updated += count

        label = "[dry-run] " if dry_run else ""
        self.stdout.write(f"\n{label}Done — {updated} records updated, {skipped} providers skipped.")
