# Carelane Demo Rehearsal Check

Date: 2026-06-12

## Environment Used

- Rehearsal harness: `./scripts/pilot_demo.sh`
- Temporary Django server: `http://127.0.0.1:8011`
- Browser automation: Chromium headless via Playwright
- Screen size: `1440x1000`
- Primary rehearsal login: `demo_gemeente / pilot_demo_pass_123`
- Provider login for Intake verification: `demo_provider_kompas / pilot_demo_pass_123`
- Note: ad hoc Django servers can lock the SQLite rehearsal database; the verified harness avoids this by resetting the DB and using one temporary server.

## Login / Account Used

- Municipality flow: `demo_gemeente / pilot_demo_pass_123`
- Provider flow for Intake: `demo_provider_kompas / pilot_demo_pass_123`
- The provider context is expected for Intake follow-up after placement.

## Step-by-Step Result Table

| Step | Page | Route | Load status | Visual status | Count status | CTA / empty-state status | Screenshot path | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | Regiekamer | `/dashboard/` | Pass | Clean operational shell; no clipping or broken chrome | Counts align with visible signals | Clear next action shown | `docs/checkpoints/screenshots/carelane-demo-fix-09-regiekamer-live.png` | Canonical terminology visible; no old primary workflow labels. |
| 2 | Aanmeldingen | `/casussen` | Pass | Worklist loads normally; no error panel | Counts align with the visible worklist state | Clear next action shown | `docs/checkpoints/screenshots/carelane-demo-fix-10-aanmeldingen-live.png` | Attention banner and sidebar counts are consistent in the verified harness. |
| 3 | Matching | `/matching` | Pass | Matching queue renders without visual break | Counts align with visible rows | Clear next action shown | `docs/checkpoints/screenshots/carelane-demo-fix-11-matching-live.png` | Canonical workflow tabs are visible. |
| 4 | Matching detail | `/matching?openCase=2` | Pass | Provider comparison/underbouwing surface renders | Counts align with the selected case | Clear next action shown | `docs/checkpoints/screenshots/carelane-demo-fix-12-matching-detail-live.png` | Detail surface is usable and remains advisory. |
| 5 | Aanbiederreactie / Reacties | `/beoordelingen` | Pass | Compatibility route renders the Reacties view correctly | Counts align with visible queue rows | Clear next action shown | `docs/checkpoints/screenshots/carelane-demo-fix-13-reacties-live.png` | UI says Reacties/Aanbiederreactie; no old primary phase labels visible. |
| 6 | Plaatsingen | `/plaatsingen` | Pass | Placement coordination view renders cleanly | Counts align with visible rows | Clear next action shown | `docs/checkpoints/screenshots/carelane-demo-fix-14-plaatsingen-live.png` | Reads as transition toward intake. |
| 7 | Intake | `/intake` | Pass | Provider intake workspace renders cleanly after provider login | Counts align with visible queue state | Clear next action shown | `docs/checkpoints/screenshots/carelane-demo-fix-intake-provider-confirmed.png` | Intake is reachable in the provider context and reads as post-placement follow-up. |
| 8 | Acties | `/acties` | Pass | Support-only shell renders cleanly | Counts align with visible rows | Clear next action shown | `docs/checkpoints/screenshots/carelane-demo-rehearsal-08-acties.png` | Support surface only; does not disrupt the happy-flow demo. |

## Blockers

- None in the verified rehearsal harness.

## P1 Fixes Needed Before Demo

- None required for the current canonical happy-flow rehearsal.

## P2 Polish Only

- Refresh screenshots if the pilot dataset is reseeded again.
- If desired, capture one fresh Acties screenshot alongside the current live-flow set.

## Final Demo Readiness Verdict

ready with minor notes
