# CareOn Screen Archetype Map

**Versie:** 1.0 — 2026-06-15

Elke route is geclassificeerd in één archetype. Het archetype bepaalt welke layout-primitieven, slots en intensiteitsgrenzen van toepassing zijn.

---

## Archetype 1 — Command Center

**Token:** `archetype="command"`  
**Layout:** `CarePageScaffold archetype="command"`  
**Intensiteit:** HOOG

| Route | Component | Status |
|---|---|---|
| `/regiekamer` | `SystemAwarenessPage` | Actief — golden reference |
| `/dashboard` | — | Niet geïmplementeerd |
| `/coordination` | — | Niet geïmplementeerd |

**Verplichte layout-elementen:**
- Flat header met inline stats (geen subtitle-paragraaf)
- `CareOperationalSummary` (nieuw, F7)
- `CareFlowBoard variant="pipeline"` (5 fasen)
- `CareFilterTabGroup` (Mijn werk / Teamqueue / Niet toegewezen / Geblokkeerd)
- `CareWorkListCard` + `CareWorkRow`-compositie
- Detail drawer (right-side panel, `data-care-surface="drawer"`)

**Intensiteitsgrenzen:**
- Max 1 `CareAttentionSurface critical` tegelijk
- Max 1 dominante CTA in page header
- Geen KPI-blocks boven de queue

---

## Archetype 2 — Operational Queue

**Token:** `archetype="queue"`  
**Layout:** `CarePageScaffold`  
**Intensiteit:** MEDIUM-HOOG

| Route | Component | Status |
|---|---|---|
| `/casussen` | `WorkloadPage` | Actief — refactor nodig (F6) |
| `/mijn-casussen` | `WorkloadPage` (filtered) | Actief |
| `/intake` | `IntakeListPage` | Actief |
| `/beoordelingen` | `AanbiederBeoordelingPage` | Actief |
| `/matching` | `MatchingQueuePage` | Actief |
| `/plaatsingen` | `PlacementTrackingPage` | Actief |
| `/acties` | `ActiesPage` | Actief |
| `/signalen` | `SignalenPage` | Actief |
| `/aanbieder-reacties` | `AanbiederreactiePage` | Actief |

**Verplichte layout-elementen:**
- `CareUnifiedHeader` met één count-badge in metric-slot
- `CareSearchFiltersBar`
- `CareFilterTabGroup` (status-tabs, geen fase-navigatie)
- `CareWorkListCard` + `CareOperationalQueueHeader` + `CareWorkRow`-compositie
- Max 1 `CareAttentionBar` (uitsluitend bij gedeeld blokkade voor meerdere items)

**Verbod:** Geen KPI-blocks, geen fase-board boven de queue.

---

## Archetype 3 — Detail Workspace

**Token:** `archetype="workspace"`  
**Layout:** `CasusWorkspaceLayout` (gedocumenteerde uitzondering)  
**Intensiteit:** HOOG (gefocust)

| Route | Component | Status |
|---|---|---|
| `/care/cases/:id` | `CaseExecutionPage` | Actief |
| Plaatsingsbevestiging | `PlacementPage` | Actief |

**Notitie in bestand vereist:**
```tsx
// LAYOUT_EXCEPTION: CasusWorkspaceLayout — het hero-band IS de page header.
// Zie CAREON_DESIGN_SYSTEM_V1.md Archetype 3.
```

**Intensiteitsgrenzen:**
- Contextsecties standaard ingeklapt
- Alleen contextsecties tonen die de beslissing beïnvloeden

---

## Archetype 4 — Network/Directory

**Token:** `archetype="network"`  
**Layout:** `CarePageScaffold`  
**Intensiteit:** LAAG-MEDIUM

| Route | Component | Status |
|---|---|---|
| `/zorgaanbieders` | `ZorgaanbiedersPage` | Actief |
| `/gemeenten` | `GemeentenPage` | Actief — tabel-refactor nodig |
| `/regios` | `RegiosPage` | Actief |

**Karakter:** Advisorisch, niet beslissingsgericht. Antwoord op "welke aanbieder heeft capaciteit?" — niet "wat moet ik nu doen?"

**Verbod:** Geen urgency-badges op paginaniveau; geen CTA zonder specifieke case-context.

---

## Archetype 5 — Support/Evidence

**Token:** `archetype="support"`  
**Layout:** `CarePageScaffold` (geen dominantAction, kpiStrip of workflow slot)  
**Intensiteit:** LAAG

| Route | Component | Status |
|---|---|---|
| `/rapportages` | `RapportagesPage` | Actief — mock data |
| `/documenten` | `DocumentenPage` | Actief |
| `/audittrail` | `AudittrailPage` | Actief |
| `/gebruikers` | `GebruikersPage` | Stub |
| `/instellingen` | `InstellingenPage` | Actief — eigen sidebar nav (gedocumenteerde uitzondering) |

**Intensiteitsgrenzen:**
- Geen attention-surfaces in de basisstaat
- Max 1 primaire actie (exporteer/upload/beheer)

---

## Gedocumenteerde layout-uitzonderingen

| Component | Archetype | Reden |
|---|---|---|
| `CasusWorkspaceLayout` | 3 — Detail Workspace | Hero-band IS de page header; scroll-model verschilt fundamenteel |
| `MatchingPageWithMap` | 2 → 4 hybrid | Kaartvisualisatie vereist volle-breedte-layout |
| `NieuweCasusPage` | intake-form | Stap-voor-stap formulier; geen queue, geen header-stats |
| `InstellingenPage` sidebar | 5 — Support | Tweede navigatielaag binnen de pagina voor instellingscategorieën |

Elke uitzondering heeft een `// LAYOUT_EXCEPTION:` commentaar in het component-bestand.

---

## Screen Uniformity Matrix

| Pagina | Archetype | CarePageScaffold | CareUnifiedHeader | CareWorkRow | CareAttentionSurface | PrimaryActionButton |
|---|---|---|---|---|---|---|
| Regiekamer | 1 | ✓ | ✓ | ✓ (compositie) | ✓ (conditional) | ✓ max 1/surface |
| WorkloadPage | 2 | ✓ | ✓ | ✓ | ✓ (conditional) | ✓ max 1 |
| IntakeListPage | 2 | ✓ | ✓ | ✓ | ✓ (conditional) | ✓ max 1 |
| MatchingQueuePage | 2 | ✓ | ✓ | ✓ | ✓ (conditional) | ✓ max 1 |
| PlacementTrackingPage | 2 | ✓ | ✓ | ✓ | ✓ (conditional) | ✓ max 1 |
| CaseExecutionPage | 3 | ✗ (uitzondering) | ✗ (hero band) | ✗ (workspace rows) | ✓ | ✓ in decision zone |
| ZorgaanbiedersPage | 4 | ✓ | ✓ | ✗ (cards) | ✓ (conditional) | ✗ (geen) |
| GemeentenPage | 4 | ✓ | ✓ | tbd (refactor) | ✗ | ✗ |
| RapportagesPage | 5 | ✓ | ✓ | ✗ | ✗ | ✓ (exporteer) |
| GebruikersPage | 5 | ✓ | ✓ | ✗ | ✗ | ✓ (uitnodig) |
| LoginPage | auth | ✗ (uitzondering B) | ✗ | ✗ | ✗ | ✓ (submit) |
