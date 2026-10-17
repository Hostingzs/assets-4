#!/usr/bin/env bash
# Drive Mad (offline build) — local server launcher.
# The game must be served over HTTP (file:// will not boot the wasm data package).
PORT="${1:-8080}"
echo "Drive Mad offline -> http://localhost:${PORT}"
python3 -m http.server "$PORT" --bind 0.0.0.0
