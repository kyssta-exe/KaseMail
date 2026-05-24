#!/usr/bin/env bash
# KaseMail VPS Installer
# Usage: sudo bash scripts/install-vps.sh
set -Eeuo pipefail

APP_DIR="/opt/kasemail"
REPO_URL="${KASEMAIL_REPO_URL:-}"
PUBLIC_IP="$(curl -4fsS https://api.ipify.org 2>/dev/null || echo "YOUR_SERVER_IP")"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { printf "${BLUE}==>${NC} %s\n" "$*"; }
ok()   { printf "${GREEN}OK:${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}WARN:${NC} %s\n" "$*"; }
fail() { printf "${RED}ERROR:${NC} %s\n" "$*" >&2; exit 1; }
rand() { openssl rand -base64 48 | tr -d '\n'; }
prompt() { printf "${CYAN}?${NC} %s" "$*"; }

trap 'fail "Installation failed on line $LINENO. Check /opt/kasemail/logs/install.log for details."' ERR

# ---- Pre-flight ----
if [[ "${EUID}" -ne 0 ]]; then fail "Run as root: sudo bash scripts/install-vps.sh"; fi
if ! grep -qi ubuntu /etc/os-release 2>/dev/null; then fail "This installer supports Ubuntu 22.04/24.04 only."; fi
source /etc/os-release
case "${VERSION_ID}" in 22.04|24.04) ;; *) fail "Unsupported Ubuntu version: ${VERSION_ID}";; esac
command -v curl >/dev/null 2>&1 || { apt-get update -qq && apt-get install -y -qq curl; }

mkdir -p "$APP_DIR/logs"
exec > >(tee -a "$APP_DIR/logs/install.log") 2>&1

# ---- Welcome ----
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║        KaseMail VPS Installer v1.0          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ---- Phase 1: Dependency Check + Install ----
log "Phase 1/5: Checking system dependencies"
DEPS_MISSING=()
for dep in curl git openssl ufw; do
  command -v "$dep" >/dev/null 2>&1 || DEPS_MISSING+=("$dep")
done
DEBIAN_PKGS="ca-certificates gnupg git openssl ufw"
if ! command -v nginx >/dev/null 2>&1; then DEBIAN_PKGS+=" nginx"; fi
if ! command -v certbot >/dev/null 2>&1; then DEBIAN_PKGS+=" certbot python3-certbot-nginx"; fi
if ! systemctl is-enabled --quiet fail2ban 2>/dev/null; then DEBIAN_PKGS+=" fail2ban"; fi
if ! dpkg -s unattended-upgrades >/dev/null 2>&1; then DEBIAN_PKGS+=" unattended-upgrades"; fi

if [[ -n "$DEBIAN_PKGS" ]]; then
  log "Installing system packages: ${DEBIAN_PKGS}"
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq $DEBIAN_PKGS
fi

if ! command -v docker >/dev/null 2>&1; then
  log "Docker not found. Installing Docker..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

if ! docker compose version >/dev/null 2>&1; then
  log "Docker Compose plugin not found. Installing..."
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq docker-compose-plugin
fi

ok "All system dependencies installed"
echo ""

# ---- Phase 2: Gather Configuration ----
log "Phase 2/5: Configuration"
echo "Press Enter to accept defaults shown in brackets."
echo ""

prompt "Super admin display name [Admin]: "; read -r ADMIN_NAME
ADMIN_NAME="${ADMIN_NAME:-Admin}"

