# Carelane Closed Pilot Release Packet v1

**Purpose:** evidence-backed release packet for a controlled closed pilot.
**Decision posture:** demo-ready and closed-pilot-ready are GO; production-ready remains NO-GO until real operational evidence exists.

## Release scope

This packet covers the current Carelane pilot release wave for:

- canonical workflow execution
- tenant isolation and role/permission behavior
- advisory matching and municipality validation
- provider response and audit visibility
- controlled staging / rehearsal evidence

Out of scope:

- new product features
- workflow redesign
- UI redesign
- permission model changes
- matching logic changes
- database schema changes
- production promotion without operational evidence

## Intended audience

- release captain
- backend owner
- ops owner
- QA owner
- security / identity owner
- pilot stakeholders

## Pilot constraints

- closed pilot only
- controlled audience and known users
- no production promotion from this packet alone
- no hidden workflow bypasses
- no change to canonical workflow order
- no feature expansion beyond what is already verified

## Pilot execution kit

- [Pilot Session Plan v1](../pilot/PILOT_SESSION_PLAN_V1.md)
- [Pilot Facilitation Script v1](../pilot/PILOT_FACILITATION_SCRIPT_V1.md)
- [Pilot Feedback Log v1](../pilot/PILOT_FEEDBACK_LOG_V1.md)
- [Pilot Risk Register v1](../pilot/PILOT_RISK_REGISTER_V1.md)
- [Pilot Data Guide v1](../pilot/PILOT_DATA_GUIDE_V1.md)
- [Runbook Index](../ops/RUNBOOK_INDEX.md)

## Evidence status table

| Evidence item | Status | Notes |
|---|---|---|
| Test suite | complete | Default backend path passes: 940 passed, 3 warnings. |
| Frontend build | complete | Frontend build passes on the current release candidate. |
| Secrets inventory | template only | Documented in `docs/ops/SECRETS_INVENTORY.md`; no real values recorded. |
| Backup / restore drill | template only | Documented in `docs/ops/BACKUP_RESTORE_DRILL.md`; first drill not yet performed. |
| Observability | template only | Documented in `docs/ops/OBSERVABILITY_CHECKLIST.md`; no live monitoring evidence attached yet. |
| Rollback | template only | Documented in `docs/ops/ROLLBACK_PLAYBOOK.md`; not yet validated in a real rollback. |
| Release sign-off | template only | Documented in `docs/releases/RELEASE_SIGNOFF_V1.md`; production section remains NO-GO. |
| Closed-pilot sign-off | complete | Existing staging / rehearsal evidence remains GO. |

## Verified test evidence

- Backend test suite: **940 passed, 3 warnings**
- Default pytest path: isolated from external Supabase/Postgres placeholder credentials
- Targeted release-contract tests: passed in prior cleanup verification

## Verified build evidence

- Frontend build: passed on the current release candidate

## Canonical workflow evidence

- Canonical flow remains: Casus → Samenvatting → Matching → Gemeente Validatie → Aanbieder Beoordeling → Plaatsing → Intake
- Backend state machine remains the source of truth
- No workflow step reordering was introduced for this packet

## Role / permission evidence

- Tenant isolation remains enforced by tests
- Provider visibility remains linked-case only
- Document-create, OIDC, and bootstrap release-contract checks were verified in the preceding cleanup cycle

## Audit / visibility evidence

- Audit trail and timeline surfaces remain part of the operational contract
- Release documentation now separates evidence templates from completed pilot evidence
- Production evidence sections remain clearly marked as pending or template-only where appropriate

## Known production gaps

- secrets inventory has no completed operational drill attached
- backup / restore evidence is not yet completed
- observability evidence is not yet completed
- rollback playbook is documented but not validated in a real rollback
- release sign-off is not yet fully completed for production

## Go / No-go decision

| Readiness tier | Decision |
|---|---|
| Demo-ready | GO |
| Closed-pilot-ready | GO |
| Production-ready | NO-GO |

## Sign-off

### Release captain

- Name:
- Date:
- Decision:

### Backend owner

- Name:
- Date:
- Verification note:

### Ops owner

- Name:
- Date:
- Verification note:

### QA owner

- Name:
- Date:
- Verification note:

### Security / identity owner

- Name:
- Date:
- Verification note:
