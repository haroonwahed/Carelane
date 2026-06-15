# CareOn Design System V1

**Versie:** 1.0  
**Datum:** 2026-06-15  
**Status:** Goedgekeurd — implementatie gestart

---

## Doel

Dit document is de bindende specificatie voor het CareOn design system. Het vervangt de losse richtlijnen in `CAREON_UI_CONTRACT.md`, `CAREON_VISUAL_DOCTRINE.md`, `DESIGN_SYSTEM_INHERITANCE_MODEL.md` en `DESIGN_SYSTEM_PATTERN_REFERENCE.md`. Bij tegenstrijdigheid heeft dit document voorrang.

---

## Deel 1 — Tokenstructuur

### Principe: drie lagen, één bron van waarheid

```
Laag 1: Primitieve tokens  → globals.css (:root / .dark)
Laag 2: Semantische tokens → globals.css (--care-* namespace)
Laag 3: Component tokens   → op het root-element van een component (cascade naar kinderen)
```

`tokens.ts` herexporteert uitsluitend waarden die JavaScript-toegang vereisen (bv. voor runtime CSS property injection). Er mag geen dubbele paletdefinitie in `tokens.ts` staan. De huidige `tokens.colors` en `tokens.visualContract` worden samengevoegd in één `tokens.visual` object dat 1:1 mapt op semantische CSS tokens.

**Verbod:** Geen component mag een kleur, radius, shadow of spacing-waarde hardcoderen die al in deze hiërarchie bestaat.

---

### Laag 1 — Primitieve kleurenschaal

```css
/* Paars (brand accent) */
--color-purple-500: #7C4DFF;
--color-purple-600: #5c29ff;
--color-purple-400: #9B6FFF;

/* Navy (donkere oppervlakken) */
--color-navy-950: #070B18;
--color-navy-900: #0B1020;
--color-navy-800: #0E1424;
--color-navy-700: #111827;
--color-navy-600: #121A2C;
--color-navy-500: #151B2E;
--color-navy-400: #1B2236;
--color-navy-300: #20283D;

/* Functionele kleuren */
--color-slate-100: #E8ECF3;
--color-slate-400: #94A3B8;
--color-red-400: #C96B6B;
--color-amber-400: #D9A441;
--color-amber-warn: #F5A900;
--color-blue-400-light: #4B7FD4;
--color-blue-400-dark: #6B9AD4;
--color-green-400: #3FA37C;
```

---

### Laag 2 — Semantische tokens

#### Shell-geometrie (CORRECTIE 4 — responsive)

```css
/* Sidebar */
--care-sidebar-width-expanded: 256px;   /* was 280px — herwogen voor 1280px viewport */
--care-sidebar-width-collapsed: 72px;
--care-sidebar-width: var(--care-sidebar-width-expanded); /* default */

/* Topbar */
--care-topbar-height: 64px;             /* was 72px — herwogen voor operationele tableruimte */

/* Horizontale padding (responsive) */
--care-page-h-padding: 24px;            /* basis */
--care-page-h-padding-wide: 32px;       /* ≥1440px */
--care-page-max-width: 1536px;
```

**Viewport-validatie (uitvoeren vóór Phase 1 afsluiten):**
- 1280px: geen horizontale scrollbar, volledige 6-koloms Regiekamer-tabel zichtbaar
- 1440px: `--care-page-h-padding-wide` actief
- 1728px: maximale layout-breedte bereikt (`--care-page-max-width`)

#### Oppervlaktehiërarchie

```css
/* dark mode */
--background: var(--color-navy-950);
--surface-1: var(--color-navy-800);
--surface-2: var(--color-navy-600);
--surface-3: var(--color-navy-400);
--surface-elevated: var(--color-navy-300);
--border-default: rgba(255,255,255,0.06);
--border-strong: rgba(255,255,255,0.10);
```

#### Radius — vereenvoudigde schaal (CORRECTIE 5)

Het 24px vs 22px onderscheid is visueel niet betekenisvol en wordt afgeschaft.

```css
--care-radius-large: 20px;    /* grote oppervlakken: pagina-header, modals, dialogs */
--care-radius-card: 16px;     /* cards, section containers, panels */
--care-radius-control: 10px;  /* buttons, inputs, selects, tabs */
--care-radius-pill: 9999px;   /* badges, avatars, pill-tabs */
```

Vier waarden, elk met een zichtbaar verschillende visuele functie.

**Verbod:** Geen andere border-radius waarden zijn toegestaan. Bij twijfel: ga één schaalniveau omhoog.

