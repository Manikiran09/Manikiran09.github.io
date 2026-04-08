#!/usr/bin/env bash
# Start backend and frontend dev servers when the Codespace opens.
# Logs are written to /tmp so they don't clutter the workspace.
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "🚀 Starting backend (port 5000)..."
cd "${REPO_ROOT}/event-management/backend"
npm run dev > /tmp/backend.log 2>&1 &

echo "🚀 Starting frontend (port 5173)..."
cd "${REPO_ROOT}/event-management/frontend"
npm run dev > /tmp/frontend.log 2>&1 &

echo ""
echo "Both servers are starting in the background."
echo "  Backend log:  tail -f /tmp/backend.log"
echo "  Frontend log: tail -f /tmp/frontend.log"
