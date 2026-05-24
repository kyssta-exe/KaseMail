#!/usr/bin/env bash
set -Eeuo pipefail
DOMAIN=${1:-example.com}
MAIL_HOST=${2:-mail.$DOMAIN}
IP=${3:-203.0.113.10}
cat <<EOF
# DNS records for $DOMAIN

# Host records
$MAIL_HOST.  A  $IP

# Mail routing
$DOMAIN.  MX  10 $MAIL_HOST.

# SPF
$DOMAIN.  TXT  "v=spf1 mx -all"

# DMARC - start with monitoring
_dmarc.$DOMAIN.  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@$DOMAIN; adkim=s; aspf=s"

# DKIM - copy real value from mail core after domain creation
kase1._domainkey.$DOMAIN.  TXT  "v=DKIM1; k=rsa; p=PASTE_PUBLIC_KEY"

# Optional MTA-STS and TLS reporting
_mta-sts.$DOMAIN.  TXT  "v=STSv1; id=$(date +%Y%m%d%H%M)"
_smtp._tls.$DOMAIN.  TXT  "v=TLSRPTv1; rua=mailto:tlsrpt@$DOMAIN"
mta-sts.$DOMAIN.  A  $IP

# Optional client autoconfig
_imaps._tcp.$DOMAIN.  SRV  0 1 993 $MAIL_HOST.
_submission._tcp.$DOMAIN.  SRV  0 1 587 $MAIL_HOST.
EOF
