# 03 - Architecture

## High-level design

KaseMail should be split into these layers:

1. **Mail core:** mailcow or Stalwart. Handles SMTP, submission, IMAP/JMAP, DKIM signing, anti-spam, queues, storage, and TLS.
2. **Control plane:** KaseMail API and admin panel. Handles workspaces, users, RBAC, domain verification, mailboxes, aliases, quotas, migration jobs, audit logs, and billing/limits if added later.
3. **Webmail:** KaseMail webmail UI. Talks to IMAP/SMTP or JMAP. Provides inbox, search, compose, filters, identities, contacts, calendar, and mobile/PWA UX.
4. **Operations:** DNS health checks, backups, monitoring, alerting, logs, fail2ban/auto-banning, vulnerability updates, and restore procedures.

## Recommended production topology for one VPS

```
Internet
  |
  | 25, 465, 587, 143, 993, 80, 443
  v
VPS public IP with PTR -> mail.example.com
  |
  +-- mailcow or Stalwart mail core
  |     +-- SMTP inbound/outbound
  |     +-- Submission SMTP
  |     +-- IMAP/JMAP
  |     +-- DKIM signing
  |     +-- spam/virus filtering
  |     +-- mail storage
  |
  +-- KaseMail panel
  |     +-- Next.js or Remix frontend
  |     +-- API server
  |     +-- Postgres metadata DB
  |     +-- Redis queue/cache
  |
  +-- Webmail UI
  |     +-- IMAP/JMAP client
  |     +-- SMTP submit
  |
  +-- Monitoring and backups
        +-- Prometheus/Loki/Grafana or simpler uptime checks
        +-- Restic/Borg backup to S3-compatible storage
```

## Domains

Use separate hostnames:

- `mail.example.com` - SMTP/IMAP/JMAP mail hostname and PTR/rDNS target.
- `panel.example.com` - superadmin/workspace admin panel.
- `webmail.example.com` - webmail UI.
- `mta-sts.example.com` - MTA-STS policy host if using MTA-STS.
- `autoconfig.example.com` and `autodiscover.example.com` - client setup helpers.

For a small private installation, `mail.example.com` can also host webmail and panel behind routes, but separate hostnames are cleaner and easier to secure.

## Data ownership

The KaseMail panel must not become the only source of truth for mail delivery. The mail core remains the source of truth for actual mailboxes, aliases, DKIM keys, queues, and message storage.

KaseMail stores:

- Workspaces and users.
- Role assignments.
- Desired mailbox/domain state.
- Audit log.
- DNS verification state.
- Backup/migration job state.
- UI preferences.

The mail core stores:

- Mailbox credentials, mail storage, aliases, routing, DKIM keys, spam settings, and queues.

Use reconciliation jobs so KaseMail can detect drift between its database and the mail core.

## Mail flow

Inbound:

1. Remote sender looks up MX for `brand.io`.
2. MX points to `mail.brand.io` or `mail.example.com`.
3. VPS receives SMTP on port 25.
4. Mail core checks SPF/DKIM/DMARC for inbound sender, spam reputation, virus/malware, greylisting/rate limits.
5. Valid mail lands in Dovecot/Stalwart mailbox storage.
6. User reads via webmail, IMAP, mobile, or desktop client.

Outbound:

1. User submits message through webmail or SMTP submission on 587/465.
2. Mail core authenticates user and ensures sender identity is allowed.
3. Mail core signs with DKIM for the domain.
4. Mail core sends to recipient MX using TLS when available.
5. Bounces/DSNs and DMARC/TLS reports are parsed into admin dashboards.

## HA and scaling

Start with one VPS. For a private system, high availability is usually less important than clean backups and quick restore.

Future HA options:

- Separate outbound relay/smart host for high deliverability.
- Secondary MX that queues during downtime.
- Object storage for blobs and separate DB/storage if using Stalwart.
- Cold standby with daily replicated backups.
- Kubernetes/Swarm only after the single-node setup is stable.
