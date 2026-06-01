# Generated manually — additive municipality urgency request metadata.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("contracts", "0079_caseintakeprocess_source_reference"),
    ]

    operations = [
        migrations.AddField(
            model_name="municipalityconfiguration",
            name="urgency_document_request_url",
            field=models.URLField(
                blank=True,
                default="",
                help_text="Officiële pagina of loket waar een urgentieverklaring aangevraagd kan worden.",
                max_length=200,
                verbose_name="Link urgentieverklaring aanvragen",
            ),
        ),
    ]
