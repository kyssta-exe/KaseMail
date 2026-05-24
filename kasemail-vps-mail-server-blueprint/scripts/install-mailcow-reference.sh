#!/usr/bin/env bash
set -Eeuo pipefail
# Reference-only mailcow install helper. Review before production.
if [ "${EUID:-$(id -u)}" -ne 0 ]; then echo "Run as root" >&2; exit 1; fi
MAIL_HOSTNAME=${MAIL_HOSTNAME:-mail.example.com}
apt-get update
apt-get install -y git openssl curl gawk coreutils grep jq
if ! command -v docker >/dev/null 2>&1; then curl -fsSL https://get.docker.com | sh; fi
systemctl enable --now docker
apt-get install -y docker-compose-plugin || true
cd /opt
[ -d mailcow-dockerized ] || git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized
echo "Run ./generate_config.sh and enter hostname: $MAIL_HOSTNAME"
./generate_config.sh
docker compose pull
docker compose up -d
