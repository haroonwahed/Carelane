# CareOn Design System Master Brief — Completion Matrix

Generated: 2026-06-15. Based on full codebase audit against CAREON_DESIGN_SYSTEM_MASTER_BRIEF.md.

Legend: ✅ COMPLETE | 🔶 PARTIALLY COMPLETE | ❌ NOT STARTED | ⛔ BLOCKED | — NO LONGER REQUIRED

---

## 1. Design Tokens

**Status: 🔶 PARTIALLY COMPLETE**

Files:
- `client/src/styles/globals.css` — 83 `--care-*` tokens defined; bidirectional light/dark
- `client/src/design/tokens.ts` — JS re-export; `tokens.visual` canonical, `legacyVisualContract` deprecated

What exists:
- Colour tokens: primitive palette + `--care-badge-{tone}-{bg|text}` per semantic tone ✅
- Layout tokens: sidebar 256px, topbar 64px, page padding, max-width, radii, shadows ✅
- Surface tokens: radii, shadows, overlay, backdrop ✅
- CTA tokens: `--care-cta-primary`, `--care-cta-warning` ✅

What is missing:
- Motion tokens (`--care-motion-fast`, `--care-motion-standard`, `--care-motion-slow`, easing) ❌
- Typography scale tokens (no `--care-text-*` tokens; sizes hardcoded as `text-[12px]`/`text-[13px]`) ❌
- Z-index scale tokens (`--care-z-topbar`, `--care-z-overlay`, `--care-z-sticky`) ❌
- Surface state tokens (`--care-state-selected`, `--care-state-active`, `--care-state-disabled`) ❌
- Context rail width token (`--care-context-rail-width`) ❌
- Queue width token (`--care-queue-width`) ❌

Tests: `src/lib/operationalRhythm.test.ts` mirrors rhythm values — passes ✅

Remaining work: Add motion, typography-scale, z-index, state, and width tokens to `globals.css` and re-export in `tokens.ts`.

Risk: Low — additive only; no existing consumers will break.

---

## 2. Shell Geometry

**Status: 🔶 PARTIALLY COMPLETE**

Files:
- `client/src/components/examples/MultiTenantDemo.tsx` — production shell
- `client/src/components/navigation/Sidebar.tsx`, `TopBar.tsx`

What exists:
- Sidebar 256px via `--care-sidebar-width-expanded` ✅
- Topbar 64px via `--care-topbar-height` ✅
- Page padding via `--care-page-h-padding` ✅
- Shell structure: `h-screen overflow-hidden / flex-1 overflow-y-auto` ✅

What is missing:
- `TopBar.tsx` uses hardcoded `z-40` (not a token) ❌
- Sticky bar in `CasusWorkspaceLayout` uses `z-20` (not a token) ❌
- No documented z-index ladder ❌

Tests: `src/test/careUiContract.test.ts` checks layout contract — passes ✅

Remaining work: Add z-index tokens; update `TopBar.tsx` and `CasusWorkspaceLayout.tsx` to use them.

Risk: Low — visual only; no layout breaks expected.

---

## 3. Primitive Normalization

**Status: 🔶 PARTIALLY COMPLETE**

Files: `client/src/components/ui/` — Button, Input, Select, Dialog, Sheet, Tabs, Table, Badge, Dropdown, Alert, etc.

What exists:
- All major shadcn/Radix primitives present ✅
- Dialog/Sheet/Dropdown already use `--care-shadow-*` tokens ✅
- `PrimaryActionButton` in `CareDesignPrimitives.tsx` ✅

What is missing:
- `shadow-md` hardcoded in `PrimaryActionButton` (line 233 of CareDesignPrimitives.tsx) — should be `--care-shadow-control` ❌
- No `EmptyState` primitive component (used inline everywhere) ❌
- No `Skeleton` wrapper for care-domain loading patterns ❌
- No documented variants/states per primitive ❌
- Checkbox, Radio, Switch — no care-domain wrapper or documented usage ❌

Tests: `src/test/careA11ySmoke.primitives.test.tsx` — passes ✅

Remaining work: Fix shadow-md; create EmptyState + Skeleton domain wrappers; document states.

Risk: Low for shadow fix. Medium for EmptyState (many inline patterns to unify).

---

## 4. Badge Consolidation