#### Shadows

```css
--care-shadow-card: 0 10px 28px rgba(11,16,32,0.16);
--care-shadow-section: 0 6px 20px rgba(11,16,32,0.12);
--care-shadow-control: 0 2px 8px rgba(11,16,32,0.08);
--care-shadow-overlay: rgba(0,0,0,0.50);
--care-shadow-dialog: 0 20px 60px rgba(0,0,0,0.40);
```

#### CTA-tokens

```css
--care-cta-primary: var(--primary);       /* #7C4DFF */
--care-cta-warning: var(--color-amber-warn);  /* #F5A900 */
--care-cta-secondary-border: var(--border-strong);
```

#### Badge-tokens

```css
--care-badge-red-bg: ...;   /* via bestaande --badge-red-bg */
--care-badge-red-text: ...;
--care-badge-amber-bg: ...;
--care-badge-amber-text: ...;
--care-badge-blue-bg: ...;
--care-badge-blue-text: ...;
--care-badge-purple-bg: ...;
--care-badge-purple-text: ...;
--care-badge-green-bg: ...;
--care-badge-green-text: ...;
--care-badge-muted-bg: var(--muted);
--care-badge-muted-text: var(--muted-foreground);
```

#### Rhythm-spacing (behouden)

Alle bestaande `--care-rhythm-*` properties blijven ongewijzigd.

---

### Laag 3 — Component tokens

Gedeclareerd op het root-element van een component, cascadend naar kinderen:

```css
/* CareWorkRow */
--care-row-height: 52px;
--care-row-accent: transparent;
--care-row-hover-bg: var(--surface-hover);

/* CareSection */
--care-section-radius: var(--care-radius-card);
--care-section-bg: var(--card);
--care-section-border: var(--border-default);

/* PrimaryActionButton */
--care-cta-bg: var(--care-cta-primary);
--care-cta-height: 40px;
--care-cta-radius: var(--care-radius-pill);
```

---

## Deel 2 — Component-architectuur

### Beheer-beslissingen

| Component | Beslissing | Toelichting |
|---|---|---|
| `CarePanel` | DELETE | Identiek aan `CareSection tone="elevated"` |
| `CareSection` | KEEP + fix | Voeg `tone="elevated"` toe; fix muted tone duplication |
| `CarePageHeader` (CareSurface) | DELETE | Superseded door `CareUnifiedHeader` |
| `CareSectionCard` | MERGE → `CareSection` | Structureel identiek; dead props verwijderen |
| `CareInsightBanner` | MERGE → `CareAttentionSurface variant="neutral"` | Geen unieke functionaliteit |
| `CareAttentionBar` | KEEP + fix | Fix hardcoded `title` → prop met default |
| `CareDominantStatus` | MERGE → `CareStatusBadge variant="dominant"` | — |
| `CasusWorkspaceStatusBadges` | MERGE → `CareStatusBadge` | Dupliceert CARE_BADGE_TONE inline |
| `CaseStatusBadge` | RENAME → `CareStatusBadge` | Formaliseer de alias |
| `PrimaryActionButton` | KEEP + fix | Fix `rounded-xl` → `rounded-pill`; governance zie Deel 3 |
| `CareWorkRow` | KEEP | Compositie-foundation; zie Deel 5 |
| `CareFlowStepCard` | KEEP + fix | Fix hardcoded amber → CSS variabele |
| `CareFlowBoard` | KEEP + fix | Kolomtelling dynamisch van stepCount |
| `LoginPage` | KEEP + migrate (na fase 8) | Auth-surface apart; zie Deel 7 |

### Nieuwe primitieven — beperkte set (CORRECTIE 7)

Maak **uitsluitend** aan wanneer ≥2 bestaande productschermen aantoonbaar hetzelfde patroon nodig hebben:

| Component | Status | Voorwaarde |
|---|---|---|
| `CareOperationalSummary` | AANMAKEN (fase 8) | Regiekamer + WorkloadPage hebben dit nodig |
| `CareAttentionSurface` | CONSOLIDEREN (fase 3) | Absorbeert CareInsightBanner en CareAttentionBar-overlap |
| `CareRecommendedAction` | AANMAKEN (fase 8) | Regiekamer + CaseWorkspace hebben dit nodig |

**Onderzoek overlap vóór aanmaak (fase 3):**
- `CareAttentionSurface` vs `CareAttentionBar` vs `AttentionBand` vs `OperationalSignalStrip` vs `RecommendedActionBlock`
- Consolideer naar de kleinste betekenisvolle set
- Elk component moet een unieke functie hebben die niet door een bestaand component gedekt wordt

**Niet direct aanmaken:** `BottleneckBadge`, `ImpactSummary`, `AttentionBand`, `OperationalSignalStrip`, `RecommendedActionBlock`. Wacht op bewijs van twee productschermen.

---

## Deel 3 — Primary Action Governance (CORRECTIE 2)

### Regel

De regel is niet "exact één PrimaryActionButton in de DOM" maar:

1. **Maximaal één dominante actie per zichtbare operationele surface**
2. **Maximaal één dominante actie in de paginaheader**
3. **Een drawer, modal of decision panel mag één eigen dominante actie hebben** — dit is geen overtreding van regel 1 omdat het een andere surface boundary is
4. **Twee dominante acties mogen nooit dezelfde workflowhandeling concurrerend aanbieden** — dit is de kernovertreding ("Los blokkades op" + "Los kritieke blokkades op" zijn hetzelfde)
5. **Secundaire acties gebruiken `SecondaryActionButton` of `TertiaryAction`**

### Technische afdwinging

Surface boundaries worden gemarkeerd met `data-care-surface` attributen:

```html
<div data-care-surface="page-header">
  <!-- max 1 PrimaryActionButton hier -->
</div>

<div data-care-surface="worklist">
  <!-- max 1 PrimaryActionButton hier -->
</div>

<div data-care-surface="drawer">
  <!-- eigen PrimaryActionButton toegestaan -->
</div>
```

Test-query: `document.querySelectorAll('[data-care-surface="page-header"] [data-component="primary-action"]').length <= 1`

---

## Deel 4 — Copy Architecture (CORRECTIE 3)

### Twee typen copy

**Type A — Generieke componentcopy**
Mag als component-default bestaan. Voorbeelden:
- "Geen resultaten gevonden"
- "Er is een fout opgetreden"
- "Laden..."
- "Sluiten"

**Type B — Domein- en workflowcopy**
Mag NIET hardcoded in generieke UI-primitieven worden geplaatst. Voorbeelden:
- "Start matching"
- "Vraag gegevens op"
- "Wacht op aanbiederreactie"
- "Plaatsing bevestigd"
- "Los blokkades op"

### Bronnen voor domein- en workflowcopy

In volgorde van voorkeur:

1. **Gestructureerde backendvelden** — `next_best_action.label`, `recommended_action.cta_label`
2. **Workflow configuration** — `decisionPhaseUi.ts`, `workflowConfig.ts`
3. **Domain mappings** — `phaseLabels.ts`, `actionLabels.ts` (per workflowdomein)
4. **Content dictionaries** — alleen als de backend geen veld levert

**Verbod:** Een generiek component (`CareAttentionSurface`, `PrimaryActionButton`, `CareWorkRow`) mag geen domein-specifieke Nederlandse copy als hardcoded string bevatten.

---

## Deel 5 — Row Composition (CORRECTIE 6)

### Principe

`CareWorkRow` is de gedeelde visuele en interactie-foundation voor alle operationele rijen.

- Spacing
- Hover-gedrag
- Selectiepatroon
- Action-slot

...worden één keer gedefinieerd in `CareWorkRow` en nooit opnieuw geïmplementeerd.

### Domeinspecifieke wrappers

Toegestaan en aanbevolen wanneer de kolomconfiguratie domeinspecifiek is:

```tsx
// Correct:
function MatchingWorkRow({ item }: { item: MatchingItem }) {
  return (
    <CareWorkRow
      id={item.id}
      accentTone={item.urgency === "critical" ? "critical" : "neutral"}
      action={<MatchingPrimaryAction item={item} />}
    >
      <MatchingStatusColumn item={item} />
      <ProviderColumn item={item} />
    </CareWorkRow>
  );
}
```

**Verbod:** Een domein-wrapper mag geen eigen `className` introduceren voor spacing, hover, border, of selection-state. Deze komen altijd van `CareWorkRow`.

### Waarschuwingssignaal

Wanneer `CareWorkRow` meer dan 6 optionele props krijgt voor conditional rendering, is dat een teken dat een domeinwrapper nodig is.

---

## Deel 6 — Badge Taxonomie

Vier badge-components, gesloten set:

| Component | Gebruik |
|---|---|
| `CareStatusBadge` | Workflowstatus (actief, geblokkeerd, wacht) |
| `CanonicalPhaseBadge` | Positie in de 5-fasen-stroom |
| `CareMetaChip` | Metadata (regio, tijd, aantallen) |
| `PriorityBadge` | Urgentie-triage (spoed / hoog / normaal) |

Nieuwe tones vereisen een governance-beslissing en een token-toevoeging, niet een ad-hoc class.

---

## Deel 7 — Page Archetypes

### Archetype 1 — Command Center
Routes: `/regiekamer`, `/dashboard`  
Verplichte elementen: `CarePageScaffold archetype="command"`, `CareFlowBoard variant="pipeline"`, `CareOperationalSummary`, één dominante CTA in de header.

### Archetype 2 — Operational Queue
Routes: `/casussen`, `/intake`, `/matching`, `/plaatsingen`, `/acties`, `/signalen`  
Verplichte elementen: `CarePageScaffold`, `CareSearchFiltersBar`, `CareFilterTabGroup`, `CareWorkListCard` + `CareWorkRow`-compositie.

### Archetype 3 — Detail Workspace
Routes: `/care/cases/:id`  
Uitzondering: `CasusWorkspaceLayout` (gedocumenteerd met `// LAYOUT_EXCEPTION:`).

### Archetype 4 — Network/Directory
Routes: `/zorgaanbieders`, `/gemeenten`, `/regios`  
Advisorisch, niet beslissingsgericht. Geen urgency badges op paginaniveau.

### Archetype 5 — Support/Evidence
Routes: `/rapportages`, `/documenten`, `/audittrail`, `/gebruikers`, `/instellingen`  
Geen `dominantAction`, geen `kpiStrip`. Intensiteit: LAAG.

---

## Deel 8 — Implementatievolgorde (CORRECTIE 1)

Uitvoervolgorde voor de eerste implementatiebatch:

| Fase | Scope | Risico | Dependencies |
|---|---|---|---|
| **F0** Token foundation | `globals.css`, `tokens.ts`, Tailwind config | Laag (additief) | — |
| **F1** Shell geometry | `Sidebar`, `TopBar`, `CareAppFrame` | Medium | F0 |
| **F2** Primitive cleanup | `CareDesignPrimitives`, `CareSurface`, shadcn ui | Medium | F0 |
| **F3** Badge consolidation | `CareStatusBadge`, alle badge-verwijzingen | Medium | F2 |
| **F4** CTA governance | `SystemAwarenessPage`, `WorkloadPage`, alle pagina's | Medium | F2 |
| **F5** Surface consolidation | `CarePanel` → `CareSection`, dode exports | Laag | F2 |
| **F6** WorkloadPage foundation | `WorkloadPage` herstellen met canonieke primitieven | Medium | F3, F4 |
| **F7** Regiekamer golden reference | `SystemAwarenessPage` → volledig GoR | Hoog | F0-F6 |

**Na F7:** Stop voor visuele en technische beoordeling.  
**Na beoordeling:** LoginPage auth-surface migratie (aparte batch).

### Per fase

- Wijzigingen klein houden
- Verwijder oude implementaties zodra alle consumers zijn gemigreerd
- Voeg regressietests toe
- Voer typecheck, lint en relevante tests uit
- Geen tijdelijke parallelle componentfamilies
- Rapporteer gewijzigde bestanden en resterende design debt

---

## Deel 9 — Shell Geometry Governance (CORRECTIE 4)

### Waarden

| Element | Waarde | Toelichting |
|---|---|---|
| Sidebar expanded | 256px | Gevalideerd op 1280px viewport |
| Sidebar collapsed | 72px | Icon + tooltip |
| Topbar height | 64px | Gevalideerd op 1280px viewport |
| Page h-padding (basis) | 24px | < 1440px |
| Page h-padding (wide) | 32px | ≥ 1440px |

### Validatiecriteria

Vóór afsluiting van F1 moeten alle drie viewports zijn getest:
- **1280px**: volledige 6-koloms Regiekamer-tabel zonder horizontale scroll
- **1440px**: `--care-page-h-padding-wide` actief, layout symmetrisch
- **1728px**: max-width bereikt, layout gecentreerd

---

## Deel 10 — Regiekamer Golden Reference: Definition of Done (CORRECTIE 8)

### Scope

De golden reference omvat ALLE van de volgende elementen. Geen nieuwe productfunctionaliteit. Bestaande backendcontracten en workflowlogica blijven intact.

**Verplichte elementen:**
- [ ] Page header (flat, inline stats, één dominante CTA)
- [ ] Operational summary (`CareOperationalSummary`)
- [ ] Compacte 5-fasenstrip (`CareFlowBoard variant="pipeline"`)
- [ ] Saved work views (tabfilters: Mijn werk / Teamqueue / Niet toegewezen / Geblokkeerd)
- [ ] Filtergedrag (tab-selectie filtert de worklist, telt actueel)
- [ ] Operationele work rows (`CareWorkRow` compositie)
- [ ] Selectiegedrag (klik op rij → detail drawer, geselecteerde rij gemarkeerd)
- [ ] Detail drawer (right-side panel, `data-care-surface="drawer"`)
- [ ] Loading state (`LoadingState` in worklist, CTA disabled, geen layout shift)
- [ ] Empty state (`CareEmptyState` per tabcontext)
- [ ] Error state (`ErrorState` met retry-actie)
- [ ] Blocked state (`CareAttentionSurface variant="critical"` wanneer cases geblokkeerd)
- [ ] Responsive gedrag (1280 / 1440 / 1728px gevalideerd)
- [ ] Keyboard navigation (tab-volgorde: aandacht → CTA → fasenstrip → filters → eerste rij)
- [ ] WCAG AA contrast (alle badges op `--background: #070B18`)

### Token compliance

- [ ] Nul hardcoded hex-waarden of rgba-literals in `SystemAwarenessPage.tsx`
- [ ] Nul `style={{}}` attributen (uitzondering: CSS custom property injection)
- [ ] Shell-geometrie matcht `--care-*` tokens in browser devtools
- [ ] Alle radii zijn één van de vier canonieke waarden
- [ ] Alle shadows via CSS custom properties

### Component compliance

- [ ] Maximaal één dominante actie per `data-care-surface` scope
- [ ] Twee dominante acties bieden nooit dezelfde workflowhandeling concurrerend aan
- [ ] Alle badges via `CareStatusBadge`, `CanonicalPhaseBadge`, `CareMetaChip`, of `PriorityBadge`
- [ ] Alle aandacht-surfaces via `CareAttentionSurface` of `CareAttentionBar`
- [ ] 5-fasenstrip via `CareFlowBoard variant="pipeline"`, actieve fase van live API
- [ ] Alle werkrijen via `CareWorkRow`-compositie met `data-care-work-row` attribuut

### Copy compliance

- [ ] Geen domein-specifieke Nederlandse copy hardcoded in generieke primitieven
- [ ] Workflowlabels komen van `decisionPhaseUi.ts` of backendvelden
- [ ] Geen legacy fasenamen (`SUMMARY_READY`, `Analyseer`, `Optimaliseer`) in gerenderde tekst

### Layout compliance

- [ ] `CarePageScaffold archetype="command"` is de root
- [ ] Slot-volgorde in DOM: header → attention → summary → pipeline → filters → worklist
- [ ] Geen horizontale scroll bij 1280px
- [ ] Geen `min-w-[72rem]` of vergelijkbare breedte-locks

### Regression check

- [ ] Geen componenten uit `components/examples/` of e-commerce in het bestand
- [ ] `grep -E 'style=\{' SystemAwarenessPage.tsx` → 0 resultaten
- [ ] `grep -E '#[0-9A-Fa-f]{3,6}|rgba?\(' SystemAwarenessPage.tsx` → 0 resultaten

---

## Appendix — Wat er verandert ten opzichte van het originele auditrapport

| Voorstel in rapport | Correctie |
|---|---|
| Sidebar 280px | → 256px expanded, 72px collapsed |
| Topbar 72px | → 64px |
| H-padding 32px vast | → 24px basis, 32px bij ≥1440px |
| Radius 24px/22px | → 4 semantische schaal: 20/16/10/pill |
| "Exact één PrimaryActionButton" | → governance per surface boundary, drawer/modal mag eigen CTA |
| Alle 6 nieuwe primitieven aanmaken | → start met 3 (CareOperationalSummary, CareAttentionSurface consolidatie, CareRecommendedAction) |
| Fase 10 direct na Fase 0 | → volledige 8-fase batch voor Regiekamer |
| Copy in component-defaults toegestaan | → gesplitst: generieke copy OK, domein-copy verboden in primitieven |
| CareWorkRow als monolithische primitief | → compositie-foundation; domeinwrappers (MatchingWorkRow etc.) zijn aanbevolen |
| LoginPage in eerste batch | → aparte auth-surface migratie na fase 7 |
