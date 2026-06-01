from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class ZorgbehoefteSubcategorySpec:
    code: str
    label: str
    description: str
    sort_order: int
    visible_in_mvp: bool = True


@dataclass(frozen=True)
class ZorgbehoefteCategorySpec:
    code: str
    label: str
    description: str
    sort_order: int
    visible_in_mvp: bool = True
    subcategories: tuple[ZorgbehoefteSubcategorySpec, ...] = ()


ZORGBEHOEFTE_TAXONOMY_V1: tuple[ZorgbehoefteCategorySpec, ...] = (
    ZorgbehoefteCategorySpec(
        code="WONEN_VERBLIJF",
        label="Wonen & verblijf",
        description="Plaatsings- en doorstroomvragen rond wonen en verblijf.",
        sort_order=10,
        subcategories=(
            ZorgbehoefteSubcategorySpec("WONEN_VERBLIJF_WOONVOORZIENING", "Woonvoorziening", "Passende woonplek of woonvoorziening nodig.", 10),
            ZorgbehoefteSubcategorySpec("WONEN_VERBLIJF_BESCHERMD_WONEN", "Beschermd wonen", "Beschermde woonvorm of intensieve woonbegeleiding.", 20),
            ZorgbehoefteSubcategorySpec("WONEN_VERBLIJF_CRISISOPVANG", "Crisisopvang", "Acute opvang met directe plaatsingsdruk.", 30),
            ZorgbehoefteSubcategorySpec("WONEN_VERBLIJF_TIJDELIJK_VERBLIJF", "Tijdelijk verblijf", "Kortdurend verblijf of overbrugging.", 40),
            ZorgbehoefteSubcategorySpec("WONEN_VERBLIJF_RESIDENTIELE_PLAATSING", "Residentiële plaatsing", "Volledige residentiële plek nodig.", 50),
            ZorgbehoefteSubcategorySpec("WONEN_VERBLIJF_PLEEGZORG", "Pleegzorg", "Gezinsgerichte plaatsing in pleegzorg.", 60),
            ZorgbehoefteSubcategorySpec("WONEN_VERBLIJF_GEZINSHUISPLAATSING", "Gezinshuisplaatsing", "Plaatsing in een gezinshuis.", 70),
            ZorgbehoefteSubcategorySpec("WONEN_VERBLIJF_BEGELEID_WONEN", "Begeleid wonen", "Zelfstandig wonen met begeleiding.", 80),
            ZorgbehoefteSubcategorySpec("WONEN_VERBLIJF_DOORSTROOM_WONEN", "Doorstroom wonen", "Doorstroom naar stabiele woonplek.", 90),
        ),
    ),
    ZorgbehoefteCategorySpec(
        code="VEILIGHEID_BESCHERMING",
        label="Veiligheid & bescherming",
        description="Casussen met veiligheidsdruk, bescherming of escalatie.",
        sort_order=20,
        subcategories=(
            ZorgbehoefteSubcategorySpec("VEILIGHEID_BESCHERMING_ACUTE_VEILIGHEID", "Acute veiligheid", "Directe veiligheidsafweging of snelle opvolging.", 10),
            ZorgbehoefteSubcategorySpec("VEILIGHEID_BESCHERMING_HUISELIJK_GEWELD", "Huiselijk geweld", "Situaties met (dreigend) huiselijk geweld.", 20),
            ZorgbehoefteSubcategorySpec("VEILIGHEID_BESCHERMING_KINDBESCHERMING", "Kindbescherming", "Beschermingsvraag voor minderjarige.", 30),
            ZorgbehoefteSubcategorySpec("VEILIGHEID_BESCHERMING_TOEZICHT_JEUGDBESCHERMING", "Toezicht / jeugdbescherming", "Toezicht, bescherming of maatregelvraag.", 40),
            ZorgbehoefteSubcategorySpec("VEILIGHEID_BESCHERMING_ESCALATIEGEVOELIGE_THUISSITUATIE", "Escalatiegevoelige thuissituatie", "Thuiscontext met verhoogd escalatierisico.", 50),
            ZorgbehoefteSubcategorySpec("VEILIGHEID_BESCHERMING_CRISISINTERVENTIE", "Crisisinterventie", "Interventie nodig bij acute onveiligheid.", 60),
            ZorgbehoefteSubcategorySpec("VEILIGHEID_BESCHERMING_VEILIGE_TIJDELIJKE_PLAATSING", "Veilige tijdelijke plaatsing", "Tijdelijke veilige plek nodig.", 70),
        ),
    ),
    ZorgbehoefteCategorySpec(
        code="GEDRAG_ONTWIKKELING",
        label="Gedrag & ontwikkeling",
        description="Operationele hulpvragen rond gedrag, ontwikkeling en structuur.",
        sort_order=30,
        subcategories=(
            ZorgbehoefteSubcategorySpec("GEDRAG_ONTWIKKELING_GEDRAGSPROBLEMATIEK", "Gedragsproblematiek", "Brede gedragsproblematiek.", 10),
            ZorgbehoefteSubcategorySpec("GEDRAG_ONTWIKKELING_EMOTIEREGULATIE", "Emotieregulatie", "Ondersteuning bij emotieregulatie.", 20),
            ZorgbehoefteSubcategorySpec("GEDRAG_ONTWIKKELING_ONTWIKKELINGSPROBLEMATIEK", "Ontwikkelingsproblematiek", "Ontwikkelingsvragen met impact op plaatsing.", 30),
            ZorgbehoefteSubcategorySpec("GEDRAG_ONTWIKKELING_SOCIAAL_FUNCTIONEREN", "Sociaal functioneren", "Moeite in sociale interactie of deelname.", 40),
            ZorgbehoefteSubcategorySpec("GEDRAG_ONTWIKKELING_ZELFREDZAAMHEID", "Zelfredzaamheid", "Ondersteuning bij dagelijkse zelfstandigheid.", 50),
            ZorgbehoefteSubcategorySpec("GEDRAG_ONTWIKKELING_STRUCTUURBEHOEFTE", "Structuurbehoefte", "Sterke behoefte aan voorspelbaarheid en structuur.", 60),
            ZorgbehoefteSubcategorySpec("GEDRAG_ONTWIKKELING_SCHOOLUITVAL_DAGSTRUCTUUR", "Schooluitval / dagstructuur", "Geen stabiele school- of dagstructuur.", 70),
        ),
    ),
    ZorgbehoefteCategorySpec(
        code="GEZIN_OPVOEDING",
        label="Gezin & opvoeding",
        description="Vraagstukken in opvoeding, gezinssysteem en thuissituatie.",
        sort_order=40,
        subcategories=(
            ZorgbehoefteSubcategorySpec("GEZIN_OPVOEDING_OPVOEDONDERSTEUNING", "Opvoedondersteuning", "Ondersteuning voor opvoeders.", 10),
            ZorgbehoefteSubcategorySpec("GEZIN_OPVOEDING_GEZINSBEGELEIDING", "Gezinsbegeleiding", "Begeleiding van het gezinssysteem.", 20),
            ZorgbehoefteSubcategorySpec("GEZIN_OPVOEDING_OUDER_KIND_ONDERSTEUNING", "Ouder-kind ondersteuning", "Gerichte ondersteuning rondom ouder-kind-relatie.", 30),
            ZorgbehoefteSubcategorySpec("GEZIN_OPVOEDING_SYSTEEMPROBLEMATIEK", "Systeemproblematiek", "Systeem- of netwerkproblematiek.", 40),
            ZorgbehoefteSubcategorySpec("GEZIN_OPVOEDING_RELATIE_GEZINSCONFLICT", "Relatie-/gezinsconflict", "Conflicten binnen gezin of relatie.", 50),
            ZorgbehoefteSubcategorySpec("GEZIN_OPVOEDING_THUISSITUATIE_INSTABIEL", "Thuissituatie instabiel", "Instabiele thuissituatie zonder directe veiligheidsroute.", 60),
        ),
    ),
    ZorgbehoefteCategorySpec(
        code="PSYCHOSOCIAAL_BEGELEIDING",
        label="Psychosociaal & begeleiding",
        description="Niet-diagnostische ondersteuningsvraag met beïnvloeding van plaatsing en begeleiding.",
        sort_order=50,
        subcategories=(
            ZorgbehoefteSubcategorySpec("PSYCHOSOCIAAL_BEGELEIDING_PSYCHISCHE_ONDERSTEUNING", "Psychische ondersteuning", "Psychische ondersteuning zonder diagnosefocus.", 10),
            ZorgbehoefteSubcategorySpec("PSYCHOSOCIAAL_BEGELEIDING_TRAUMA_GERELATEERDE_ONDERSTEUNING", "Trauma-gerelateerde ondersteuning", "Ondersteuning bij traumagerelateerde belasting.", 20),
            ZorgbehoefteSubcategorySpec("PSYCHOSOCIAAL_BEGELEIDING_GEZINSDYNAMIEK", "Gezinsdynamiek", "Ondersteuning bij complexe gezinsdynamiek.", 30),
            ZorgbehoefteSubcategorySpec("PSYCHOSOCIAAL_BEGELEIDING_OVERBELASTING_THUISSITUATIE", "Overbelasting thuissituatie", "Thuis raakt overbelast zonder directe veiligheidsroute.", 40),
            ZorgbehoefteSubcategorySpec("PSYCHOSOCIAAL_BEGELEIDING_INTENSIEVE_BEGELEIDING", "Intensieve begeleiding", "Langdurige en intensieve begeleiding nodig.", 50),
        ),
    ),
    ZorgbehoefteCategorySpec(
        code="REGIE_COMPLEX",
        label="Regie & complexe casus",
        description="Casussen die om ketenregie en meerpartij-afstemming vragen.",
        sort_order=60,
        subcategories=(
            ZorgbehoefteSubcategorySpec("REGIE_COMPLEX_MEERVOUDIGE_PROBLEMATIEK", "Meervoudige problematiek", "Meerdere vraagstukken tegelijk.", 10),
            ZorgbehoefteSubcategorySpec("REGIE_COMPLEX_KETENAFSTEMMING_NODIG", "Ketenafstemming nodig", "Afstemming tussen meerdere partijen vereist.", 20),
            ZorgbehoefteSubcategorySpec("REGIE_COMPLEX_MULTI_AANBIEDER_BEGELEIDING", "Multi-aanbieder begeleiding", "Begeleiding over meerdere aanbieders heen.", 30),
            ZorgbehoefteSubcategorySpec("REGIE_COMPLEX_REGIE_INTENSIEVE_CASUS", "Regie-intensieve casus", "Casus vraagt intensieve regie en opvolging.", 40),
            ZorgbehoefteSubcategorySpec("REGIE_COMPLEX_WACHTLIJN_OVERBRUGGING", "Wachtlijst-overbrugging", "Overbrugging nodig tot definitieve plek.", 50),
            ZorgbehoefteSubcategorySpec("REGIE_COMPLEX_HERPLAATSING_NODIG", "Herplaatsing nodig", "Bestaande plaatsing moet worden herzien.", 60),
        ),
    ),
)

