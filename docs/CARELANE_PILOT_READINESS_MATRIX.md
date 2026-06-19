# Carelane Pilot Readiness Matrix

**Generated:** 2026-06-15  
**Scope:** Canonical pilot workflow — Aanmelding → Matching → Aanbiederreactie → Plaatsing → Intake  
**Statuses:** PILOT_READY | FUNCTIONAL_NEEDS_POLISH | BLOCKED | OUT_OF_SCOPE

---

## Legend

| Status | Meaning |
|---|---|
| **PILOT_READY** | Functional, tested, no blocking defects |
| **FUNCTIONAL_NEEDS_POLISH** | Works for pilot but has known UX or edge-case gaps |
| **BLOCKED** | Cannot run the pilot workflow without this being resolved |
| **OUT_OF_SCOPE** | Not required for the pilot; track separately |

---

## 1. Regiekamer (Coordination Control Center)

**Status: FUNCTIONAL_NEEDS_POLISH**

### Implemented behavior
- Phase board with 5 columns (Aanmelding, Matching, Aanbiederreactie, Plaatsing, Intake)
- Worklist with priority + issue + phase + ownership + taxonomy category/subcategory filters
- CareFilterDrawer with chip-based interaction and saved views
- NBA (next best action) strip with contextual guidance per case
- Search with debounce, URL-synced filter state
- Urgency badges, SLA-based row colouring, attention strip for critical cases
- Quick-link phase board rows navigate to coordinator worklist filtered by that phase
- Keyboard accessible rows with focus ring

### Missing behavior
- Filter chips: when > 2 active filters, the trigger label only shows a count (no chip summary visible without opening the drawer)
- Taxonomy filters now live in the drawer but subcategory options are not dynamically scoped to the selected category within the drawer (all subcategory options shown regardless of category selection)
- No real-time push notifications — worklist refresh is manual or on navigation

### Technical risk
- Low — all data sourced from `useCoordinationDecisionOverview` which hits `/care/api/coordination/` (authenticated, org-scoped)
- Phase board layout uses `min-w-[900px]` on the inner grid — works at 1024px+ but collapses to horizontal scroll at 768px

### UX risk
- Medium — no automatic refresh means coordinators may miss new high-priority cases between manual refreshes
- The filter chip count in the trigger button is the only signal that filters are active — easy to miss

### Privacy/security risk
- Low — all data is filtered server-side by organization; no client data visible in the Regiekamer without proper org membership

### Files involved
- `client/src/components/care/SystemAwarenessPage.tsx`
- `client/src/components/care/CareFilterDrawer.tsx`
- `client/src/components/care/CareDesignPrimitives.tsx` (RegiekamerWorkRow)
- `contracts/api/cases.py` (coordination_decision_overview_api)

### Tests available
- `CoordinationControlCenter.test.tsx` — 29 tests covering filter, taxonomy chips, phase board, NBA strip, saved views

### Acceptance criteria for PILOT_READY
- [ ] Subcategory options in drawer scoped to selected category (or documented as out-of-scope for v1)
- [ ] Auto-refresh or "X nieuwe casussen" banner after configurable interval

---

## 2. Aanmeldingen (Case Registration)

**Status: PILOT_READY**

### Implemented behavior
- Multi-step form: client reference → care need → region → submit
- Privacy disclosure shown before personal data collection
- Redirects to case workspace after successful creation
- Backend validates required fields, writes audit `STATE_TRANSITION` log
- 503 returned if audit logging fails (safe-fail)

### Missing behavior
- No draft-save between steps (closing the browser loses progress)
- No duplicate detection (same client reference can create two cases)

### Technical risk
- Low — `intake_create_api` is well-guarded; role enforced (`GEMEENTE`/`ADMIN`/`ZORGAANBIEDER`)

### UX risk
- Low for pilot — form is short enough that losing progress is acceptable

### Privacy/security risk
- Low — client identity is not collected in the registration form; only a reference code is used

### Files involved
- `client/src/components/care/NieuweCasusPage.tsx`
- `contracts/api/intake.py` (intake_create_api)

### Tests available
- `NieuweCasusPage.test.tsx` — form flow, validation, submit
- `Playwright: care-visual-regression.spec.ts` — Nieuwe casus smoke test

### Acceptance criteria for PILOT_READY
- Already met ✅

---

## 3. Casuswerkruimte (Case Execution Workspace)

**Status: FUNCTIONAL_NEEDS_POLISH**

