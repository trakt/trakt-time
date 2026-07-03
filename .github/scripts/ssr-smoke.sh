#!/usr/bin/env bash
# SSR render smoke test.
#
# Typecheck, vitest (jsdom), and the doctor build all run with browser
# resolve conditions, so a dependency that breaks *server-side* rendering
# sails through every other gate and 500s production on deploy (see the
# tanstack persist-client 6.x incident). This boots the real dev server
# and asserts a page that exercises the query/persist provider layer
# actually renders.
#
# Env:
#   SSR_SMOKE_PORT   defaults to 4173
#   SSR_SMOKE_PATH   defaults to /shows/watchlist

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
PORT="${SSR_SMOKE_PORT:-4173}"
SMOKE_PATH="${SSR_SMOKE_PATH:-/shows/watchlist}"
LOG_FILE="$(mktemp "${TMPDIR:-/tmp}/ssr-smoke.XXXXXX")"

cd "$ROOT/projects/client"

deno task dev --port "$PORT" --strictPort > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

# Poll until the page renders. Transient non-200s are fine while vite
# warms up; a broken SSR path never turns 200, so a timeout is a failure.
for _ in $(seq 1 90); do
  sleep 1
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${PORT}${SMOKE_PATH}" || true)
  if [ "$CODE" = "200" ]; then
    echo "SSR smoke OK (${SMOKE_PATH} rendered)"
    exit 0
  fi
done

echo "::error::SSR smoke failed: ${SMOKE_PATH} never rendered (last status: ${CODE:-none})"
echo "── last 60 lines of dev server output ──"
tail -n 60 "$LOG_FILE"
exit 1
