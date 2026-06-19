# Carelane Secrets Inventory

**Purpose:** inventory of environment variables and credentials required to boot, secure, observe, and operate Carelane.
**Rule:** do not store real secret values here. Document metadata only.

## Scope

This inventory covers the runtime and CI variables that affect:

- boot
- authentication / SSO
- database access
- storage / media
- email
- AI-adjacent features and integrations
- monitoring / alerting
- deployment / release operations

## Required environment variables

| Variable | Purpose | Required for | Local | Staging | Production | Owner | Rotation notes |
|---|---|---|---|---|---|---|---|
| `DJANGO_SECRET_KEY` | Django signing key for sessions, CSRF, and secure tokens | boot, auth | Yes | Yes | Yes | Backend / Ops | Rotate on suspected exposure; expect session invalidation. |
| `DATABASE_URL` | Database connection string | boot, database | Yes, may be empty for SQLite fallback in tests/dev | Yes | Yes | Backend / Ops | Rotate with provider maintenance window; verify migrations after rotation. |
| `ALLOWED_HOSTS` | Host allow-list for Django | boot, deployment | Yes | Yes | Yes | Ops | Update when hostnames change; no secret material, but production-critical. |
| `CSRF_TRUSTED_ORIGINS` | Trusted HTTPS origins | boot, deployment | Yes | Yes | Yes | Ops | Update alongside host/origin changes. |
| `DEFAULT_FROM_EMAIL` | Default outbound sender | email, boot | Yes | Yes | Yes | Ops / Product ops | Rotate only if sender identity changes; keep aligned with mail provider. |
| `EMAIL_BACKEND` | Email delivery backend choice | email | Optional | Yes | Yes | Ops | Change only with a delivery provider change. |
| `EMAIL_HOST` | SMTP host | email | Optional | Yes | Yes | Ops | Update if provider changes endpoint. |
| `EMAIL_PORT` | SMTP port | email | Optional | Yes | Yes | Ops | Typically provider-controlled; no rotation. |
| `EMAIL_USE_TLS` | SMTP transport security toggle | email | Optional | Yes | Yes | Ops | Keep enabled unless provider requires otherwise. |
| `EMAIL_HOST_USER` | SMTP username | email | Optional | Yes | Yes | Ops | Rotate with provider credential changes. |
| `EMAIL_HOST_PASSWORD` | SMTP password | email | Optional | Yes | Yes | Ops | Rotate per provider guidance and when exposure is suspected. |
| `SSO_ENABLED` | Enables OIDC / SSO flow | auth, boot | Usually `0` | Env-specific | Env-specific | Ops / Identity | Toggle only with release coordination. |
| `OIDC_RP_CLIENT_ID` | OIDC client identifier | auth | Optional | If SSO enabled | If SSO enabled | Identity / Ops | Rotate only if client is reissued or compromised. |
| `OIDC_RP_CLIENT_SECRET` | OIDC client secret | auth | Optional | If SSO enabled | If SSO enabled | Identity / Ops | Rotate with IdP secret rotation; update app and CI together. |
| `OIDC_OP_DISCOVERY_ENDPOINT` | OIDC discovery URL | auth | Optional | If SSO enabled | If SSO enabled | Identity / Ops | Update when IdP endpoints change. |
| `OIDC_OP_AUTHORIZATION_ENDPOINT` | OIDC auth endpoint | auth | Optional | If SSO enabled and no discovery | If SSO enabled and no discovery | Identity / Ops | Keep in sync with IdP. |
| `OIDC_OP_TOKEN_ENDPOINT` | OIDC token endpoint | auth | Optional | If SSO enabled and no discovery | If SSO enabled and no discovery | Identity / Ops | Keep in sync with IdP. |
| `OIDC_OP_USER_ENDPOINT` | OIDC user-info endpoint | auth | Optional | If SSO enabled and no discovery | If SSO enabled and no discovery | Identity / Ops | Keep in sync with IdP. |
| `OIDC_OP_JWKS_ENDPOINT` | OIDC JWKS endpoint | auth | Optional | If SSO enabled and no discovery | If SSO enabled and no discovery | Identity / Ops | Keep in sync with IdP. |
| `OIDC_PUBLIC_BASE_URL` | Public base URL used for redirect URI construction | auth, deployment | Optional | Yes if SSO enabled | Yes if SSO enabled | Ops | Rotate when public host changes; verify redirect host safety. |
| `OIDC_REDIRECT_ALLOWED_HOSTS` | Allowed hosts for OIDC redirect flow | auth, deployment | Optional | Yes if SSO enabled | Yes if SSO enabled | Ops | Update when public or SPA hostnames change. |
| `OIDC_RP_SCOPES` | Requested OIDC scopes | auth | Optional | If SSO enabled | If SSO enabled | Identity | Update only when IdP policy changes. |
| `OIDC_VERIFY_SSL` | OIDC TLS verification toggle | auth | Optional | Yes | Yes | Ops / Security | Keep enabled; only disable for controlled local debugging. |
| `SENTRY_DSN` | Error monitoring endpoint | monitoring | Optional | Recommended | Recommended | Ops / Observability | Rotate if leaked; treat as external service credential. |
| `SENTRY_ENVIRONMENT` | Monitoring environment label | monitoring | Optional | Recommended | Recommended | Ops / Observability | Update when environment naming changes. |
| `SENTRY_RELEASE` | Release identifier for monitoring | monitoring, deployment | Optional | Recommended | Recommended | Release captain / Ops | Set per deploy; not a secret but required for traceability. |
| `DJANGO_TEST_LOG_LEVEL` | Test logging noise control | boot, QA | Optional | Optional | Optional | QA / Engineering | No rotation; keep aligned with CI/debug policy. |
| `CARELANE_PILOT_UI` | Pilot UI flag | deployment | Optional | Common | Common | Product / Ops | Change only via release coordination. |
| `CARELANE_PILOT_SPA_ONLY` | Pilot SPA-only mode flag | deployment | Optional | Common | Common | Product / Ops | Change only via release coordination. |
| `PILOT_AUTO_BOOTSTRAP` | Auto-bootstrap staging/pilot data | deployment | Optional | Common | Rare | Ops | Disable outside controlled bootstrap windows. |
| `PILOT_FORCE_RESET` | Force full demo reset | deployment | Optional | Controlled use only | No | Ops / Release captain | Use only in maintenance windows; destructive to demo state. |
| `PILOT_FULL_DEMO_SEED` | Seed full demo work queue | deployment | Optional | Controlled use only | No | Ops / Release captain | Use only when the rehearsal queue must be regenerated. |
| `E2E_DEMO_PASSWORD` | Demo user password seed | auth, deployment | Optional | Yes | No | Ops | Rotate when demo credentials are refreshed. |
| `E2E_GEMEENTE_USERNAME` | Demo municipality username | auth, deployment | Optional | Yes | No | Ops | Not a secret, but part of the demo bootstrap contract. |
| `RENDER_DEPLOY_HOOK_URL` | Manual deploy hook | deployment | Optional | Optional | Optional | Release captain / Ops | Rotate if the hook URL changes or is reissued. |
| `PREFLIGHT_POSTGRES_URL` | Preflight database target | database, deployment | Optional | Optional | Optional | Ops | Temporary release-only connection target; never commit a real value. |
| `STAGING_DATABASE_URL` | Staging preflight database target | database, deployment | Optional | Optional | Optional | Ops | Temporary release-only connection target; never commit a real value. |
| `HEALTHCHECK_URL` | Health-check target for release automation | monitoring, deployment | Optional | Optional | Optional | QA / Ops | Update when release host changes. |

## Non-secret but operationally critical

These values are not secrets, but they are release-critical and should be treated as controlled configuration:

- `DEBUG`
- `SPA_ORIGIN`
- `LOGIN_URL`
- `LOGIN_REDIRECT_URL`
- `LOGOUT_REDIRECT_URL`
- `DB_CONN_MAX_AGE`
- `EMAIL_HOST_USER`
- `EMAIL_PORT`
- `EMAIL_USE_TLS`
- `CARELANE_PILOT_UI`
- `CARELANE_PILOT_SPA_ONLY`

## Current gaps / explicit non-requirements

- Storage: the current codebase does not define a dedicated object-storage secret or bucket credential. If object storage is introduced later, add the new variables here with owner and rotation notes.
- AI: the current codebase does not define a dedicated AI or LLM API secret. If an AI integration is introduced later, add the new credential here before enabling it in production.

## Ownership model

- Backend / Engineering: code defaults, database connectivity, boot-time safety
- Ops / Release captain: environment wiring, rotation cadence, deployment guardrails
- Identity / Security: OIDC client material and redirect-origin safety
- QA: test-only and preflight-only variables
- Observability: monitoring and alerting configuration

## Rotation notes

- Rotate credentials on compromise, staff offboarding, provider re-issue, or scheduled policy windows.
- Prefer coordinated rotation that includes staging first, then production.
- Verify boot, login, database connectivity, and email delivery after each rotation.
- Never reuse a production secret in local development.

## Evidence

Populate this section after the first production-readiness drill.

- Date:
- Environment:
- Rotated items:
- Validation result:
- Owner:
- Notes:
