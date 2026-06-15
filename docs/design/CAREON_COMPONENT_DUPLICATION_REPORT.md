# CareOn Component Duplication Report
**Phase 1 Audit — Design System Normalization**
**Date:** 2026-06-15
**Status:** Draft — binding input for CAREON_DESIGN_NORMALIZATION_PLAN.md Phase 2

---

## Scope

This report documents all confirmed component duplications found during the Phase 1 codebase audit of the CareOn SPA (`client/src/`) and its supporting design token layer (`client/src/design/tokens.ts`, `client/src/styles/globals.css`). Each duplication entry lists affected paths, call-site count, recommended resolution, and priority.

**Priority scale:**
- **Critical** — Causes inconsistent UI rendering today; blocks design-system contract compliance
- **High** — Semantic overlap creates decision paralysis for new feature work; must resolve before new pages are built
- **Medium** — Technical debt; can be deferred one sprint without rendering regressions
- **Low** — Cosmetic or legacy artefact; address opportunistically

---

## Duplication 1 — Badge Systems (5 parallel implementations)

### Components involved

| Component | File | Type |
|---|---|---|
| `CaseStatusBadge` | `care/CaseStatusBadge.tsx` | Workflow phase badge (CareCase.CasePhase) |
| `CareBadge` | `care/CareDesignPrimitives.tsx` | Generic semantic badge (tone-based) |
| `PriorityBadge` | `care/CareDesignPrimitives.tsx` | Priority indicator (LOW/MEDIUM/HIGH/CRITICAL) |
| Inline `<span className="careon-badge-*">` | `WorkloadPage.tsx`, `IntakeListPage.tsx`, `AanbiederPortaalPage.tsx` | Ad-hoc, non-composable |
| `Badge` (shadcn) | `ui/badge.tsx` | Base primitive (imported directly in 10+ care components) |

Re-exported as: `CareStatusBadge` via `CareDesignPrimitives.tsx:62` — partial alias only.

### Call sites
Approximately **36 import sites** across `client/src/` reference at least one badge variant. Inline `careon-badge-*` spans appear in at least 3 page-level components without going through any token layer.

### Problem
Five systems serve the same semantic need (labeling workflow states, priority, and category) with different visual outputs. `CareStatusBadge` maps `CasePhase` values; `CareBadge` accepts arbitrary `tone` props; shadcn `Badge` has its own variant system incompatible with `--care-badge-*` tokens. Inline spans bypass all three. The result is badge color inconsistency across pages for the same `CasePhase.MATCHING` value.

### Recommended resolution
1. Keep `CareBadge` as the single primitive; bind it to `--care-badge-{color}-bg / -text` tokens exclusively.
2. Rebuild `CaseStatusBadge` as a thin wrapper over `CareBadge` (maps `CasePhase` → `tone`).
3. Rebuild `PriorityBadge` as a second thin wrapper over `CareBadge`.
4. Remove all `careon-badge-*` inline spans — replace with `CaseStatusBadge` or `CareBadge`.
5. Remove direct `Badge` (shadcn) imports from Care pages; gate shadcn `Badge` to non-care UI only.

**Priority: Critical**

---

## Duplication 2 — Section Containers (4 overlapping implementations)

### Components involved

| Component | File | Notes |
|---|---|---|
| `CareSection` | `care/CareDesignPrimitives.tsx` | **Canonical.** tone-aware (neutral / elevated / warning) |
| `CarePanel` | `care/CareDesignPrimitives.tsx:343` | Thin alias to `CareSection tone="elevated"` — kept for backwards compat |
| `CareSectionCard` | `care/CareSurface.tsx` | Structurally identical to `CareSection elevated`; separate file |
| `CareWorkspaceSection` | `care/CareDesignPrimitives.tsx:414` | Distinct: workspace-specific layout (no elevation, sidebar rail) — **keep** |

### Call sites
`CarePanel` has ~8 call sites in older page files. `CareSectionCard` has ~5 call sites in `CareSurface.tsx` consumers. `CareSection` is the canonical form used in all new code (~20+ call sites).

### Problem
`CarePanel` and `CareSectionCard` both render elevated card containers identical to `CareSection tone="elevated"`. Having three names for the same thing causes confusion when building new sections.

### Recommended resolution
1. `CareSection` (canonical) — no change.
2. `CarePanel` — add `@deprecated` JSDoc; migrate all 8 call sites to `<CareSection tone="elevated">` in one pass; remove after migration.
3. `CareSectionCard` — migrate its 5 call sites to `<CareSection tone="elevated">`; delete `CareSectionCard` from `CareSurface.tsx`.
4. `CareWorkspaceSection` — keep as-is; rename to `CareRailSection` in a future typography pass to clarify its distinct purpose.

**Priority: High**

