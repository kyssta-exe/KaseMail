#!/usr/bin/env bash
set -Eeuo pipefail
# Example restic backup wrapper. Requires RESTIC_REPOSITORY and RESTIC_PASSWORD env vars.
: "${RESTIC_REPOSITORY:?Set RESTIC_REPOSITORY}"
: "${RESTIC_PASSWORD:?Set RESTIC_PASSWORD}"
MAILCOW_DIR=${MAILCOW_DIR:-/opt/mailcow-dockerized}
HOST_TAG=${HOST_TAG:-kasemail-mailcow}
if ! command -v restic >/dev/null 2>&1; then echo "Install restic first" >&2; exit 1; fi
cd "$MAILCOW_DIR"
./helper-scripts/backup_and_restore.sh backup all --delete-days 7
restic backup /opt/mailcow-dockerized /var/lib/docker/volumes --tag "$HOST_TAG"
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune
restic check