_PROVIDER_SPECIALISATION_SUBCATEGORY_CODES_BY_CATEGORY_CODE: dict[str, tuple[str, ...]] = {
    "WONEN_VERBLIJF": (
        "WONEN_VERBLIJF_WOONVOORZIENING",
        "WONEN_VERBLIJF_BESCHERMD_WONEN",
        "WONEN_VERBLIJF_CRISISOPVANG",
        "WONEN_VERBLIJF_TIJDELIJK_VERBLIJF",
    ),
    "VEILIGHEID_BESCHERMING": (
        "VEILIGHEID_BESCHERMING_ACUTE_VEILIGHEID",
        "VEILIGHEID_BESCHERMING_HUISELIJK_GEWELD",
        "VEILIGHEID_BESCHERMING_CRISISINTERVENTIE",
    ),
    "GEDRAG_ONTWIKKELING": (
        "GEDRAG_ONTWIKKELING_GEDRAGSPROBLEMATIEK",
        "GEDRAG_ONTWIKKELING_STRUCTUURBEHOEFTE",
        "GEDRAG_ONTWIKKELING_SCHOOLUITVAL_DAGSTRUCTUUR",
    ),
    "GEZIN_OPVOEDING": (
        "GEZIN_OPVOEDING_OPVOEDONDERSTEUNING",
        "GEZIN_OPVOEDING_GEZINSBEGELEIDING",
        "GEZIN_OPVOEDING_RELATIE_GEZINSCONFLICT",
    ),
    "PSYCHOSOCIAAL_BEGELEIDING": (
        "PSYCHOSOCIAAL_BEGELEIDING_PSYCHISCHE_ONDERSTEUNING",
        "PSYCHOSOCIAAL_BEGELEIDING_TRAUMA_GERELATEERDE_ONDERSTEUNING",
        "PSYCHOSOCIAAL_BEGELEIDING_INTENSIEVE_BEGELEIDING",
    ),
    "REGIE_COMPLEX": (
        "REGIE_COMPLEX_MEERVOUDIGE_PROBLEMATIEK",
        "REGIE_COMPLEX_KETENAFSTEMMING_NODIG",
        "REGIE_COMPLEX_REGIE_INTENSIEVE_CASUS",
    ),
}


def iter_zorgbehoefte_main_specs() -> Iterable[ZorgbehoefteCategorySpec]:
    return ZORGBEHOEFTE_TAXONOMY_V1


def iter_zorgbehoefte_subcategory_specs() -> Iterable[tuple[ZorgbehoefteCategorySpec, ZorgbehoefteSubcategorySpec]]:
    for category in ZORGBEHOEFTE_TAXONOMY_V1:
        for subcategory in category.subcategories:
            yield category, subcategory


def provider_subcategory_codes_for_category_code(category_code: str) -> tuple[str, ...]:
    return _PROVIDER_SPECIALISATION_SUBCATEGORY_CODES_BY_CATEGORY_CODE.get(str(category_code or "").strip().upper(), ())


def provider_subcategory_codes_for_category(category: ZorgbehoefteCategorySpec | None) -> tuple[str, ...]:
    if category is None:
        return ()
    return provider_subcategory_codes_for_category_code(category.code)


def format_taxonomy_explainability(
    category_label: str,
    category_code: str,
    subcategory_label: str,
    subcategory_code: str,
) -> tuple[str, str]:
    category_label = str(category_label or "").strip()
    category_code = str(category_code or "").strip().upper()
    subcategory_label = str(subcategory_label or "").strip()
    subcategory_code = str(subcategory_code or "").strip().upper()

    label_parts = [part for part in (category_label, subcategory_label) if part]
    code_parts = [part for part in (category_code, subcategory_code) if part]

    label_line = f"Taxonomie: {' → '.join(label_parts)}" if label_parts else ""
    code_line = f"Taxonomiecode: {' → '.join(code_parts)}" if code_parts else ""
    return label_line, code_line


