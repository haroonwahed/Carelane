"""
Data migration: link Client.responsible_coordinator for the three demo provider accounts.

seed_demo_data sets this link when run manually, but Render free tier has no shell
access. This migration ensures the link is set on every deploy so provider accounts
can see their assigned cases via filter_care_cases_for_provider_actor.
"""
from django.db import migrations


PROVIDER_STAFF = [
    ("provider.horizon@gemeente-demo.nl", "Horizon Jeugdzorg"),
    ("provider.kompas@gemeente-demo.nl", "Kompas Zorg"),
    ("provider.groei@gemeente-demo.nl", "Groei & Co"),
]


def link_coordinators(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Client = apps.get_model("contracts", "Client")

    for username, client_name in PROVIDER_STAFF:
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            continue
        Client.objects.filter(name=client_name).update(responsible_coordinator=user)


def unlink_coordinators(apps, schema_editor):
    Client = apps.get_model("contracts", "Client")
    usernames = [u for u, _ in PROVIDER_STAFF]
    User = apps.get_model("auth", "User")
    ids = list(User.objects.filter(username__in=usernames).values_list("pk", flat=True))
    Client.objects.filter(responsible_coordinator_id__in=ids).update(responsible_coordinator=None)


class Migration(migrations.Migration):

    dependencies = [
        ("contracts", "0094_create_pilot_superusers"),
    ]

    operations = [
        migrations.RunPython(link_coordinators, reverse_code=unlink_coordinators),
    ]
