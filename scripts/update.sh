#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="/opt/kasemail"
APP_DIR="${ROOT_DIR}/app"
REPO_URL="${KASEMAIL_REPO_URL:-https://github.com/kyssta-exe/KaseMail.git}"
ENV_FILE="${APP_DIR}/.env.production"
COMPOSE_FILE="${APP_DIR}/docker-compose.yml"
BACKUP_DIR="${ROOT_DIR}/backups/pre-update-$(date +%Y%m%d-%H%M%S)"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; }

if [[ $EUID -ne 0 ]]; then
  err "Run as root: sudo bash scripts/update.sh"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  err "Missing $ENV_FILE. Run installer first."
  exit 1
fi

mkdir -p "$BACKUP_DIR"
cp "$ENV_FILE" "$BACKUP_DIR/.env.production"

log "Backing up database"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres pg_dump -U kasemail kasemail > "$BACKUP_DIR/db.sql" 2>/dev/null || warn "Database backup skipped"

if [[ ! -d "$APP_DIR/.git" ]]; then
  log "Converting installed copy to git-managed checkout"
  mv "$APP_DIR" "${APP_DIR}.old.$(date +%s)"
  git clone "$REPO_URL" "$APP_DIR"
  cp "$BACKUP_DIR/.env.production" "$ENV_FILE"
  cd "$APP_DIR"
  cp scripts/docker-compose.production.yml docker-compose.yml
else
  cd "$APP_DIR"
fi

log "Fetching latest code"
git fetch origin main --tags
CURRENT="$(git rev-parse --short HEAD)"
LATEST="$(git rev-parse --short origin/main)"

if [[ "$CURRENT" == "$LATEST" ]]; then
  log "Code already up-to-date (${CURRENT})"
else
  log "Updating ${CURRENT} -> ${LATEST}"
  git checkout main
  git reset --hard origin/main
fi

cp scripts/docker-compose.production.yml docker-compose.yml

log "Rebuilding app image"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --pull app

log "Starting infrastructure"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres redis stalwart

log "Applying database schema"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm --no-deps --entrypoint "" app ./node_modules/.bin/prisma db push --accept-data-loss

log "Re-seeding admin/workspace"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm --no-deps --entrypoint "" app npm run db:seed --silent || warn "Seed skipped"

log "Restarting app"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate app

docker image prune -f >/dev/null 2>&1 || true

log "Update complete (${LATEST})"
echo "Backup: $BACKUP_DIR"