---

## Duplication 3 — Page Headers (3 parallel implementations)

### Components involved

| Component | File | Status |
|---|---|---|
| `CareUnifiedHeader` | `care/CareUnifiedPage.tsx` | **Canonical.** Re-exported as `PageHeader` from `CareDesignPrimitives.tsx:19` |
| `CarePageHeader` | `care/CareSurface.tsx` | Deprecated; still imported in `CareDesignPrimitives.tsx:10` |
| `PageHeroHeader` | — | Alias removed at `CareDesignPrimitives.tsx:22`; `// PageHeroHeader alias removed` comment remains |

### Call sites
`CarePageHeader` is imported at `CareDesignPrimitives.tsx:10` but the import may be unused after alias removal. `PageHeroHeader` is a dead export — the comment documents its removal but it may still appear in legacy page imports.

### Problem
`CarePageHeader` import in `CareDesignPrimitives.tsx` is potentially dead code. The `PageHeroHeader` comment creates confusion: developers reading the file cannot tell if it was replaced or just removed. The canonical `CareUnifiedHeader` / `PageHeader` alias is correct but undiscoverable without reading the file.

### Recommended resolution
1. Audit all imports of `CarePageHeader` across `client/src/`; remove if zero consumers remain.
2. Delete `CarePageHeader` from `CareSurface.tsx` once imports are clean.
3. Replace the dead comment block with an explicit migration note in `CAREON_DESIGN_NORMALIZATION_PLAN.md`.
4. Ensure `PageHeader` alias from `CareDesignPrimitives.tsx` is documented in the component inventory as the canonical import path.

**Priority: High**

---

## Duplication 4 — Status/State UI (4 parallel approaches)

### Components involved

| Component | File | Notes |
|---|---|---|
| `CareStatusBadge` / `CaseStatusBadge` | `care/CaseStatusBadge.tsx` | Maps `CasePhase` to badge — see Duplication 1 |
| `CareDominantStatus` | `care/CareDesignPrimitives.tsx` | Prominent inline status string for workspace hero area |
| `DecisionBadge` | `care/workflow/DecisionBadge.tsx` | Provider decision badge (ACCEPT/REJECT/INFO); imports shadcn `Badge` |
| Inline phase strings | Various page files | Raw `workflow_state` or `case_phase` label rendered without component |

### Call sites
`CareDominantStatus` ~4 call sites; `DecisionBadge` ~3 call sites (provider workflow screens); inline phase strings visible in at least `SystemAwarenessPage.tsx` and `WorkloadPage.tsx`.

### Problem
Four different UI treatments for workflow/decision state create visual inconsistency across the Regiekamer, Casuswerkruimte, and Aanbiedersportal screens. `DecisionBadge` uses shadcn `Badge` variants instead of `--care-badge-*` tokens, diverging from the token system.

### Recommended resolution
1. `CareStatusBadge` — canonical for `CasePhase` values (see Duplication 1 fix).
2. `CareDominantStatus` — keep for workspace hero; ensure it reads from `--care-badge-*` tokens not hardcoded Tailwind colors.
3. `DecisionBadge` — rewrite to use `CareBadge` as its base; map `ACCEPTED/REJECTED/INFO_REQUESTED` to tones `green/red/amber`.
4. Inline phase strings — replace with `CaseStatusBadge` in a single sweep.

**Priority: High**

---

## Duplication 5 — Page Layout Wrappers (3 overlapping scaffolds)

### Components involved

| Component | File | Notes |
|---|---|---|
| `CarePageTemplate` | `care/CareUnifiedPage.tsx` | Wraps `CareAppFrame` + provides slot layout |
| `CarePageScaffold` | `care/CarePageScaffold.tsx` | Independent scaffold with its own header/content slots; re-exported from `CareDesignPrimitives.tsx:16` |
| Direct `CareAppFrame` usage | `care/CareAppFrame.tsx` | Used directly in some pages bypassing both scaffolds |

### Call sites
`CarePageTemplate` — ~6 page consumers. `CarePageScaffold` — ~8 page consumers. Direct `CareAppFrame` — ~4 pages (mostly legacy care pages).

### Problem
Three ways to scaffold a Care SPA page produce subtly different header/padding/scroll behavior. New pages added by different developers diverge structurally depending on which example they followed. This makes global layout changes (e.g. changing topbar height from 64px to a new value) require edits in three places.

### Recommended resolution
1. Designate `CarePageScaffold` as the single canonical page wrapper (already re-exported from primitives).
2. Migrate `CarePageTemplate` consumers to `CarePageScaffold`; deprecate and remove `CarePageTemplate`.
3. Eliminate direct `CareAppFrame` usage in page files — gate `CareAppFrame` as an internal-only component consumed exclusively by `CarePageScaffold`.
4. Document the single scaffold pattern in `CAREON_PAGE_PATTERNS.md`.

