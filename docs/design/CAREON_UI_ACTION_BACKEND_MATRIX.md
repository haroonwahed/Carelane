# CareOn UI / Action / Backend Matrix
**Phase 1 Audit — Workflow Action Contracts**
**Date:** 2026-06-15
**Status:** Draft — verified against `contracts/urls.py`, `contracts/workflow_state_machine.py`, `contracts/api/` modules

---

## Purpose

This matrix documents every significant user action available in the CareOn SPA, mapping the visible UI element to its backend API endpoint, permission model, payload, audit trail, and resulting workflow state transition. It serves as the single source of truth for frontend developers implementing action buttons and for backend reviewers verifying that the API contract matches UI expectations.

**Convention:**
- Workflow states reference `WorkflowState` constants from `contracts/workflow_state_machine.py`
- CasePhase values reference `CareCase.CasePhase` from `contracts/models.py`
- Roles reference `WorkflowRole` from `contracts/workflow_state_machine.py`: `GEMEENTE` | `ZORGAANBIEDER` | `ADMIN`
- Audit events reference `CaseDecisionLog.EventType` from `contracts/models.py`
- All API paths are relative to the Django app root (no `/care/` prefix in urls.py)

---

## Page 1: Regiekamer (SystemAwarenessPage)

The Regiekamer is the coordination command center. It shows the full case queue for a gemeente organization. Users: gemeente coordinators and admins.

---

### Action 1.1 — Nieuwe aanmelding (Create new case)

| Field | Value |
|---|---|
| **Screen** | Regiekamer / SystemAwarenessPage |
| **Action label** | "Nieuwe aanmelding" |
| **User role** | `GEMEENTE`, `ADMIN` |
| **Visibility** | Always visible to authorized roles; hidden from `ZORGAANBIEDER` |
| **Enabled** | Always enabled for authorized roles |
| **API endpoint** | `POST /api/cases/intake-create/` |
| **Backend view** | `intake_create_api` — `contracts/api/intake.py` |
| **Permission check** | `@login_required`; `_require_workflow_role` checks role ∈ {`GEMEENTE`, `ADMIN`}; organization tenancy scoped |
| **Required payload** | Intake form fields (from `intake_form_options_api` options): `client_name`, `care_category_main`, `care_category_sub`, `gemeente`, `regio`, `urgency`, `contract_type`, and optional free-text fields. Full field list from `GET /api/cases/intake-form/`. |
| **Success state** | Case created; toast "Aanmelding aangemaakt"; redirect to new case detail (`/casus/:id`). New case enters `WorkflowState.DRAFT_CASE` or `WorkflowState.WIJKTEAM_INTAKE` depending on intake path. `CareCase.CasePhase` set to `intake`. |
| **Failure state** | Form validation errors rendered inline; 400 response body contains field-level errors. Toast "Aanmelding kon niet worden aangemaakt." |
| **Audit event** | `CaseDecisionLog.EventType.STATE_TRANSITION` — `user_action='intake_create'`, `action_source='intake_create_api'` |
| **Resulting workflow state** | `WorkflowState.WIJKTEAM_INTAKE` (wijkteam intake path) or `WorkflowState.DRAFT_CASE` (direct coordinator path) |

---

### Action 1.2 — Start matching (from Regiekamer case row)

