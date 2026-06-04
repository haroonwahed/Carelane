# CareOn Design Governance

## Purpose

This document turns the abstract visual and interaction doctrine into a platform-wide operating standard.

It does not redesign CareOn.
It defines the rules that keep CareOn calm, scannable, operational, and trustworthy across pages.

Primary references:

- [`CareOn_Design_Constitution_v1_3.md`](CareOn_Design_Constitution_v1_3.md)
- [`CareOn_Operational_Constitution_v2.md`](CareOn_Operational_Constitution_v2.md)
- [`CAREON_UI_GOVERNANCE_WORKFLOW.md`](CAREON_UI_GOVERNANCE_WORKFLOW.md)
- [`CARE_SPA_PAGE_LAYOUTS.md`](CARE_SPA_PAGE_LAYOUTS.md)

---

## 1) Linear Design Laws

Linear feels professional because it follows a consistent set of laws:

1. One dominant action per surface.
2. Lists carry the primary workflow; cards are secondary.
3. Metadata is present only when it changes the next decision.
4. Hierarchy is communicated through spacing, scale, and placement first.
5. Secondary actions are visually quieter than the primary action.
6. Detail views separate state, ownership, and next action cleanly.
7. The same object looks the same everywhere.
8. The shell is stable, so content can carry the focus.
9. Emphasis is rare and therefore meaningful.
10. Navigation is predictable and never fights the content.
11. Dense content is grouped, not scattered.
12. Status signals are compact and consistent.
13. Tone stays calm even under urgency.
14. Empty, loading, and error states are structurally predictable.
15. Visual rhythm is constant across pages.
16. The user should never need to decode the page structure again.
17. Detail pages preserve context while keeping the next move visible.
18. Labels are concise and operational.
19. The page answers “what now?” before “what else?”
20. Attention is controlled, never loud.

Why this works:

- it reduces scanning cost
- it minimizes cognitive switching
- it keeps action obvious
- it creates trust through consistency
- it allows dense operational data without chaos

---

## 2) CareOn Design Laws

CareOn follows the same structural discipline, but with care-coordination semantics.

1. Every operational surface must answer: what needs attention, who owns it, what happens next.
2. One object equals one representation across the platform.
3. CareOn is a control layer, not a dossier.
4. Matching is advisory only.
5. Municipal validation is a gate, not a substitute for provider judgment.
6. A blocked case must be visible without reading paragraphs.
7. The next best action must be visually dominant.
8. Ownership must be visible before detail.
9. The workflow path must read as past, present, future.
10. Metadata is only visible if it affects a decision.
11. If it does not change action, it is secondary or hidden.
12. One surface, one purpose.
13. Attention surfaces are rare and action-oriented.
14. The same role vocabulary must appear everywhere.
15. The active state wins by placement, not by extra decoration.
16. Context sections must not compete with the workflow cluster.
17. Worklists remain rows, not dashboards.
18. Detail pages remain operational, not archival.
19. Alerts must lead to an action.
20. The platform should stay calm even when the data is urgent.
21. Never solve hierarchy with more borders or more colors.
22. Never add helper copy to solve a hierarchy issue.
23. Never use a card stack to hide structural ambiguity.
24. Never create a second competing action cluster.
25. Never expose internal mechanics if the user does not need them.

---

## 3) Universal Worklist Standard

### Required fields

- Title
- Current state
- Owner
- Next action
- Urgency
- Age / waiting time

### Optional fields

- Region
- Provider
- Short reason
- Category
- Count badges when they change the decision

### Hidden fields

- Raw codes
- Internal ids
- Audit mechanics
- Long notes
- Technical phase names

### Scan order

1. Title
2. State
3. Owner
4. Next action
5. Urgency
6. Region / provider
7. Age

### Worklist rules

- Keep rows compact.
- Avoid card-like row containers.
- Use one row = one operational object.
- Do not add duplicate metadata chips.
- Show only metadata that changes the decision.
- Keep sorting predictable.
- Keep filters present but secondary.

### CareOn worklist pages

