#!/usr/bin/env bash
# Restart (or start) Carelane local dev servers: Django on :8000, Vite on :3000.
# Run from anywhere:  bash scripts/dev-restart.sh
# Or from repo root:   ./scripts/dev-restart.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BACKEND_PORT="${CARELANE_BACKEND_PORT:-8000}"
FRONTEND_PORT="${CARELANE_FRONTEND_PORT:-3000}"
BACKEND_LOG="${CARELANE_BACKEND_LOG:-/tmp/carelane-backend.log}"
FRONTEND_LOG="${CARELANE_FRONTEND_LOG:-/tmp/carelane-frontend.log}"
BACKEND_PID_FILE="${CARELANE_BACKEND_PID_FILE:-/tmp/carelane-dev-backend.pid}"
FRONTEND_PID_FILE="${CARELANE_FRONTEND_PID_FILE:-/tmp/carelane-dev-frontend.pid}"

if [[ ! -x "${ROOT}/.venv/bin/python" ]]; then
  echo "error: ${ROOT}/.venv/bin/python not found. Create the venv and install deps first." >&2
  exit 1
fi

if [[ ! -f "${ROOT}/client/package.json" ]]; then
  echo "error: ${ROOT}/client/package.json not found." >&2
  exit 1
fi

stop_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti "tcp:${port}" 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    echo "Stopping process(es) on port ${port}: ${pids}"
    # shellcheck disable=SC2086
    kill ${pids} 2>/dev/null || true
  fi
}

stop_pidfile() {
  local f="$1"
  if [[ -f "$f" ]]; then
    local p
    p="$(cat "$f" 2>/dev/null || true)"
    if [[ -n "${p}" ]] && kill -0 "${p}" 2>/dev/null; then
      echo "Stopping PID ${p} (from ${f})"
      kill "${p}" 2>/dev/null || true
    fi
    rm -f "$f"
  fi
}

echo "== Carelane dev restart =="
stop_pidfile "${BACKEND_PID_FILE}"
stop_pidfile "${FRONTEND_PID_FILE}"
stop_port "${BACKEND_PORT}"
stop_port "${FRONTEND_PORT}"
sleep 1

echo "Starting Django → http://127.0.0.1:${BACKEND_PORT}/"
nohup "${ROOT}/.venv/bin/python" manage.py runserver "127.0.0.1:${BACKEND_PORT}" >>"${BACKEND_LOG}" 2>&1 &
echo $! >"${BACKEND_PID_FILE}"

echo "Starting Vite → http://localhost:${FRONTEND_PORT}/"
nohup npm --prefix "${ROOT}/client" run dev >>"${FRONTEND_LOG}" 2>&1 &
echo $! >"${FRONTEND_PID_FILE}"

sleep 1
echo
echo "Logs:"
echo "  backend:  ${BACKEND_LOG}"
echo "  frontend: ${FRONTEND_LOG}"
echo "PIDs:"
echo "  backend:  $(cat "${BACKEND_PID_FILE}" 2>/dev/null || echo '?')"
echo "  frontend npm: $(cat "${FRONTEND_PID_FILE}" 2>/dev/null || echo '?')"
echo
echo "Tip: tail -f ${BACKEND_LOG} ${FRONTEND_LOG}"
