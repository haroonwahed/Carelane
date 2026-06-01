from __future__ import annotations

from django.db import migrations

from contracts.zorgbehoefte_taxonomy import ZORGBEHOEFTE_TAXONOMY_V1


def forwards(apps, schema_editor):
    CareCategoryMain = apps.get_model("contracts", "CareCategoryMain")
    CareCategorySubcategory = apps.get_model("contracts", "CareCategorySubcategory")

    allowed_main_codes = {spec.code for spec in ZORGBEHOEFTE_TAXONOMY_V1}
    allowed_main_labels = {spec.label for spec in ZORGBEHOEFTE_TAXONOMY_V1}
    allowed_sub_codes = {subspec.code for spec in ZORGBEHOEFTE_TAXONOMY_V1 for subspec in spec.subcategories}
    allowed_sub_labels = {subspec.label for spec in ZORGBEHOEFTE_TAXONOMY_V1 for subspec in spec.subcategories}

    existing_mains = {str(item.code or "").strip(): item for item in CareCategoryMain.objects.all()}
    existing_main_names = {str(item.name or "").strip(): item for item in CareCategoryMain.objects.all()}
    existing_subs = {
        (str(item.code or "").strip(), item.main_category_id): item
        for item in CareCategorySubcategory.objects.select_related("main_category").all()
    }
    existing_sub_names = {
        (str(item.name or "").strip(), item.main_category_id): item
        for item in CareCategorySubcategory.objects.select_related("main_category").all()
    }

    for spec in ZORGBEHOEFTE_TAXONOMY_V1:
        main = existing_mains.get(spec.code) or existing_main_names.get(spec.label)
        if main is None:
            main = CareCategoryMain.objects.create(
                code=spec.code,
                name=spec.label,
                description=spec.description,
                order=spec.sort_order,
                is_active=True,
                visible_in_mvp=spec.visible_in_mvp,
            )
        else:
            main.code = spec.code
            main.name = spec.label
            main.description = spec.description
            main.order = spec.sort_order
            main.is_active = True
            main.visible_in_mvp = spec.visible_in_mvp
            main.save(update_fields=["code", "name", "description", "order", "is_active", "visible_in_mvp"])
        for subspec in spec.subcategories:
            sub = existing_subs.get((subspec.code, main.id)) or existing_sub_names.get((subspec.label, main.id))
            if sub is None:
                sub = CareCategorySubcategory.objects.create(
                    main_category=main,
                    code=subspec.code,
                    name=subspec.label,
                    description=subspec.description,
                    order=subspec.sort_order,
                    is_active=True,
                    visible_in_mvp=subspec.visible_in_mvp,
                )
            else:
                sub.main_category = main
                sub.code = subspec.code
                sub.name = subspec.label
                sub.description = subspec.description
                sub.order = subspec.sort_order
                sub.is_active = True
                sub.visible_in_mvp = subspec.visible_in_mvp
                sub.save(update_fields=["main_category", "code", "name", "description", "order", "is_active", "visible_in_mvp"])
    CareCategoryMain.objects.exclude(code__in=allowed_main_codes).exclude(name__in=allowed_main_labels).update(
        visible_in_mvp=False,
    )
    CareCategorySubcategory.objects.exclude(code__in=allowed_sub_codes).exclude(name__in=allowed_sub_labels).update(
        visible_in_mvp=False,
    )


class Migration(migrations.Migration):

    dependencies = [
        ("contracts", "0082_carecategorymain_code_and_more"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