- [`WorkloadPage.tsx`](../client/src/components/care/WorkloadPage.tsx)
- [`MatchingQueuePage.tsx`](../client/src/components/care/MatchingQueuePage.tsx)
- [`PlacementTrackingPage.tsx`](../client/src/components/care/PlacementTrackingPage.tsx)
- [`ActiesPage.tsx`](../client/src/components/care/ActiesPage.tsx)
- [`SignalenPage.tsx`](../client/src/components/care/SignalenPage.tsx)
- [`ZorgaanbiedersPage.tsx`](../client/src/components/care/ZorgaanbiedersPage.tsx)
- [`GemeentenPage.tsx`](../client/src/components/care/GemeentenPage.tsx)
- [`RegiosPage.tsx`](../client/src/components/care/RegiosPage.tsx)
- [`DocumentenPage.tsx`](../client/src/components/care/DocumentenPage.tsx)

---

## 4) Casus Representation Standard

### Primary information

- Case reference
- Current phase
- Owner
- Next action
- Blocker or attention state

### Secondary information

- Region
- Provider
- Urgency band
- Age / elapsed time

### Contextual information

- Short reason
- History summary
- Related items
- Audit trail access

### CareCaseRow primitive

Every casus representation should share this shape:

- left: identity and state
- center: owner and next action
- right: urgency and age
- secondary rail: contextual metadata

### Casus pages

- [`CaseExecutionPage.tsx`](../client/src/components/care/CaseExecutionPage.tsx)
- [`WorkloadPage.tsx`](../client/src/components/care/WorkloadPage.tsx)
- [`MatchingQueuePage.tsx`](../client/src/components/care/MatchingQueuePage.tsx)
- [`PlacementTrackingPage.tsx`](../client/src/components/care/PlacementTrackingPage.tsx)

---

## 5) Action Hierarchy

### Platform rule

One dominant action per operational surface.

### Object rule

One dominant action per object.

### Action ladder

1. Primary action: moves the case forward.
2. Secondary action: supporting action that does not compete.
3. Tertiary action: utility / navigation / view-only.

### CareOn examples

- `Open aanvragen (1)` as the dominant operational CTA on coordination surfaces.
- `Vraag reactie aan` on provider review surfaces.
- `Start intake` after placement confirmation.
- `Bevestig plaatsing` on placement surfaces.

### Forbidden patterns

- competing primary CTAs
- decorative buttons
- actions that only “open” without changing the decision path
- multiple equal-weight CTAs in one cluster

---

## 6) Attention Surface Standard

### Neutral state

Use when the case is moving normally and nothing blocks progression.

Allowed:

- current state
- owner
- next action
- one compact CTA

Forbidden:

- explanatory paragraphs
- dashboard widgets
- large banners

### Attention state

Use when something needs focus but the case is not fully blocked.

Allowed:

- short issue summary
- owner
- one dominant action
- minimal supporting metadata

Forbidden:

- multi-action banners
- nested cards
- duplicate emphasis

### Critical state

Use when the surface is blocked, overdue, or at operational risk.

Allowed:

- strongest state signal
- owner
- next action
- one primary CTA

Forbidden:

- verbose helper text
- extra explanatory blocks
- dashboard-style metrics

---

## 7) Metadata Governance

### Visible metadata

Only show metadata if it changes the next action:

- region when it affects routing
- urgency band
- owner
- age / waiting time
- provider when it changes the decision

### Collapsed metadata

- short reason
- historical context
- related counts
- non-blocking state details

### Hidden metadata

- raw codes
- internal ids
- long notes
- technical phase labels
- audit internals

### Governance test

If a field does not change a decision, hide it.

---

## 8) Universal Detail Page Standard

### Required architecture

1. Hero
2. Attention layer
3. Workflow visibility
4. Core context sections
5. Decision sections
6. Primary action placement

### Detail page rules

- The hero must show the current state.
- The attention layer must be the strongest signal when the object is blocked.
- The workflow must remain visible but not noisy.
- Context sections must never compete with the primary action cluster.
- The primary action must be adjacent to the owner and the current state.

### Pages in scope

- Casus detail
- Provider detail
- Gemeente detail
- Matching detail
- Plaatsing detail

### Current implementation anchors

- [`CaseExecutionPage.tsx`](../client/src/components/care/CaseExecutionPage.tsx)
- [`AanbiederBeoordelingPage.tsx`](../client/src/components/care/AanbiederBeoordelingPage.tsx)
- [`GemeentenPage.tsx`](../client/src/components/care/GemeentenPage.tsx)
- [`MatchingPageWithMap.tsx`](../client/src/components/care/MatchingPageWithMap.tsx)
- [`PlacementPage.tsx`](../client/src/components/care/PlacementPage.tsx)

---

## 9) Uniformity Audit Framework

Score every operational page on a 1-10 scale:

- Scanability
- Noise
- Hierarchy
- Action clarity
- Ownership clarity
- Operational focus

### Pass threshold

- Average score: 8 or higher
- No category below 7 on operational surfaces

### Audit questions

1. Can the user see what needs attention in 3 seconds?
2. Can the user see who owns the next step in 3 seconds?
3. Can the user see what happens next without reading extra copy?
4. Is there only one dominant action?
5. Are non-essential signals suppressed?
6. Does the page feel calm under pressure?

---

## 10) Page Mapping

### Unified list / coordination surfaces

| Page | Primary responsibility | Dominant action | Notes |
| --- | --- | --- | --- |
| `SystemAwarenessPage` | Operational coordination | open requests / critical attention | attention surface, flow board, worklist |
| `WorkloadPage` | Case worklist | open or continue case | primary queue row standard |
| `MatchingQueuePage` | Matching queue | inspect match candidates | score, fit, and owner |
| `PlacementTrackingPage` | Placement oversight | inspect placement / follow-up | compact operational status |
| `ActiesPage` | Action queue | execute pending action | action-first queue |
| `SignalenPage` | Operational signals | inspect critical signal | signal priority and ownership |
| `ZorgaanbiedersPage` | Provider oversight | inspect provider / coverage | provider capacity and response |
| `GemeentenPage` | Municipal oversight | inspect municipal routing | financing / compatibility context |
| `RegiosPage` | Regional coverage | inspect region coverage | youth-region taxonomy |
| `DocumentenPage` | Operational documents | open document / related item | keep secondary to workflow |

### Detail surfaces

| Page | Primary responsibility | Dominant action | Notes |
| --- | --- | --- | --- |
| `CaseExecutionPage` | Casus detail | move case forward | strongest operational detail page |
| `AanbiederBeoordelingPage` | Provider review | accept / reject / request info | one dominant provider decision |
| `PlacementPage` | Placement detail | confirm / follow up | placement outcome focus |
| `MatchingPageWithMap` | Match detail | evaluate candidate | advisory matching only |

### Supporting surfaces

| Page | Role | Design rule |
| --- | --- | --- |
| `NieuweCasusPage` | Intake creation | keep form calm, structured, and linear |
| `AudittrailPage` | Evidence / trace | audit history only, no workflow competition |
| `RapportagesPage` | Reporting | operational reporting, not dashboard theater |
| `InstellingenPage` | Governance | dedicated workspace, not list scaffold |

---

## 11) Top Improvements for CareOn

1. Standardize the worklist row primitive everywhere.
2. Remove duplicate metadata from rows.
3. Enforce one dominant CTA per surface.
4. Make ownership stronger in the top third of detail pages.
5. Keep blocked states visually rare and highly legible.
6. Reduce competing cards on operational pages.
7. Normalize case identity everywhere.
8. Standardize alert surfaces.
9. Keep filters secondary to the queue itself.
10. Make the workflow path read as past, present, future.
11. Remove helper copy that is only solving hierarchy issues.
12. Ensure region, provider, and urgency fields only appear where they affect action.
13. Make detail pages less dossier-like and more operational.
14. Keep secondary metadata collapsed or hidden by default.
15. Make the primary action adjacent to the owner.
16. Keep list pages calmer than detail pages.
17. Keep attention surfaces rare.
18. Reduce visual competition in right rails.
19. Preserve consistency between role views.
20. Enforce the audit framework before shipping new surfaces.

---

## 12) Enforcement Notes

- If a page cannot answer attention, owner, and next action within 3 seconds, it is not compliant.
- If a page needs a second dominant action, the page hierarchy is wrong.
- If metadata does not change a decision, it should not be visible.
- If a surface starts to feel like a dashboard, it should be simplified.
- If a new page is introduced, it must inherit an approved primitive pattern.

---

## 13) Recommended Review Order

When auditing or changing CareOn:

1. Worklist pages
2. Detail pages
3. Attention surfaces
4. Metadata surfaces
5. Supporting pages

This order catches the highest-risk hierarchy drift first.

---

## 14) Governance Summary

CareOn should feel:

- calm
- operational
- trustworthy
- high-signal
- low-noise

Its job is not to look like Linear.
Its job is to apply the same discipline to care coordination:

- less noise
- clearer ownership
- one next action
- stable hierarchy
- platform-wide consistency

