# Generated manually — additive urgency application status for intake and regiekamer visibility.

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("contracts", "0083_zorgbehoefte_taxonomy_v1"),
    ]

    operations = [
        migrations.AddField(
            model_name="caseintakeprocess",
            name="urgency_applied",
            field=models.BooleanField(
                default=False,
                help_text="Geeft aan dat de urgentieverklaring is aangevraagd bij de gemeente of het loket.",
                verbose_name="Urgentieverklaring aangevraagd",
            ),
        ),
        migrations.AddField(
            model_name="caseintakeprocess",
            name="urgency_applied_since",
            field=models.DateField(
                blank=True,
                help_text="Datum waarop de urgentieverklaring is aangevraagd.",
                null=True,
                verbose_name="Urgentieverklaring aangevraagd op",
            ),
        ),
    ]