**Status: ❌ NOT STARTED (7 implementations proliferating)**

Files:
- `src/components/care/UrgencyBadge.tsx` — standalone file
- `src/components/care/RiskBadge.tsx` — standalone file
- `src/components/care/CaseStatusBadge.tsx` — standalone file
- `src/components/care/CareDesignPrimitives.tsx` — `CareStatusBadge`, `FlowPhaseBadge`, `CanonicalPhaseBadge`, `CareMetricBadge`
- `src/components/care/SystemAwarenessPage.tsx` — inline red/amber badge using raw Tailwind `border-red-500/35 bg-red-500/10 text-red-200` classes (at least 6 sites)
- `src/components/care/CareUnifiedPage.tsx` — `CareMetricBadge`

What is missing:
- Single canonical `CareStatusBadge` exported from `CareDesignPrimitives.tsx` covering all semantic tones ❌
- `UrgencyBadge.tsx` and `RiskBadge.tsx` deprecated and routes to `CareStatusBadge` ❌
- SystemAwarenessPage inline badge classes replaced with token-based variants ❌

Tests: None for badge consolidation.

Remaining work: Consolidate to `CareStatusBadge(tone, label)` + deprecate standalone files + migrate all call sites.

Risk: Medium — many call sites; need careful migration without visual regression.

---

## 5. CarePanel / CareSection Consolidation

**Status: 🔶 PARTIALLY COMPLETE**

Files: `src/components/care/CareDesignPrimitives.tsx` (lines 338–358: `CarePanel` as alias to `CareSection tone="elevated"`)

What exists:
- `CarePanel` is already a thin alias to `CareSection tone="elevated"` ✅
- Both exported from CareDesignPrimitives ✅

What is missing:
- 35 usages of `CarePanel` across care components vs. 29 usages of `CareSection` ❌
- Callers that use `CarePanel` do not benefit from being on `CareSection` semantics ❌
- No migration completion status ❌

Remaining work: Audit all 35 `CarePanel` usages; determine if each should be `CareSection tone="elevated"` or a different tone; migrate; then mark `CarePanel` deprecated.

Risk: Medium — CarePanel callers may depend on specific padding/radius that differs from CareSection.

---

## 6. Component Documentation

**Status: 🔶 PARTIALLY COMPLETE**

Files:
- `docs/design/CAREON_COMPONENT_INVENTORY.md` — exists ✅
- `docs/design/CAREON_DESIGN_SYSTEM_V1.md` — exists ✅
- No per-component prop/variant/state documentation inline or in docs ❌

Remaining work: Add structured docs for each required domain component covering props, variants, interaction, empty/loading/error/permission/responsive behaviour.

Risk: Low — documentation only; no code changes.

---

## 7. Storybook Installation

**Status: ❌ NOT STARTED**

Files:
- `client/.storybook/main.ts` — config present (references `@storybook/react-vite`, `@storybook/addon-essentials`, `@storybook/addon-a11y`) ✅
- `client/.storybook/preview.ts` — present ✅
- `client/src/components/ui/ApiErrorMessage.stories.tsx` — one story file ✅

What is missing:
- Zero Storybook npm packages installed ❌
- No stories for any domain component ❌
- No foundation stories (colour, typography, spacing) ❌

Remaining work: `npm install storybook @storybook/react-vite @storybook/addon-essentials @storybook/addon-a11y @storybook/test`; write stories for all required components and pages.

Risk: Medium — Storybook version conflicts with Vite 6 possible; needs verification.

---

## 8. Accessibility Tooling

**Status: 🔶 PARTIALLY COMPLETE**

Files:
- `jest-axe` installed ✅
- `src/test/careA11ySmoke.pages.test.tsx` — renders 7 pages, runs `expectNoA11yViolations` ✅
- `src/test/careA11ySmoke.primitives.test.tsx` — primitives a11y test ✅
- `@storybook/addon-a11y` in Storybook config (not installed) ❌

What is missing:
- No `aria-live` regions for toast/status updates ❌
- No skip link in shell ❌
- No focus management on route transitions ❌
- `AlertTriangle` icons in sticky bar not paired with `aria-label` (added `aria-hidden` but no text alternative for blocker severity) ❌
- Storybook a11y addon not available ❌

