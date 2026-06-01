# CareOn structural rename deferred note

Status: **deferred on purpose**

Scope: structural terminology rename work for `regiekamer` and related internal identifiers.

## What is deferred

- Route and identifier rename for the operational coordination shell
- Internal API/model identifier rename where it would ripple through the workflow stack
- Broad test-id or telemetry identifier renames that would require coordinated updates across code, tests, and docs

## What is not deferred

- Visible product copy can still be polished to use clearer operational-coordination language
- New docs may use the clearer wording now, as long as they do not imply the underlying contract changed

## Why it is deferred

- The current shell, tests, and docs still rely on `regiekamer` as an implementation contract
- A structural rename would touch routes, test ids, telemetry, docs, and probably release evidence at the same time
- The risk is churn without functional gain while production rollout work is still outstanding

## Safe trigger to revisit

Only revisit after all of these are true:

- Production rollout is complete and stable
- Provider-path and golden-path smoke remain green on the live stack
- There is a coordinated migration plan for routes, identifiers, tests, and docs
- There is time to update the release evidence and operational docs together

## Current recommendation

Keep the structural rename deferred. Continue using the clearer visible copy already introduced in the shell, and avoid changing backend or route identifiers until the next coordinated refactor window.
