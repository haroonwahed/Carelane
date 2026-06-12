# CareOn Demo Route Readiness Map

Date: 2026-06-12

Scope:
- Route and navigation readiness only.
- No code changes, no route changes, no redesign.
- Source inputs: `AGENTS.md`, `docs/checkpoints/careon-operational-ui-stabilization.md`, `docs/design/CAREON_UI_CONTRACT.md`, `docs/Careon_Operational_Constitution_v2.md`, `client/src/lib/routes.ts`, `client/src/components/examples/MultiTenantDemo.tsx`, `client/src/components/navigation/Sidebar.tsx`.

## Executive Summary

The stabilized demo shell is centered on the canonical happy flow and has now been verified through the pilot harness:

Aanmelding -> Matching -> Aanbiederreactie -> Plaatsing -> Intake

The final harness run confirms the demo path is executable end to end. The strongest route/path coverage is on:

- `/dashboard/` for Regiekamer
- `/casussen` for Aanmeldingen
- `/matching` for the matching queue and `/matching?openCase=<id>` for the verified matching detail drill-down
- `/beoordelingen` for Aanbiederreactie / Reacties via the compatibility route
- `/plaatsingen` for plaatsingen and placement drill-down
- `/intake` for the post-placement intake workspace in the provider context

The main remaining demo risk is not route availability but surface selection:

- `CaseExecutionPage` is a useful drill-down detail surface, but it is not part of the core happy-flow narrative.
- `ProviderProfilePage`, `CasusControlCenter`, `IntakeBriefing`, and `DocumentSection` are not first-class demo surfaces in the live shell and should stay out of the main demo path.
- `DocumentenPage` is routed and visible in navigation, but it is supporting infrastructure rather than happy-flow content.
- Intake is expected to use the provider context after placement; that is part of the verified demo story, not a defect.

## Demo Happy Flow Route Sequence

1. Regiekamer: `/dashboard/`
2. Aanmeldingen: `/casussen`
3. Matching queue: `/matching`
4. Matching detail: `/matching?openCase=<caseId>`
5. Aanbiederreactie / Reacties: `/beoordelingen`
6. Plaatsingen: `/plaatsingen`
7. Intake: `/intake` in the provider context

Notes:
- The matching queue and matching detail are both surfaced through the same route family.
- Placement detail is an in-page drill-down inside `/plaatsingen`, not a separate route.
- Case detail drill-down is routed via `/care/cases/<id>/` and is reachable from worklists and case actions.
- The final harness uses the matching detail drill-down as a verified inspection path, not as a separate product surface.

## Required Pages and Readiness

| Surface | Route / path | How it is reached | Demo role | Readiness | Main risk | Recommended action | Screenshot before demo |
|---|---|---|---|---|---|---|---|
| Regiekamer | `/dashboard/` | Sidebar item and default authenticated shell entry | Required | demo-ready | Visual consistency only | leave as-is | Yes |
| Aanmeldingen | `/casussen` | Sidebar item; also reachable from Regiekamer and case actions | Required | demo-ready | Count consistency / worklist data | leave as-is | Yes |
| Matching queue | `/matching` | Sidebar item; also from case actions and related worklist links | Required | demo-ready | Count/data dependency | leave as-is | Yes |
| Matching detail | `/matching?openCase=<caseId>` | Opened from matching queue row click or worklist handoff | Required in the flow, but detail-state only | demo-ready | Backend/data dependency | leave as-is | Yes |
| Aanbiederreactie / Reacties | `/beoordelingen` | Sidebar item; opened from matching and placement follow-up paths | Required | demo-ready | Terminology / compatibility route | leave as-is | Yes |
| Plaatsingen list | `/plaatsingen` | Sidebar item; opened from matching and aanbiederreactie follow-up paths | Required | demo-ready | Count consistency | leave as-is | Yes |
| Intake | `/intake` | Sidebar item; also reached after placement confirmation in the provider context | Required | demo-ready | Provider-context requirement | leave as-is | Yes |
| Acties | `/acties` | Sidebar item; notification/action follow-up entry point | Optional/supporting | demo-ready | Not part of canonical happy flow | leave as-is | Optional |

