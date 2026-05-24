#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/kasemail"
COMPOSE_FILE="${APP_DIR}/scripts/docker-compose.production.yml"
ENV_FILE="${APP_DIR}/.env.production"
BACKUP_DIR="${APP_DIR}/backups/pre-update"
REPO_URL="https://github.com/your-org/kasemail.git"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; }

cleanup() {
  if [ $? -ne 0 ]; then
    err "Update failed! Rolling back..."
    if [ -d "$BACKUP_DIR" ]; then
      cp "$BACKUP_DIR/.env.production" "$ENV_FILE" 2>/dev/null || true
      warn "Manual restore may be needed: docker compose down && docker compose up -d"
    fi
  fi
}
trap cleanup EXIT

cd "$APP_DIR"

# --- Check current version ---
CURRENT_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "unknown")
log "Current version: ${CURRENT_VERSION}"

# --- Fetch latest ---
log "Fetching latest release info..."
git fetch --tags --force 2>&1 || { warn "Git fetch failed (no network? remaining on current version)"; exit 0; }

LATEST_TAG=$(git tag --sort=-v:refname 2>/dev/null | head -1)
if [ -z "$LATEST_TAG" ]; then
  LATEST_TAG=$(git rev-parse --short HEAD)
fi

if [ "$CURRENT_VERSION" = "$LATEST_TAG" ]; then
  log "Already up-to-date (${CURRENT_VERSION})."
  exit 0
fi

log "Updating: ${CURRENT_VERSION} → ${LATEST_TAG}"

# --- Backup ---
log "Backing up current state..."
mkdir -p "$BACKUP_DIR"
cp "$ENV_FILE" "$BACKUP_DIR/.env.production" 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U kasemail kasemail > "$BACKUP_DIR/db-pre-update.sql" 2>/dev/null || warn "DB backup skipped (postgres not running)"

# --- Pull latest code ---
log "Pulling ${LATEST_TAG}..."
git checkout "$LATEST_TAG" 2>&1 || { err "Git checkout failed"; exit 1; }

# --- Rebuild & restart ---
log "Rebuilding Docker images..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --pull app 2>&1 || { err "Docker build failed"; exit 1; }

log "Running database migrations..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres 2>/dev/null
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm app sh -c "./node_modules/.bin/prisma db push --accept-data-loss" 2>&1 || warn "Migration had issues (schema may not match)"

log "Restarting services..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate app stalwart 2>&1 || { err "Service restart failed"; exit 1; }

# --- Cleanup old images ---
docker image prune -f 2>/dev/null || true

log "Update complete! Running ${LATEST_TAG}"
echo ""
echo "  Panel:   https://$(grep PANEL_DOMAIN "$ENV_FILE" | cut -d= -f2)"
echo "  Webmail: https://$(grep WEBMAIL_DOMAIN "$ENV_FILE" | cut -d= -f2)"
echo ""
echo "  To rollback: cd ${APP_DIR} && git checkout ${CURRENT_VERSION} && bash scripts/update.sh"
