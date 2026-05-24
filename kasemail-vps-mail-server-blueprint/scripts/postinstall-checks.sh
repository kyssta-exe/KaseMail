#!/usr/bin/env bash
set -Eeuo pipefail
DOMAIN=${1:-example.com}
MAIL_HOST=${2:-mail.$DOMAIN}
echo "Checking DNS for $DOMAIN and $MAIL_HOST"
command -v dig >/dev/null 2>&1 || { echo "Install dnsutils/bind-utils for dig" >&2; exit 1; }
dig +short A "$MAIL_HOST"
dig +short MX "$DOMAIN"
dig +short TXT "$DOMAIN"
dig +short TXT "_dmarc.$DOMAIN"
dig +short TXT "_mta-sts.$DOMAIN" || true
echo "Check PTR manually with: dig -x <VPS_PUBLIC_IP>"
echo "Check ports locally with: ss -tlpn | grep -E -w '25|80|443|465|587|993'"
