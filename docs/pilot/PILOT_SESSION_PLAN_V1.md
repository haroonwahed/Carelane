# Carelane Pilot Session Plan v1

**Purpose:** execution plan for the first controlled closed-pilot session.
**Decision posture:** demo-ready and closed-pilot-ready are GO; production-ready remains NO-GO until operational evidence exists.

## Pilot objective

Validate that the current Carelane release can support a supervised, low-risk closed-pilot session using the canonical workflow and role boundaries already verified in smoke and E2E coverage.

## Scope

- canonical workflow execution
- controlled pilot users only
- advisory matching and provider response handling
- placement and intake handoff
- audit trail visibility for meaningful transitions
- role-based visibility checks

Out of scope:

- new product features
- UI redesign
- workflow redesign
- production promotion
- schema changes
- permission model changes

## Excluded production claims

- The pilot session is not production evidence.
- The pilot session does not prove backup/restore readiness.
- The pilot session does not prove observability completeness.
- The pilot session does not prove rollback completeness.
- The pilot session does not authorize production go-live.

## Roles involved

- release captain
- coordinator / municipality operator
- provider operator
- QA observer
- ops owner
- backend owner

## Pilot constraints

- use only controlled pilot/demo users
- use only seeded pilot/demo data
- keep the canonical workflow order intact
- do not skip approval / response steps
- do not use real client data
- do not present the pilot as production-ready

## Success criteria

- the session completes the canonical path without blocking defects
- advisory matching remains advisory and explainable
- provider visibility remains case-linked only
- unauthorized access remains blocked
- audit trail entries are visible for the major transitions
- no production claims appear in UI or docs

## Failure criteria

- workflow order breaks
- permissions leak beyond the intended role
- provider sees cases without the approved link
- matching loses its advisory nature
- audit trail is missing for meaningful transitions
- the UI or docs claim production readiness

## Pre-session checklist

- [ ] pilot environment reset completed
- [ ] seeded pilot users are present
- [ ] golden-path casus exists
- [ ] provider decision path is available
- [ ] release packet and runbook index are accessible
- [ ] browser and backend access are ready
- [ ] observers know the no-production-claims rule
- [ ] feedback log and risk register are open

## Session script

1. Open the Regiekamer or main operational dashboard.
2. Confirm the pilot user is logged in with the expected role.
3. Open the seeded pilot casus.
4. Complete Aanmelding.
5. Start Matching.
6. Review the advisory provider recommendation and its explanation or trade-offs.
7. Select the intended provider.
8. Process Aanbiederreactie.
9. Confirm Plaatsing.
10. Move toward Intake.
11. Check the audit trail for the major state transitions.
12. Verify role-based visibility for coordinator, provider, and unauthorized/member access.
13. Confirm that Samenvatting is not presented as a primary workflow phase.
14. Confirm that Gemeente Validatie is not presented as a default primary workflow phase.
15. Verify that no production-ready claim is made anywhere in the observed flow.

## Post-session checklist

- [ ] observations logged in the feedback table
- [ ] any defects categorized by severity
- [ ] any risk register updates recorded
- [ ] blockers separated from non-blocking issues
- [ ] follow-up owners assigned
- [ ] next session decision recorded
- [ ] evidence archived in the release packet

## Go / no-go decision

| Decision item | Status |
|---|---|
| Demo-ready | GO |
| Closed-pilot-ready | GO |
| Production-ready | NO-GO |

### Decision note

Proceed with the first controlled closed-pilot session only if the pre-session checklist is complete and no blocking defect is open for the canonical workflow, permissions, or audit visibility path.
