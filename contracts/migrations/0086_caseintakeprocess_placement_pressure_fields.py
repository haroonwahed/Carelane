# Generated manually — additive placement-pressure metadata for intake triage and urgency derivation.

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("contracts", "0085_document_external_handoff_reference"),
    ]

    operations = [
        migrations.AddField(
            model_name="caseintakeprocess",
            name="placement_pressure_horizon",
            field=models.CharField(
                choices=[
                    ("TODAY", "Vandaag"),
                    ("3_DAYS", "3 dagen"),
                    ("1_WEEK", "1 week"),
                    ("2_WEEKS", "2 weken"),
                    (">2_WEEKS", ">2 weken"),
                ],
                default=">2_WEEKS",
                help_text="Hoe lang de huidige situatie operationeel houdbaar is zonder escalatie.",
                max_length=20,
                verbose_name="Huidige situatie houdbaar tot",
            ),
        ),
        migrations.AddField(
            model_name="caseintakeprocess",
            name="safety_pressure",
            field=models.BooleanField(
                default=False,
                help_text="Geeft aan of vertraging een veiligheidsrisico oplevert.",
                verbose_name="Veiligheidsdruk",
            ),
        ),
        migrations.AddField(
            model_name="caseintakeprocess",
            name="time_sensitive_arrangement",
            field=models.BooleanField(
                default=False,
                help_text="Geeft aan of funding of juridische timing de doorstroom versnelt.",
                verbose_name="Tijdskritisch arrangement",
            ),
        ),
        migrations.AddField(
            model_name="caseintakeprocess",
            name="escalation_needed",
            field=models.BooleanField(
                default=False,
                help_text="Geeft aan of snelle gemeente- of providerafstemming nodig is.",
                verbose_name="Escalatie nodig",
            ),
        ),
        migrations.AddField(
            model_name="caseintakeprocess",
            name="placement_pressure_notes",
            field=models.TextField(
                blank=True,
                help_text="Korte operationele toelichting zonder direct herleidbare persoonsgegevens.",
                verbose_name="Plaatsingsdruk toelichting",
            ),
        ),
    ]