| Field | Value |
|---|---|
| **Screen** | Regiekamer / SystemAwarenessPage — case row action |
| **Action label** | "Start matching" |
| **User role** | `GEMEENTE`, `ADMIN` |
| **Visibility** | Visible on case rows where `workflow_state ∈ {SUMMARY_READY}` and `CasePhase = intake` |
| **Enabled** | Case summary must be complete; case must be in `SUMMARY_READY` state |
| **API endpoint** | `POST /api/cases/<int:case_id>/matching/action/` |
| **Backend view** | `matching_action_api` → `_matching_action_api_inner` — `contracts/api/matching.py` |
| **Permission check** | `@login_required`; organization tenancy; role must be `GEMEENTE` or `ADMIN` |
| **Required payload** | `{ "action": "confirm_validation" }` — triggers gemeente validation of matching readiness |
| **Success state** | Case moves to `GEMEENTE_VALIDATED`; matching candidates panel activates; toast "Matching gestart." `CasePhase` set to `matching`. |
| **Failure state** | If state guard fails: 409 with `{ "ok": false, "error": "..." }`; toast "Kan matching niet starten — controleer de casusgegevens." |
| **Audit event** | `CaseDecisionLog.EventType.GEMEENTE_VALIDATION` — `user_action='gemeente_validate_matching'`, `action_source='matching_action_api_confirm_validation'` |
| **Resulting workflow state** | `WorkflowState.MATCHING_READY` → `WorkflowState.GEMEENTE_VALIDATED` |

---

### Action 1.3 — Wijs toe (Assign owner to case)

| Field | Value |
|---|---|
| **Screen** | Regiekamer / SystemAwarenessPage — case row action or bulk action |
| **Action label** | "Wijs toe" |
| **User role** | `GEMEENTE`, `ADMIN` |
| **Visibility** | Visible for unassigned cases or reassignment; visible to coordinator role and admin |
| **Enabled** | Case must exist and be in an active phase (not `ARCHIVED`) |
| **API endpoint** | `PATCH /api/cases/<int:case_id>/` or `POST /api/cases/bulk-update/` (for bulk assignment) |
| **Backend view** | `case_detail_api` (PATCH) or `cases_bulk_update_api` — `contracts/api/cases.py` |
| **Permission check** | `@login_required`; `can_access_case_action(user, case, CaseAction.EDIT)` must pass; `ZORGAANBIEDER` role cannot edit assignment |
| **Required payload** | `{ "assigned_to": <user_id> }` (single) or `{ "case_ids": [...], "assigned_to": <user_id> }` (bulk) |
| **Success state** | Case row updates with assignee name; toast "Casus toegewezen aan [naam]." |
| **Failure state** | 403 if permission denied; toast "Kan casus niet toewijzen." |
| **Audit event** | `CaseDecisionLog.EventType.STATE_TRANSITION` — `user_action='case_assign'` (if logged); assignment changes are tracked in case model `updated_at` |
| **Resulting workflow state** | No state transition — ownership metadata change only |

---

## Page 2: Casuswerkruimte (CaseExecutionPage)

The Casuswerkruimte is the per-case workspace. It presents the full case detail, history, and action panel. Access is scoped: coordinators/admins see all; providers see only their linked placement.

---

### Action 2.1 — Maak casus compleet (Mark case ready from Aanmelding)

| Field | Value |
|---|---|
| **Screen** | Casuswerkruimte / CaseExecutionPage — case header action area |
| **Action label** | "Maak casus compleet" |
| **User role** | `GEMEENTE`, `ADMIN` |
| **Visibility** | Visible when `workflow_state ∈ {DRAFT_CASE}` and current user is coordinator |
| **Enabled** | All required intake fields must be populated; enabled state may be driven by `case_decision_evaluation_api` completeness flags |
| **API endpoint** | `POST /api/cases/<int:case_id>/early-lifecycle/` |
| **Backend view** | `case_early_lifecycle_api` — `contracts/api/cases.py` |
| **Permission check** | `@login_required`; organization tenancy; role must be `GEMEENTE` or `ADMIN` |
| **Required payload** | `{ "action": "complete_summary" }` |
| **Success state** | Case advances to `SUMMARY_READY`; action panel updates to show "Start matching" as next step; toast "Casus gereed voor matching." |
| **Failure state** | 400 if required fields missing; inline validation panel highlights incomplete sections |
| **Audit event** | `CaseDecisionLog.EventType.STATE_TRANSITION` — `user_action='complete_summary'`, `action_source='case_early_lifecycle_api'` |
| **Resulting workflow state** | `WorkflowState.DRAFT_CASE` → `WorkflowState.SUMMARY_READY` |

