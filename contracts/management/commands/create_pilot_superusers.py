"""
One-shot command to provision pilot superuser accounts.

Run on production via the Render shell:
    python manage.py create_pilot_superusers

Prints a temporary password for each account that doesn't already exist.
Idempotent: re-running on an existing account is a no-op (password unchanged).
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()

PILOT_SUPERUSERS = [
    {"username": "luuk@carelane.nl", "email": "luuk@carelane.nl", "first_name": "Luuk", "password": "ChangeMeNow1!"},
    {"username": "sina@carelane.nl", "email": "sina@carelane.nl", "first_name": "Sina", "password": "ChangeMeNow2!"},
]


class Command(BaseCommand):
    help = "Create pilot superuser accounts for Luuk and Sina (idempotent). Rotate passwords after first use."

    def handle(self, *args, **options):
        for spec in PILOT_SUPERUSERS:
            user, created = User.objects.get_or_create(
                username=spec["username"],
                defaults={
                    "email": spec["email"],
                    "first_name": spec["first_name"],
                    "is_staff": True,
                    "is_superuser": True,
                },
            )
            if created:
                user.set_password(spec["password"])
                user.save(update_fields=["password"])
                self.stdout.write(self.style.SUCCESS(f"Created {spec['email']}"))
            else:
                self.stdout.write(f"Skipped {spec['email']} — already exists.")
