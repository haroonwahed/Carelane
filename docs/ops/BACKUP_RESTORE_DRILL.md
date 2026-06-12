# CareOn Backup / Restore Drill

**Purpose:** evidence record for backup and restore readiness.
**Status:** template until the first completed drill is recorded.

## Backup scope

The backup must cover:

- Postgres application data
- migrations/schema state
- release-critical reference data
- operational audit trails and decision logs
- any storage objects required to rehydrate the app state

Exclude:

- local build artifacts
- ephemeral browser caches
- reproducible demo screenshots unless they are part of evidence retention policy

## Restore scenario

Use a realistic failure scenario, for example:

- accidental deletion of a case / placement record
- bad migration requiring restore to a known-good point
- operator error during pilot data reset

The restore target should be a non-production validation environment unless the organization has explicitly approved a production restore.

## Restore steps

1. Record the source backup identifier and timestamp.
2. Provision or select the restore target database.
3. Restore the backup into the target environment.
4. Apply the correct migration set if the backup is point-in-time or schema-lagged.
5. Start the application against the restored target.
6. Verify health and canonical workflow access.
7. Verify audit traceability and data integrity for a known case.

## Verification checklist

- [ ] Backup completed successfully
- [ ] Backup identifier and timestamp recorded
- [ ] Restore target identified
- [ ] Restore completed without errors
- [ ] Application boots against restored data
- [ ] `/_health/` or equivalent health check returns `200`
- [ ] Login succeeds with a known test user
- [ ] One canonical case renders correctly
- [ ] Audit / timeline entries are present
- [ ] No data truncation or corruption observed
- [ ] Restore duration recorded
- [ ] Evidence attached to rollout record

## Target objectives

| Metric | Placeholder |
|---|---|
| RPO | TBD |
| RTO | TBD |

## Evidence: first completed drill

Fill this section after the first completed drill.

- Date:
- Backup source:
- Restore target:
- Backup size:
- Restore duration:
- RPO observed:
- RTO observed:
- Verification result:
- Owner:
- Notes:
