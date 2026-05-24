#!/usr/bin/env bash
# KaseMail VPS Uninstaller
# Usage: sudo bash scripts/uninstall-vps.sh
set -Eeuo pipefail

APP_DIR="/opt/kasemail"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { printf "${BLUE}==>${NC} %s\n" "$*"; }
ok()   { printf "${GREEN}OK:${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}WARN:${NC} %s\n" "$*"; }
fail() { printf "${RED}ERROR:${NC} %s\n" "$*" >&2; exit 1; }

if [[ "${EUID}" -ne 0 ]]; then fail "Run as root: sudo bash scripts/uninstall-vps.sh"; fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║       KaseMail VPS Uninstaller v1.0          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
warn "This will PERMANENTLY REMOVE KaseMail and ALL data:"
echo "  ● Docker containers, images, volumes (PostgreSQL + Redis data)"
echo "  ● ${APP_DIR} directory (app code, backups, config, logs)"
echo "  ● nginx site config for KaseMail"
echo "  ● Let's Encrypt TLS certificates (if any)"
echo "  ● Daily backup cron job"
echo ""
warn "This operation CANNOT be undone."
echo ""

read -rp "Type 'yes' to confirm: " CONFIRM
[[ "$CONFIRM" != "yes" ]] && fail "Uninstall cancelled."

# Try to read domains from env file for cleanup
if [[ -f "${APP_DIR}/app/.env.production" ]]; then
  PANEL_DOMAIN="$(grep -oP '^PANEL_DOMAIN=\K.*' "${APP_DIR}/app/.env.production" || echo "")"
  WEBMAIL_DOMAIN="$(grep -oP '^WEBMAIL_DOMAIN=\K.*' "${APP_DIR}/app/.env.production" || echo "")"
else
  read -rp "Panel domain (for nginx/certbot cleanup): " PANEL_DOMAIN
  read -rp "Webmail domain (for nginx/certbot cleanup): " WEBMAIL_DOMAIN
fi

echo ""

# Step 1: Stop and remove Docker resources
log "Step 1/6: Stopping and removing Docker resources"
if [[ -f "${APP_DIR}/app/docker-compose.yml" ]]; then
  cd "${APP_DIR}/app" && docker compose down --volumes --remove-orphans 2>/dev/null || true
fi
container_ids="$(docker ps -a --filter "name=kasemail" --filter "name=postgres" --filter "name=redis" -q 2>/dev/null || true)"
if [[ -n "$container_ids" ]]; then
  docker rm -f $container_ids 2>/dev/null || true
fi
docker image prune -af --filter "until=24h" 2>/dev/null || true
docker network prune -f 2>/dev/null || true
docker volume prune -af 2>/dev/null || true
ok "Docker resources cleaned"

# Step 2: Remove application directory
log "Step 2/6: Removing application directory"
rm -rf "$APP_DIR"
ok "Application directory removed"

# Step 3: Remove nginx config
log "Step 3/6: Removing nginx configuration"
rm -f /etc/nginx/sites-available/kasemail.conf
rm -f /etc/nginx/sites-enabled/kasemail.conf
if [[ -n "${PANEL_DOMAIN:-}" || -n "${WEBMAIL_DOMAIN:-}" ]]; then
  rm -f "/etc/nginx/sites-available/kasemail-${PANEL_DOMAIN}.conf" 2>/dev/null || true
  rm -f "/etc/nginx/sites-enabled/kasemail-${PANEL_DOMAIN}.conf" 2>/dev/null || true
fi
if nginx -t 2>/dev/null; then
  systemctl reload nginx 2>/dev/null || true
fi
ok "nginx configuration removed"

# Step 4: Remove TLS certificates
log "Step 4/6: Removing Let's Encrypt certificates"
for domain in "${PANEL_DOMAIN:-}" "${WEBMAIL_DOMAIN:-}"; do
  if [[ -n "$domain" ]]; then
    certbot delete --cert-name "$domain" --non-interactive 2>/dev/null || true
  fi
done
ok "TLS certificates removed"

# Step 5: Remove cron job
log "Step 5/6: Removing backup cron job"
rm -f /etc/cron.d/kasemail-backup
systemctl reload cron 2>/dev/null || true
ok "Backup cron job removed"

# Step 6: Cleanup summary
log "Step 6/6: Cleanup complete"
ok "KaseMail fully uninstalled."
echo ""
echo "  ── Manual cleanup (optional) ──"
echo ""
echo "  Remove Docker engine (if no other containers):"
echo "    apt-get purge docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"
echo ""
echo "  Remove nginx (if no other sites):"
echo "    apt-get purge nginx nginx-common nginx-core"
echo ""
echo "  Remove certbot:"
echo "    apt-get purge certbot python3-certbot-nginx"
echo ""
echo "  Remove fail2ban (if not used elsewhere):"
echo "    apt-get purge fail2ban"
echo ""
echo "  Reset firewall:"
echo "    ufw --force reset"
echo ""
echo "  Remove kasemail user (if created):"
echo "    userdel -r kasemail 2>/dev/null || true"
echo ""
