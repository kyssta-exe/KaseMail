#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
trap 'echo "[kasemail] error on line $LINENO" >&2' ERR

need_root() {
  if [ "${EUID:-$(id -u)}" -ne 0 ]; then
    echo "Run as root: sudo bash install.sh" >&2
    exit 1
  fi
}

ask() {
  local prompt="$1" default="$2" value
  read -r -p "$prompt [$default]: " value
  printf '%s' "${value:-$default}"
}

ask_secret() {
  local prompt="$1" value value2
  while true; do
    read -r -s -p "$prompt: " value; echo
    read -r -s -p "Confirm $prompt: " value2; echo
    if [ "$value" = "$value2" ] && [ -n "$value" ]; then
      printf '%s' "$value"
      return
    fi
    echo "Values did not match or were empty. Try again." >&2
  done
}

install_docker_debian() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    echo "[kasemail] Docker and Compose already installed"
    return
  fi
  apt-get update
  apt-get install -y ca-certificates curl gnupg git jq openssl gawk coreutils grep
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
  apt-get install -y docker-compose-plugin || true
}

check_ports() {
  echo "[kasemail] Checking common mail/web ports"
  if ss -tlpn | grep -E -w ':(25|80|110|143|443|465|587|993|995|4190)' || true; then
    echo "[kasemail] If ports above are used by other services, stop them before production deploy."
  fi
}

need_root
source /etc/os-release || true
if ! command -v ss >/dev/null 2>&1; then apt-get update && apt-get install -y iproute2; fi

PRIMARY_DOMAIN=$(ask "Primary domain" "example.com")
MAIL_HOSTNAME=$(ask "Mail hostname" "mail.$PRIMARY_DOMAIN")
PANEL_HOSTNAME=$(ask "Panel hostname" "panel.$PRIMARY_DOMAIN")
WEBMAIL_HOSTNAME=$(ask "Webmail hostname" "webmail.$PRIMARY_DOMAIN")
ADMIN_EMAIL=$(ask "Superadmin email" "admin@$PRIMARY_DOMAIN")
TIMEZONE=$(ask "Timezone" "UTC")
STACK=$(ask "Mail core (mailcow/stalwart)" "mailcow")
ENABLE_POP3=$(ask "Enable POP3? (yes/no)" "no")
ENABLE_MTA_STS=$(ask "Enable MTA-STS/TLS-RPT DNS guidance? (yes/no)" "yes")
ADMIN_PASSWORD=$(ask_secret "Superadmin password")

INSTALL_DIR=/opt/kasemail
mkdir -p "$INSTALL_DIR"
cat > "$INSTALL_DIR/answers.env" <<EOF
PRIMARY_DOMAIN=$PRIMARY_DOMAIN
MAIL_HOSTNAME=$MAIL_HOSTNAME
PANEL_HOSTNAME=$PANEL_HOSTNAME
WEBMAIL_HOSTNAME=$WEBMAIL_HOSTNAME
ADMIN_EMAIL=$ADMIN_EMAIL
TIMEZONE=$TIMEZONE
STACK=$STACK
ENABLE_POP3=$ENABLE_POP3
ENABLE_MTA_STS=$ENABLE_MTA_STS
EOF
chmod 600 "$INSTALL_DIR/answers.env"

check_ports
install_docker_debian

case "$STACK" in
  mailcow)
    echo "[kasemail] Installing mailcow reference stack"
    if [ ! -d /opt/mailcow-dockerized ]; then
      cd /opt
      git clone https://github.com/mailcow/mailcow-dockerized
    fi
    cd /opt/mailcow-dockerized
    echo "[kasemail] mailcow generate_config.sh may ask for hostname and timezone. Use: $MAIL_HOSTNAME and $TIMEZONE"
    ./generate_config.sh
    echo "[kasemail] Pulling and starting mailcow"
    docker compose pull
    docker compose up -d
    ;;
  stalwart)
    echo "[kasemail] Writing Stalwart reference compose"
    mkdir -p "$INSTALL_DIR/stalwart"
    cat > "$INSTALL_DIR/docker-compose.yml" <<'EOF'
services:
  stalwart:
    image: stalwartlabs/stalwart:latest
    restart: unless-stopped
    ports:
      - "25:25"
      - "465:465"
      - "587:587"
      - "143:143"
      - "993:993"
      - "8080:8080"
    environment:
      - STALWART_RECOVERY_ADMIN=admin:CHANGE_THIS_AFTER_BOOTSTRAP
    volumes:
      - stalwart_etc:/etc/stalwart
      - stalwart_data:/var/lib/stalwart
volumes:
  stalwart_etc:
  stalwart_data:
EOF
    sed -i "s|CHANGE_THIS_AFTER_BOOTSTRAP|$ADMIN_PASSWORD|g" "$INSTALL_DIR/docker-compose.yml"
    cd "$INSTALL_DIR"
    docker compose up -d
    ;;
  *)
    echo "Unknown STACK: $STACK" >&2
    exit 1
    ;;
esac

cat > "$INSTALL_DIR/dns-records.md" <<EOF
# DNS records to create

Primary domain: $PRIMARY_DOMAIN
Mail hostname: $MAIL_HOSTNAME
Panel hostname: $PANEL_HOSTNAME
Webmail hostname: $WEBMAIL_HOSTNAME

Set PTR/rDNS at your VPS provider:

- VPS public IP -> $MAIL_HOSTNAME

Create/verify DNS:

- $MAIL_HOSTNAME A <VPS_PUBLIC_IP>
- $PANEL_HOSTNAME A <VPS_PUBLIC_IP>
- $WEBMAIL_HOSTNAME A <VPS_PUBLIC_IP>
- $PRIMARY_DOMAIN MX 10 $MAIL_HOSTNAME.
- $PRIMARY_DOMAIN TXT "v=spf1 mx -all"
- _dmarc.$PRIMARY_DOMAIN TXT "v=DMARC1; p=none; rua=mailto:dmarc@$PRIMARY_DOMAIN; adkim=s; aspf=s"
- DKIM TXT: copy from mail core admin UI after domain creation.

Optional:

- _mta-sts.$PRIMARY_DOMAIN TXT "v=STSv1; id=$(date +%Y%m%d%H%M)"
- _smtp._tls.$PRIMARY_DOMAIN TXT "v=TLSRPTv1; rua=mailto:tlsrpt@$PRIMARY_DOMAIN"
EOF
chmod 600 "$INSTALL_DIR/dns-records.md"

cat > "$INSTALL_DIR/install-report.md" <<EOF
# KaseMail install report

- Stack: $STACK
- Primary domain: $PRIMARY_DOMAIN
- Mail hostname: $MAIL_HOSTNAME
- Panel hostname: $PANEL_HOSTNAME
- Webmail hostname: $WEBMAIL_HOSTNAME
- Admin email: $ADMIN_EMAIL
- Timezone: $TIMEZONE

Next steps:

1. Configure PTR/rDNS at VPS provider.
2. Add DNS records from $INSTALL_DIR/dns-records.md.
3. Log into the mail core admin UI.
4. Change default/recovery passwords.
5. Create primary domain and mailbox.
6. Copy DKIM DNS record from the mail core.
7. Run postinstall DNS and mail tests.
8. Configure encrypted offsite backups before real mail use.
EOF
chmod 600 "$INSTALL_DIR/install-report.md"

echo "[kasemail] Done. Read $INSTALL_DIR/install-report.md and $INSTALL_DIR/dns-records.md"
