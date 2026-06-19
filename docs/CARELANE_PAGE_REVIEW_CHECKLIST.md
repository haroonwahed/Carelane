# Carelane Page Review Checklist

## Purpose

Use this checklist when reviewing a Carelane page for visual hierarchy, operational clarity, and consistency with the Carelane design governance.

This is not a redesign spec.
It is a review standard.

Primary references:

- [`CARELANE_DESIGN_GOVERNANCE.md`](CARELANE_DESIGN_GOVERNANCE.md)
- [`CARELANE_UI_GOVERNANCE_WORKFLOW.md`](CARELANE_UI_GOVERNANCE_WORKFLOW.md)
- [`CARE_SPA_PAGE_LAYOUTS.md`](CARE_SPA_PAGE_LAYOUTS.md)

---

## 1) Universal Review Questions

Every page must answer these within 3 seconds:

1. What requires attention?
2. Who owns it?
3. What happens next?

### Pass criteria

- One dominant action is obvious.
- Ownership is visible without searching.
- The current state is visually clear.
- Secondary metadata does not compete with the primary workflow.
- The page feels calm, not noisy.

### Fail criteria

- More than one primary action competes.
- The page reads like a dashboard.
- Too much metadata is visible by default.
- The user has to read paragraphs to understand state.
- Cards, borders, or color are doing hierarchy work that layout should do.

---

## 2) Page Review Matrix

### Coordination / operational surfaces

#### `SystemAwarenessPage` (`/coordination`, legacy `/regiekamer`)

Review checklist:

- [ ] The top alert surface is the strongest signal when attention is needed.
- [ ] The dominant action is singular and clear.
- [ ] The flow board communicates past, current, future without extra labels.
- [ ] The worklist does not compete with the attention surface.
- [ ] The right rail remains subordinate.
- [ ] Filters stay present but secondary.

#### `WorkloadPage` (`/casussen`)

Review checklist:

- [ ] Each row reads as one casus.
- [ ] The row scan order is title, state, owner, next action, urgency, age.
- [ ] The row is compact and not card-like.
- [ ] Filters do not overpower the worklist.
- [ ] Metadata only appears when it changes the next decision.

#### `MatchingQueuePage` (`/matching`)

Review checklist:

- [ ] Candidate ranking is obvious.
- [ ] Fit, confidence, and reason are compact and scannable.
- [ ] The page does not feel like a mapping dashboard.
- [ ] The primary action is to inspect or evaluate a candidate, not to browse endlessly.
- [ ] Region and urgency are visible only if they change the decision.

#### `AanbiederBeoordelingPage` (`/beoordelingen`)

Review checklist:

- [ ] Provider identity is clear.
- [ ] One dominant provider decision is visually obvious.
- [ ] Response actions do not compete.
- [ ] Notes and evidence stay secondary.
- [ ] The page reads as an operational review surface, not a ticketing screen.

#### `PlacementTrackingPage` (`/plaatsingen`)

Review checklist:

- [ ] Placement status is clear immediately.
- [ ] The next follow-up action is visible.
- [ ] Provider and municipality context is compact.
- [ ] The page does not inflate placement details into a dossier.
- [ ] Overdue items remain visible without alarm clutter.

#### `ActiesPage` (`/acties`)

Review checklist:

- [ ] One action row equals one actionable object.
- [ ] The owner and due state are visible.
- [ ] Actions are sorted in a predictable operational order.
- [ ] Decorative metadata is minimized.
- [ ] The page does not duplicate signals already visible in coordination.

#### `SignalenPage` (`/signalen`)

Review checklist:

- [ ] The signal severity is the main visual signal.
- [ ] The owner is visible immediately.
- [ ] The next action is clear and singular.
- [ ] Signals remain compact rows, not cards.
- [ ] Alert content is rare and scoped.

#### `ZorgaanbiedersPage` (`/zorgaanbieders`)

Review checklist:

- [ ] Provider identity is instantly readable.
- [ ] Coverage, capacity, and response state are scannable.
- [ ] The page does not become a directory-like dump.
- [ ] One dominant action per provider context is apparent.
- [ ] Region and service data are shown only when decision-relevant.

#### `GemeentenPage` (`/gemeenten`)

Review checklist:

- [ ] Municipality identity is clear.
- [ ] Financing / validation state is obvious.
- [ ] The page is operational, not census-like.
- [ ] Region context appears only when relevant.
- [ ] The page supports routing and validation, not general browsing.

#### `RegiosPage` (`/regios`)

Review checklist:

- [ ] The region type is obvious.
- [ ] Search and typeahead are compact and purposeful.
- [ ] Municipality data is not confused with youth-region data.
- [ ] Coverage and filtering remain secondary to the region itself.
- [ ] The page does not expose unnecessary taxonomy noise.

#### `DocumentenPage` (`/documenten`)

Review checklist:

- [ ] The document list is the primary element.
- [ ] The preview or metadata pane is subordinate.
- [ ] The page remains calm and operational.
- [ ] There is no extra dashboard layering.
- [ ] Related entity context is visible only if it helps the task.

### Detail surfaces

#### `CaseExecutionPage` (`/care/cases/:id/`)

Review checklist:

- [ ] Current state is visible first.
- [ ] Ownership of the next action is clear.
- [ ] The next action is visually connected to the state.
- [ ] The workflow path reads as past, current, future.
- [ ] Context sections do not compete with the top operational cluster.
- [ ] No extra explanatory text is needed to understand what to do.

#### `PlacementPage` (`/plaatsingen/:id` or detail equivalent)

Review checklist:

- [ ] Placement outcome is the main story.
- [ ] Follow-up actions are singular and obvious.
- [ ] The detail page feels operational, not archival.
- [ ] The active step is clearly distinguished from completed ones.

#### `MatchingPageWithMap`

Review checklist:

- [ ] Map content does not overpower the operational object.
- [ ] Candidate evaluation remains the primary task.
- [ ] Detail and map support the same decision, not separate narratives.
- [ ] The page remains advisory, not auto-assigning.

#### `NieuweCasusPage` (`/casussen/nieuw`)

Review checklist:

- [ ] The form is linear and calm.
- [ ] Each step feels like progression, not a wall of fields.
- [ ] Important distinctions (gemeente vs jeugdregio, etc.) are explicit.
- [ ] No extra helper copy is used to compensate for poor structure.
- [ ] The form never feels denser than necessary.

### Governance / support surfaces

#### `AudittrailPage`

Review checklist:

- [ ] Evidence and chronology are the point.
- [ ] No action cluster competes with the audit trail.
- [ ] The surface remains restrained and inspectable.

#### `RapportagesPage`

Review checklist:

- [ ] Reporting is the purpose, not dashboard theater.
- [ ] Key metrics are compact and interpretable.
- [ ] The page does not overwhelm users with unnecessary charts.

#### `InstellingenPage`

Review checklist:

- [ ] The workspace feels governed and deliberate.
- [ ] Navigation and settings do not compete visually.
- [ ] The page does not look like a generic admin console.

---

## 3) Review Scoring

Score each page from 1 to 10:

- Scanability
- Noise
- Hierarchy
- Action clarity
- Ownership clarity
- Operational focus

### Recommendation bands

- 9-10: ship-ready
- 8: acceptable with minor polish
- 7: acceptable only with a documented follow-up
- 6 or below: revise before merge

---

## 4) Review Notes Template

When reviewing a page, write:

1. What requires attention?
2. Who owns it?
3. What happens next?
4. What is louder than necessary?
5. What should be hidden or collapsed?
6. What is the one dominant action?

---

## 5) Enforcement Guidance

- Do not solve hierarchy issues with more copy.
- Do not solve hierarchy issues with more color.
- Do not solve hierarchy issues with more containers.
- Prefer simplification over addition.
- If a page cannot be understood quickly, reduce it.