---

### Action 2.2 — Start matching (from Casuswerkruimte)

| Field | Value |
|---|---|
| **Screen** | Casuswerkruimte / CaseExecutionPage — action panel |
| **Action label** | "Start matching" |
| **User role** | `GEMEENTE`, `ADMIN` |
| **Visibility** | Visible when `workflow_state = SUMMARY_READY` |
| **Enabled** | Case summary complete; `SUMMARY_READY` state |
| **API endpoint** | `POST /api/cases/<int:case_id>/matching/action/` |
| **Backend view** | `matching_action_api` → `_matching_action_api_inner` — `contracts/api/matching.py` |
| **Permission check** | `@login_required`; `GEMEENTE` or `ADMIN` role; organization tenancy |
| **Required payload** | `{ "action": "prepare_waitlist_proposal" }` — initiates matching candidate fetch and advisory matching |
| **Success state** | Matching candidates panel populated via `GET /api/cases/<id>/matching-candidates/`; case phase updated to `matching`; `workflow_state` → `MATCHING_READY`; toast "Matching gestart." |
| **Failure state** | 400 if case not in `SUMMARY_READY`; toast "Kan matching niet starten." |
| **Audit event** | `CaseDecisionLog.EventType.GEMEENTE_VALIDATION` — `user_action='gemeente_validate_matching'`, `action_source='matching_action_api_prepare_waitlist'` |
| **Resulting workflow state** | `WorkflowState.SUMMARY_READY` → `WorkflowState.MATCHING_READY` |

---

### Action 2.3 — Verstuur naar aanbieder (Send to provider — from Casuswerkruimte)

| Field | Value |
|---|---|
| **Screen** | Casuswerkruimte / CaseExecutionPage — action panel after matching |
| **Action label** | "Verstuur naar aanbieder" |
| **User role** | `GEMEENTE`, `ADMIN` |
| **Visibility** | Visible when `workflow_state ∈ {GEMEENTE_VALIDATED}` and a provider has been selected |
| **Enabled** | Provider must be selected from matching candidates; `GEMEENTE_VALIDATED` state required |
| **API endpoint** | `POST /api/cases/<int:case_id>/matching/action/` |
| **Backend view** | `matching_action_api` → `_matching_action_api_inner` — `contracts/api/matching.py` |
| **Permission check** | `@login_required`; `GEMEENTE` or `ADMIN` role; organization tenancy |
| **Required payload** | `{ "action": "send_to_provider", "provider_id": <int> }` |
| **Success state** | `PlacementRequest` created or updated with status `PROVIDER_REVIEW_PENDING`; provider notification triggered; case phase → `provider_beoordeling`; toast "Verzoek verstuurd naar aanbieder." |
| **Failure state** | 400 if provider not selected or state guard fails; toast "Kan verzoek niet versturen — selecteer een aanbieder." |
| **Audit event** | `CaseDecisionLog.EventType.STATE_TRANSITION` — `user_action='send_to_provider'`, `action_source='matching_action_api_send_to_provider'` |
| **Resulting workflow state** | `WorkflowState.GEMEENTE_VALIDATED` → `WorkflowState.PROVIDER_REVIEW_PENDING`; `CasePhase` → `provider_beoordeling` |

---

### Action 2.4 — Bevestig plaatsing (Confirm placement)

| Field | Value |
|---|---|
| **Screen** | Casuswerkruimte / CaseExecutionPage — placement action panel |
| **Action label** | "Bevestig plaatsing" |
| **User role** | `GEMEENTE`, `ADMIN` |
| **Visibility** | Visible when `workflow_state ∈ {PROVIDER_ACCEPTED}` and placement is not yet confirmed |
| **Enabled** | Provider must have accepted (`PROVIDER_ACCEPTED`); budget review cleared (or not required) |
| **API endpoint** | `POST /api/cases/<int:case_id>/placement-action/` |
| **Backend view** | `placement_action_api` → `_placement_action_api_inner` — `contracts/api/placement.py` |
| **Permission check** | `@login_required`; `GEMEENTE` or `ADMIN` role; organization tenancy |
| **Required payload** | `{ "status": "PLACEMENT_CONFIRMED", "note": "<optional confirmation note>" }` |
| **Success state** | `PlacementRequest.status` → `PLACEMENT_CONFIRMED`; workflow state → `PLACEMENT_CONFIRMED`; case phase → `plaatsing`; toast "Plaatsing bevestigd." |
| **Failure state** | 400 if state guard fails or provider has not accepted; toast "Kan plaatsing niet bevestigen." |
| **Audit event** | `CaseDecisionLog.EventType.STATE_TRANSITION` — `user_action=WorkflowAction.CONFIRM_PLACEMENT`, `action_source='placement_action_api'` |
| **Resulting workflow state** | `WorkflowState.PROVIDER_ACCEPTED` → `WorkflowState.PLACEMENT_CONFIRMED`; `CasePhase` → `plaatsing` |

---

### Action 2.5 — Plan intake (Schedule intake)

| Field | Value |
|---|---|
| **Screen** | Casuswerkruimte / CaseExecutionPage — placement confirmed state |
| **Action label** | "Plan intake" |
| **User role** | `GEMEENTE`, `ADMIN`, `ZORGAANBIEDER` |
| **Visibility** | Visible when `workflow_state = PLACEMENT_CONFIRMED` |
| **Enabled** | Placement confirmed; intake date fields available |
| **API endpoint** | `POST /api/cases/<int:case_id>/intake-action/` |
| **Backend view** | `intake_action_api` → `_intake_action_api_inner` — `contracts/api/intake.py` |
| **Permission check** | `@login_required`; `_require_workflow_role`; `GEMEENTE`, `ADMIN`, or `ZORGAANBIEDER` with placement link |
| **Required payload** | `{ "action": "start_intake", "intake_date": "<ISO date>", "location": "<optional>" }` |
| **Success state** | `CaseIntakeProcess.workflow_state` → `INTAKE_STARTED`; `CareCase.case_phase` → `actief`; toast "Intake gepland." |
| **Failure state** | 400 if date missing or state guard fails; toast "Intake kon niet worden gepland." |
| **Audit event** | `CaseDecisionLog.EventType.STATE_TRANSITION` — `user_action=WorkflowAction.START_INTAKE`, `action_source='intake_action_api'` |
| **Resulting workflow state** | `WorkflowState.PLACEMENT_CONFIRMED` → `WorkflowState.INTAKE_STARTED`; `CasePhase` → `actief` |

---

### Action 2.6 — Sla op / Bewerk (Save case edits)

| Field | Value |
|---|---|
| **Screen** | Casuswerkruimte / CaseExecutionPage — editable fields |
| **Action label** | "Opslaan" / "Bewerken" (toggle) |
| **User role** | `GEMEENTE`, `ADMIN` |
| **Visibility** | Always visible to editing-eligible roles; edit fields hidden from `ZORGAANBIEDER` |
| **Enabled** | Case must not be in `ARCHIVED` state; `can_access_case_action(user, case, CaseAction.EDIT)` must pass |
| **API endpoint** | `PATCH /api/cases/<int:case_id>/` |
| **Backend view** | `case_detail_api` — `contracts/api/cases.py` |
| **Permission check** | `@login_required`; `can_access_case_action` with `CaseAction.EDIT`; `ZORGAANBIEDER` blocked from EDIT action |
| **Required payload** | Partial case fields: any subset of `{ "title", "notes", "risk_level", "urgency", "assigned_to", ... }` |
| **Success state** | Case fields updated; `updated_at` refreshed; toast "Wijzigingen opgeslagen." No workflow state change. |
| **Failure state** | 400 for validation errors; 403 for permission denied; toast "Opslaan mislukt." |
| **Audit event** | Not logged to `CaseDecisionLog` (metadata edit, not a governance decision). `updated_at` timestamp provides implicit audit trail. |
| **Resulting workflow state** | No change |

