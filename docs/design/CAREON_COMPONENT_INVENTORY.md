# CareOn Component Inventory

**Versie:** 1.0 — 2026-06-15  
**Bron:** Design audit (28-agent workflow), correcties van 2026-06-15

---

## Statuslegenda

| Status | Betekenis |
|---|---|
| KEEP | Behouden, mogelijk met fixes |
| FIX | Behouden maar heeft gerichte aanpassingen nodig |
| DELETE | Verwijderen nadat consumers zijn gemigreerd |
| MERGE | Samenvoegen met een ander component |
| CREATE | Nieuw aanmaken (alleen na bewijs van ≥2 productschermen) |

---

## Layout & Shell

| Component | Bestand | Status | Issues | Actie |
|---|---|---|---|---|
| `CareAppFrame` | `CareDesignPrimitives` | KEEP | `px-4/md:px-5` — vervang door `--care-page-h-padding` | F1 |
| `CarePageScaffold` | `CareDesignPrimitives` | KEEP | Voeg `data-care-page-archetype` attribuut toe | F2 |
| `CarePageTemplate` | `CareDesignPrimitives` | KEEP (intern) | Niet direct exporteren naar page-bestanden | — |
| `Sidebar` | `navigation/Sidebar` | FIX | `w-64` → `var(--care-sidebar-width-expanded)` | F1 |
| `TopBar` | `navigation/TopBar` | FIX | `h-16` → `var(--care-topbar-height)`, `px-5` → var | F1 |
| `CasusWorkspaceLayout` | workspace | KEEP | Gedocumenteerde layout-uitzondering | — |

---

## Section & Surface

| Component | Bestand | Status | Issues | Actie |
|---|---|---|---|---|
| `CareSection` | `CareDesignPrimitives` | FIX | Voeg `tone="elevated"` toe; fix muted-tone base-class duplicatie | F5 |
| `CareWorkspaceSection` | `CareDesignPrimitives` | KEEP | Geen issues | — |
| `CareSectionHeader` | `CareDesignPrimitives` | FIX | Dead props: `description`, `descriptionAriaLabel`, `descriptionTestId` | F2 |
| `CareSectionBody` | `CareDesignPrimitives` | KEEP | Geen issues | — |
| `CarePanel` | `CareDesignPrimitives` | DELETE | Identiek aan `CareSection tone="elevated"` | F5 |
| `CareSectionCard` | `CareSurface` | MERGE→CareSection | Dead subtitle props; structureel identiek | F5 |
| `CarePageHeader` | `CareSurface` | DELETE | Superseded door `CareUnifiedHeader` | F5 |
| `CareUnifiedHeader` | `CareDesignPrimitives` | KEEP | Re-exported als `PageHeader` — behoud alias | — |

---

## Headers & Navigation

| Component | Bestand | Status | Issues | Actie |
|---|---|---|---|---|
| `CareUnifiedHeader` | `CareDesignPrimitives` | KEEP | Canoniek page header | — |
| `PageHeader` alias | `CareDesignPrimitives` | KEEP | Re-export van CareUnifiedHeader | — |
| `PageHeroHeader` alias | `CareDesignPrimitives` | DELETE | Verwijder alias, migreer callers naar CareUnifiedHeader | F5 |

---

## Aandacht & Signalering

| Component | Bestand | Status | Issues | Actie |
|---|---|---|---|---|
| `CareAttentionSurface` | `CareDesignPrimitives` | FIX | Dutch labels hardcoded → props met defaults; consolideer overlap | F2/F3 |
| `CareAttentionBar` | `CareDesignPrimitives` | FIX | `title="Operatieve aandacht"` hardcoded → prop | F2 |
| `CareInsightBanner` | `CareSurface` | MERGE→CareAttentionSurface | `compact` ternary is no-op; Dutch label hardcoded; geen unieke functie | F2 |
| `CareAlertCard` | `CareDesignPrimitives` | FIX | Critical icon `text-yellow-100` → `text-red-100`; `/12`, `/8` opacity | F2 |
| `BlockingNotice` | `CareDesignPrimitives` | FIX | Voeg `tone` prop toe voor niet-destructieve blocking states | F2 |

**Onderzoek vóór F2:** Consolideer CareAttentionSurface + CareAttentionBar + (weg te werken: AttentionBand, OperationalSignalStrip) naar kleinste betekenisvolle set.

---

## Acties & CTAs

| Component | Bestand | Status | Issues | Actie |
|---|---|---|---|---|
| `PrimaryActionButton` | `CareDesignPrimitives` | FIX | `rounded-xl` → `rounded-pill`; surface-boundary governance | F4 |
| `SecondaryActionButton` | — | CREATE als nodig | Wanneer ≥2 schermen het patroon nodig hebben | — |
| `CareQueueInlineAction` | `CareDesignPrimitives` | KEEP | Correct secondary row action | — |
| `Button` (shadcn) | `ui/button` | FIX | `text-white` → `text-primary-foreground`; destructive hover fix | F2 |

---

## Badges & Status

| Component | Bestand | Status | Issues | Actie |
|---|---|---|---|---|
| `CareStatusBadge` | `CaseStatusBadge` → rename | FIX | Formaliseer als canoniek component; voeg `variant="dominant"` toe | F3 |
| `CanonicalPhaseBadge` | `CareDesignPrimitives` | KEEP | Unieke normalisatiepipeline; behoud apart | — |
| `CareMetaChip` | `CareDesignPrimitives` | KEEP | Correct voor metadata | — |
| `CareBadge` | `CareDesignPrimitives` | KEEP (intern) | Converteer `CARE_BADGE_TONE` naar CSS variabelen | F3 |
| `CareDominantStatus` | `CareDesignPrimitives` | MERGE→CareStatusBadge | Identiek aan CareMetaChip maar groter | F3 |
| `CasusWorkspaceStatusBadges` | workspace | MERGE→CareStatusBadge | Dupliceert CARE_BADGE_TONE inline | F3 |
| `CareMetricBadge` | `CareDesignPrimitives` | FIX | Hardcoded `title` → prop met default | F2 |
| `PriorityBadge` | — | CREATE (F3) | 3 varianten: spoed/hoog/normaal | F3 |