Tests: All a11y smoke tests pass (228 total, 48 files) ✅

Remaining work: Skip link; aria-live regions; focus management; fix sticky bar icons.

Risk: Low for skip link / aria-live. Medium for route-transition focus management.

---

## 9. Visual Regression Testing

**Status: ❌ NOT STARTED**

What is missing:
- No Playwright visual snapshot tests ❌
- No component screenshot tests ❌
- `@playwright/test` is installed but used only for e2e flows ❌

Remaining work: Create `tests/visual/` snapshot tests for Regiekamer, Casuswerkruimte, Matchingwerkruimte at 1280/1440/1600px. Requires a running dev server.

Risk: High — visual regression is a CI infrastructure investment, not just code. Blocked on Storybook.

---

## 10. Responsive Overflow Testing

**Status: ❌ NOT STARTED**

What is missing:
- No viewport-specific tests ❌
- No explicit overflow assertions for tables / work queues ❌
- `careUiContract.test.ts` does not check scrollWidth > clientWidth ❌

Remaining work: Add DOM-width assertions for CareWorkRow, CareWorkQueue tables at min-width 1280px via jsdom.

Risk: Medium — jsdom does not render CSS so true layout overflow cannot be detected; needs playwright for real layout checks.

---

## 11. Regiekamer (SystemAwarenessPage)

**Status: 🔶 PARTIALLY COMPLETE**

Files: `src/components/care/SystemAwarenessPage.tsx` (2457 lines)

What exists:
- Five-phase workflow board with CareFlowBoard ✅
- NBA panel with `PrimaryActionButton` (fixed from `bg-primary` raw button) ✅
- Metric panels linking to filtered queues ✅
- Bottleneck display ✅

What is missing:
- Inline red/amber Tailwind badge classes (not `--care-badge-*` tokens) at 6+ sites ❌
- No saved operational views / saved filter patterns ❌
- No CareFilterDrawer integration ❌
- `shadow-sm` hardcoded in multiple buttons ❌
- Partial loading and API error states not explicitly surfaced per section ❌

Tests: `src/components/care/CoordinationControlCenter.test.tsx` — passes ✅

Remaining work: Replace hardcoded badge classes; add saved views; integrate CareFilterDrawer; surface error/loading states per section.

Risk: Medium — SystemAwarenessPage is the largest file; careful targeted edits required.

---

## 12. Casuswerkruimte

**Status: 🔶 PARTIALLY COMPLETE**

Files:
- `src/components/care/CaseExecutionPage.tsx` (1402 lines)
- `src/components/care/CasusWorkspaceLayout.tsx` (235 lines, updated this session)

What exists:
- Sticky context bar with case ID, urgency, municipality, owner, elapsed, blocker, dominant CTA ✅ (added this session)
- Flow progress stepper ✅
- Decision panel / hero band ✅
- Context stack ✅

What is missing:
- Right-side CareContextRail ❌
- Duplicate CTA risk: sticky bar and hero band both render `primaryCtaLabel` with same `handlePrimaryAction` — when both visible, user sees the CTA twice ❌
- Blocker label in sticky bar truncated to 52 chars with `max-w-[220px] truncate` — no accessible full text ❌
- Arbitrary `px-0` on outer div but content gets padding from CareAppFrame — sticky bar has no background bleed to viewport edges ❌

Tests: `src/components/care/CaseExecutionWorkspaceSections.test.tsx` — passes ✅

Remaining work: Add CareContextRail; fix duplicate CTA (show in sticky bar only when scrolled past hero); full blocker text in title/tooltip.

Risk: Medium for duplicate CTA — requires scroll detection. Low for context rail.

---

## 13. CareContextRail

**Status: ❌ NOT STARTED**

No file exists at any path.

Required content (per brief):
- Blocker
- Deadline
- Owner
- Required decision
- Contact
- Linked provider
- Recent audit event

Remaining work: Create `src/components/care/CareContextRail.tsx`; integrate into `CaseExecutionPage`.

Risk: Low — new file only; no existing code disrupted.

---

## 14. Matchingwerkruimte

**Status: 🔶 PARTIALLY COMPLETE**

Files: `src/components/care/MatchingPageWithMap.tsx` (1291 lines)

What exists:
- Ranked provider list with scores ✅
- `whyMatch` explanation text from API ✅
- `tradeOffs` array from API (mapped to UI as string list) ✅
- Sub-scores (specialization, region, capacity, complexity) ✅
- API calls to `confirm_validation` + `send_to_provider` ✅
- Waitlist flow ✅

What is missing:
- No `CareTradeoffList` component (tradeoffs rendered as raw strings) ❌
- No audited manual override: `handleSelectProvider` only sets local state; when a non-top provider is sent without override reason, backend does not receive an `override_reason` field ❌
- No override reason capture dialog ❌
- No "override not permitted" state ❌
- States not implemented: no suitable providers, provider unavailable, sending request failure/success, override requested ❌

Tests: `src/components/care/MatchingPageWithMap.test.tsx` — passes ✅

Remaining work: CareTradeoffList; override reason dialog; POST `override_reason` to backend; implement missing states.

Risk: High — override audit path touches backend contract; must not silently skip audit.

---

## 15. CareFilterDrawer

**Status: ❌ NOT STARTED**

No file exists at any path.

Required elements (per brief):
- Saved views
- Include/exclude filters
- Region, phase, care need, provider status, blocked state
- Active filter chips
- Sort

Remaining work: Create `src/components/care/CareFilterDrawer.tsx`; integrate into SystemAwarenessPage and WorkloadPage.

Risk: Low for component. Medium for integration (must not break existing filter state).

---

## 16. Saved Views

**Status: ❌ NOT STARTED**

No implementation in any component.

Remaining work: Define saved view schema; implement in CareFilterDrawer; persist via localStorage or user preferences API.

Risk: Medium — needs decision on persistence (localStorage vs. backend).

---

## 17. Advisory Matching Explanation

**Status: 🔶 PARTIALLY COMPLETE**

Files: `src/components/care/MatchingPageWithMap.tsx`

What exists:
- `whyMatch` text from API rendered ✅
- Advisory label (`CareMatchAdvisoryLabel`) ✅
- Confidence score display ✅
- Sub-scores mapped (specialization, region, capacity, complexity) ✅
- Score help dialog with explanation script ✅

What is missing:
- `CareMatchExplanation` as a standalone domain component ❌
- Sub-scores shown but not in a structured explanation format with satisfied constraints / trade-offs ❌
- "Why another provider may be preferable" section ❌
- Incomplete matching data warning ❌

Remaining work: Wrap existing explanation elements into `CareMatchExplanation` component; add constraint satisfaction list; add "why another provider" disclaimer.

Risk: Low — UI restructuring of existing data.

---

## 18. Trade-off Comparison

**Status: 🔶 PARTIALLY COMPLETE**

Files: `src/components/care/MatchingPageWithMap.tsx`

What exists:
- `tradeOffs` array mapped from API (`trade_offs` field) ✅
- Warnings array from API ✅
- Rendered as string list in provider detail panel ✅

What is missing:
- `CareTradeoffList` as a reusable domain component ❌
- Trade-off vs. advantage structured comparison ❌
- Trade-offs shown per provider in the ranked list view ❌

Remaining work: Create `CareTradeoffList` in CareDesignPrimitives; apply in MatchingPageWithMap.

Risk: Low.

---

## 19. Audited Manual Override

**Status: ❌ NOT STARTED**

Files: `src/components/care/MatchingPageWithMap.tsx`

What exists:
- `handleConfirmSelectionChoice` sends `confirm_validation` + `send_to_provider` ✅
- `validation_context` object passed with score/advisory/tradeOffs ✅

What is missing:
- No detection of when selected provider is NOT the top recommendation ❌
- No override reason capture dialog ❌
- No `override_reason` field sent to backend when provider differs from top recommendation ❌
- No "override not permitted" state for roles without override permission ❌

Remaining work: Compare `selectedProviderId` against `rankedMatches[0].provider.id`; if differs, open override reason dialog; POST `override_reason` with `send_to_provider` action.

Risk: High — backend must accept and audit the `override_reason`; frontend cannot silently omit it.

---

## 20. UI Action / Backend Matrix

**Status: ✅ COMPLETE**

File: `docs/design/CAREON_UI_ACTION_BACKEND_MATRIX.md` — exists, covers Regiekamer, Casuswerkruimte, Matchingwerkruimte actions with endpoints, permissions, audit events, workflow states.

