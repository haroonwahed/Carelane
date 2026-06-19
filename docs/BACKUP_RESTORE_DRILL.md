# Carelane backup / restore drill

Purpose: capture the first real backup / restore verification for production or staging. This is an operational evidence sheet, not a product feature.

## When to run

- After a successful live backup exists
- Before or shortly after the first production promotion
- Any time the storage or database provider changes

## Preconditions

- A recent automated backup exists
- Restore target is non-production
- `DATABASE_URL` for the restore target is available
- You can run Django management commands against the restore target

## Drill steps

1. Record the source backup reference and timestamp.
2. Restore the backup into a non-production database.
3. Point `DATABASE_URL` at the restore target.
4. Run migrations with `python manage.py migrate --plan`.
5. Run a minimal smoke path:
   - `python manage.py check`
   - `curl -fsS http://127.0.0.1:8000/_health/`
   - login smoke for the configured non-production account
6. Record whether the restored environment matches the expected release SHA and schema.
7. Note any data loss, schema mismatch, or manual intervention.

## Evidence template

| Field | Value |
|-------|-------|
| Backup source | pending |
| Backup timestamp | pending |
| Restore target | pending |
| Restore timestamp | pending |
| Migrations OK | pending |
| Health check OK | pending |
| Login smoke OK | pending |
| Notes / incidents | pending |

## Pass criteria

- Restore completes without schema corruption
- App boots on the restored database
- Health and login smoke return green
- Notes are archived in `docs/DRILL_LOG.md`
