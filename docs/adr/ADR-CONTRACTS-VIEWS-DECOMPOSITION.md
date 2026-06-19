# ADR: Decomposition of `contracts/views.py`

**Status:** Proposed
**Date:** 2026-06-17
**Deciders:** Founder / engineering owner (Haroon)
**Related docs:** `docs/CARELANE_STRUCTURAL_MIGRATION_PLAN.md`, `docs/FOUNDATION_LOCK.md`, `AGENTS.md`, `DECISIONS.md` (Infrastructure Maturity Phase)

---

## Context

`contracts/views.py` has grown into a god-module:

- **8,235 lines** in a single file.
- **~320 top-level definitions** — **53 public views/functions** and **72 private helpers**, plus the class-based views (CBVs) for nearly every domain entity.
- It mixes concerns that have nothing to do with each other: HTTP request handling, the **matching/scoring algorithm**, **geocoding** (a hand-rolled `_haversine_distance_km`), provider-behaviour scoring, **task/deadline auto-sync**, **case-flow state transitions**, **SPA-shell rendering**, ops/health endpoints, and per-resource CRUD.

This matters because of three forces specific to Carelane:

1. **Regulated workflow integrity.** The backend is the source of truth for state and permissions (`FOUNDATION_LOCK`, `AGENTS.md`). Workflow gates and tenant isolation live partly inside these view functions. A file this large makes it hard to see — and safely change — exactly where a gate is enforced, which is a regulatory and liability risk.
2. **The redesign wave is active.** Recent commits (weeks 22–24) are almost entirely UI/redesign (`--care-*` tokens, shared SLA primitives, matching-grid restructure). Each of those touches view context-building code buried in this file. The monolith is now directly slowing the work you are actually doing.
3. **The pattern is already proven next door.** `contracts/api/` is *already* decomposed into cohesive modules (`cases.py`, `intake.py`, `matching.py`, `placement.py`, `evaluation.py`, `audit.py`, `auth.py`, `providers.py`, `members.py`, …). `views.py` is the laggard, not a greenfield design problem. We have a working target shape in the same package.

This is **not** a request to add features. It fits squarely inside the declared **Infrastructure Maturity Phase / feature freeze** (reliability, observability, workflow integrity).

### Non-negotiable constraints

- **No behaviour change.** URLs, view names, template context keys, and tested user-facing markers stay identical (`DECISIONS.md` → "UI and Test Compatibility").
- **Stay green.** 93 pytest modules + 13 Playwright e2e specs + Platform Guardrails CI must pass at every step.
- **Tenant isolation preserved.** `test_cross_tenant_isolation` and `TenantScopedQuerysetMixin` semantics are untouched.
- **No terminology/model renames** here — that is a separate, deferred track (`CARELANE_STRUCTURAL_MIGRATION_PLAN.md`, `STRUCTURAL_RENAME_DEFERRED.md`). This ADR moves code, it does not rename symbols.

---

## Decision

Decompose `contracts/views.py` into a **`contracts/views/` package** of cohesive modules that mirrors the existing `contracts/api/` layout, by **mechanically moving** functions/classes — not rewriting them — and re-exporting everything from `contracts/views/__init__.py` so that imports and `urls.py` keep working unchanged.

The pure domain logic currently trapped in views (matching, geo, scoring, flow-sync) moves into **non-view domain modules** so it can be unit-tested and reused by the API layer without importing a view module.

### Target structure

```
contracts/
  views/
    __init__.py            # re-exports public names → import surface unchanged
    base.py                # TenantScopedQuerysetMixin, TenantAssignCreateMixin, _CaseScopedIntakeMixin
    shell.py               # index, _render_spa_shell_response, dashboard, *_redirect, handlers
    ops.py                 # health_check, build_info, ops_system_state, favicon
    clients.py             # Client* CBVs
    documents.py           # Document* CBVs
    deadlines.py           # Deadline* CBVs + deadline_complete
    signals.py             # CareSignal* CBVs + signal_update_status
    tasks.py               # CareTask* CBVs + task_board_redirect
    budgets.py             # Budget* + AddExpense CBVs
    organization.py        # team, invites, membership, activity, switch_organization, notifications
    configuration.py       # CareConfiguration / Municipality / Regional config CBVs
    intake.py              # CaseIntake* CBVs
    assessment.py          # CaseAssessment* CBVs
    placement.py           # PlacementRequest* CBVs, case_placement_action
    matching_views.py      # matching_dashboard, case_matching_action (HTTP layer only)
    provider_response.py   # provider_response_monitor, case_provider_response_action, communication
    case_actions.py        # case_outcome_action, case_archive_action, case_communication_action
    reports.py             # reports_dashboard, global_search
    auth.py                # SignUpView, profile, settings_hub, design_mode_settings

  domain/                  # exists (holds request-free dataclasses in contracts.py; add __init__.py)
    matching.py            # _build_*_suggestions, _build_matching_explanation, scoring, tiebreak
    geo.py                 # _haversine_distance_km, _coerce_coordinate, _extract_coordinates, _build_case_location
    provider_profile.py    # _provider_profile_* predicates and surfaces
    case_flow.py           # ensure_case_flow, sync_case_flow_state, sync_*_auto_tasks, sync_automatic_deadlines
```