Remaining work: None for the document. Verify override action is included (see item 19).

Risk: None.

---

## 21. Workflow-State Mapping Tests

**Status: 🔶 PARTIALLY COMPLETE**

Files:
- `src/lib/decisionPhaseUi.test.ts` ✅
- `src/lib/workflowUi.decisionState.test.ts` ✅
- `src/lib/workflowUi.placementTracking.test.ts` ✅
- `src/test/careUiContract.test.ts` ✅

What is missing:
- No test verifying that `MATCHING_READY → PROVIDER_REVIEW_PENDING` transition only fires when backend permits ❌
- No test for override path (non-top provider requires reason) ❌
- No test for `ARCHIVED` exit state ❌

Remaining work: Add transition coverage tests for override path and ARCHIVED state.

Risk: Medium — requires mocking backend state machine.

---

## 22. Governance Documentation

**Status: 🔶 PARTIALLY COMPLETE**

Files:
- `docs/CAREON_DESIGN_GOVERNANCE.md` — exists ✅
- `docs/design/CAREON_DESIGN_SYSTEM_V1.md` — exists ✅
- `docs/design/CAREON_DESIGN_DEBT_REGISTER.md` — exists ✅

What is missing:
- Governance document does not enumerate the 10 rules from the master brief ❌
- No enforcement mechanism in CI ❌
- No reference to the `operationalDesignLawsGuard.test.ts` pattern for automated governance ❌

Remaining work: Update governance doc with the 10 master-brief rules; add CI note.

Risk: Low — documentation only.

---

## 23. Migration Plan

**Status: 🔶 PARTIALLY COMPLETE**

Files:
- `docs/CAREON_STRUCTURAL_MIGRATION_PLAN.md` — exists ✅
- `docs/design/CAREON_DESIGN_NORMALIZATION_PLAN.md` — exists ✅

What is missing:
- No per-page table with: current component family → target family, design debt, functional debt, migration priority, dependencies, risk, status ❌
- Does not reference design-system master brief sequence ❌
- `CAREON_DESIGN_NORMALIZATION_PLAN.md` still references stale `tokens.visualContract` ❌

Remaining work: Create `docs/design/CAREON_DESIGN_SYSTEM_MIGRATION_PLAN.md` as per brief spec; update normalization plan token references.

Risk: Low — documentation only.

---

## Summary

| # | Requirement | Status | Blocking Phase |
|---|---|---|---|
| 1 | Design tokens | 🔶 PARTIAL | A |
| 2 | Shell geometry | 🔶 PARTIAL | A |
| 3 | Primitive normalization | 🔶 PARTIAL | A |
| 4 | Badge consolidation | ❌ NOT STARTED | A |
| 5 | CarePanel/CareSection | 🔶 PARTIAL | A |
| 6 | Component documentation | 🔶 PARTIAL | B |
| 7 | Storybook installation | ❌ NOT STARTED | B |
| 8 | Accessibility tooling | 🔶 PARTIAL | B |
| 9 | Visual regression testing | ❌ NOT STARTED | F |
| 10 | Responsive overflow testing | ❌ NOT STARTED | F |
| 11 | Regiekamer | 🔶 PARTIAL | C |
| 12 | Casuswerkruimte | 🔶 PARTIAL | D |
| 13 | CareContextRail | ❌ NOT STARTED | B/D |
| 14 | Matchingwerkruimte | 🔶 PARTIAL | E |
| 15 | CareFilterDrawer | ❌ NOT STARTED | B |
| 16 | Saved views | ❌ NOT STARTED | B/C |
| 17 | Advisory matching explanation | 🔶 PARTIAL | E |
| 18 | Trade-off comparison | 🔶 PARTIAL | E |
| 19 | Audited manual override | ❌ NOT STARTED | E |
| 20 | UI action/backend matrix | ✅ COMPLETE | — |
| 21 | Workflow-state mapping tests | 🔶 PARTIAL | F |
| 22 | Governance documentation | 🔶 PARTIAL | A |
| 23 | Migration plan | 🔶 PARTIAL | A |

**COMPLETE: 1 / 23**
**PARTIALLY COMPLETE: 13 / 23**
**NOT STARTED: 9 / 23**
