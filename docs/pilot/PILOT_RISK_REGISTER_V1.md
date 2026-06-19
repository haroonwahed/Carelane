# Carelane Pilot Risk Register v1

**Purpose:** track operational risks for the first controlled closed-pilot session.
**Rule:** keep the register current with the pilot session plan and feedback log.

## Risk register

| Risk | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|
| Operational risk: pilot users get blocked at login or navigation | Session cannot proceed | Pre-seed and verify the controlled pilot users before the session | Ops owner | pending |
| Privacy risk: real client or personal data is used during the pilot | Data exposure and compliance risk | Use seeded demo/pilot data only; confirm the no-real-data rule at session start | Release captain / Ops owner | pending |
| Workflow risk: canonical path order is broken during the session | Session loses evidentiary value | Keep the scripted canonical order and stop if a state transition is missing | Backend owner / QA owner | pending |
| Demo-data risk: seeded cases are missing or inconsistent | Smokes and pilot steps fail unpredictably | Reset the pilot environment before the session and verify the golden-path casus | Ops owner | pending |
| Provider visibility risk: provider can see cases without the approved link | Permission breach | Verify role-based visibility before allowing provider review | Backend owner / QA owner | pending |

## Notes

- Update the status field when a risk is reviewed, mitigated, or closed.
- Add rows if a new risk appears during the pilot.
- Keep this register aligned with the feedback log; do not duplicate the same observation without a distinct risk angle.