## Optional / Detail Pages and Readiness

| Surface | Route / path | How it is reached | Demo role | Readiness | Main risk | Recommended action | Screenshot before demo |
|---|---|---|---|---|---|---|---|
| CaseExecutionPage | `/care/cases/<id>/` | Case click from Aanmeldingen, Matching, Acties, Aanbiederreactie, Plaatsingen, or audit/open-entity handoff | Optional/detail drill-down | acceptable with minor risk | Terminology and backend/data dependency | visual primitive cleanup later | Yes, if the demo includes case drill-down |
| Placement detail | `/plaatsingen` with selected case state | Row click / placement drill-down inside the placement shell | Optional/detail drill-down | acceptable with minor risk | Backend/data dependency | leave as-is | Yes, if placement detail is shown |
| Provider profile | no live shell route; example/demo only | Example/demo files, not the live shell route tree | Optional, not part of core demo | defer | Legacy layout / visual inconsistency | remove from demo navigation | No |
| IntakeBriefing | no route; embedded support component only | Used as a helper component, not a routed surface | Optional/supporting | defer | Terminology / visual consistency | leave as-is | No |
| DocumentSection | no route; embedded support component only | Used as a helper component, not a routed surface | Optional/supporting | defer | Visual inconsistency | leave as-is | No |
| DocumentenPage | `/documenten` | Sidebar item under supporting/internal navigation | Optional/supporting | acceptable with minor risk | Not part of happy flow | remove from demo navigation unless explicitly needed | Optional |

## Deferred Legacy / Quarantined Surfaces

| Surface | Route / path | How it is reached | Demo role | Readiness | Main risk | Recommended action | Screenshot before demo |
|---|---|---|---|---|---|---|---|
| CasusControlCenter | no SPA shell route; quarantined legacy shell | Not linked from the SPA route tree; retained only for reference | Legacy/quarantined | defer | Legacy layout and older workflow terminology | remove from demo navigation | No |
| AssessmentDecisionPage | no live shell route in the stabilized demo host | Standalone component only; not a first-class demo shell page | Legacy/detail | defer | Workflow terminology and routing ambiguity | remove from demo navigation | No |

## Pages That Should Not Be Shown in the Demo

- `CasusControlCenter`
- `ProviderProfilePage`
- `IntakeBriefing`
- `DocumentSection`
- `AssessmentDecisionPage`

Also avoid showing `DocumentenPage` unless the demo explicitly needs document management evidence.

## Recommended Next Cleanup Order

1. Keep the canonical happy-flow navigation limited to Regiekamer, Aanmeldingen, Matching, Aanbiederreactie / Reacties, Plaatsingen, and Intake.
2. Remove `ProviderProfilePage` and `CasusControlCenter` from any demo navigation or sample entry points.
3. Decide whether `CaseExecutionPage` should remain a supported drill-down only, or be treated as an explicit demo step for case-level inspection.
4. Decide whether `DocumentenPage` belongs in the stakeholder demo at all, or only in internal/support walkthroughs.
5. Capture screenshots for the required flow pages and the case/placement detail drill-downs if those are part of the pilot script.

## Known Risks Before Pilot

- Matching and placement drill-downs depend on live case/provider data, so an empty or inconsistent dataset can make the demo feel incomplete even when the route is available.
- `CaseExecutionPage` is route-visible and useful, but it still reads as a deeper operational detail surface rather than a happy-flow page.
- `DocumentenPage` is visible in navigation but does not belong to the canonical flow; it should not distract from the main demo narrative.
- Legacy and quarantined surfaces still exist in the repo, so demo navigation must stay disciplined to avoid accidental exposure.
- Screenshot coverage should focus on the canonical flow first, then the drill-downs only if the pilot script explicitly includes them.
- Intake should be presented as a provider-context step after placement; that is the verified path in the final harness.
