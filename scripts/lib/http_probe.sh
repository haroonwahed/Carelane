#!/usr/bin/env bash
# Shared HTTP probes with visible progress (cold Render / long curls).
# Source from other scripts: . "$(dirname "$0")/lib/http_probe.sh"

http_probe_curl_max_time() {
  echo "${HTTP_PROBE_CURL_MAX_TIME:-90}"
}

# Print status line, then curl; echoes "code elapsed" on stdout for callers.
http_probe_request() {
  local url="$1"
  local max_time="${2:-$(http_probe_curl_max_time)}"
  echo "→ GET ${url} (max ${max_time}s) …" >&2
  local out
  out="$(curl -sS -L -o /dev/null -w '%{http_code} %{time_total}' --max-time "$max_time" "$url" 2>&1)" || {
    echo "  FAIL (curl): ${out}" >&2
    echo "000 0"
    return 1
  }
  local code="${out%% *}"
  local elapsed="${out#* }"
  if [[ "$code" =~ ^(2|3)[0-9]{2}$ ]]; then
    echo "  OK HTTP ${code} in ${elapsed}s" >&2
  else
    echo "  FAIL HTTP ${code} in ${elapsed}s" >&2
  fi
  echo "$code $elapsed"
}

# Wake a sleeping Render web service; prints progress each attempt.
http_wake_origin() {
  local origin="${1%/}"
  local probe_path="${2:-/login/}"
  local attempts="${HTTP_WAKE_ATTEMPTS:-3}"
  local max_time="${HTTP_WAKE_MAX_TIME:-120}"
  local url="${origin}${probe_path}"

  echo "[http_wake] ${origin} — cold start can take 60–120s; up to ${attempts} attempts …" >&2
  local attempt=1
  while (( attempt <= attempts )); do
    echo "[http_wake] attempt ${attempt}/${attempts}: ${url}" >&2
    local result code elapsed
    result="$(http_probe_request "$url" "$max_time")" || true
    code="${result%% *}"
    elapsed="${result#* }"
    if [[ "$code" =~ ^(2|3)[0-9]{2}$ ]]; then
      echo "[http_wake] ready (HTTP ${code}, ${elapsed}s)" >&2
      return 0
    fi
    attempt=$((attempt + 1))
  done
  echo "[http_wake] ERROR: ${origin} did not respond with 2xx/3xx after ${attempts} attempts" >&2
  return 1
}
