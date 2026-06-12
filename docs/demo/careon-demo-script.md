# CareOn Demo Script and Click-Path

Date: 2026-06-12

This script follows the stabilized operational flow and keeps the demo inside the canonical happy path:

Aanmelding -> Matching -> Aanbiederreactie -> Plaatsing -> Intake

Support-only surfaces stay available, but they are not part of the main story.

## 1. Demo Objective

This demo proves that CareOn can move a care request from registration to matching, provider response, placement, and intake while keeping every next action visible and owned. It shows how the platform reduces uncertainty without turning into a passive dashboard. It also shows that provider visibility stays controlled and that matching remains advisory rather than an automatic assignment. The point of the demo is not to show every workspace in the product, but to show that the operational chain stays understandable, auditable, and moveable under capacity pressure.

## 2. Demo Setup

- Verified harness: `./scripts/pilot_demo.sh`
- Verified URL: `http://127.0.0.1:8011`
- Recommended role/context: start in the municipality context, then switch to the provider context for Intake
- Demo account:
  - Municipality: `demo_gemeente / pilot_demo_pass_123`
  - Provider for Intake: `demo_provider_kompas / pilot_demo_pass_123`
- Recommended browser/window setup:
  - One browser window
  - Zoom at 100%
  - Sidebar visible
  - Do not open multiple app tabs unless a route comparison is explicitly needed
- Routes used:
  - `/dashboard/`
  - `/casussen`
  - `/matching`
  - `/matching?openCase=<caseId>` for detail drill-down
  - `/beoordelingen`
  - `/plaatsingen`
  - `/intake` in the provider context
  - `/acties` only as support
- Verified screenshot set:
  - `docs/checkpoints/screenshots/careon-demo-fix-09-regiekamer-live.png`
  - `docs/checkpoints/screenshots/careon-demo-fix-10-aanmeldingen-live.png`
  - `docs/checkpoints/screenshots/careon-demo-fix-11-matching-live.png`
  - `docs/checkpoints/screenshots/careon-demo-fix-12-matching-detail-live.png`
  - `docs/checkpoints/screenshots/careon-demo-fix-13-reacties-live.png`
  - `docs/checkpoints/screenshots/careon-demo-fix-14-plaatsingen-live.png`
  - `docs/checkpoints/screenshots/careon-demo-fix-intake-provider-confirmed.png`
  - `docs/checkpoints/screenshots/careon-demo-rehearsal-08-acties.png`

## 3. Narrative Summary

CareOn helps a municipality move a care request from registration to matching, provider response, placement and intake while keeping every next action clear.

## 4. Click-Path Table

| Step | Page | Route | What to show | What to say | What not to click | Success signal |
|---|---|---|---|---|---|---|
| 1 | Regiekamer | `/dashboard/` | Operational overview, bottlenecks, next-best-action logic, and the current case flow | “This is the operational command view. It tells us what is blocked, who owns the next action, and where cases need attention.” | Do not open legacy detail workspaces or document-heavy surfaces | Audience sees the chain, blockers, and next action without needing explanation |
| 2 | Aanmeldingen | `/casussen` | One incomplete registration and the path to readiness for matching | “This is where a new request is brought into the chain and completed enough to move forward.” | Do not use legacy case-control or assessment pages | Audience sees how an incomplete case becomes ready for the next step |
| 3 | Matching | `/matching` | Advisory matching, reasoning, and trade-offs | “Matching is not assignment. It helps narrow the field with explainable reasoning, capacity, region, urgency, and complexity.” | Do not click unrelated provider profile or legacy decision pages | Audience understands why a provider is suggested and where uncertainty remains |
| 4 | Matching detail | `/matching?openCase=<caseId>` | Provider comparison and underbouwing | “Here we inspect the recommendation in more detail and compare the options before anyone moves the case forward.” | Do not switch into `CaseExecutionPage` unless you explicitly want a deeper drill-down | Audience sees the comparison and the reasoned recommendation |
| 5 | Aanbiederreactie / Reacties | `/beoordelingen` | Provider response follow-up: approved, rejected, or needs more information | “Now we see the provider response side. The platform keeps that feedback structured so the case can either advance or loop back with a clear reason.” | Do not open legacy assessment terminology or document management | Audience sees that provider response is tracked and actionable |
| 6 | Plaatsingen | `/plaatsingen` | Placement coordination and the transition toward intake | “This is the handoff point. We confirm placement and then move toward intake without losing the case context.” | Do not open unrelated detail workspaces unless you need one explicit placement drill-down | Audience sees the placement handoff and the next operational step |
| 7 | Intake | `/intake` | Post-placement intake follow-up in the provider context | “Voor de intake schakelen we naar het aanbiederperspectief, omdat intake-opvolging bij de aanbieder ligt.” | Do not backtrack into legacy workflow pages or present Intake as a municipality-only step | Audience sees that intake follows placement and is handled in the provider workspace |
| 8 | Acties, optional | `/acties` | Human tasks separated from automation | “Acties is the support queue. It shows human follow-up work, but it is not the core happy flow.” | Do not make this the main story | Audience understands the separation between workflow automation and manual tasks |

## 5. Suggested Spoken Script

### Regiekamer
- Opening sentence: “We start in Regiekamer, where the team sees the operational picture in one place.”
- What the user sees: Open cases, blockers, and the next best action.
- Why it matters: It keeps the chain moving and makes ownership visible.
- Transition: “Let’s open a request and follow it into the operational chain.”

### Aanmeldingen
- Opening sentence: “Here is the intake point for a new request.”
- What the user sees: An incomplete registration that can be prepared for matching.
- Why it matters: The request becomes structured enough to move without guesswork.
- Transition: “Once the request is ready, we move to Matching.”

