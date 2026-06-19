# Carelane Pilot Backlog

**Generated:** 2026-06-15  
**Scope:** Work required for, or directly relevant to, the first Carelane pilot  
**Not included:** Speculative features, post-pilot roadmap, cosmetic improvements unrelated to function

Priority tiers:
- **P0** — blocks the pilot (must be done before first user session)
- **P1** — required for a trustworthy pilot (do within first sprint)
- **P2** — useful after the pilot is running (schedule in sprint 2)

---

## P0 — Blocks the Pilot

### P0-1: Add role guard to `matching_candidates_api`

**Why P0:** Any authenticated ZORGAANBIEDER in the same org can read ranked match candidates for any case. This is a data confidentiality breach that could expose matching scores and trade-offs to the wrong party.

**Fix:** In `contracts/api/matching.py`, `matching_candidates_api`, add:
```python
actor_role, role_error = _require_workflow_role(
    user=request.user,
    organization=organization,
    allowed_roles={WorkflowRole.GEMEENTE, WorkflowRole.ADMIN},
)
if role_error is not None:
    return role_error
```
**Files:** `contracts/api/matching.py`  
**Test:** Add an integration test asserting ZORGAANBIEDER gets 403 on this endpoint.

---

### P0-2: Fix provider identity gap in `provider_decision_api`

**Why P0:** When `placement.selected_provider_id is None` (only `proposed_provider` is set), any ZORGAANBIEDER in the org can accept or reject the case. This breaks the provider-to-case assignment guarantee.

**Fix:** In `contracts/api/placement.py`, extend the identity check:
```python
effective_provider_id = placement.selected_provider_id or placement.proposed_provider_id
if effective_provider_id is not None:
    actor_client_ids = provider_client_ids_for_user(request.user, organization)
    if effective_provider_id not in actor_client_ids:
        return JsonResponse({'ok': False, 'error': 'Niet gemachtigd...'}, status=403)
```
**Files:** `contracts/api/placement.py`  
**Test:** Integration test asserting wrong-provider ZORGAANBIEDER gets 403 on `provider_decision_api`.

---

### P0-3: Confirm document download auth (document URL auth audit)

**Why P0:** Documents may contain personal health data. If download URLs are not auth-gated (signed or cookie-verified), any person with the URL can download sensitive files — a GDPR violation.

**Action:** Audit `contracts/api/documents.py` and the file storage configuration:
- If using Django's default file serving: confirm `@login_required` wraps the download view
- If using cloud storage (S3/GCS): confirm signed URLs with short TTL are generated per-request
- Add a test that a direct file URL returns 401/403 without a valid session

**Files:** `contracts/api/documents.py`, storage configuration  
**Test:** Integration test for unauthenticated document URL access.

---

## P1 — Required for a Trustworthy Pilot

### P1-1: Add rejection flow for providers in case detail

**Why P1:** The quick-reject button was removed from the list view (correctly — it silently failed because `rejection_reason_code` was not collected). Providers now have no way to reject a case from the UI. They must navigate to the case workspace, but even there the rejection path must collect a reason code.

**Fix:** In `CaseExecutionPage`, when `role === "zorgaanbieder"` and the NBA is `PROVIDER_REJECTION_OPTION` or similar, show a rejection dialog that:
1. Lets the provider select a `rejection_reason_code` from a dropdown (codes from `PlacementRequest.RejectionReasonCode` model choices)
2. Optionally adds `rejection_notes`
3. Calls `POST /care/api/cases/<id>/placement/provider-decision/` with `{ status: "REJECTED", rejection_reason_code, rejection_notes }`

**Files:** `client/src/components/care/CaseExecutionPage.tsx`, `contracts/api/placement.py`

---

### P1-2: Skeleton loading for decision panel in Casuswerkruimte

**Why P1:** `fetchCaseDecisionEvaluation` is an async call. Currently the workspace renders blank space while it loads. This makes the UI feel broken and can cause coordinators to click the wrong thing.

**Fix:** Show a `Skeleton` component in place of the hero band and decision panel while `decisionEvaluation` is null and `evaluationLoading` is true.

**Files:** `client/src/components/care/CaseExecutionPage.tsx`

---

### P1-3: CaseDecisionLog entries surfaced in AudittrailPage

**Why P1:** The `AudittrailPage` currently shows the Django admin audit log (`AuditLog`) but not the richer `CaseDecisionLog` entries. This means override reasons, recommendation context, and provider selection events are invisible to coordinators and auditors during the pilot.

**Fix:** Add a second tab or section to `AudittrailPage` that fetches from a new endpoint exposing `CaseDecisionLog` for the selected case. Include `event_type`, `actor`, `user_action`, `optional_reason` (override reason), `recommended_value`, `actual_value`, `created_at`.

**Files:** `client/src/components/care/AudittrailPage.tsx`, `contracts/api/audit.py`

---

### P1-4: Remove dead TopBar global search button

**Why P1:** The search icon in the TopBar is wired to `onSearch={() => undefined}`. Users click it expecting cross-entity search and nothing happens. In a pilot setting this damages trust.

