# Generated manually — additive case intake metadata.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("contracts", "0078_aanbiedervastiging_geocode_metadata"),
    ]

    operations = [
        migrations.AddField(
            model_name="caseintakeprocess",
            name="source_reference",
            field=models.CharField(
                blank=True,
                db_index=True,
                default="",
                help_text="Automatisch gegenereerde referentie voor de bronkoppeling.",
                max_length=64,
                verbose_name="Bronreferentie",
            ),
        ),
    ]
