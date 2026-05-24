# Threat Model Starter

## Assets

- Mailbox contents.
- Admin credentials.
- Mail core API keys.
- DKIM private keys.
- TLS private keys.
- Backup repository credentials.
- User sessions and app passwords.
- DNS provider API tokens.

## Abuse cases

- Open relay sends spam.
- Compromised mailbox sends spam.
- Workspace admin escalates to superadmin.
- User sends from unauthorized alias.
- HTML email XSS steals webmail session.
- DNS checker SSRF attacks internal network.
- API key leaked in logs.
- Backup bucket compromised.
- Admin break-glass used silently.
- Malicious attachment served inline.

## Required mitigations

- Strict sender identity checks.
- Per-account outbound rate limits.
- HTML sanitizer and CSP.
- DNS checker only uses resolver APIs, never arbitrary HTTP fetches except approved MTA-STS checks.
- Secret redaction in logs.
- API key hashing and IP allowlist.
- 2FA for admins.
- Encrypted backups.
- Immutable audit logging.
