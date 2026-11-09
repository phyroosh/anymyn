#!/usr/bin/env bash
# ANYMYN STUDIO — Single Command Launcher
# Binds strictly to 127.0.0.1:4242
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================="
echo "  Starting ANYMYN STUDIO — Local Video Control Center"
echo "  Target URL: http://127.0.0.1:4242"
echo "=========================================================="

# Check if port 4242 is held by a lingering process and free it
if command -v lsof >/dev/null 2>&1; then
  LINGERING_PID="$(lsof -ti :4242 2>/dev/null || true)"
  if [ -n "$LINGERING_PID" ]; then
    echo "[ANYMYN Studio] Releasing lingering process (PID: $LINGERING_PID) on port 4242..."
    kill -15 $LINGERING_PID 2>/dev/null || kill -9 $LINGERING_PID 2>/dev/null || true
    sleep 0.3
  fi
fi

exec node studio/control-center/server.js "$@"
