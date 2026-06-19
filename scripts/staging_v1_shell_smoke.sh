#!/usr/bin/env bash
# V1 staging shell smoke — HTTP 200 checks for routes in docs/V1_SHIP_CHECKLIST.md §3.
#
# Usage:
#   BASE_URL=https://carelane-web.onrender.com ./scripts/staging_v1_shell_smoke.sh
#
# Does not authenticate; confirms SPA shell / Django routes respond. For full role
# flows use Playwright after deploy with rehearsal or pilot demo users.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=scripts/lib/http_probe.sh
. "$ROOT_DIR/scripts/lib/http_probe.sh"

if [[ -z "${BASE_URL:-}" ]]; then
  echo "ERROR: set BASE_URL (e.g. https://carelane-web.onrender.com)" >&2
  exit 1
fi

ORIGIN="${BASE_URL%/}"
paths=(
  "/"
  "/care/"
  "/login/"
  "/?view=dashboard"
  "/care/casussen"
  "/care/matching"
  "/care/beoordelingen"
  "/dashboard/"
)

echo "== V1 staging shell smoke: ${ORIGIN}"

if [[ "${STAGING_WAKE_FIRST:-1}" == "1" ]]; then
  http_wake_origin "$ORIGIN" "/login/" || exit 1
fi

failed=0
for path in "${paths[@]}"; do
  url="${ORIGIN}${path}"
  result="$(http_probe_request "$url" "$(http_probe_curl_max_time)" || echo "000 0")"
  code="${result%% *}"
  elapsed="${result#* }"
  if [[ ! "$code" =~ ^(2|3)[0-9]{2}$ ]]; then
    echo "FAIL $url → HTTP $code (${elapsed}s)"
    failed=1
  else
    echo "OK   $url → HTTP $code (${elapsed}s)"
  fi
done

if [[ "$failed" -ne 0 ]]; then
  exit 1
fi
if [[ -n "${EXPECTED_SPA_JS:-}" ]]; then
  live_js="$(curl -sS -L --max-time 60 "${ORIGIN}/dashboard/" | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1 || true)"
  if [[ "$live_js" != "$EXPECTED_SPA_JS" ]]; then
    echo "FAIL SPA bundle on /dashboard/: expected ${EXPECTED_SPA_JS}, got ${live_js:-<none>}"
    exit 1
  fi
  echo "OK   SPA bundle ${live_js} on /dashboard/"
fi

echo "== All shell routes returned 2xx/3xx"
