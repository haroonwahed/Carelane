# Carelane Design System & Core Experience Implementation Brief

## Role

Act as Carelane’s senior product designer, design-system architect, frontend architect, and implementation reviewer.

Your job is not to redesign isolated screens. Your job is to establish a complete, reusable, coded, documented, and enforceable Carelane design system, then apply it to the three highest-value operational pages.

Work from the existing repository. Reuse and improve what already exists. Do not create a parallel component system.

---

## Authoritative Sources

Treat these files as product and technical source of truth:

- `Carelane_Product_Design_Constitution_v1_2.docx`
- `Carelane_Technical_Foundation_v1_2.docx`

Also inspect all current Carelane design documentation, shared components, layout primitives, theme tokens, route structure, state management, API clients, permissions, workflows, tests, and Storybook configuration if present.

The canonical operational workflow is:

`Aanmelding → Matching → Aanbiederreactie → Plaatsing → Intake`

Do not introduce additional top-level phases such as `Samenvatting`, `Gemeente Validatie`, or `Beoordeling` unless explicitly approved.

---

# Primary Objective

Create a complete Carelane design-system foundation and apply it to these three pages:

1. **Regiekamer**
2. **Casuswerkruimte**
3. **Matchingwerkruimte**

These pages must feel like parts of one product, not three separate concepts.

The resulting product should feel:

- calm
- premium
- operational
- trustworthy
- modern
- restrained
- humane
- information-rich without feeling crowded

Carelane is not a generic SaaS dashboard, KPI cockpit, CRM, or admin panel.

It is operational infrastructure for care allocation under scarcity.

---

# Core UX Principles

Every operational screen must answer within seconds:

1. What needs attention now?
2. Why is it blocked or at risk?
3. What is the next best action?
4. Who owns that action?
5. What happens after the action?

Use one dominant CTA per work surface.

Do not expose system automation as a manual CTA.

Do not use vague labels such as:

- Bekijk aandacht
- Analyseer proces
- Workflow optimaliseren
- Slimme automatisering
- Genereer samenvatting

Use concrete operational language such as:

- Maak casus compleet
- Vraag gegevens op
- Start matching
- Verstuur naar aanbieder
- Plan intake
- Bevestig plaatsing

---

# Healthcare UX Patterns to Apply

Translate the strongest patterns from mature healthcare platforms into Carelane:

## Persistent context

When working on a casus, keep the following visible:

- client identity
- case ID
- urgency
- current workflow phase
- municipality
- assigned coordinator
- elapsed time
- blocker
- next action

## Master-detail-context layout

Prefer:

`Queue / list | Main workspace | Context rail`

Use this where it improves operational flow.

## Serious search and filtering

Support:

- saved views
- recent searches
- assigned to me
- advanced filters
- include and exclude filters
- active filter chips
- sort
- urgency
- region
- phase
- care need
- owner
- provider status
- blocked state

## Semantic status use

Use colour only when it communicates state:

- success
- warning
- critical
- neutral
- selected / active

Do not use decorative colours without meaning.

## Structured density

Do not blindly reduce information.

Use compact but clear information hierarchy where users need to scan many records.

---

# Visual Direction

## Shell

Use:

- deep navy or near-black navigation shell
- light or softly tinted operational work surfaces where appropriate
- restrained purple for primary actions, selection, active states, and focus
- muted amber for pending attention
- muted red for blockers and escalation
- slate and gray-blue neutrals

Avoid:

- full-screen glowing dark interfaces
- dramatic gradients
- excessive shadows
- excessive rounded cards
- neon accents
- decorative glassmorphism
- every content block becoming a separate floating card

## Navigation

Preferred:

- 220–240 px primary sidebar
- clear labels
- compact icon treatment
- no permanent subtitles under every navigation item
- contextual sub-navigation inside complex modules
- 64–72 px top bar

## Surfaces

Use a clear hierarchy:

- Level 0: application canvas
- Level 1: page surface
- Level 2: active operational panel
- Level 3: overlay, dialog, focused escalation state

## Typography

Typography should be:

- editorial
- calm
- readable
- confident
- operational

Avoid oversized marketing-style headings inside the application.

---

# Required Design-System Architecture

Create or normalize the following structure. Adapt paths to the repository conventions where necessary.

```text
/docs/design-system/
  00-principles.md
  01-foundations.md
  02-tokens.md
  03-primitives.md
  04-domain-components.md
  05-interaction-patterns.md
  06-page-archetypes.md
  07-content-and-copy.md
  08-accessibility.md
  09-responsive-behaviour.md
  10-functional-contracts.md
  11-do-and-dont.md
  12-migration-plan.md

/src/design-system/
  tokens/
  primitives/
  domain/
  patterns/
  layouts/
```

Do not force this exact location if the repository already has a better coherent structure. Prefer consolidation over duplication.

---

# Phase 1: Repository Audit

Before changing production UI, inspect the repository and create:

## 1. `CARELANE_DESIGN_SYSTEM_INVENTORY.md`

Document:

- current token files
- theme configuration
- typography
- spacing
- radii
- shadows
- icon usage
- layout primitives
- reusable UI components
- domain components
- tables
- filters
- dialogs
- forms
- states
- shell and navigation
- Storybook setup
- responsive patterns
- accessibility tooling
- visual test setup

For every relevant component, record:

- file path
- purpose
- current usage
- variants
- whether it should be kept, refactored, merged, or retired

## 2. `CARELANE_COMPONENT_DUPLICATION_REPORT.md`

Identify:

- duplicate buttons
- duplicate badges
- duplicate cards
- duplicate status treatments
- duplicate tables
- duplicate page headers
- duplicate layout wrappers
- arbitrary spacing values
- arbitrary colour values
- one-off CSS
- shell inconsistencies
- legacy component systems

## 3. `CARELANE_UI_ACTION_BACKEND_MATRIX.md`

For each important CTA and workflow transition, document:

- screen
- action
- user role
- visibility conditions
- enabled conditions
- API endpoint or command
- permission check
- validation
- success state
- failure state
- audit event
- resulting workflow state

Do not assume the frontend authorizes workflow transitions.

The backend remains the source of truth.

## 4. `CARELANE_SCREEN_UNIFORMITY_MATRIX.md`

For all current routes and screen families, record:

- shell
- page header
- spacing
- content width
- card style
- buttons
- badges
- tables
- filters
- responsiveness
- overflow risk
- domain terminology
- current design-system compliance
- action required

---

# Phase 2: Lock the Foundations

Create or normalize semantic design tokens.

At minimum define:

## Colour tokens

```text
care-bg-canvas
care-bg-shell
care-surface-1
care-surface-2
care-surface-3
care-border-subtle
care-border-strong
care-text-primary
care-text-secondary
care-text-muted
care-accent-primary
care-accent-hover
care-status-success
care-status-warning
care-status-critical
care-status-neutral
care-focus-ring
```

## Typography tokens

Define:

- display
- page title
- section title
- body
- compact body
- label
- metadata
- table text
- helper text

## Layout tokens

Define:

- sidebar width
- topbar height
- page max width
- page padding
- content gaps
- panel widths
- context rail width
- queue width
- table density
- mobile breakpoints

## Surface tokens

Define:

- radii
- borders
- elevations
- overlay
- backdrop
- selected state
- active state
- disabled state

## Motion tokens

Define:

- fast
- standard
- slow
- easing
- focus transition
- panel transition
- dialog transition

No new arbitrary visual values may be introduced after this phase unless documented.

---

# Phase 3: Normalize Primitives

Audit and normalize:

- Button
- IconButton
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Badge
- Avatar
- Tooltip
- Dialog
- Sheet
- Tabs
- Table
- DropdownMenu
- CommandMenu
- EmptyState
- Skeleton
- Toast
- Alert
- Pagination
- Breadcrumb
- SearchInput
- FilterChip

Each primitive must support relevant states:

- default
- hover
- focus
- active
- disabled
- loading
- error
- read-only

Use existing accessible foundations such as Radix or shadcn where already present.

Do not replace stable existing foundations without a clear reason.

---

# Phase 4: Build Carelane Domain Components

Normalize existing Carelane components and add missing domain components.

Required core set:

```text
CarePageScaffold
CareShell
CareSidebar
CareTopbar
PageHeroHeader
PrimaryActionButton
CareSection
CareAlertCard
CareStatusBadge
FlowPhaseBadge
CareWorkRow
CareCaseHeader
CareCaseIdentity
CarePhaseStepper
CareNextActionPanel
CareBlockerPanel
CareWorkQueue
CareWorkQueueRow
CareFilterBar
CareFilterDrawer
CareSavedView
CareTimeline
CareActivityItem
CareDocumentRow
CareProviderMatchCard
CareMatchScore
CareMatchExplanation
CareTradeoffList
CareProviderResponseCard
CarePlacementSummary
CareOwnershipCard
CareDeadlineIndicator
CareMetricLink
CareAuditEvent
CareContextRail
```

For each component document:

- purpose
- props
- variants
- interaction
- empty state
- loading state
- error state
- permission state
- responsive behaviour
- approved use
- prohibited use

---

# Phase 5: Build the Three Core Pages

## Page 1: Regiekamer

### Purpose

Operational triage, bottleneck visibility, workflow health, and next-best-action orchestration.

### Required structure

1. Page header
2. Operational summary
3. Five-phase workflow overview
4. Attention queue
5. Bottlenecks
6. Recent activity or handoffs
7. Filters or saved view where useful

### Rules

Metrics must link to actual filtered work.

Do not show decorative KPI cards with meaningless percentage changes.

Good example:

`12 casussen vertraagd → Bekijk de 12 casussen`

Every card or metric must support a decision or action.

### Required states

- normal
- no urgent work
- partial loading
- API error
- permissions-limited view
- long data
- narrow viewport

---

## Page 2: Casuswerkruimte

### Purpose

Provide a complete operational workspace for one casus without forcing the user to navigate across fragmented pages.

### Preferred structure

```text
Contextual navigation / timeline
Main casus workspace
Right context rail
```

### Persistent case header

Show:

- client identity
- age
- case ID
- municipality
- urgency
- current phase
- owner
- elapsed time
- main blocker
- one dominant action

### Suggested tabs or sections

- Overzicht
- Hulpvraag en situatie
- Matching
- Documenten
- Gesprekken
- Tijdlijn
- Audit

Do not duplicate the same information in multiple tabs.

### Main content

Show:

- situation summary
- care needs
- constraints
- current status
- missing information
- ownership
- recent communication
- related documents
- workflow progress
- next best action

### Context rail

Show:

- blocker
- deadline
- owner
- required decision
- contact
- linked provider
- recent audit event

### Required states

- incomplete case
- waiting for submitter
- ready for matching
- waiting for provider
- provider rejected
- placement confirmed
- intake scheduled
- restricted access
- archived
- loading
- error

---

## Page 3: Matchingwerkruimte

### Purpose

Compare providers, understand recommendation rationale, inspect trade-offs, and select a provider to receive the case.

### Preferred structure

```text
Client and needs summary
Ranked provider comparison
Selected provider detail rail
```

### Required elements

- client summary
- essential care needs
- match criteria
- ranked provider cards
- match score
- score explanation
- trade-offs
- availability
- region and distance
- specialization
- capacity
- response time
- active caseload where relevant
- selected provider detail
- manual override
- audited override reason
- dominant CTA: send request to provider

### Matching rules

Matching is advisory.

Do not imply certainty.

Never present only a score.

Every recommendation must explain:

- why the provider matches
- what constraints were satisfied
- what trade-offs exist
- what information may be incomplete
- why another provider may still be preferable

### Required states

- recommendations available
- no suitable providers
- incomplete matching data
- provider unavailable
- selected provider
- override requested
- override not permitted
- sending request
- request failed
- request sent

---

# Phase 6: Storybook

If Storybook exists, expand it.

If it does not exist, add it unless the repository architecture makes this clearly unsuitable.

Document:

## Foundations

- colours
- typography
- spacing
- radii
- borders
- shadows
- icons
- breakpoints

## Primitives

Every primitive and state.

## Domain components

Every Carelane component and state.

## Page patterns

- Regiekamer
- queue
- master-detail-context
- case workspace
- matching workspace
- provider response
- placement
- empty states
- error states
- permission states

Add accessibility checks where possible.

---

