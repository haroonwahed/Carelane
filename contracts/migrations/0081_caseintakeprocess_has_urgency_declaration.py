# Generated manually — additive intake metadata for urgency declaration handling.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("contracts", "0080_municipalityconfiguration_urgency_document_request_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="caseintakeprocess",
            name="has_urgency_declaration",
            field=models.BooleanField(
                default=False,
                help_text="Geeft aan dat de client al een bestaande urgentieverklaring heeft die geüpload kan worden.",
                verbose_name="Client heeft al een urgentieverklaring",
            ),
        ),
    ]
