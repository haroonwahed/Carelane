# CareOn Release Sign-off v1

**Purpose:** final release-readiness evidence sheet for CareOn v1.
**Rule:** do not mark production-ready without evidence in every production checklist category.

## Demo-ready checklist

- [x] frontend build passes
- [x] backend test suite passes in safe local/test settings
- [x] default pytest path no longer depends on external placeholder credentials
- [x] canonical workflow and UI contracts remain intact

## Closed-pilot-ready checklist

- [x] staging / rehearsal evidence exists
- [x] pilot smoke / sign-off evidence exists
- [x] tenant isolation and workflow gating remain green
- [x] pilot bootstrap and release evidence paths are defined

## Production-ready checklist

- [ ] secrets inventory complete
- [ ] backup / restore drill completed
- [ ] observability checklist completed
- [ ] rollback playbook validated
- [ ] release sign-off recorded
- [ ] production smoke evidence captured

## Test evidence

- Frontend build: pass
- Default backend test path: pass
- Targeted release-contract tests: pass
- Warnings / notes: retained Django URLField deprecation warnings only

## Security / privacy evidence

- No real secret values are stored in docs
- OIDC redirect safety remains enforced
- Document privacy checks remain intact
- Tenant isolation remains green

## Operational evidence

- Safe test settings isolate the default backend path from external Postgres placeholders
- Release inventory and rollback templates are documented
- Monitoring, backup, and sign-off templates exist

## Final go / no-go

### Go

- Demo-ready: **GO**
- Closed-pilot-ready: **GO**

### No-go

- Production-ready: **NO-GO**

### Reason

Production evidence is still incomplete until the following are completed and signed:

- secrets inventory
- backup / restore drill
- observability checklist
- rollback validation
- release sign-off record

