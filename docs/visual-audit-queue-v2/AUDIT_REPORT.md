# Queue Rendering V2 — Post-Implementation Browser Audit

**Date:** 2026-05-16  
**Session:** `haroonwahed` (Haroon Wahed's Regie — populated: 2 aanvragen, 2 matching)  
**Base URL:** `http://127.0.0.1:3000`  
**Screenshots:** `docs/visual-audit-queue-v2/*.png`

> **Audit-only pass** — no redesign or code changes in this document.

---

## Screenshot index

| File | Route | Notes |
|------|-------|--------|
| `00-regiekamer-desktop.png` | `/regiekamer` | Populated worklist (2 rows), doorstroom, compact attention band |
| `01-casussen-desktop.png` | `/casussen` | Populated grid (2 rows), operational attention band |
| `01-casussen-mobile-390.png` | `/casussen` @ 390px | Sidebar + header; **main-column horizontal scroll not verified** in capture |
| `02-acties-desktop.png` | `/acties` | Empty worklist; compact attention + empty state |
| `03-matching-desktop.png` | `/matching` | Populated grid (2 rows) |
| `04-plaatsingen-desktop.png` | `/plaatsingen` | Empty; dual attention bands + tabs |
| `05-signalen-desktop.png` | `/signalen` | Empty |
| `06-beoordelingen-desktop.png` | `/beoordelingen` | Empty; **filled purple** `PrimaryActionButton` in attention band |
| `07-intake-desktop.png` | `/intake` | **Redirects to Coördinatie** for admin role (see § Intake) |
| `07-intake-zorgaanbieder-desktop.png` | `/intake` (context switch attempted) | Still admin shell — intake not captured live |

**API note:** `POST /care/api/session/active-organization/` with `organization_slug: haroonwahed` returned **403** in automation; populated data still appeared because the logged-in user defaults to that org.

---

## Pass / fail scorecard (10 criteria)

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Header and row columns align | **PASS** (populated) | Regiekamer, Casussen, Matching: column labels line up with row cells; shared `OPERATIONAL_QUEUE_GRID_*` in `CareUnifiedPage.tsx` |
| 2 | Rows feel like one dispatch-list system | **PASS** (most) / **PARTIAL** | Flat `divide-y` rows on queue pages; **Beoordelingen** still uses `ProviderReviewCaseCard` + HTML table when data exists |
| 3 | CTAs compact, right-aligned, not dominant | **PASS** (rows) / **PARTIAL** (chrome) | Row CTAs: outline, `max-w-[11rem]`, column 6; page chrome still uses filled `PrimaryActionButton` on Casussen/Regiekamer |
| 4 | No full-width purple queue CTAs | **PASS** (worklists) / **FAIL** (beoordelingen band) | No full-width hero CTAs in lists; **Beoordelingen** empty attention band uses solid `PrimaryActionButton` “Naar matching” |
| 5 | Horizontal scroll on small widths (no card-stacking) | **PARTIAL** | `CareWorkListCard` → `overflow-x-auto`; grid `min-w-[52rem]`; mobile screenshot did not show main-pane scroll behavior |
| 6 | Regiekamer = command, same family | **PASS** | Doorstroom pipeline + `queueVariant="command"` rows; same grid/CTA language as Casussen |
| 7 | Empty/loading states — no separate dialect | **PASS** | Shared `EmptyState` / `LoadingState` inside `CareWorkListCard` on Acties, Plaatsingen, Signalen |
| 8 | Attention bands compact, operational | **PASS** | `CareAttentionBar layout="compact"` on queue pages; Regiekamer risk band is flat, not hero |
| 9 | Row density readable but efficient | **PASS** | ~56px operational rhythm; 6-column grid readable at 1440px |
| 10 | No queue page uses custom cards/grids unless justified | **PARTIAL** | **Beoordelingen** (`ProviderReviewCaseCard`, provider `<table>`); **AssessmentQueuePage** migrated but **not routed**; Intake feedback uses `rounded-2xl` banner |

**Overall:** **7 PASS · 3 PARTIAL · 1 FAIL** (criterion 4 fails on Beoordelingen attention band only; several PARTIALs are polish-tier).

---

## What looks good (V2 wins)

- **Shared dispatch geometry** — `OPERATIONAL_QUEUE_GRID_COLS` / `CareOperationalQueueHeader` / `CareWorkRow` give aligned 6-column headers and rows on Casussen, Matching, Regiekamer worklist, Acties (when populated), Plaatsingen, Intake (code), AssessmentQueuePage (code).
- **Flat rows** — No per-row rounded card shells; `border-b` + left accent reads as one list.
- **Row CTAs** — Outline buttons in the last column; truncated labels; not full-width.
- **Attention bands** — `layout="compact"` reads operational; inline `CareQueueInlineAction` on populated queues.
- **Regiekamer** — Command elements (doorstroom, risk count, rail) coexist with the same worklist grid as Casussen.

---

## Remaining visual inconsistencies (with file references)

### Critical (breaks V2 contract on a shipped route)

| Issue | Route | File / component |
|-------|-------|------------------|
| Filled purple CTA in queue attention band | `/beoordelingen` | `AanbiederBeoordelingPage.tsx` ~933–946 — `PrimaryActionButton` “Naar matching” inside `CareAttentionBar` empty state |
| Active-case **card** UI (not dispatch grid) when cases exist | `/beoordelingen` | `AanbiederBeoordelingPage.tsx` — `ProviderReviewCaseCard` (~1273+), used ~1967 |
| Custom **HTML table** for provider overview tab | `/beoordelingen` | `AanbiederBeoordelingPage.tsx` ~981–990 (`overflow-x-auto` + `<table min-w-[720px]>`) |

### Important (visible on common paths; weakens “one system”)

| Issue | Route | File / component |
|-------|-------|------------------|
| Filled **“Nieuwe aanvraag”** in page header (not inline outline) | `/casussen` | `WorkloadPage.tsx` ~711–713 — `PrimaryActionButton` |
| Same header CTA pattern | `/regiekamer` | `SystemAwarenessPage.tsx` ~1314–1324 — `PrimaryActionButton` “Nieuwe aanvraag” |
| Mobile **purple FAB** “Regie-paneel” | `/regiekamer` (xl hidden) | `SystemAwarenessPage.tsx` ~1500–1515 — `Button variant="default"` fixed bottom-right |
| **DEV** debug `details` on Casussen rows (hover “i”) | `/casussen` (dev only) | `WorkloadPage.tsx` ~360–382 |
| **Intake not auditable** on admin session | `/intake` | `MultiTenantDemo.tsx` `normalizePageForRole` ~183–191 — admin `/intake` → `regiekamer` |
| **AssessmentQueuePage** not in live nav | — | `AssessmentQueuePage.tsx` migrated; `MultiTenantDemo.tsx` imports but no `currentPage === "assessment"` render |

### Polish (consistency / cleanup)

| Issue | File / component |
|-------|------------------|
| Unused `PrimaryActionButton` imports | `ActiesPage.tsx`, `MatchingQueuePage.tsx`, `PlacementTrackingPage.tsx`, `SignalenPage.tsx` |
| Extra `rounded-2xl` feedback strip on Intake | `IntakeListPage.tsx` ~179 |
| Plaatsingen: **three** attention surfaces (dominant + two conditional) | `PlacementTrackingPage.tsx` ~133–155 |
| Double `divide-y` wrappers on some lists | e.g. `IntakeListPage.tsx` ~210 + `CarePrimaryList` |
| `CareFilterTabGroup` still uses `rounded-2xl` chrome | `CareUnifiedPage.tsx` ~331 |
| Mobile 390 capture dominated by sidebar — **re-run** with rail collapsed / main-only viewport for scroll proof |

---

## Intake route (audit limitation)

For **admin / gemeente** roles, `/intake` is **not a separate surface** — `normalizePageForRole` redirects to `regiekamer`. Intake queue V2 compliance was verified by **code review** of `IntakeListPage.tsx` (`CareWorkRow`, `CareOperationalQueueHeader`, `CareQueueInlineAction`, `CareAttentionBar layout="compact"`).

**Recommended audit follow-up:** capture `07-intake-provider-desktop.png` with `provider-horizon` (or real zorgaanbieder org) via org switcher or E2E `demoContextId=provider-horizon`.

---

## Recommended fix order

### 1 — Critical (Beoordelingen parity)

1. `AanbiederBeoordelingPage.tsx` — Replace attention-band `PrimaryActionButton` with `CareQueueInlineAction` (match Acties/Matching).
2. `AanbiederBeoordelingPage.tsx` — When `reviewCasesAll.length > 0`, render **queue worklist** via `CareWorkRow` + `CareOperationalQueueHeader`; reserve `ProviderReviewCaseCard` for **detail** route only (or collapse into row expander with explicit justification).
3. `AanbiederBeoordelingPage.tsx` — Migrate “Uitgenodigde aanbieders” table to grid rows or document as justified sub-surface (provider matrix ≠ casus dispatch).

### 2 — Important (header / mobile command)

4. `WorkloadPage.tsx` + `SystemAwarenessPage.tsx` — Swap header “Nieuwe aanvraag” to `CareQueueInlineAction` or outline `Button` (keep create affordance, lose filled purple dominance).
5. `SystemAwarenessPage.tsx` — Regiekamer mobile FAB: `variant="outline"` or token-muted fill; match queue inline family.
6. `WorkloadPage.tsx` — Gate DEV row debug behind explicit flag or remove from production builds.

### 3 — Product / routing

7. `MultiTenantDemo.tsx` — Wire `AssessmentQueuePage` or remove dead import.
8. Document or expose **Intake** for admin (read-only) if product needs cross-role audit; else keep redirect and test zorgaanbieder path in CI screenshots.

### 4 — Polish

9. Remove unused `PrimaryActionButton` imports on queue pages.
10. `IntakeListPage.tsx` — Replace `rounded-2xl` feedback with `CareAttentionBar` or inline alert primitive.
11. `PlacementTrackingPage.tsx` — Merge redundant attention bands where possible.
12. Re-capture `01-casussen-mobile-390.png` with main column focused (collapse nav / hide sidebar) to validate horizontal scroll.

---

## Primitive reference (source of truth)

| Primitive | Path |
|-----------|------|
| Grid + row + header + inline CTA | `client/src/components/care/CareUnifiedPage.tsx` |
| Worklist shell + horizontal scroll | `client/src/components/care/CareDesignPrimitives.tsx` — `CareWorkListCard` |
| Design law tests | `client/src/test/operationalDesignLawsGuard.test.ts` |

---

## Verification commands (for fix PR, not run in this audit)

```bash
cd client && npm test -- --run operationalDesignLawsGuard.test.ts CareUnifiedPage.test.tsx
```

Optional: extend `scripts/audit-queue-v2-screenshots.mjs` to run from `client/` (playwright dep), set org via UI, and add `provider-horizon` intake + mobile main-column crops.
