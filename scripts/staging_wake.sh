#!/usr/bin/env bash
# Wake staging (or any BASE_URL) with visible progress — use before Playwright or long curls.
#
# Usage:
#   BASE_URL=https://carelane-web.onrender.com ./scripts/staging_wake.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=scripts/lib/http_probe.sh
. "$ROOT_DIR/scripts/lib/http_probe.sh"

BASE_URL="${BASE_URL:-${STAGING_BASE_URL:-https://carelane-web.onrender.com}}"
http_wake_origin "${BASE_URL%/}" "/login/"