---

## Queues & Rijen (CORRECTIE 6)

| Component | Bestand | Status | Issues | Actie |
|---|---|---|---|---|
| `CareWorkRow` | `CareDesignPrimitives` | KEEP | Compositie-foundation; herstel in WorkloadPage | F6 |
| `CareWorkListCard` | `CareDesignPrimitives` | KEEP | Canoniek queue container | — |
| `CarePrimaryList` | `CareDesignPrimitives` | KEEP | Geen issues | — |
| `CareOperationalQueueHeader` | `CareDesignPrimitives` | FIX | Verwijder `@ts-ignore` op label key | F2 |
| `MatchingWorkRow` | — | CREATE indien nodig | Wrapper over CareWorkRow voor matching-specifieke kolommen | F6 |
| `PlacementWorkRow` | — | CREATE indien nodig | Wrapper over CareWorkRow voor placement-specifieke kolommen | later |
| `IntakeWorkRow` | — | CREATE indien nodig | Wrapper over CareWorkRow voor intake-specifieke kolommen | later |

**Domeinwrappers** composeren CareWorkRow en introduceren geen eigen spacing/hover/selection/action patronen.

---

## Filters & Zoeken

| Component | Bestand | Status | Issues | Actie |
|---|---|---|---|---|
| `CareFilterTabGroup` | `CareDesignPrimitives` | KEEP | Geen issues | — |
| `CareFilterTabButton` | `CareDesignPrimitives` | FIX | `accentHex` inline style → CSS custom property | F2 |
| `CareSearchFiltersBar` | `CareDesignPrimitives` | KEEP | Behoud `CareSearchFilterBar` alias | — |
| `CareOperationalSelect` | `CareDesignPrimitives` | KEEP | Geen issues | — |
| `CareFilterLabel` | `CareDesignPrimitives` | KEEP | Geen issues | — |

---

## Flow & Pipeline

| Component | Bestand | Status | Issues | Actie |
|---|---|---|---|---|
| `CareFlowBoard` | `CareDesignPrimitives` | FIX | Hardcoded 4-koloms grid → dynamisch van stepCount | F2 |
| `CareFlowStepCard` | `CareDesignPrimitives` | FIX | `ring-amber-500/50`, `text-amber-400` → CSS variabelen | F2 |

---

## Metrics & KPIs

| Component | Bestand | Status | Issues | Actie |
|---|---|---|---|---|
| `CareMetricCard` | `CareDesignPrimitives` | FIX | `tracking-[0.1em]` → `[0.12em]`; `min-h-[120px]` → token | F2 |

---

## Informatiepatronen

| Component | Bestand | Status | Issues | Actie |
|---|---|---|---|---|
| `CareContextHint` | `CareDesignPrimitives` | FIX | Hardcoded `mt-6` → verwijderen, caller bepaalt margin | F2 |
| `CareInfoPopover` | `CareDesignPrimitives` | KEEP | Geen issues | — |
| `LoadingState` | `CareDesignPrimitives` | KEEP | Geen issues | — |
| `ErrorState` | `CareDesignPrimitives` | KEEP | Geen issues | — |
| `CareEmptyState` | `CareDesignPrimitives` | FIX | `max-h-[220px]` → variant prop | F2 |

---

## Nieuwe componenten — beperkte set (CORRECTIE 7)

| Component | Wanneer aanmaken | Reden |
|---|---|---|
| `CareOperationalSummary` | F7 (Regiekamer) | Regiekamer + WorkloadPage hebben dit patroon |
| `CareRecommendedAction` | F7 (Regiekamer) | Regiekamer + CaseWorkspace hebben dit patroon |
| `SecondaryActionButton` | Wanneer nodig | Minimaal 2 productschermen moeten het patroon nodig hebben |
| `BottleneckBadge` | Later | Bewijs nog niet aangetoond voor ≥2 schermen |
| `ImpactSummary` | Later | Bewijs nog niet aangetoond |
| `AttentionBand` | Niet aanmaken | Consolideren met CareAttentionSurface |
| `OperationalSignalStrip` | Niet aanmaken | Consolideren met CareAttentionSurface of CareOperationalSummary |
| `RecommendedActionBlock` | Niet aanmaken | Vervangen door CareRecommendedAction |

---

## shadcn UI-primitieven

| Component | Status | Issues | Actie |
|---|---|---|---|
| `Button` | FIX | `text-white` → `text-primary-foreground` | F2 |
| `Dialog` | FIX | `bg-black/50` overlay, `dark:shadow-...`, `rounded-2xl` | F2 |
| `Select` | FIX | Shadow hardcoded, trigger `rounded-md` | F2 |
| `Sheet` | FIX | `bg-black/50` overlay | F2 |
| `DropdownMenu` | FIX | 2x hardcoded shadow, `rounded-md` sub-content | F2 |
| `Badge` | KEEP | Geen issues | — |
| `Tabs` | KEEP | Pixel-offsets gedocumenteerd als intentioneel | — |
| `Table` | KEEP | Minor checkbox-alignment | — |