### Matching
- Opening sentence: “Matching is advisory, not automatic.”
- What the user sees: Candidate providers, fit reasons, trade-offs, and confidence signals.
- Why it matters: The municipality can make a better decision with less uncertainty.
- Transition: “We can now open one case and inspect the recommendation in detail.”

### Matching detail
- Opening sentence: “This detail view shows why this provider is recommended.”
- What the user sees: Side-by-side comparison and underbouwing.
- Why it matters: The decision can be explained and defended.
- Transition: “After matching, provider response is tracked in Reacties.”

### Aanbiederreactie / Reacties
- Opening sentence: “This is where the provider response is captured.”
- What the user sees: Accepted, rejected, or more information needed.
- Why it matters: The chain stays auditable and the next step is always explicit.
- Transition: “When the response is positive, the case moves into Plaatsingen.”

### Plaatsingen
- Opening sentence: “Placement confirms that the case can move forward operationally.”
- What the user sees: The placement handoff and the route toward intake.
- Why it matters: The case does not disappear after a response; it stays owned.
- Transition: “Now we close the loop with Intake.”

### Intake
- Opening sentence: “Intake is the post-placement follow-up workspace in the provider context.”
- What the user sees: The active intake step after placement.
- Why it matters: The chain ends in a controlled handoff, not a loose handover.
- Transition: “If needed, we can show support work in Acties, but the main flow is complete.”

### Acties, optional
- Opening sentence: “Acties is support work, not the main journey.”
- What the user sees: Human tasks that sit alongside the operational flow.
- Why it matters: It keeps manual work visible without confusing it with the happy path.
- Transition: “That is the full happy-flow chain from registration to intake.”

## 6. Demo Guardrails

- Do not open legacy or quarantined pages during the core demo.
- Do not click `DocumentenPage` unless document management is explicitly part of the demo.
- Do not use `CaseExecutionPage` unless the audience asks for a deeper workflow drill-down.
- Avoid pages that still read as custom legacy layouts or that are outside the finalized operational flow.
- Keep the story inside the canonical happy flow:
  - Regiekamer
  - Aanmeldingen
  - Matching
  - Aanbiederreactie / Reacties
  - Plaatsingen
  - Intake
- The final harness uses the municipality context first and then switches to the provider context for Intake.

## 7. Questions to Prepare For

- How does CareOn decide matches?
  - It uses advisory matching with explainable reasoning, trade-offs, and fit signals. It narrows the field; it does not assign automatically.
- Can the municipality override a match?
  - Yes, within the operational flow it can steer, validate, and move the case forward, but it does not turn matching into an automatic assignment engine.
- What does the provider see?
  - Only the visibility and response needed for the operational handoff; the platform keeps provider visibility controlled.
- Is provider visibility controlled?
  - Yes. The platform is designed to show only the appropriate information at the appropriate step.
- What happens if a provider rejects?
  - The case remains auditable and can be re-routed, re-matched, or escalated with the reason preserved.
- What happens after placement?
  - The flow moves into Intake, where post-placement follow-up is handled in the provider context as the next operational step.
- Is Samenvatting a workflow phase?
  - No. It may appear as a support artifact or status, but it is not a visible primary phase in the stabilized flow.
- How is this different from a dashboard?
  - This is a decision and coordination workspace. It shows ownership, blockers, and the next best action.
- How do we prevent cases from getting lost?
  - Every step is tied to a visible owner, reason, and next action, and the case moves through a controlled sequence rather than a passive list.

## 8. Demo Risks and Mitigations

- Backend/data dependency
  - Risk: a sparse or inconsistent dataset can make matching, placement, or intake look incomplete.
  - Mitigation: rehearse with the seeded demo dataset and confirm the target case is available before the demo starts.
- Missing region fallback
  - Risk: a case or provider without region metadata can weaken the story.
  - Mitigation: choose a case with a valid region or note the fallback only if it appears.
- Compatibility routes
  - Risk: legacy compatibility routes such as `/beoordelingen` can confuse the audience if explained poorly.
  - Mitigation: present them as compatibility support for `Reacties` / `Aanbiederreactie`, not as a separate product concept.
- Legacy detail pages
  - Risk: accidental navigation into legacy or quarantined surfaces can derail the narrative.
  - Mitigation: stay on the canonical happy path and only drill down when a specific detail is needed.
- Provider visibility explanation
  - Risk: stakeholders may assume providers see too much.
  - Mitigation: state clearly that visibility is controlled and tied to the workflow step.
- Demo account/session issues
  - Risk: the demo can fail before the route story starts if the session is not ready.
  - Mitigation: verify the demo account/session before screen share and keep the correct tenant selected.
- SQLite locking during ad hoc rehearsal
  - Risk: extra local Django servers can lock the rehearsal database and interfere with repeated runs.
  - Mitigation: use the dedicated `./scripts/pilot_demo.sh` harness, which resets the database and starts one temporary server for the verified run.

## 9. Final Pre-Demo Checklist

- Build passes
- Design-token guardrail passes
- Operational design-law guard passes
- Screenshots captured for the canonical flow
- Seeded demo account works
- Sidebar counts align with the visible worklists
- No visible old workflow phases (`Samenvatting`, `Gemeente Validatie`, `Beoordeling`, `Aanbieder Beoordeling`)
- Correct browser zoom is set
- Rehearse once end-to-end before the live demo
- Verified harness command: `./scripts/pilot_demo.sh`
- Verified URL: `http://127.0.0.1:8011`