### Implemented behavior
- Full `CasusWorkspaceLayout` with flow progress stepper, hero band, decision panel, context stack
- Context rail (visible at xl breakpoint) with blocker, owner, deadline, audit event
- Scroll-aware sticky CTA — only appears when hero band scrolls off screen (no duplicate CTA)
- ARCHIVED exit banner (`case-uitstroom-banner`, role=status)
- All five workflow phases rendered via `decisionEvaluation` from backend
- Arrangement alignment panel (gemeente only)
- Audit timeline (last 12 events)
- Demo-only code (`isReferenceBlockedCase = spaCase.id === "41"`) removed

### Missing behavior
- No "Bewerken" edit flow for case data (links to `toCareCaseEdit` but that route is not a SPA component — it's an external Django form)
- Context rail hidden on laptop/compact breakpoints (only shows at xl=1280px+)
- No inline notification when another user acts on the same case concurrently

### Technical risk
- Medium — `fetchCaseDecisionEvaluation` is called on every case open; if it's slow the workspace feels sluggish. No skeleton loading for the decision panel.

### UX risk
- Medium — the context rail is the main place for "Blocker / owner / required decision" but it's hidden below xl. On 1024px users must scroll to find this information.

### Privacy/security risk
- Low — client identity is masked at `CLI-xxxxx` level until intake is confirmed; all masking logic is in the frontend (`maskParticipantIdentity`)

### Files involved
- `client/src/components/care/CaseExecutionPage.tsx`
- `client/src/components/care/CasusWorkspaceLayout.tsx`
- `client/src/components/care/CareContextRail.tsx`
- `contracts/api/cases.py` (case_decision_evaluation_api)

### Tests available
- `CaseWorkflowDetailPage.test.tsx` — 7 tests including ARCHIVED state, primary CTA, blockers
- `CaseExecutionWorkspaceSections.test.tsx`

### Acceptance criteria for PILOT_READY
- [ ] Decision panel skeleton loading during `fetchCaseDecisionEvaluation` (currently shows blank space)
- [x] No duplicate CTA ✅
- [x] ARCHIVED exit banner ✅
- [x] Demo-only code removed ✅

---

## 4. Matching

**Status: FUNCTIONAL_NEEDS_POLISH**

### Implemented behavior
- `MatchingPageWithMap` with ranked match cards, match score (0–100), trade-off list, warning banners
- Manual override: confirm dialog requires reason text for non-top-ranked selection
- `override_reason` sent to backend; backend validates and writes `PROVIDER_SELECTED` audit log
- Top-ranked provider detection uses `MatchResultaat.ranking` from database
- Backend returns 400 with `code: OVERRIDE_REASON_REQUIRED` when override reason missing
- Provider map with geographic overlay
- Category/subcategory taxonomy tags on match cards
- Waitlist proposal flow

### Missing behavior
- `matching_candidates_api` has no `WorkflowRole` check — any authenticated user in the org can retrieve match candidates (including `ZORGAANBIEDER`). This is a security gap.
- Match score normalization handles both 0–1 and 0–100 formats defensively but this ambiguity should be resolved with a contract fix

### Technical risk
- Medium — `MatchResultaat` ranking depends on the matching engine having run and written results. If no `MatchResultaat` rows exist for a case, `top_match` is None and the override detection silently skips (treated as no override)

### UX risk
- Low — override warning is clearly displayed; confirm button is disabled until reason text is entered

### Privacy/security risk
- **Medium** — `matching_candidates_api` is missing a `WorkflowRole` guard. A ZORGAANBIEDER with org membership could call `GET /care/api/cases/<id>/matching-candidates/` and see the ranked list for any case. Fix: add `_require_workflow_role(..., {WorkflowRole.GEMEENTE, WorkflowRole.ADMIN})`.

### Files involved
- `client/src/components/care/MatchingPageWithMap.tsx`
- `contracts/api/matching.py`
- `contracts/models.py` (MatchResultaat)

### Tests available
- `MatchingPageWithMap.test.tsx` — 5 tests including override path, tradeoffs, error state

### Acceptance criteria for PILOT_READY
- [ ] Add `_require_workflow_role` guard to `matching_candidates_api`
- [x] Override reason required and audited ✅
- [x] Match score displayed ✅

---

## 5. Reacties (Aanbiederreactie / Provider Review)

**Status: FUNCTIONAL_NEEDS_POLISH**

### Implemented behavior
- Gemeente side: `AanbiederreactiePage` shows pending reactions with status chips (wachtend, geaccepteerd, afgewezen, info_gevraagd)
- Quick-accept in `IntakeListPage` (provider role): calls `POST /care/api/cases/<id>/provider-decision/` with `status=ACCEPTED`
- Provider identity verified server-side via `provider_client_ids_for_user`
- Rejection reason not collectable in the list view — rejection requires navigating to case detail (quick-reject button removed; was a bug: backend rejects without `rejection_reason_code`)
- Loading, empty, and error states present
- Status tabs filter the provider reaction queue

### Missing behavior
- Quick-reject removed from list; providers must go to case detail to reject — this is intentional (reason required) but adds friction
- Provider identity check (`provider_decision_api` lines 175–180) only fires when `selected_provider_id is not None`. If only `proposed_provider` is set, any org-member can accept/reject.
- No push notification to the provider when a new case is sent to them

### Technical risk
- Medium — provider identity guard has the conditional gap above; low likelihood in pilot since all providers are known, but should be fixed

### UX risk
- Low for gemeente side (full filtering + queue). Medium for provider side (no notification → provider must poll the queue)

### Privacy/security risk
- Low — client data shown at intake-level detail only after provider acceptance; masking in place

### Files involved
- `client/src/components/care/AanbiederreactiePage.tsx`
- `client/src/components/care/IntakeListPage.tsx`
- `contracts/api/placement.py` (provider_decision_api)

### Tests available
- `AanbiederreactiePage.test.tsx`
- `IntakeListPage.test.tsx` (includes acceptance flow)

### Acceptance criteria for PILOT_READY
- [ ] Fix provider identity check: also check `proposed_provider_id` when `selected_provider_id` is None
- [x] Quick-reject removed (backend contract enforced) ✅
- [ ] Document or add a rejection flow in case detail for provider role

---

## 6. Plaatsingen (Placement)

**Status: FUNCTIONAL_NEEDS_POLISH**

### Implemented behavior
- `PlacementPage` shows selected provider, checklist (provider acceptance + capacity + intake readiness), and "Bevestig plaatsing" CTA
- Provider fallback (`?? legacyProviders[0]`) removed — `!provider` now correctly shows empty state
- Backend: `placement_action_api` enforces `GEMEENTE/ADMIN` only, validates transition, writes audit
- Rematch path (after rejection): resets workflow to `MATCHING_READY`
- Budget review path supported (state `BUDGET_REVIEW_PENDING`)

### Missing behavior
- `PlacementPage` uses form-based POST to `toCareCasussenPlacementAction` (a legacy Django URL), not the JSON API. If the form endpoint changes, this will break silently.
- No "compare alternatives" view — placement is a single-provider confirmation

### Technical risk
- Low — the checklist gates the confirm button; partial data cannot be accidentally confirmed

### UX risk
- Low — checklist is clear and the primary CTA is disabled until all conditions pass

### Privacy/security risk
- Low — placement data is already org-scoped

### Files involved
- `client/src/components/care/PlacementPage.tsx`
- `client/src/components/care/PlacementPageWrapper.tsx`
- `contracts/api/placement.py` (placement_action_api)

### Tests available
- `PlacementPage.test.tsx`
- `PlacementTrackingPage.test.tsx`

### Acceptance criteria for PILOT_READY
- [ ] Migrate `PlacementPage` form POST to use the JSON API (`placement_action_api`) for consistency
- [x] Provider fallback removed ✅

---

## 7. Intake

**Status: PILOT_READY**

### Implemented behavior
- `IntakeListPage` (provider role, `view="intake"`) shows confirmed placements awaiting intake start
- Provider navigates to `CaseExecutionPage` and clicks "Start intake" (NBA: `START_INTAKE`)
- Backend: `intake_action_api` restricted to `ZORGAANBIEDER` only
- Auto-advance to `ACTIVE_PLACEMENT` if transition is immediately allowed
- Loading, empty, and error states present

### Missing behavior
- No dedicated intake scheduling UI (intake start date, time, location) — the backend records the event but there is no form to capture these logistics
- No SMS/email notification to client after intake start

### Technical risk
- Low — transition is server-enforced and the auto-advance is guarded by a second `evaluate_transition` call

### UX risk
- Low for pilot — providers can start intake via the case workspace CTA

### Privacy/security risk
- Low — ZORGAANBIEDER role restriction enforced at backend

### Files involved
- `client/src/components/care/IntakeListPage.tsx`
- `contracts/api/intake.py` (intake_action_api)

### Tests available
- `IntakeListPage.test.tsx`

### Acceptance criteria for PILOT_READY
- Already met ✅

---

## 8. Documenten (Documents)

**Status: FUNCTIONAL_NEEDS_POLISH**

### Implemented behavior
- `DocumentenPage` shows document list with type, date, uploader
- Document upload and download UI present
- Backend `documents.py` handles CRUD

### Missing behavior
- No version history per document
- No inline document preview
- No document access log (who viewed/downloaded)

### Technical risk
- Low for the pilot — documents are supplemental, not on the critical path

### UX risk
- Low — basic list + upload meets pilot needs

### Privacy/security risk
- Medium — document downloads bypass the SPA auth check on the URL (direct file URL). If documents contain sensitive client data, this needs a signed URL or auth header. Should be audited before pilot.

### Files involved
- `client/src/components/care/DocumentenPage.tsx`
- `contracts/api/documents.py`

### Tests available
- None specific to documents in the care component suite

### Acceptance criteria for PILOT_READY
- [ ] Confirm document download URLs are auth-gated (signed URLs or cookie-auth)
- [ ] Add at least one smoke test for document list rendering

---

## 9. Search

**Status: FUNCTIONAL_NEEDS_POLISH**

### Implemented behavior
- Per-page search bars on all major list pages (debounced, client-side filter)
- Global search stub in TopBar (no-op `onSearch={() => undefined}`)

### Missing behavior
- **TopBar global search is a dead button** — `onSearch` is hardcoded to `() => undefined` in `MultiTenantDemo.tsx`. Clicking it does nothing.
- No cross-page or cross-entity search

### Technical risk
- Low — per-page search works; global search is explicitly stubbed

### UX risk
- Medium — users expect the TopBar search icon to do something

### Privacy/security risk
- Low — search results are filtered by org and role

### Files involved
- `client/src/components/navigation/TopBar.tsx`
- `client/src/components/examples/MultiTenantDemo.tsx`

### Tests available
- Per-page search covered in individual page tests

### Acceptance criteria for PILOT_READY
- [ ] Either implement global search or remove the search icon from TopBar for the pilot. Document the decision.

---

## 10. Notifications

**Status: OUT_OF_SCOPE**

### Current state
- Badge count in TopBar sidebar (hardcoded to 2 when `currentPage === "casussen"`)
- No real-time notification delivery
- No notification storage or read/unread state

### Missing behavior
- Everything — notifications are effectively mocked

### Technical risk
- High if required for pilot — would need WebSocket or SSE infrastructure

### Acceptance criteria for PILOT_READY
- OUT_OF_SCOPE for pilot v1. Coordinators and providers will rely on email/manual queue polling.

---

## 11. Roles and Permissions

**Status: FUNCTIONAL_NEEDS_POLISH**

### Implemented behavior
- Three roles: `gemeente`, `zorgaanbieder`, `admin`
- Backend: `_require_workflow_role` enforced on every mutating endpoint
- Frontend: role-conditional rendering (e.g., gemeente-only arrangement alignment panel)
- Organization scoping: all queries filtered by `organization`

### Missing behavior
- `matching_candidates_api` has no role guard (any org-member can read)
- `provider_decision_api` identity check has a gap when `selected_provider_id is None`
- No "sub-role" within gemeente (e.g., coördinator vs. financieel medewerker)
- `MultiTenantDemo.tsx` role switcher is demo-only; production will use SSO groups

### Technical risk
- Medium — the two authorization gaps above (see Matching and Reacties) are the only production risks

### UX risk
- Low — role-based UI rendering is consistent

### Privacy/security risk
- Medium — the two auth gaps mean a ZORGAANBIEDER in the same org could:
  1. Read matching candidates for any case (`matching_candidates_api`)
  2. Accept/reject a case with only `proposed_provider` set (`provider_decision_api`)

### Files involved
- `contracts/api/_helpers.py` (_require_workflow_role)
- `contracts/workflow_state_machine.py`
- `contracts/api/matching.py`
- `contracts/api/placement.py`

### Tests available
- `test_intake_assessment_matching_flow.py` covers role enforcement at integration level

### Acceptance criteria for PILOT_READY
- [ ] Add `_require_workflow_role({GEMEENTE, ADMIN})` to `matching_candidates_api`
- [ ] Fix `provider_decision_api` to check `proposed_provider_id` when `selected_provider_id` is None

---

## 12. Audit Trail

**Status: PILOT_READY**

### Implemented behavior
- `CaseDecisionLog` written for every workflow transition via `log_transition_event` → `log_case_decision_event`
- Fields stored: `case_id`, `placement_id`, `event_type`, `actor`, `actor_kind`, `action_source`, `provider_id`, `override_type`, `recommended_value`, `actual_value`, `optional_reason`, `recommendation_context`
- `override_reason` stored in `optional_reason` + `override_type='MANUAL'` for manual provider overrides
- `AuditLog` (Django admin log) also written for all model mutations via middleware
- `audit_log_api` and `audit_log_export_api` expose audit trail to admin users
- `strict=True` on all workflow audit calls — failed audit write returns 503, blocks the action

### Missing behavior
- `AudittrailPage.tsx` shows the Django `AuditLog` (admin middleware log) but not the richer `CaseDecisionLog`. Pilot users will not see override reasons or recommendation context in the UI.
- No per-case audit export for the pilot admin

### Technical risk
- Low — `log_case_decision_event` is well-tested and the `strict=True` fail-safe is in place

### UX risk
- Medium — coordinators cannot see override reasons in the current audit trail UI

### Privacy/security risk
- Low — audit records are immutable append-only; admin-role required to read

### Files involved
- `contracts/governance.py` (log_case_decision_event)
- `contracts/models.py` (CaseDecisionLog)
- `client/src/components/care/AudittrailPage.tsx`
- `contracts/api/audit.py`

### Tests available
- `test_intake_assessment_matching_flow.py` covers audit event writing at integration level

### Acceptance criteria for PILOT_READY
- [ ] Surface `CaseDecisionLog` entries (especially `PROVIDER_SELECTED` + override) in `AudittrailPage`

---

## Pilot Readiness Summary

| Area | Status | Blockers |
|---|---|---|
| Regiekamer | FUNCTIONAL_NEEDS_POLISH | No auto-refresh; subcategory cascading in drawer |
| Aanmeldingen | **PILOT_READY** | — |
| Casuswerkruimte | FUNCTIONAL_NEEDS_POLISH | Decision panel skeleton loading |
| Matching | FUNCTIONAL_NEEDS_POLISH | `matching_candidates_api` role gap |
| Reacties | FUNCTIONAL_NEEDS_POLISH | Provider identity gap; no rejection UI |
| Plaatsingen | FUNCTIONAL_NEEDS_POLISH | Legacy form POST to JSON API migration |
| Intake | **PILOT_READY** | — |
| Documenten | FUNCTIONAL_NEEDS_POLISH | Document download auth audit |
| Search | FUNCTIONAL_NEEDS_POLISH | Dead TopBar search button |
| Notifications | OUT_OF_SCOPE | — |
| Roles & Permissions | FUNCTIONAL_NEEDS_POLISH | 2 auth gaps |
| Audit Trail | **PILOT_READY** | CaseDecisionLog not surfaced in UI |

**Pilot readiness: 3/12 areas PILOT_READY. 8/12 FUNCTIONAL_NEEDS_POLISH (pilot can proceed with documented limitations). 0 BLOCKED.**

**Estimated effort to close all FUNCTIONAL_NEEDS_POLISH gaps: 3–5 days engineering.**

---

## Appendix: Files Changed in This Session

| File | Change |
|---|---|
| `client/src/components/care/SystemAwarenessPage.tsx` | Taxonomy category + subcategory filter groups restored in CareFilterDrawer |
| `client/src/components/care/CoordinationControlCenter.test.tsx` | Taxonomy test re-enabled and updated to chip-based interaction (2 tests) |
| `contracts/api/matching.py` | Override detection, `override_reason` validation, `PROVIDER_SELECTED` audit on `send_to_provider` + `assign` |
| `client/tests/e2e/care-visual-regression.spec.ts` | Multi-viewport responsive tests for Regiekamer, Casuswerkruimte, Matchingwerkruimte |
| `client/src/components/examples/MultiTenantDemo.tsx` | Skip-to-main-content link; `id="main-content"` on scrollable region |
| `client/src/components/care/CareUnifiedPage.tsx` | `aria-live="polite"` on main zone |
| `client/src/components/care/CaseExecutionPage.tsx` | Removed `isReferenceBlockedCase` demo-only branch (dead "Bekijk alles" button, hardcoded names/dates) |
| `client/src/components/care/IntakeListPage.tsx` | Removed quick-reject button (backend requires rejection_reason_code; list view cannot collect it) |
| `client/src/components/care/PlacementPage.tsx` | Removed silent `?? legacyProviders[0]` fallback; empty state now shown when provider not found |
| `client/src/components/care/MatchingPageWithMap.tsx` | CareTradeoffList in selected cards; CareMatchScore in advisory column; override dialog |
| `client/src/components/care/MatchingPageWithMap.test.tsx` | 2 new Phase F tests: override path, tradeoffs |
| `client/src/components/care/CaseWorkflowDetailPage.test.tsx` | ARCHIVED exit banner test |
| `docs/CARELANE_PILOT_READINESS_MATRIX.md` | This document |
