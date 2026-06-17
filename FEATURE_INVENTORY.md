# FEATURE INVENTORY

**Historical / non-guidance.** Surface inventory for the current CareOn release wave.
Doctrine and workflow law remain in `docs/Careon_Operational_Constitution_v2.md` and `docs/FOUNDATION_LOCK.md`.

### v1.3 product evolution (orchestration layer)

This inventory records which UI surfaces are active product, supporting internal tooling, quarantined legacy, or demo-only.
It is used by guardrail tests and doc references that still point at the root inventory path.

| Surface | Status | Notes |
|---|---|---|
| CareOn shell, Aanvragen, Matching, Reacties, Plaatsingen, Casus detail | `ACTIVE_PRODUCT` | Canonical operational workflow surfaces. |
| Regiekamer / coordination helpers, arrangement hints, release evidence utilities | `SUPPORTING_INTERNAL` | Internal coordination or release support, not standalone product scope. |
| `CasusControlCenter` legacy layout and related historic shell fragments | `QUARANTINED_LEGACY` | Kept only for reference and guardrail context. |
| `ProviderIntakeDashboard` historical provider mock and similar seeded mock-only surfaces | `DEMO_ONLY` | Not linked from the active route map. |

### Current redesign wave (2026-Q2)

The active engineering focus is a UI redesign and consolidation pass over the `ACTIVE_PRODUCT` surfaces above — not net-new product scope (consistent with the Infrastructure Maturity Phase in `DECISIONS.md`). Shipped or in progress in this wave:

| Workstream | State | Notes |
|---|---|---|
| `--care-*` semantic design tokens replacing raw color utilities across care pages | `IN_PROGRESS` | Migrating away from hardcoded colors / raw CSS-variable utilities; enforced by design-law guardrails. |
| Shared `CareSlaCountdown` SLA primitive adopted across Intake / Placement / Aanbiederreactie / Regiekamer | `SHIPPED` | SLA breaches now actionable across list pages and Regiekamer. |
| Matching detail page restructured into a fixed-slot grid | `SHIPPED` | `MatchingPageWithMap` consumes real `/care/api/cases/<id>/matching-candidates/` payloads. |
| Interactive Casus-detail (owner, priority, elapsed, activity; guided completion flow) | `SHIPPED` | Tab disable logic + backend validation + success feedback. |
| Regiekamer redesigned as action-list with SLA countdown + elevation/token migration | `SHIPPED` | Dead legacy-layout code stripped; exempted from obsolete operational design-law guards. |

### Backend structural health (tracked separately)

`contracts/views.py` is a recognized god-module (~8.2k lines). Its planned decomposition into a `contracts/views/` package (mirroring the already-modular `contracts/api/`) is specified in [`docs/adr/ADR-CONTRACTS-VIEWS-DECOMPOSITION.md`](docs/adr/ADR-CONTRACTS-VIEWS-DECOMPOSITION.md). This is maintainability work inside the feature freeze, not product scope.

## Uitstroom

Traject exit is expressed in the platform as completion plus archive semantics.
Visible product language may say **Uitstroom**, while the persisted workflow contract remains `ARCHIVED` until a coordinated major version changes that mapping.