def ensure_zorgbehoefte_taxonomy():
    from contracts.models import CareCategoryMain, CareCategorySubcategory

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

    created_main_ids: set[int] = set()
    created_sub_ids: set[int] = set()

    for category in ZORGBEHOEFTE_TAXONOMY_V1:
        main = existing_mains.get(category.code)
        if main is None:
            main = existing_main_names.get(category.label)
        if main is None:
            main = CareCategoryMain.objects.create(
                code=category.code,
                name=category.label,
                description=category.description,
                order=category.sort_order,
                is_active=True,
                visible_in_mvp=category.visible_in_mvp,
            )
        else:
            main.code = category.code
            main.name = category.label
            main.description = category.description
            main.order = category.sort_order
            main.is_active = True
            main.visible_in_mvp = category.visible_in_mvp
            main.save(update_fields=["code", "name", "description", "order", "is_active", "visible_in_mvp"])
        created_main_ids.add(main.id)

        for subcategory in category.subcategories:
            sub = existing_subs.get((subcategory.code, main.id))
            if sub is None:
                sub = existing_sub_names.get((subcategory.label, main.id))
            if sub is None:
                sub = CareCategorySubcategory.objects.create(
                    main_category=main,
                    code=subcategory.code,
                    name=subcategory.label,
                    description=subcategory.description,
                    order=subcategory.sort_order,
                    is_active=True,
                    visible_in_mvp=subcategory.visible_in_mvp,
                )
            else:
                sub.main_category = main
                sub.code = subcategory.code
                sub.name = subcategory.label
                sub.description = subcategory.description
                sub.order = subcategory.sort_order
                sub.is_active = True
                sub.visible_in_mvp = subcategory.visible_in_mvp
                sub.save(update_fields=["main_category", "code", "name", "description", "order", "is_active", "visible_in_mvp"])
            created_sub_ids.add(sub.id)

    return {
        "main_ids": created_main_ids,
        "sub_ids": created_sub_ids,
    }
