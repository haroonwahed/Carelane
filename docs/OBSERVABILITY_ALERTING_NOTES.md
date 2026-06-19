# Carelane observability and alerting notes

Purpose: define the minimum operational signals to watch in production and where the evidence should live.

## Core signals

| Signal | What to watch | Suggested response |
|--------|----------------|--------------------|
| HTTP health | `GET /_health/` returns `200` | Verify app process, secrets, and database connectivity |
| 5xx rate | Rising server errors on app endpoints | Check release SHA, logs, and recent deploy changes |
| DB connection errors | Postgres auth / availability failures | Verify `DATABASE_URL`, network, and database service health |
| Latency spike | Slow page loads or API responses | Compare deploy time with error logs and DB saturation |
| Disk pressure | Disk usage approaching host limits | Clean logs, inspect static files, and contact ops |

## Log signals

- Request correlation id in application logs
- Django error traces for unhandled exceptions
- Deploy markers around migration / restart windows

## Minimum alerting targets

- Health endpoint failure
- 5xx error burst
- Database connection failure
- Disk full or near-full warning

## Evidence template

| Field | Value |
|-------|-------|
| Monitoring platform | pending |
| Health endpoint | pending |
| 5xx alert configured | pending |
| DB alert configured | pending |
| Disk alert configured | pending |
| On-call contact | pending |
| Notes | pending |

## Where to archive

- Copy rollout notes to `docs/DRILL_LOG.md`
- Keep the production sign-off in `docs/RELEASE_EXECUTION_SHEET_2026-05-30.md`
