# Carelane Pilot Feedback Log v1

**Purpose:** record observations from the first controlled closed-pilot session and follow-up sessions.
**Rule:** log facts only. Do not invent outcomes or fill in missing evidence.
**Capture rules:**

- every observation must be one separate row
- do not summarize multiple issues into one row
- capture what the participant did or said, not what we assume
- mark severity consistently
- link each observation to a screen or flow step

## Feedback table

| Date / time | Role | Screen / flow | Observation | Severity | Category | Proposed action | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | bug / UX friction / missing copy / permission issue / workflow confusion / performance / data issue | TBD | TBD | pending |

## Example rows

These rows are examples only. Do not treat them as real findings.

| Date / time | Role | Screen / flow | Observation | Severity | Category | Proposed action | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| Example only | Coordinator | Matching | Participant said the recommendation looked helpful, but asked where the trade-off explanation was shown. | medium | trust concern | Add a clearer explanation anchor in the matching view | Product / QA | example |
| Example only | Provider | Aanbiederreactie | Participant needed an extra click to understand why the case appeared in the queue. | low | UX friction | Review queue labeling and next-step copy | Product | example |
| Example only | Member / unauthorized | Case access | Participant expected to open a case but was blocked by role scope, which was the intended behavior but not immediately obvious. | high | permission issue | Clarify the blocked-access message and expected role boundary | Backend / UX | example |

## Severity definitions

- `blocker` - stops the pilot session or prevents a safe continuation
- `high` - serious issue that materially affects trust, access, or workflow correctness
- `medium` - important issue that should be fixed before the next session if feasible
- `low` - minor friction or copy issue that does not block the session

## Status guidance

- `pending` - observation is logged but not yet reviewed
- `triaged` - owner has reviewed the item
- `blocked` - item blocks the pilot or a safe session continuation
- `resolved` - item has been addressed and re-verified

## Notes

- Use one row per distinct observation.
- Prefer a separate row for each flow break, permission issue, or data issue.
- Add timestamps in the local pilot timezone.

## Category definitions

- `bug` - unexpected behavior or defect
- `UX friction` - the flow works, but the participant struggles with it
- `missing copy` - text or explanation is absent or insufficient
- `permission issue` - role-based access or visibility concern
- `workflow confusion` - uncertainty about the step order or next action
- `trust concern` - doubt about the correctness, safety, or reliability of the step
- `matching concern` - concern about match quality, explanation, or advisory clarity
- `performance` - slow response, lag, or operational delay
- `data issue` - missing, stale, incorrect, or inconsistent data
