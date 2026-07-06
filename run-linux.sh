#!/usr/bin/env bash
set -euo pipefail
export PORT=${PORT:-8080}
# Set these before the first run if needed.
# export ADMIN_PIN="change-this-admin-pin"
# export MEMBER_PIN="change-this-member-pin"
# export VIEWER_PIN="change-this-viewer-pin"
node server.js