The split is **by domain seam, not by line count** — each module owns one coherent slice of the workflow.

---

## Options Considered

### Option A: Leave it as-is

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low (no work) |
| Cost | Zero now, compounding later |
| Scalability | Poor — every redesign PR keeps paying the tax |
| Team familiarity | High (status quo) |

**Pros:** No risk today; no review overhead.
**Cons:** The redesign wave keeps touching an 8k-line file; workflow gates stay hard to audit; merge conflicts likely across the worktree/copilot branches already in flight.

### Option B: Big-bang rewrite into the new structure in one PR

| Dimension | Assessment |
|-----------|------------|
| Complexity | High |
| Cost | High up-front |
| Scalability | Good end-state |
| Team familiarity | Low during transition |

**Pros:** One clean cut; done in a single review.
**Cons:** Unreviewable diff over 8k lines; high chance of a silent behaviour/gate change; collides head-on with in-flight redesign and `copilot/*` branches. Violates "stay green at every step" in spirit.

### Option C (chosen): Incremental, mechanical move behind a stable `__init__` re-export

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium |
| Cost | Spread across small PRs |
| Scalability | Good end-state, mirrors `api/` |
| Team familiarity | High — same code, new home |

**Pros:** Each PR is small and reviewable; `git mv`-style moves are diff-friendly; imports/URLs never break because `__init__.py` re-exports; can pause anytime with a coherent tree; pure-logic extraction unlocks fast unit tests.
**Cons:** Temporary dual-location awkwardness; requires discipline to avoid "improving while moving"; needs a guardrail test so the file doesn't regrow.

---

## Trade-off Analysis

The decisive trade-off is **review safety vs. speed**. Option B is faster to "done" but its diff is unauditable in a regulated workflow — exactly where a missed tenant or workflow gate is most expensive. Option C trades a few weeks of incremental PRs for the ability to keep CI green and reviews honest at every step, and to interleave the work with the ongoing redesign instead of blocking it.

The second trade-off is **move vs. rewrite**. We explicitly choose to *move* code unchanged. Any cleanup ("this helper could be simpler") is tempting but turns a safe relocation into a behaviour-risk change. Cleanups are logged as follow-ups, not done inline.

---

## Consequences

**Easier**
- Redesign PRs touch a focused 200–600 line module instead of an 8k-line file.
- Workflow gates and tenant scoping become locally visible per domain, easier to audit.
- Matching/geo/scoring logic becomes unit-testable in isolation and reusable by `contracts/api/matching.py` without a view import.
- Fewer merge conflicts across the active `worktree-agent-*` and `copilot/*` branches.

**Harder / to revisit**
- During the transition, contributors must know that `contracts.views` is now a package; update editor jump-to-definition habits.
- We need a guardrail (below) so no single view module silently grows back into a god-file.
- `models.py` (4,641 lines) has the same smell but is **out of scope** here — flag as a separate ADR because model splits touch migrations and are riskier.

---

## Action Items (phased — each phase is its own PR, green before merge)

1. [ ] **Phase 0 — Safety net.** Confirm coverage of the hot paths (matching, provider-response, placement, archive, intake CRUD). Add a thin characterization test where a public view has no direct test. Add a guardrail test asserting `contracts/views/` modules stay under an agreed line ceiling (e.g. 800) and that `contracts/views.py` no longer exists once Phase 1 lands.
2. [ ] **Phase 1 — Make `views` a package.** Convert `views.py` → `views/__init__.py` verbatim (zero logic change). Confirm urls.py, tests, and SPA shell all still resolve. This is the reversible foundation.
3. [ ] **Phase 2 — Extract pure domain logic** into `contracts/domain/{geo,matching,provider_profile,case_flow}.py`. These have no `request` dependency and are the highest-value, lowest-risk move. Add focused unit tests for `_haversine_distance_km`, scoring, and flow-sync. Re-export from `__init__` for compatibility.
4. [ ] **Phase 3 — Carve out leaf view groups** with no cross-dependencies: `ops.py`, `shell.py`, `base.py` (mixins), then the simple CRUD CBVs (`clients`, `documents`, `deadlines`, `signals`, `tasks`, `budgets`, `configuration`).
5. [ ] **Phase 4 — Move the workflow-critical surfaces** one module per PR, in this order (lowest blast radius first): `reports` → `organization` → `assessment` → `intake` → `placement` → `provider_response` → `matching_views` → `case_actions`. Re-verify tenant isolation + workflow gates after each.
6. [ ] **Phase 5 — Shrink `__init__.py`** to only re-exports (no definitions left). Remove the temporary re-exports of domain logic from views once call sites import from `contracts.domain` directly.
7. [ ] **Phase 6 — Close out.** Delete the line-ceiling exception, update `AGENTS.md` / `CARELANE_STRUCTURAL_MIGRATION_PLAN.md` to point at the new layout, and open a follow-up ADR stub for `models.py`.

### Definition of done per PR
- All pytest + Playwright + Platform Guardrails green.
- No change to URLs, view names, or template context keys.
- Diff is dominated by moves (review can confirm "same code, new file").
- `test_cross_tenant_isolation` and workflow-gate tests unchanged and passing.
