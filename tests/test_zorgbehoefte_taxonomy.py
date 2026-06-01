from django.test import TestCase

from contracts.models import CareCategoryMain, CareCategorySubcategory
from contracts.zorgbehoefte_taxonomy import ZORGBEHOEFTE_TAXONOMY_V1, ensure_zorgbehoefte_taxonomy


class ZorgbehoefteTaxonomyTestCase(TestCase):
    def test_ensure_taxonomy_materializes_definitive_mvp_categories(self):
        ensure_zorgbehoefte_taxonomy()

        visible_mains = list(
            CareCategoryMain.objects.filter(is_active=True, visible_in_mvp=True).order_by('order', 'name')
        )
        self.assertEqual([item.code for item in visible_mains], [spec.code for spec in ZORGBEHOEFTE_TAXONOMY_V1])
        self.assertEqual([item.name for item in visible_mains], [spec.label for spec in ZORGBEHOEFTE_TAXONOMY_V1])

        safety_category = CareCategoryMain.objects.get(code='VEILIGHEID_BESCHERMING')
        safety_subcategories = list(
            CareCategorySubcategory.objects.filter(
                main_category=safety_category,
                is_active=True,
                visible_in_mvp=True,
            ).order_by('order', 'name')
        )
        self.assertEqual(
            [item.code for item in safety_subcategories],
            [subspec.code for subspec in ZORGBEHOEFTE_TAXONOMY_V1[1].subcategories],
        )
        self.assertEqual(
            [item.name for item in safety_subcategories],
            [subspec.label for subspec in ZORGBEHOEFTE_TAXONOMY_V1[1].subcategories],
        )
