# 04 - VPS, DNS, and Deliverability Setup

## VPS requirements

For mailcow day-1 route:

- Clean dedicated VPS or full virtualization, not LXC/OpenVZ/shared container.
- Ubuntu 22.04+ or Debian 12/13 recommended.
- At least 6 GiB RAM + 1 GiB swap for default mailcow; 8 GiB is more comfortable for a few users.
- 20 GiB disk minimum before email storage; use more for real mailboxes.
- Public IPv4 with port 25 open.
- Reverse DNS/PTR control at the VPS provider.

For a Stalwart custom-product route:

- 2 to 4 GiB RAM can work for small deployments depending on storage and spam filtering choices, but use 4 to 8 GiB for production comfort.
- Docker or native service installation.
- A clear plan for data, blob, search, and backup storage.

## Ports

Open inbound:

| Port | Purpose |
|---:|---|
| 25 | SMTP server-to-server mail delivery |
| 465 | SMTPS submission |
| 587 | SMTP submission with STARTTLS |
| 143 | IMAP, optional if you force IMAPS only |
| 993 | IMAPS |
| 80 | ACME HTTP challenge and redirect to HTTPS |
| 443 | HTTPS panel/webmail/JMAP/WebDAV/autoconfig |
| 4190 | ManageSieve, optional |
| 110/995 | POP3/POP3S, optional and usually disabled unless needed |

## PTR/rDNS

Set reverse DNS at the VPS provider:

```
203.0.113.10 -> mail.example.com
mail.example.com A -> 203.0.113.10
```

Forward and reverse must match. This is one of the most common reasons new self-hosted mail servers go to spam or get rejected.

## DNS records per hosted domain

Example for `brand.io` using `mail.example.com` as the central mail host:

```dns
@                 MX   10 mail.example.com.
@                 TXT  "v=spf1 mx -all"
_dmarc            TXT  "v=DMARC1; p=none; rua=mailto:dmarc@brand.io; adkim=s; aspf=s"
kase1._domainkey  TXT  "v=DKIM1; k=rsa; p=PUBLIC_KEY_FROM_MAIL_CORE"
```

If you use a domain-specific mail host:

```dns
mail              A    203.0.113.10
@                 MX   10 mail.brand.io.
@                 TXT  "v=spf1 a:mail.brand.io -all"
```

Optional but recommended:

```dns
_mta-sts          TXT  "v=STSv1; id=2026052301"
_smtp._tls        TXT  "v=TLSRPTv1; rua=mailto:tlsrpt@brand.io"
mta-sts           A    203.0.113.10
_autodiscover._tcp SRV 0 1 443 mail.example.com.
_imaps._tcp        SRV 0 1 993 mail.example.com.
_submission._tcp  SRV 0 1 587 mail.example.com.
```

MTA-STS policy served over HTTPS at:

```
https://mta-sts.brand.io/.well-known/mta-sts.txt
```

Example content:

```txt
version: STSv1
mode: testing
mx: mail.example.com
max_age: 86400
```

Move from `testing` to `enforce` only after TLS reports show clean delivery.

## DMARC rollout

Start with monitoring:

```dns
_dmarc TXT "v=DMARC1; p=none; rua=mailto:dmarc@brand.io; adkim=s; aspf=s"
```

After all legitimate senders pass alignment:

```dns
_dmarc TXT "v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc@brand.io; adkim=s; aspf=s"
```

Then increase to 100 percent and eventually:

```dns
_dmarc TXT "v=DMARC1; p=reject; rua=mailto:dmarc@brand.io; adkim=s; aspf=s"
```

## Deliverability rules

- Never run this on a residential connection.
- Do not use cheap VPS IPs with bad reputation if mail delivery matters.
- Do not send cold/bulk marketing from this private server.
- Use a separate domain or subdomain for marketing if you must send campaigns.
- Keep complaint rate below mailbox-provider thresholds.
- Keep bounce rates low.
- Include one-click unsubscribe headers for subscribed/marketing mail.
- Use Gmail Postmaster Tools, DMARC aggregate reports, and test accounts.
- Consider an outbound smart host such as Postmark, Mailgun, or Amazon SES for transactional or critical outbound mail if your VPS IP is weak.

## DNS verification workflow for KaseMail panel

1. User/admin adds a domain.
2. Panel creates a domain-verification TXT token.
3. Admin publishes the token in DNS.
4. Panel checks TXT, MX, SPF, DKIM, DMARC, MTA-STS, TLS-RPT, and autoconfig records.
5. Panel blocks outbound sending for that domain until SPF, DKIM, DMARC, MX, and PTR checks pass.
6. Panel shows exact copy/paste DNS values and provider-specific instructions.
