#!/usr/bin/env bash
set -Eeuo pipefail
# Reference-only Stalwart Docker helper. Review current Stalwart docs before production.
if [ "${EUID:-$(id -u)}" -ne 0 ]; then echo "Run as root" >&2; exit 1; fi
INSTALL_DIR=${INSTALL_DIR:-/opt/kasemail-stalwart}
RECOVERY_ADMIN=${RECOVERY_ADMIN:-admin:change-this-password}
mkdir -p "$INSTALL_DIR"
cat > "$INSTALL_DIR/docker-compose.yml" <<EOF
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
      - STALWART_RECOVERY_ADMIN=$RECOVERY_ADMIN
    volumes:
      - stalwart_etc:/etc/stalwart
      - stalwart_data:/var/lib/stalwart
volumes:
  stalwart_etc:
  stalwart_data:
EOF
cd "$INSTALL_DIR"
docker compose up -d
