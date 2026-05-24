# 07 - Admin Panel Product Specification

## Main navigation

- Dashboard
- Workspaces
- Domains
- Mailboxes
- Aliases and groups
- Migrations
- Deliverability
- Spam and quarantine
- Security
- Backups
- Logs and audit
- Settings

## Superadmin dashboard

Show:

- Global health score.
- Mail queue and deferred messages.
- Domain DNS health summary.
- DKIM/DMARC alignment status.
- Backup status and last restore test.
- Top workspaces by storage and outbound volume.
- Security alerts.
- Update availability.

## Workspace dashboard

Show:

- Domains in workspace.
- Mailboxes used vs quota.
- Alias count.
- Spam/quarantine summary.
- DNS issues.
- User 2FA adoption.
- Recent admin activity.

## Domain management

Features:

- Add domain.
- Ownership verification token.
- DNS record generator.
- Automatic DNS via provider APIs later.
- DNS status checker for MX, A/AAAA, SPF, DKIM, DMARC, MTA-STS, TLS-RPT, autoconfig, autodiscover.
- DKIM key generation and rotation.
- DMARC policy assistant.
- Catch-all mailbox.
- Default quota and mailbox limits.
- Domain suspend mode.
- Outbound sending lock until DNS passes.

## Mailbox management

Features:

- Create mailbox.
- Set quota.
- Force password reset.
- Require 2FA.
- Create app passwords.
- Configure forwarding.
- Configure vacation reply.
- Assign aliases.
- Enable/disable IMAP, SMTP, POP3, webmail.
- View mailbox storage usage.
- View recent login and send activity.
- Suspend mailbox.

## Alias and group management

- Simple alias: `hello@domain` -> one or more recipients.
- Domain alias: `brand.net` aliases to `brand.io`.
- Catch-all: unmatched local parts to chosen mailbox.
- Group/list: restricted sender policy, internal-only option, moderation later.
- Temporary alias: user-controlled disposable aliases if allowed.

## Spam and quarantine

- Global and per-workspace allow/block lists.
- Per-domain and per-user spam thresholds.
- Quarantine review and release.
- Train spam/ham where supported.
- Log why a message was classified.
- Highlight phishing, spoofing, malware, SPF/DKIM/DMARC failures.

## Migration

- IMAP migration from Spacemail/Gmail/Outlook/other.
- Dry run estimates folder count and message count.
- Incremental sync mode.
- Cutover checklist.
- Migration status and error logs.

## Audit logs

Log:

- Login/logout.
- Failed login.
- 2FA changes.
- Password/app password changes.
- Domain add/delete/suspend.
- Mailbox create/delete/suspend.
- Alias changes.
- DKIM key rotation.
- DNS verification changes.
- Backup/restore.
- Permission changes.
- Break-glass mailbox access.

## Settings

- Branding.
- Registration mode.
- Default quotas.
- Security policy.
- SMTP relay settings.
- Backup target.
- Alert destinations.
- Update policy.
