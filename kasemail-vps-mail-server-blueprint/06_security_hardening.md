# 06 - Security Hardening

## Non-negotiable controls

- Admin-only account creation by default.
- 2FA for superadmin and workspace admins.
- App passwords for IMAP/SMTP clients.
- Strong password hashing for KaseMail panel accounts: Argon2id.
- Secure session cookies: `HttpOnly`, `Secure`, `SameSite=Lax` or stricter.
- CSRF protection for browser forms.
- Rate limits for login, mailbox creation, SMTP auth, password reset, and DNS checks.
- Audit log for every admin action.
- API keys stored hashed, not plaintext.
- All admin APIs restricted by RBAC and optionally IP allowlist.
- Do not let admin credentials authenticate to IMAP/JMAP/WebDAV.
- No open relay: outbound mail only from authenticated users or trusted internal services.
- Disable POP3 unless explicitly needed.
- Disable plaintext auth on insecure connections.
- Keep TLS certificates automated and monitored.

## Network hardening

- Only open required ports.
- Use the mail core's recommended firewall model. For Docker systems, remember Docker can bypass simple UFW input rules; use `DOCKER-USER` chain or provider firewall correctly.
- Restrict admin panel by IP allowlist if possible.
- Put metrics and debug endpoints on localhost/VPN only.
- Run SSH on keys only, no password login.
- Enable automatic security updates for OS packages where safe.

## Mail hardening

- SPF, DKIM, DMARC alignment for every sending domain.
- DKIM 2048-bit RSA or Ed25519 where supported by the mail core and receiving ecosystem.
- Rotate DKIM keys on schedule and after compromise.
- Create `postmaster@` and `abuse@` aliases for each domain.
- Enforce authenticated sender identity: users can only send from their mailbox or approved aliases.
- Add outbound rate limits per user, workspace, domain, and global server.
- Detect compromised accounts by sudden send volume, new geolocation, many bounces, or spam complaints.
- Quarantine suspicious outbound mail instead of blindly sending.

## Webmail hardening

- Sanitize HTML email before display.
- Block remote images by default, with sender allowlist.
- Do not execute email scripts or active content.
- Proxy or warn on unsafe links.
- Scan attachments where possible.
- Add Content Security Policy.
- Use attachment size limits.
- Autosave drafts without leaking content to logs.

## Backup security

- Encrypt backups before they leave the VPS.
- Store backups offsite.
- Keep at least daily backups and weekly/monthly retention.
- Test restore monthly.
- Back up DKIM private keys, TLS configs, database, mail storage, and panel secrets.
- Keep backup credentials separate from the server when possible.

## Break-glass policy

If you need superadmin mailbox access for emergencies:

- Require a specific break-glass permission.
- Require 2FA re-authentication.
- Require a reason.
- Notify the workspace owner.
- Log the action immutably.
- Time-limit the access.

For personal/private use, the better default is no admin mailbox reading from the panel.