**Fix (option A):** Remove the search icon from the TopBar for the pilot. Add a note in the pilot briefing that search is per-page only.  
**Fix (option B):** Wire it to focus the search input on the current page (`document.querySelector('input[type="search"]')?.focus()`).

**Files:** `client/src/components/navigation/TopBar.tsx`, `client/src/components/examples/MultiTenantDemo.tsx`

---

### P1-5: PlacementPage: migrate form POST to JSON API

**Why P1:** `PlacementPage` currently submits via a form POST to a legacy Django URL (`toCareCasussenPlacementAction`). This bypasses the JSON API error handling, CSRF behavior differs, and the response format is inconsistent with the rest of the SPA.

**Fix:** Replace the form POST with `apiClient.post('/care/api/cases/<id>/placement/action/', { status: 'APPROVED' })` matching `placement_action_api`.

**Files:** `client/src/components/care/PlacementPage.tsx`

---

### P1-6: Integration tests for P0-1 and P0-2 role guards

**Why P1:** The P0 security fixes need test coverage so they don't regress silently.

**Test cases to add in `tests/test_intake_assessment_matching_flow.py` or a new file:**
- `ZORGAANBIEDER` gets 403 on `matching_candidates_api`
- Wrong-org ZORGAANBIEDER gets 403 on `provider_decision_api` (when only `proposed_provider_id` set)

**Files:** `tests/test_intake_assessment_matching_flow.py`

---

### P1-7: Manual "Ververs" refresh for Regiekamer worklist

**Why P1:** Coordinators working a full-day queue have no signal when new cases arrive. Without a refresh mechanism they may miss time-sensitive cases.

**Fix:** Add a visible "Ververs" (refresh) button next to the filter bar in `SystemAwarenessPage` that calls `refetch()` on the overview hook. Optionally add a subtitle showing last-refreshed time.

**Files:** `client/src/components/care/SystemAwarenessPage.tsx`

---

## P2 — Useful After the Pilot Is Running

### P2-1: Auto-refresh worklist (polling or WebSocket)

After the pilot stabilises, replace or supplement the manual refresh (P1-7) with automatic polling every 90 seconds or a WebSocket push.

### P2-2: Subcategory scoping in CareFilterDrawer

Subcategory chips in the filter drawer should only show options relevant to the currently-selected category chip (in-drawer pending state, before "Toepassen"). This requires the drawer to expose its local pending state upward or computing options dynamically inside a new `ControlledCareFilterDrawer` variant.

### P2-3: Global cross-entity search

Full-text search across cases, providers, and documents. Requires a backend search endpoint (Elasticsearch or PostgreSQL full-text).

### P2-4: Intake scheduling form

After the provider starts intake, collect: scheduled date, time, location, assigned care worker. Stores these in a new `IntakeAppointment` model. Required for proper intake tracking.

### P2-5: In-UI notification inbox

Replace the hardcoded notification badge with a real notification store. Events: new case sent to provider, provider accepted/rejected, SLA breach, coordinator mention.

### P2-6: Document access log

Record who downloaded or viewed each document. Surface in `AudittrailPage`. Required for full GDPR compliance but not blocking for the pilot (documents contain no personal identifiers at this stage).

### P2-7: Duplicate case detection on Aanmelding

Check if a client reference already exists before creating a new case. Warn the coordinator and link to the existing case.

### P2-8: Draft-save for multi-step intake form

Persist form state between steps so coordinators can close the browser and resume.

---

## Summary Table

| ID | Title | Priority | Files |
|---|---|---|---|
| P0-1 | Role guard on `matching_candidates_api` | **P0** | `contracts/api/matching.py` |
| P0-2 | Provider identity gap in `provider_decision_api` | **P0** | `contracts/api/placement.py` |
| P0-3 | Document download auth audit | **P0** | `contracts/api/documents.py` |
| P1-1 | Rejection flow for providers in case detail | P1 | `CaseExecutionPage.tsx`, `placement.py` |
| P1-2 | Skeleton loading for decision panel | P1 | `CaseExecutionPage.tsx` |
| P1-3 | CaseDecisionLog in AudittrailPage | P1 | `AudittrailPage.tsx`, `audit.py` |
| P1-4 | Remove/fix dead TopBar search button | P1 | `TopBar.tsx`, `MultiTenantDemo.tsx` |
| P1-5 | PlacementPage JSON API migration | P1 | `PlacementPage.tsx` |
| P1-6 | Integration tests for P0 role guards | P1 | `tests/` |
| P1-7 | Manual refresh button for Regiekamer | P1 | `SystemAwarenessPage.tsx` |
| P2-1 | Auto-refresh worklist | P2 | `SystemAwarenessPage.tsx` |
| P2-2 | Subcategory scoping in drawer | P2 | `CareFilterDrawer.tsx` |
| P2-3 | Global cross-entity search | P2 | Backend + TopBar |
| P2-4 | Intake scheduling form | P2 | New component + model |
| P2-5 | In-UI notification inbox | P2 | TopBar + backend |
| P2-6 | Document access log | P2 | `documents.py` + AudittrailPage |
| P2-7 | Duplicate case detection | P2 | `NieuweCasusPage.tsx` + intake API |
| P2-8 | Draft-save for intake form | P2 | `NieuweCasusPage.tsx` |
