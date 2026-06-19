# Carelane Pilot Data Guide v1

**Purpose:** describe the controlled seed/demo data used for the first closed-pilot session.
**Rule:** do not use real client data in the pilot.

## Seed / demo data used

- `seed_demo_data --reset --locked-time` provides the canonical pilot/demo tenant and workflow fixtures.
- `reset_pilot_environment` runs `seed_demo_data`, `seed_jeugdregio_backbone`, and `seed_pilot_e2e` in the documented order.
- The controlled pilot tenant uses the `gemeente-demo` organization.
- The golden-path E2E case is the seeded `Zorg OS Golden Path <suffix>` casus created for the current run.

## How to reset the pilot environment

Use the documented reset path for rehearsal / pilot environments:

```bash
./manage.py reset_pilot_environment
```

Typical usage is via the rehearsal settings or the scripted pilot-prep flow documented elsewhere in the repository.

## Known safe test users / roles

These are the documented pilot users created by `seed_pilot_e2e`:

| Username | Role | Intended use |
|---|---|---|
| `demo_gemeente` | municipality / coordinator | manage the canonical pilot casus |
| `demo_provider_brug` | provider | provider-review path and linked-case visibility |
| `demo_provider_kompas` | provider | alternate provider-review path and linked-case visibility |
| `e2e_owner` | owner / smoke account | operational smoke and admin coordination |

Password values are environment-controlled and must not be written into this document.

## Golden path casus

- The canonical golden-path casus is the seeded `Zorg OS Golden Path <suffix>` case created for the current run.
- Use the case surfaced by the pilot E2E flow rather than a hard-coded database ID.
- The casus should support the scripted path: Aanmelding → Matching → Aanbiederreactie → Plaatsing → Intake.

## Provider decision path

- The provider review path uses the seeded provider account and the linked-case queue.
- Provider response handling should remain case-scoped and role-scoped.
- The pilot smoke path validates the provider decision endpoint and the queue view.

## What data must not be used

- real client records
- production provider records
- real names or contact details of service users
- production secrets or credentials
- unapproved external data exports
- ad hoc pilot data created outside the scripted seed path

## Notes

- If a pilot session needs a fresh dataset, reset the environment instead of manually patching records.
- If the seeded case list changes, update this guide and the pilot session plan together.
