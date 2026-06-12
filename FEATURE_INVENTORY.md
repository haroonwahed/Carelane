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

## Uitstroom

Traject exit is expressed in the platform as completion plus archive semantics.
Visible product language may say **Uitstroom**, while the persisted workflow contract remains `ARCHIVED` until a coordinated major version changes that mapping.