---

## Page 3: Matchingwerkruimte (MatchingPageWithMap)

The Matchingwerkruimte is the map-based provider selection interface. It shows matching candidates geographically and allows the coordinator to select and dispatch a provider.

---

### Action 3.1 — Verstuur naar aanbieder (Send to selected provider from map)

| Field | Value |
|---|---|
| **Screen** | Matchingwerkruimte / MatchingPageWithMap — provider dispatch panel |
| **Action label** | "Verstuur naar aanbieder" |
| **User role** | `GEMEENTE`, `ADMIN` |
| **Visibility** | Visible when a provider marker is selected on the map and `workflow_state ∈ {GEMEENTE_VALIDATED}` |
| **Enabled** | Provider selected; `GEMEENTE_VALIDATED` state; case has a valid `PlacementRequest` record |
| **API endpoint** | `POST /api/cases/<int:case_id>/matching/action/` |
| **Backend view** | `matching_action_api` → `_matching_action_api_inner` — `contracts/api/matching.py` |
| **Permission check** | `@login_required`; `GEMEENTE` or `ADMIN` role; organization tenancy; placement scoped to case |
| **Required payload** | `{ "action": "send_to_provider", "provider_id": <int> }` — `provider_id` from selected map marker |
| **Success state** | `PlacementRequest` updated; provider notified; case phase → `provider_beoordeling`; map marker animates to "sent" state; `SelectedProviderCard` shows "Verstuurd"; toast "Verzoek verstuurd naar [aanbiedernaam]." |
| **Failure state** | 400 if provider not selected or not in candidate list; 409 state guard failure; toast "Versturen mislukt — probeer opnieuw." Map state reverts. |
| **Audit event** | `CaseDecisionLog.EventType.STATE_TRANSITION` — `user_action='send_to_provider'`, `action_source='matching_action_api_send_to_provider'`; `provider` FK set to selected provider |
| **Resulting workflow state** | `WorkflowState.GEMEENTE_VALIDATED` → `WorkflowState.PROVIDER_REVIEW_PENDING`; `CasePhase` → `provider_beoordeling` |

---

### Action 3.2 — Handmatige overschrijving (Manual provider override)

| Field | Value |
|---|---|
| **Screen** | Matchingwerkruimte / MatchingPageWithMap — override panel / reason dialog |
| **Action label** | "Handmatige overschrijving" (or "Afwijken van advies") |
| **User role** | `GEMEENTE`, `ADMIN` |
| **Visibility** | Visible when the coordinator selects a provider that differs from the system recommendation (`system_recommendation.recommended_provider_id ≠ selected_provider_id`) |
| **Enabled** | A reason must be entered in the override reason field; reason must be non-empty (enforced client-side and server-side) |
| **API endpoint** | `POST /api/cases/<int:case_id>/matching/action/` |
| **Backend view** | `matching_action_api` → `_matching_action_api_inner` — `contracts/api/matching.py` |
| **Permission check** | `@login_required`; `GEMEENTE` or `ADMIN` role; override reason required in payload (server validates `override_reason` non-empty) |
| **Required payload** | `{ "action": "send_to_provider", "provider_id": <int>, "override_reason": "<mandatory reason text>", "override_type": "coordinator_manual" }` |
| **Success state** | Same as Action 3.1, plus override recorded. `CaseDecisionLog` entry captures divergence from system recommendation. Map shows provider as selected with override indicator. |
| **Failure state** | 400 if `override_reason` is empty; client-side: submit button disabled until reason field is non-empty; toast "Geef een reden op voor de afwijking." |
| **Audit event** | `CaseDecisionLog.EventType.PROVIDER_SELECTED` — `user_action='provider_selected_manual_override'`, `override_type='coordinator_manual'`, `recommended_value` = system recommendation, `actual_value` = selected provider; `optional_reason` = override reason text |
| **Resulting workflow state** | `WorkflowState.GEMEENTE_VALIDATED` → `WorkflowState.PROVIDER_REVIEW_PENDING`; `CasePhase` → `provider_beoordeling` |

---

## Supplementary: Provider-side Actions (AanbiederPortaalPage / AanbiederreactiePage)

These actions are initiated by `ZORGAANBIEDER` role users responding to placement requests.

---

### Action S.1 — Accepteer (Provider accepts placement request)

| Field | Value |
|---|---|
| **Screen** | AanbiederPortaalPage / AanbiederreactiePage |
| **Action label** | "Accepteer" |
| **User role** | `ZORGAANBIEDER` |
| **Visibility** | Visible when `workflow_state = PROVIDER_REVIEW_PENDING` and provider has an active placement link |
| **Enabled** | Placement request in `PROVIDER_REVIEW_PENDING`; provider actor has `ensure_provider_case_visible_or_404` permission |
| **API endpoint** | `POST /api/cases/<int:case_id>/provider-decision/` |
| **Backend view** | `provider_decision_api` → `_provider_decision_api_inner` — `contracts/api/placement.py` |
| **Permission check** | `@login_required`; `provider_client_ids_for_user` check ensures provider actor is linked to this case's placement |
| **Required payload** | `{ "status": "ACCEPTED", "provider_comment": "<optional>" }` |
| **Success state** | `PlacementRequest.status` → `PROVIDER_ACCEPTED`; workflow → `PROVIDER_ACCEPTED`; gemeente notified; toast "Plaatsingsverzoek geaccepteerd." |
| **Failure state** | 400/403 on state mismatch or permission failure; toast "Accepteren mislukt." |
| **Audit event** | `CaseDecisionLog.EventType.STATE_TRANSITION` — `user_action=WorkflowAction.PROVIDER_ACCEPT`, `action_source='placement._provider_decision_api_inner'` |
| **Resulting workflow state** | `WorkflowState.PROVIDER_REVIEW_PENDING` → `WorkflowState.PROVIDER_ACCEPTED` |

---

### Action S.2 — Weiger (Provider rejects placement request)

| Field | Value |
|---|---|
| **Screen** | AanbiederPortaalPage / AanbiederreactiePage |
| **Action label** | "Weiger" |
| **User role** | `ZORGAANBIEDER` |
| **Visibility** | Visible when `workflow_state = PROVIDER_REVIEW_PENDING` |
| **Enabled** | Same as S.1; rejection reason required |
| **API endpoint** | `POST /api/cases/<int:case_id>/provider-decision/` |
| **Backend view** | `provider_decision_api` → `_provider_decision_api_inner` — `contracts/api/placement.py` |
| **Permission check** | Same as S.1 |
| **Required payload** | `{ "status": "REJECTED", "rejection_reason_code": "<code>", "provider_comment": "<required>" }` |
| **Success state** | `PlacementRequest.status` → `PROVIDER_REJECTED`; workflow → `PROVIDER_REJECTED`; rematch option surfaces for gemeente; toast "Verzoek geweigerd." |
| **Failure state** | 400 if rejection reason missing; toast "Geef een reden op voor weigering." |
| **Audit event** | `CaseDecisionLog.EventType.STATE_TRANSITION` — `user_action=WorkflowAction.PROVIDER_REJECT` |
| **Resulting workflow state** | `WorkflowState.PROVIDER_REVIEW_PENDING` → `WorkflowState.PROVIDER_REJECTED` (→ `MATCHING_READY` on rematch) |

---

## Workflow State Reference

```
WIJKTEAM_INTAKE
  └→ ZORGVRAAG_BEOORDELING
       └→ DRAFT_CASE
            └→ SUMMARY_READY
                 └→ MATCHING_READY
                      └→ GEMEENTE_VALIDATED
                           └→ PROVIDER_REVIEW_PENDING
                                ├→ PROVIDER_ACCEPTED
                                │    ├→ BUDGET_REVIEW_PENDING
                                │    │    ├→ PROVIDER_ACCEPTED
                                │    │    └→ MATCHING_READY
                                │    └→ PLACEMENT_CONFIRMED
                                │         └→ INTAKE_STARTED
                                │              ├→ ACTIVE_PLACEMENT
                                │              │    └→ ARCHIVED
                                │              └→ ARCHIVED
                                ├→ PROVIDER_REJECTED
                                │    └→ MATCHING_READY
                                └→ BUDGET_REVIEW_PENDING
```

---

## API Endpoint Quick Reference

| Action | Method | Endpoint | View module |
|---|---|---|---|
| Create case (intake) | POST | `/api/cases/intake-create/` | `contracts/api/intake.py` |
| Get intake form options | GET | `/api/cases/intake-form/` | `contracts/api/intake.py` |
| List cases | GET | `/api/cases/` | `contracts/api/cases.py` |
| Case detail / edit | GET/PATCH | `/api/cases/<id>/` | `contracts/api/cases.py` |
| Case timeline | GET | `/api/cases/<id>/timeline/` | `contracts/api/cases.py` |
| Early lifecycle action | POST | `/api/cases/<id>/early-lifecycle/` | `contracts/api/cases.py` |
| Matching candidates | GET | `/api/cases/<id>/matching-candidates/` | `contracts/api/matching.py` |
| Matching action (start/validate/send) | POST | `/api/cases/<id>/matching/action/` | `contracts/api/matching.py` |
| Provider decision (accept/reject) | POST | `/api/cases/<id>/provider-decision/` | `contracts/api/placement.py` |
| Placement action (confirm/rematch) | POST | `/api/cases/<id>/placement-action/` | `contracts/api/placement.py` |
| Budget decision | POST | `/api/cases/<id>/budget-decision/` | `contracts/api/placement.py` |
| Intake action (plan intake) | POST | `/api/cases/<id>/intake-action/` | `contracts/api/intake.py` |
| Activate monitoring | POST | `/api/cases/<id>/activate-monitoring/` | `contracts/api/placement.py` |
| Bulk case update (assign) | POST | `/api/cases/bulk-update/` | `contracts/api/cases.py` |
| Assessment decision | POST | `/api/cases/<id>/assessment-decision/` | `contracts/api/assessment.py` |
| Coordination decision overview | GET | `/api/regiekamer/decision-overview/` | `contracts/api/cases.py` |

---

## CaseDecisionLog Event Types Reference

| EventType | When logged |
|---|---|
| `MATCH_RECOMMENDED` | System generates matching recommendation |
| `PROVIDER_SELECTED` | Coordinator selects provider (including manual overrides) |
| `RESEND_TRIGGERED` | Placement resent to provider |
| `REMATCH_TRIGGERED` | Case returned to matching queue |
| `GEMEENTE_VALIDATION` | Gemeente validates matching candidates |
| `STATE_TRANSITION` | Any workflow state transition |
| `BUDGET_DECISION` | Budget approve/reject/defer |
| `TRANSITION_REQUEST` | Provider submits care transition request |
| `FINANCIAL_VALIDATION` | Gemeente validates transition financial impact |
| `EVALUATION_OUTCOME` | Case evaluation recorded |
| `CASE_COMMUNICATION` | Notes or messages added |
| `SLA_ESCALATION` | SLA threshold crossed |

---

*This document reflects the backend as of 2026-06-15. Backend is authoritative — when this document disagrees with `contracts/urls.py` or the API view implementations, the backend wins. Update this document after each API change.*