# Phase 7: Functional Integration

For every action on the three pages:

1. Trace it to the real backend endpoint or command.
2. Confirm permissions are API-enforced.
3. Confirm state-machine rules are enforced server-side.
4. Confirm audit logging.
5. Confirm loading and failure behaviour.
6. Confirm stale data behaviour.
7. Confirm optimistic updates are safe.
8. Confirm role-based visibility.
9. Add tests.

Do not create placeholder actions unless clearly marked and isolated.

No dead buttons.

No mocked production data unless the repository is explicitly running in demo mode.

---

# Phase 8: Testing and Quality Gates

Add or update:

- unit tests
- component tests
- interaction tests
- accessibility tests
- visual regression tests
- route smoke tests
- workflow transition tests
- permission tests
- responsive tests
- overflow tests

At minimum verify:

- 1280 px desktop
- 1440 px desktop
- 1600 px desktop
- tablet
- narrow laptop
- mobile fallback where relevant

Tables and work queues must not silently overflow.

---

# Phase 9: Migration and Governance

Create:

## `CARELANE_DESIGN_SYSTEM_MIGRATION_PLAN.md`

For every current page, record:

- current component family
- target component family
- design debt
- functional debt
- migration priority
- dependencies
- risk
- status

## `CARELANE_DESIGN_SYSTEM_GOVERNANCE.md`

Rules:

1. Do not create a new primitive when an approved one exists.
2. Do not create a new status colour without adding a token and documenting meaning.
3. Do not use arbitrary spacing when a token exists.
4. Do not create one-off card styles.
5. Do not create duplicate badge systems.
6. Do not add a new page layout without documenting the archetype.
7. Do not expose a workflow action without a functional contract.
8. Do not add a CTA without defining permission, backend command, success, failure, and audit behaviour.
9. Prefer removal over adding decorative UI.
10. Any exception must be documented.

---

# Implementation Rules

- Do not rebuild the entire app blindly.
- Audit first.
- Preserve working functionality.
- Make small, reviewable commits or coherent change groups.
- Do not break routes.
- Do not rename domain concepts casually.
- Do not introduce new workflow states.
- Do not bypass backend permissions.
- Do not add fake metrics.
- Do not add visual polish before the token and component foundation is stable.
- Do not leave the repository with two competing design systems.
- Retire legacy components only after migration is proven.
- Keep TypeScript types strict.
- Keep accessibility intact.
- Keep loading, error, empty, permission, and long-content states first-class.

---

# Required Deliverables

At the end, provide:

## Documentation

- design-system inventory
- duplication report
- screen uniformity matrix
- UI action/backend matrix
- token documentation
- primitive documentation
- domain-component documentation
- interaction patterns
- page archetypes
- accessibility rules
- responsive rules
- migration plan
- governance rules

## Code

- normalized tokens
- normalized primitives
- Carelane domain components
- Storybook stories
- Regiekamer implementation
- Casuswerkruimte implementation
- Matchingwerkruimte implementation
- functional API wiring
- tests

## Final report

Summarize:

1. What already existed
2. What was reused
3. What was consolidated
4. What was retired
5. What remains incomplete
6. Which functional gaps remain
7. Which pages still violate the design system
8. Which risks remain before production

---

# Execution Order

Follow this order:

1. Inspect repository
2. Read authoritative documents
3. Produce audit documents
4. Present findings
5. Normalize tokens
6. Normalize primitives
7. Build domain components
8. Add Storybook coverage
9. Implement Regiekamer
10. Implement Casuswerkruimte
11. Implement Matchingwerkruimte
12. Wire real functionality
13. Add tests
14. Produce migration plan
15. Produce final report

Do not jump directly into visual redesign before the audit.

---

# First Response Required

Before making code changes, respond with:

1. Repository architecture summary
2. Existing design-system maturity score from 0–100
3. Existing functional maturity score for the three target pages
4. Top ten design-system inconsistencies
5. Top ten functionality gaps
6. Existing components that should be kept
7. Existing components that should be merged
8. Existing components that should be retired
9. Proposed file structure
10. Implementation sequence and risk assessment

Then begin execution without waiting for approval unless a destructive migration or irreversible architectural change is required.
