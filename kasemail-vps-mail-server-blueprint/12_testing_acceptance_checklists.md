# 12 - Testing and Acceptance Checklists

## Preflight checklist

- VPS is full virtualization, not LXC/OpenVZ.
- OS is supported.
- Hostname is set.
- System time uses NTP.
- Ports are available.
- Port 25 outbound is not blocked.
- PTR/rDNS can be configured.
- No existing web/mail service conflicts.
- Backups are planned before first real mailbox.

## DNS checklist

For every domain:

- Ownership TXT passes.
- MX points to correct mail host.
- A/AAAA records resolve.
- PTR/rDNS matches mail host.
- SPF includes only approved senders.
- DKIM public key exists and matches mail core.
- DMARC exists with report address.
- MTA-STS in testing or enforce mode.
- TLS-RPT record exists.
- Autoconfig/autodiscover records exist if supported.

## Mail flow tests

Inbound:

- Gmail -> hosted mailbox.
- Yahoo -> hosted mailbox.
- Outlook -> hosted mailbox.
- iCloud -> hosted mailbox.
- External self-hosted -> hosted mailbox.
- Attachment inbound.
- Spam sample quarantined.

Outbound:

- Hosted mailbox -> Gmail.
- Hosted mailbox -> Yahoo.
- Hosted mailbox -> Outlook.
- Hosted mailbox -> iCloud.
- Alias sender -> external.
- Unauthorized alias sender blocked.
- Attachment outbound.
- Bounce handled.

Header checks:

- SPF pass.
- DKIM pass.
- DMARC pass.
- TLS used.
- HELO/EHLO hostname correct.
- Reverse DNS correct.
- List-Unsubscribe present for subscribed messages.

## Security tests

- Superadmin 2FA required.
- Workspace admin 2FA required.
- Workspace admin cannot access other workspace.
- User cannot create domains/mailboxes.
- API key cannot be used from unauthorized IP if allowlist enabled.
- Rate limiting works for login and SMTP auth.
- Audit logs capture all admin actions.
- HTML email sanitizer blocks scripts.
- Remote images blocked.
- No secrets in logs.
- No open relay test passes.

## Backup and restore tests

- Daily backup completes.
- Backup is encrypted.
- Backup is offsite.
- Restore to a test VPS succeeds.
- DKIM keys restored.
- Mailbox content restored.
- Panel DB restored.
- Recovery credentials work and are rotated after test.

## Release checklist

- Dependencies patched.
- Docker images pinned or update policy defined.
- Database migrations reviewed.
- Rollback plan written.
- Smoke tests pass.
- Playwright tests pass.
- Security regression tests pass.
- Docs updated.
