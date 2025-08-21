#!/usr/bin/env bash
# Unified launcher for backend (Fastify) and static frontend
# Usage:
#   chmod +x ./run.sh
#   ./run.sh
#
# Env vars:
#   PORT=<port>         Backend port (default: 3000)
#   FRONT_PORT=<port>   Frontend port (default: 8080)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACK_DIR="$ROOT_DIR/back"
FRONT_DIR="$ROOT_DIR/front"

BACK_PORT="${PORT:-3000}"
FRONT_PORT="${FRONT_PORT:-8080}"

BACK_PID=""

cleanup() {
  echo "\n[run.sh] Cleaning up..."
  if [[ -n "${BACK_PID}" ]] && ps -p "${BACK_PID}" > /dev/null 2>&1; then
    echo "[run.sh] Stopping backend (PID ${BACK_PID})"
    kill "${BACK_PID}" 2>/dev/null || true
    # Give it a moment to stop gracefully
    sleep 1
    if ps -p "${BACK_PID}" > /dev/null 2>&1; then
      echo "[run.sh] Force killing backend"
      kill -9 "${BACK_PID}" 2>/dev/null || true
    fi
  fi
}
trap cleanup EXIT INT TERM

echo "[run.sh] Project root: ${ROOT_DIR}"
echo "[run.sh] Backend: ${BACK_DIR} (port ${BACK_PORT})"
echo "[run.sh] Frontend: ${FRONT_DIR} (port ${FRONT_PORT})"

# --- Start backend ---
if [[ ! -d "${BACK_DIR}" ]]; then
  echo "[run.sh][ERROR] Backend directory not found: ${BACK_DIR}" >&2
  exit 1
fi

pushd "${BACK_DIR}" >/dev/null

if [[ ! -d node_modules ]]; then
  echo "[run.sh] Installing backend dependencies..."
  npm install
fi

echo "[run.sh] Building backend..."
npm run build

echo "[run.sh] Starting backend (npm start)..."
# Start in background
npm start &
BACK_PID=$!
echo "[run.sh] Backend PID: ${BACK_PID}"

# Wait until backend port is accepting connections (max ~15s)
ATTEMPTS=30
SLEEP=0.5
echo -n "[run.sh] Waiting for backend to be ready on :${BACK_PORT}"
for ((i=1; i<=ATTEMPTS; i++)); do
  if (echo > "/dev/tcp/127.0.0.1/${BACK_PORT}") >/dev/null 2>&1; then
    echo " -> OK"
    break
  fi
  echo -n "."
  sleep "${SLEEP}"
  if (( i == ATTEMPTS )); then
    echo "\n[run.sh][WARN] Backend did not open port ${BACK_PORT} in time. Continuing anyway..."
  fi
done

popd >/dev/null

# --- Start frontend ---
if [[ ! -d "${FRONT_DIR}" ]]; then
  echo "[run.sh][ERROR] Frontend directory not found: ${FRONT_DIR}" >&2
  exit 1
fi

echo "[run.sh] Serving frontend statically on http://localhost:${FRONT_PORT}/"
if command -v python3 >/dev/null 2>&1; then
  # Python is preferred (no extra deps)
  echo "[run.sh] Using: python3 -m http.server ${FRONT_PORT}"
  echo "[run.sh] Open these URLs in your browser:"
  echo "  - http://localhost:${FRONT_PORT}/signin.html"
  echo "  - http://localhost:${FRONT_PORT}/main.html"
  echo "  - http://localhost:${FRONT_PORT}/profile.html"
  echo "  - http://localhost:${FRONT_PORT}/comments.html"
  echo "  - http://localhost:${FRONT_PORT}/post-search.html"
  echo "  - http://localhost:${FRONT_PORT}/user-search.html"
  cd "${FRONT_DIR}" && exec python3 -m http.server "${FRONT_PORT}"
elif command -v npx >/dev/null 2>&1; then
  echo "[run.sh] Using: npx http-server -p ${FRONT_PORT}"
  echo "[run.sh] If prompted, confirm installing http-server."
  echo "[run.sh] Open http://localhost:${FRONT_PORT}/ after start."
  cd "${FRONT_DIR}" && exec npx http-server -p "${FRONT_PORT}"
else
  echo "[run.sh][ERROR] Neither python3 nor npx is available to serve the frontend." >&2
  echo "Install Python 3 or Node.js (npx http-server) and re-run."
  exit 1
fi