**Priority: High**

---

## Duplication 6 — Arbitrary Spacing (Mixed token + Tailwind hardcodes)

### Location
Scattered across `CareDesignPrimitives.tsx`, `WorkloadPage.tsx`, `SystemAwarenessPage.tsx`, `MatchingPageWithMap.tsx`, and others.

### Problem
Components mix `CARE_RHYTHM` token values (defined in `tokens.ts`) with hardcoded Tailwind spacing utilities (`space-y-3`, `gap-4`, `p-4 md:p-5`). This means spacing is not uniformly responsive to a single token change — adjusting `CARE_RHYTHM.section` does not propagate to hardcoded `gap-4` usages.

### Examples of mixed usage
```tsx
// Using token (correct)
style={{ gap: tokens.rhythm.section }}

// Using hardcoded (incorrect)
<div className="space-y-3 p-4 md:p-5">
```

### Call sites
Estimated **30+** occurrences across care page and primitive files.

### Recommended resolution
1. Audit all Tailwind spacing utilities in `care/` files (`space-y-*`, `gap-*`, `p-*`, `m-*`).
2. Map each to the nearest `CARE_RHYTHM` or `tokens.visual` equivalent.
3. Replace with inline `style={{ gap: tokens.rhythm.X }}` or CSS variables where the token system has a match.
4. For cases without a matching token, propose a new token in `tokens.ts` rather than leaving the hardcode.
5. Track progress in `CAREON_DESIGN_DEBT_REGISTER.md`.

**Priority: Medium**

---

## Duplication 7 — Arbitrary Color Values (Hardcoded Tailwind colors bypassing token system)

### Location
`client/src/components/care/CareDesignPrimitives.tsx` and likely `WorkloadPage.tsx`, `SystemAwarenessPage.tsx`.

### Problem
Hardcoded Tailwind color utilities appear instead of CSS custom properties from `--care-badge-*` tokens:

```tsx
// Wrong — bypasses dark mode and theming
className="text-amber-400 bg-amber-500/50 ring-amber-500/50"

// Correct — token-bound, dark-mode-safe
style={{ color: 'var(--care-badge-amber-text)', background: 'var(--care-badge-amber-bg)' }}
```

The `globals.css` file defines `--care-badge-amber-bg` and `--care-badge-amber-text` tokens explicitly (lines 281–282), making the hardcodes redundant and incorrect.

### Call sites
Approximately **8–12** direct color utility usages in care components. Dark mode overrides in `globals.css` (lines 524–601) partially compensate but only for Tailwind's own safelist — custom component usages are not covered.

### Recommended resolution
1. Search for `amber-`, `red-`, `green-`, `blue-`, `purple-` utilities in `care/` files.
2. Replace with `var(--care-badge-{color}-{bg|text})` equivalents.
3. Remove corresponding dark-mode Tailwind override blocks from `globals.css` once the hardcodes are eliminated.

**Priority: Medium**

---

## Duplication 8 — Shell Dimension Inconsistency (UI Contract vs. Live Tokens)

### Location

| Source | Sidebar | Topbar |
|---|---|---|
| `docs/design/CAREON_UI_CONTRACT.md:16–17` | `280px` | `72px` |
| `client/src/design/tokens.ts:75–77` | `256px` (expanded), `72px` (collapsed) | `64px` |

### Problem
`CAREON_UI_CONTRACT.md` was written before tokens were corrected (see tokens.ts comment: "corrected: 256px sidebar, 64px topbar — validated at 1280px"). The document is now stale and contradicts the live implementation. Any developer referencing the contract for layout math will get wrong dimensions, causing pixel misalignment in CSS calculations that depend on shell offsets.

### Recommended resolution
1. Update `CAREON_UI_CONTRACT.md` sidebar width to `256px` (expanded) / `72px` (collapsed).
2. Update topbar height to `64px`.
3. Add a note: "Source of truth is `client/src/design/tokens.ts` — this document reflects those values as of 2026-06-15."
4. Add CI note to review this document when `tokens.ts` shell geometry values change.

**Priority: Critical**

---

## Duplication 9 — One-off CSS Classes with Overlapping Hover Effects

### Location
`client/src/styles/globals.css`

### Classes involved

| Class | Lines | Description |
|---|---|---|
| `.premium-card` | 944, 950, 958, 1656, 1660 | Card with hover lift and shadow |
| `.kpi-card` | 951, 959, 1666, 1670, 1675 | KPI tile with hover state |
| `.queue-row` | 952, 960 | Table row with hover background |
| `.case-row` | 952, 960 | Table row with hover background (identical to `.queue-row`) |
| `.panel-surface` | 1030, 1035 | Panel background utility |
| `.care-hover-card` | 419, 428, 435, 463 | Canonical hover card utility (token-bound) |

### Problem
`.premium-card`, `.kpi-card`, `.queue-row`, `.case-row` each define hover behavior that overlaps with `.care-hover-card`. Dark-mode overrides for `.premium-card` and `.kpi-card` are maintained separately (lines 1656–1675). This creates four maintenance surfaces for effectively the same hover effect. New developers cannot know which class to use.

### Recommended resolution
1. Consolidate `.premium-card` hover behavior into `.care-hover-card` modifier or variant.
2. Consolidate `.queue-row` and `.case-row` into a single `.care-list-row` class (they are identical).
3. Migrate all existing usages in JSX/TSX files to the canonical class names.
4. Remove the four legacy classes and their dark-mode override blocks from `globals.css`.
5. `.kpi-card` has distinct sizing — evaluate whether it warrants a `CareKPICard` component instead.

**Priority: Medium**

---

## Duplication 10 — Legacy Django Template Component System

### Location
`theme/` directory (Django template layer)

### Systems present
- `ds-*` utility classes (design system prefix, Django templates)
- `btn-*` button classes (separate from shadcn `Button` / `care-button`)
- `.card`, `.panel` classes (separate from `CareSection` / `CarePanel`)

### Problem
The Django template layer (`theme/`) contains an entirely separate component and styling vocabulary from the Care SPA primitives. While these systems serve different rendering contexts (server-rendered Django views vs. React SPA), there is no documented boundary. This risks:
- Django template styles leaking into or conflicting with SPA styles if both are served on the same page.
- Developers adding new styles to the Django layer that duplicate SPA primitives.

### Recommended resolution
1. Document the hard boundary: `theme/` styles apply only to Django-rendered views; `client/src/` Care primitives apply only to the React SPA shell.
2. Add a CSS namespace prefix (`ds-` is already partially used) consistently in `theme/` to prevent selector collision.
3. Audit whether any Django views and the SPA shell share a loaded stylesheet — if so, scope by `[data-app="care-spa"]` wrapper.
4. Do not port Django `ds-*` patterns into the SPA; the migration path is to SPA primitives.

**Priority: Low**

---

## Summary Table

| # | Duplication | Files | Call Sites (est.) | Priority |
|---|---|---|---|---|
| 1 | Badge systems (5 implementations) | `CaseStatusBadge.tsx`, `CareDesignPrimitives.tsx`, `WorkloadPage.tsx`, `IntakeListPage.tsx`, `AanbiederPortaalPage.tsx`, `ui/badge.tsx` | 36+ | **Critical** |
| 2 | Section containers (4 impls) | `CareDesignPrimitives.tsx`, `CareSurface.tsx` | ~33 | **High** |
| 3 | Page headers (3 impls) | `CareUnifiedPage.tsx`, `CareSurface.tsx`, `CareDesignPrimitives.tsx` | ~10 | **High** |
| 4 | Status/state UI (4 approaches) | `CaseStatusBadge.tsx`, `CareDesignPrimitives.tsx`, `care/workflow/DecisionBadge.tsx`, various pages | ~15 | **High** |
| 5 | Page layout wrappers (3 scaffolds) | `CareUnifiedPage.tsx`, `CarePageScaffold.tsx`, `CareAppFrame.tsx` | ~18 | **High** |
| 6 | Arbitrary spacing (mixed tokens + Tailwind) | Various care pages and primitives | 30+ | **Medium** |
| 7 | Arbitrary color values (Tailwind hardcodes) | `CareDesignPrimitives.tsx`, care pages | ~10 | **Medium** |
| 8 | Shell dimension inconsistency (doc vs. tokens) | `CAREON_UI_CONTRACT.md`, `tokens.ts` | N/A (doc debt) | **Critical** |
| 9 | One-off CSS hover classes | `globals.css` | ~20 | **Medium** |
| 10 | Legacy Django template system | `theme/` | N/A (separate layer) | **Low** |

---

## Recommended Resolution Order

1. **Sprint 1 (Critical):** Fix shell dimension inconsistency in docs (#8); begin badge system consolidation (#1).
2. **Sprint 2 (High):** Resolve page headers (#3), section containers (#2), layout wrappers (#5).
3. **Sprint 3 (High + Medium):** Status/state UI consolidation (#4); arbitrary color cleanup (#7).
4. **Sprint 4 (Medium):** Spacing token audit (#6); CSS class consolidation (#9).
5. **Backlog (Low):** Django template boundary documentation (#10).

---

*This document is a Phase 1 audit output. Resolutions are tracked in `CAREON_DESIGN_NORMALIZATION_PLAN.md`. Update call-site counts after each sprint cleanup.*