while :; do
  prompt "Super admin email: "; read -r ADMIN_EMAIL
  [[ "$ADMIN_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]] && break
  warn "Invalid email format. Try again."
done

while :; do
  prompt "Super admin username (local part of email if unsure) [${ADMIN_EMAIL%@*}]: "; read -r ADMIN_USER
  ADMIN_USER="${ADMIN_USER:-${ADMIN_EMAIL%@*}}"
  [[ -n "$ADMIN_USER" ]] && break
done

while :; do
  prompt "Super admin password (min 8 chars): "; read -rs ADMIN_PASSWORD; echo
  [[ ${#ADMIN_PASSWORD} -ge 8 ]] && break
  warn "Password too short (min 8 characters)."
done
prompt "Confirm password: "; read -rs ADMIN_PASSWORD2; echo
if [[ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD2" ]]; then fail "Passwords do not match."; fi

while :; do
  prompt "Panel domain (e.g., panel.yourdomain.com): "; read -r PANEL_DOMAIN
  [[ "$PANEL_DOMAIN" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]] && break
  warn "Invalid domain format."
done

while :; do
  prompt "Webmail domain (e.g., webmail.yourdomain.com): "; read -r WEBMAIL_DOMAIN
  [[ "$WEBMAIL_DOMAIN" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]] && break
  warn "Invalid domain format."
done

while :; do
  prompt "Mail hostname (e.g., mail.yourdomain.com): "; read -r MAIL_DOMAIN
  [[ "$MAIL_DOMAIN" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]] && break
  warn "Invalid domain format."
done

prompt "Mail core [mailcow/stalwart] (default: mailcow): "; read -r MAIL_CORE
MAIL_CORE="${MAIL_CORE:-mailcow}"
[[ "$MAIL_CORE" == "mailcow" || "$MAIL_CORE" == "stalwart" ]] || fail "Mail core must be 'mailcow' or 'stalwart'."

prompt "Provision TLS certificates via Let's Encrypt? [Y/n]: "; read -r DO_SSL
DO_SSL="${DO_SSL:-Y}"
LE_EMAIL=""
if [[ "$DO_SSL" =~ ^[Yy](es)?$ ]]; then
  while :; do
    prompt "Let's Encrypt email (for expiry notifications): "; read -r LE_EMAIL
    [[ "$LE_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]] && break
    warn "Invalid email format."
  done
fi

# ---- Summary ----
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║          Installation Summary                ║"
echo "╠══════════════════════════════════════════════╣"
printf "║ Admin name:     %-30s ║\n" "$ADMIN_NAME"
printf "║ Admin email:    %-30s ║\n" "$ADMIN_EMAIL"
printf "║ Panel domain:   %-30s ║\n" "$PANEL_DOMAIN"
printf "║ Webmail domain: %-30s ║\n" "$WEBMAIL_DOMAIN"
printf "║ Mail hostname:  %-30s ║\n" "$MAIL_DOMAIN"
printf "║ Mail core:      %-30s ║\n" "$MAIL_CORE"
printf "║ TLS certs:      %-30s ║\n" "$([[ "$DO_SSL" =~ ^[Yy](es)?$ ]] && echo "Yes (${LE_EMAIL})" || echo "No")"
printf "║ Server IP:      %-30s ║\n" "$PUBLIC_IP"
echo "╚══════════════════════════════════════════════╝"
echo ""
prompt "Proceed with installation? [Y/n]: "; read -r CONFIRM
[[ "$CONFIRM" =~ ^[Nn]o?$ ]] && fail "Installation cancelled."

# ---- Phase 3: Setup Application ----
echo ""
log "Phase 3/5: Setting up KaseMail"

DB_PASSWORD="$(rand)"
JWT_SECRET="$(rand)"
ENCRYPTION_KEY="$(openssl rand -hex 32)"

mkdir -p "$APP_DIR" "$APP_DIR/backups" "$APP_DIR/logs" "$APP_DIR/config"

if [[ -n "$REPO_URL" ]]; then
  if [[ -d "$APP_DIR/app/.git" ]]; then
    git -C "$APP_DIR/app" pull --ff-only
  else
    git clone "$REPO_URL" "$APP_DIR/app"
  fi
else
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  if [[ -f "$SCRIPT_DIR/package.json" ]]; then
    log "Copying application files from $SCRIPT_DIR"
    rsync -a --delete --exclude node_modules --exclude .next --exclude .git --exclude .docker --exclude kasemail-vps-mail-server-blueprint "$SCRIPT_DIR/" "$APP_DIR/app/"
  else
    warn "No repository URL and no local source found."
    fail "Set KASEMAIL_REPO_URL or run this script from the KaseMail project directory."
  fi
fi

cd "$APP_DIR/app"
cp scripts/docker-compose.production.yml docker-compose.yml

cat > .env.production <<ENVEOF
# Database
DB_PASSWORD=${DB_PASSWORD}
DATABASE_URL=postgresql://kasemail:${DB_PASSWORD}@postgres:5432/kasemail?schema=public

# Auth
JWT_SECRET=${JWT_SECRET}
SESSION_EXPIRY_HOURS=72

# Mail core
MAIL_CORE_ADAPTER=${MAIL_CORE}
MAILCOW_API_URL=https://${MAIL_DOMAIN}
MAILCOW_API_KEY=
STALWART_API_URL=https://${MAIL_DOMAIN}
STALWART_API_KEY=

# App URLs
NEXT_PUBLIC_APP_URL=https://${PANEL_DOMAIN}
NEXT_PUBLIC_WEBMAIL_URL=https://${WEBMAIL_DOMAIN}
NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=

# Encryption
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# Backup
BACKUP_TARGET=${APP_DIR}/backups

# Monitoring
ALERT_EMAIL=${LE_EMAIL:-${ADMIN_EMAIL}}

# Internal (used by scripts)
PANEL_DOMAIN=${PANEL_DOMAIN}
WEBMAIL_DOMAIN=${WEBMAIL_DOMAIN}
MAIL_DOMAIN=${MAIL_DOMAIN}

# Seed defaults
SEED_SUPERADMIN_EMAIL=${ADMIN_EMAIL}
SEED_SUPERADMIN_PASSWORD=${ADMIN_PASSWORD}
ENVEOF

ok "Configuration written to .env.production"
echo ""

# ---- Phase 4: Deploy ----
log "Phase 4/5: Deploying services"

log "Configuring firewall"
ufw --force reset 2>/dev/null || true
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
if [[ "$MAIL_CORE" == "mailcow" ]]; then
  ufw allow 25/tcp comment 'SMTP'
  ufw allow 465/tcp comment 'SMTPS'
  ufw allow 587/tcp comment 'MSA'
  ufw allow 993/tcp comment 'IMAPS'
  ufw allow 995/tcp comment 'POP3S'
fi
ufw --force enable
ok "Firewall configured"

log "Building Docker images and starting services"
docker compose --env-file .env.production up -d --build postgres redis app
ok "Services started"

log "Waiting for PostgreSQL to be ready"
for i in {1..30}; do
  if docker compose --env-file .env.production exec -T postgres pg_isready -U kasemail -d kasemail >/dev/null 2>&1; then
    ok "PostgreSQL ready"
    break
  fi
  if [[ $i -eq 30 ]]; then fail "PostgreSQL did not become ready within 60 seconds"; fi
  sleep 2
done

log "Running database migrations"
docker compose --env-file .env.production exec -T app npx prisma migrate deploy
ok "Migrations applied"

log "Seeding superadmin and default workspace"
SEED_OUTPUT="$(docker compose --env-file .env.production exec -T app npm run db:seed --silent 2>/dev/null || echo "")"
DEFAULT_WORKSPACE_ID="$(printf '%s' "$SEED_OUTPUT" | sed -n 's/.*"workspaceId": "\([^"]*\)".*/\1/p' | tail -n1)"
if [[ -n "$DEFAULT_WORKSPACE_ID" ]]; then
  sed -i "s/^NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=.*/NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=${DEFAULT_WORKSPACE_ID}/" .env.production
  docker compose --env-file .env.production up -d --build app
  ok "Workspace seeded (ID: ${DEFAULT_WORKSPACE_ID})"
fi
echo ""

# ---- Phase 5: Configure Reverse Proxy + SSL ----
log "Phase 5/5: Configuring reverse proxy and SSL"

log "Configuring nginx"
rm -f /etc/nginx/sites-enabled/default

cat > /etc/nginx/sites-available/kasemail.conf <<NGINXEOF
upstream kasemail_app {
  server 127.0.0.1:3000;
  keepalive 64;
}

server {
  listen 80;
  server_name ${PANEL_DOMAIN} ${WEBMAIL_DOMAIN};

  client_max_body_size 32m;

  location / {
    proxy_pass http://kasemail_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    proxy_next_upstream error timeout invalid_header http_500;
    proxy_connect_timeout 10;
    proxy_send_timeout 30;
    proxy_read_timeout 30;
  }
}
NGINXEOF

if [[ -L /etc/nginx/sites-enabled/kasemail.conf ]]; then
  rm -f /etc/nginx/sites-enabled/kasemail.conf
fi
ln -sf /etc/nginx/sites-available/kasemail.conf /etc/nginx/sites-enabled/kasemail.conf
nginx -t && systemctl reload nginx
ok "nginx configured"

if [[ "$DO_SSL" =~ ^[Yy](es)?$ ]]; then
  log "Requesting TLS certificates from Let's Encrypt"
  certbot --nginx -n --agree-tos --expand -m "$LE_EMAIL" -d "$PANEL_DOMAIN" -d "$WEBMAIL_DOMAIN" || warn "Certbot failed. Verify DNS A records for both domains point to ${PUBLIC_IP}, then run: certbot --nginx -d ${PANEL_DOMAIN} -d ${WEBMAIL_DOMAIN}"
  ok "TLS certificates installed"
else
  warn "Skipping TLS. Secure your server later with: certbot --nginx -d ${PANEL_DOMAIN} -d ${WEBMAIL_DOMAIN}"
fi

log "Enabling automatic security updates"
dpkg-reconfigure -f noninteractive unattended-upgrades 2>/dev/null || true
systemctl enable --now fail2ban 2>/dev/null || true

log "Installing backup cron job"
cat > /etc/cron.d/kasemail-backup <<CRONEOF
0 3 * * * root cd ${APP_DIR}/app && docker compose --env-file .env.production exec -T postgres pg_dump -U kasemail kasemail | gzip > ${APP_DIR}/backups/kasemail-\$(date +\%F).sql.gz && find ${APP_DIR}/backups -type f -name '*.sql.gz' -mtime +30 -delete
CRONEOF
chmod 644 /etc/cron.d/kasemail-backup
ok "Daily backup cron installed (retention: 30 days)"

# ---- Done ----
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║       KaseMail Installation Complete!        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
printf "  Panel:   ${CYAN}https://%s${NC}\n" "$PANEL_DOMAIN"
printf "  Webmail: ${CYAN}https://%s/mail/inbox${NC}\n" "$WEBMAIL_DOMAIN"
printf "  Admin:   ${CYAN}%s${NC}\n" "$ADMIN_EMAIL"
echo ""
printf "  ${YELLOW}Uninstall: sudo bash %s/uninstall-vps.sh${NC}\n" "$(dirname "${BASH_SOURCE[0]}")"
echo ""
echo "  ── Required DNS records ──"
echo ""
printf "  %-8s %-20s %s\n" "Type" "Name" "Value"
printf "  %-8s %-20s %s\n" "────" "────" "─────"
printf "  %-8s %-20s %s\n" "A" "${PANEL_DOMAIN}" "${PUBLIC_IP}"
printf "  %-8s %-20s %s\n" "A" "${WEBMAIL_DOMAIN}" "${PUBLIC_IP}"
printf "  %-8s %-20s %s\n" "A" "${MAIL_DOMAIN}" "${PUBLIC_IP}"
echo ""
printf "  %-8s %-20s %s\n" "MX" "@" "10 ${MAIL_DOMAIN}"
printf "  %-8s %-20s %s\n" "TXT" "@" "v=spf1 mx ~all"
printf "  %-8s %-20s %s\n" "TXT" "_dmarc" "v=DMARC1; p=quarantine; rua=mailto:postmaster@${PANEL_DOMAIN}"
echo ""
echo "  ── Post-install steps ──"
echo ""
echo "  1. Configure DNS records above and wait for propagation."
echo "  2. Set MAILCOW_API_KEY in ${APP_DIR}/app/.env.production"
echo "     after installing mailcow (or configure Stalwart)."
echo "  3. Restart the app: cd ${APP_DIR}/app && docker compose restart app"
echo "  4. Check logs: cd ${APP_DIR}/app && docker compose logs -f app"
echo "  5. Run certbot again if SSL skipped: certbot --nginx -d ${PANEL_DOMAIN} -d ${WEBMAIL_DOMAIN}"
echo ""
ok "Happy mailing with KaseMail!"
