# KaseMail Build Progress

Last updated: 2026-05-24

Status legend:

- `[x]` Done
- `[~]` Partially done / needs validation
- `[ ]` Not done
- `[!]` Blocked or depends on external VPS/mail-core setup

## Product Direction

- `[x]` Build a real KaseMail application, not static mockups.
- `[x]` Use a real PostgreSQL-backed backend with Prisma.
- `[~]` Use real API routes from the frontend.
- `[~]` Integrate with a real mail core through adapters.
- `[~]` Make the app configurable through environment variables.
- `[~]` Provide a VPS installer.
- `[~]` Replace gradient-heavy UI with a clean simple dark theme.

## Project Foundation

- `[x]` Next.js 16 App Router project created.
- `[x]` TypeScript enabled.
- `[x]` Tailwind CSS v4 enabled.
- `[x]` shadcn/ui installed.
- `[x]` Framer Motion installed.
- `[x]` lucide-react installed.
- `[x]` Prisma installed.
- `[x]` `bcryptjs`, `jsonwebtoken`, `uuid`, `zod`, and `tsx` installed.
- `[x]` `next.config.ts` configured with `output: "standalone"` for Docker/VPS deployment.
- `[x]` `tsconfig.json` excludes the blueprint folder from app typechecking.
- `[x]` Build passes with Prisma v7 adapter, Zod fixes, and dark theme cleanup.

## Routes And Screens

- `[x]` `/` redirects to `/login`.
- `[~]` `/login` created and wired to real login API.
- `[~]` `/dashboard` created and partly wired to real API data.
- `[~]` `/workspaces` created and partly wired to real API data.
- `[~]` `/domains` created and partly wired to real API data.
- `[~]` `/dns` created, copy/verify UI exists, verify API wiring still needs final integration.
- `[~]` `/mailboxes` created and partly wired to real API data.
- `[~]` `/aliases` created and partly wired to real API data.
- `[~]` `/mail/inbox` created, still sample-message based until IMAP/JMAP adapter exists.
- `[x]` `/mail/inbox/compose-modal.tsx` created as a component.
- `[~]` `/mobile-mail` created, still a responsive visual/demo route until webmail backend exists.
- `[~]` `/security/quarantine` created, still sample-quarantine based until quarantine adapter exists.
- `[~]` `/server-health` created and partly wired to `/api/server-health`.
- `[x]` `/settings` created and fully wired to settings APIs.

## Shared UI And Layout

- `[x]` `AdminShell` created.
- `[x]` `MailShell` created.
- `[x]` `GlassCard` created.
- `[x]` `GradientButton` created, currently kept as a component name but being visually neutralized.
- `[x]` `StatusChip` created.
- `[x]` `MetricCard` created.
- `[x]` `CommandSearch` created.
- `[x]` `KaseLogo` created.
- `[x]` Global CSS dark theme created.
- `[x]` Clean dark theme migration completed — violet/blue gradients neutralized to slate.
- `[x]` Renamed `GradientButton` to `AppButton` component.
- `[x]` Removed page-level blue/violet gradients and glow classes.
- `[ ]` Add a consistent design token naming system for neutral colors.

## Database And Prisma

- `[x]` `prisma/schema.prisma` created.
- `[x]` PostgreSQL datasource configured.
- `[x]` Prisma models created for:
  - `[x]` `User`
  - `[x]` `Session`
  - `[x]` `Workspace`
  - `[x]` `WorkspaceMember`
  - `[x]` `Domain`
  - `[x]` `DnsCheck`
  - `[x]` `Mailbox`
  - `[x]` `Alias`
  - `[x]` `AuditLog`
  - `[x]` `MailMigrationJob`
  - `[x]` `BackupJob`
- `[x]` `Mailbox.passwordHash` added for password reset flow.
- `[x]` `src/lib/prisma.ts` created.
- `[x]` `prisma/seed.ts` created for superadmin/default workspace seeding.
- `[x]` `prisma generate` runs successfully after Prisma v7 migration.
- `[~]` Prisma v7 migration completed, `prisma generate` works. Migration (`prisma migrate dev`) not yet run — needs DB connection.
- `[ ]` Add indexes for common queries.
- `[ ]` Add stronger relations for mailbox ownership/user identity.
- `[x]` `UserSettings` and `PasswordResetToken` models added to schema.

## Authentication And Sessions

- `[x]` Password hashing helper added.
- `[x]` Password verification helper added.
- `[x]` Session model added.
- `[x]` Session cookie login route added.
- `[x]` Logout route added.
- `[x]` Current-user route added.
- `[x]` Login page calls real auth route.
- `[x]` CSRF middleware created (`src/lib/csrf.ts`).
- `[x]` Rate limiting middleware created (`src/lib/rate-limit.ts`).
- `[ ]` Add 2FA enrollment and verification.
- `[x]` Password reset request/confirm flow (`/api/auth/forgot-password`, `/api/auth/reset-password`).
- `[x]` Change password API (`/api/auth/change-password`).
- `[x]` Sessions API (`/api/auth/sessions`) with list and revoke.
- `[ ]` Add secure cookie behavior for local dev versus production.

## RBAC And Security

- `[x]` Basic role checks implemented with `requireAuth()`.
- `[x]` Workspace-scoped RBAC checks added to GET list routes.
- `[x]` Domain/mailbox/alias ownership checks via `src/lib/rbac.ts`.
- `[ ]` Add admin confirmation flow for destructive actions.
- `[ ]` Add full audit coverage for every mutation.
- `[ ]` Add input rate limits and abuse prevention.
- `[ ]` Add server-side HTML email sanitization.
- `[ ]` Add remote image blocking for webmail.
- `[ ]` Add secret redaction in logs.

## API Routes

- `[x]` `/api/auth/login`
- `[x]` `/api/auth/logout`
- `[x]` `/api/auth/me`
- `[x]` `/api/domains`
- `[x]` `/api/domains/[id]`
- `[x]` `/api/domains/[id]/check-dns`
- `[x]` `/api/mailboxes`
- `[x]` `/api/mailboxes/[id]`
- `[x]` `/api/mailboxes/[id]/reset-password`
- `[x]` `/api/aliases`
- `[x]` `/api/aliases/[id]`
- `[x]` `/api/workspaces`
- `[x]` `/api/audit-logs`
- `[x]` `/api/server-health`
- `[x]` `/api/settings/profile`
- `[x]` `/api/settings/security`
- `[x]` `/api/settings/mail-preferences`
- `[x]` `/api/settings/appearance`
- `[x]` `/api/auth/change-password`
- `[x]` `/api/auth/forgot-password`
- `[x]` `/api/auth/reset-password`
- `[x]` `/api/auth/sessions`
- `[ ]` `/api/quarantine`
- `[ ]` `/api/quarantine/[id]/release`
- `[ ]` `/api/quarantine/[id]/delete`
- `[ ]` `/api/quarantine/[id]/allowlist`
- `[ ]` `/api/quarantine/[id]/block`
- `[ ]` `/api/mail/folders`
- `[ ]` `/api/mail/messages`
- `[ ]` `/api/mail/messages/[id]`
- `[ ]` `/api/mail/send`
- `[ ]` `/api/mail/drafts`
- `[ ]` `/api/mail/messages/[id]/move`
- `[ ]` `/api/mail/messages/[id]/mark-spam`

## Frontend Data Wiring

- `[x]` `src/lib/api-service.ts` created.
- `[~]` Dashboard uses API calls with fallback values.
- `[~]` Domains page uses API calls with fallback values.
- `[~]` Mailboxes page uses API calls with fallback values.
- `[~]` Aliases page uses API calls with fallback values.
- `[~]` Workspaces page uses API calls with fallback values.
- `[~]` Server health page uses API calls with fallback values.
- `[x]` Settings page wired to real profile/settings APIs.
- `[ ]` Remove direct mock fallback from real admin routes once database seed/migrations are validated.
- `[x]` Settings page has loading state.
- `[x]` Settings page has error handling via toast.
- `[x]` Settings page shows empty states for sessions/domains.

## Mail Core Integration

- `[x]` Adapter interface created in `src/lib/mail-core.ts`.
- `[~]` Mailcow adapter implemented for:
  - `[~]` Create domain
  - `[~]` Delete domain
  - `[~]` Create mailbox
  - `[~]` Delete mailbox
  - `[~]` Suspend mailbox
  - `[~]` List mailboxes
  - `[~]` Create alias
  - `[~]` Delete alias
  - `[~]` Get DKIM
- `[!]` Mailcow adapter requires a real mailcow install and API key to verify.
- `[~]` Stalwart adapter interface stub created.
- `[ ]` Implement Stalwart adapter.
- `[ ]` Add adapter health checks.
- `[ ]` Add reconciliation jobs between KaseMail DB and mail core.
- `[ ]` Add mail queue/deferred status fetching.
- `[ ]` Add storage quota fetching from mail core.

## DNS And Deliverability

- `[x]` DNS helper added in `src/lib/dns.ts`.
- `[x]` MX check helper added.
- `[x]` TXT fragment check helper added.
- `[x]` A record check helper added.
- `[~]` Domain health function checks A/MX/SPF/DMARC.
- `[~]` `/api/domains/[id]/check-dns` writes DNS check records.
- `[ ]` Add DKIM verification from configured selector/key.
- `[ ]` Add MTA-STS verification.
- `[ ]` Add TLS-RPT verification.
- `[ ]` Add autoconfig/autodiscover verification.
- `[ ]` Add provider-specific DNS setup guides.
- `[ ]` Add copyable DNS record generation from real mail core DKIM values.

## Webmail

- `[x]` Desktop webmail UI created.
- `[x]` Compose modal UI created.
- `[x]` Mobile mail UI created.
- `[ ]` IMAP adapter.
- `[ ]` JMAP adapter.
- `[ ]` SMTP send adapter.
- `[ ]` Folder listing from real mailbox.
- `[ ]` Message list from real mailbox.
- `[ ]` Message read/body fetch from real mailbox.
- `[ ]` Attachments download.
- `[ ]` Draft save.
- `[ ]` Send email.
- `[ ]` Reply/forward/archive/delete actions.
- `[ ]` Search real mail.
- `[ ]` Remote image blocking.
- `[ ]` Sanitized HTML rendering.

## Spam And Quarantine

- `[x]` Quarantine UI created.
- `[ ]` Real quarantine API routes.
- `[ ]` Mailcow/Rspamd quarantine adapter.
- `[ ]` Stalwart quarantine adapter.
- `[ ]` Release quarantined message action.
- `[ ]` Delete quarantined message action.
- `[ ]` Allowlist sender action.
- `[ ]` Block sender action.
- `[ ]` Spam threshold persistence.
- `[ ]` Filter training status from real backend.
- `[ ]` Recent phishing patterns from real backend.

## Settings

- `[x]` Settings UI created with Profile, Security, Connected Domains, Mail Preferences, Appearance sections.
- `[x]` Profile page fetches `/api/settings/profile` on load.
- `[x]` Save profile API.
- `[x]` Save security settings API (2FA toggle).
- `[x]` Save mail preferences API.
- `[x]` Save appearance preferences API.
- `[x]` Connected domains settings from real domains API.
- `[x]` 2FA settings wired to real API (toggle).
- `[x]` Sessions list wired to database sessions.

## Deployment And VPS Installer

- `[x]` `Dockerfile` added.
- `[x]` Standalone Next.js output configured.
- `[x]` `.env.example` added.
- `[x]` `scripts/docker-compose.production.yml` added.
- `[x]` `scripts/install-vps.sh` added.
- `[~]` Installer prompts for panel domain, webmail domain, mail hostname, Let's Encrypt email, superadmin credentials, and mail core.
- `[~]` Installer installs Docker, nginx, certbot, UFW, fail2ban.
- `[~]` Installer starts Postgres, Redis, and app container.
- `[~]` Installer runs migrations and seed.
- `[~]` Installer configures nginx reverse proxy.
- `[~]` Installer requests TLS certificates.
- `[~]` Installer writes a database backup cron job.
- `[!]` Installer has not yet been tested on a clean VPS.
- `[x]` Uninstall script created (`scripts/uninstall-vps.sh`) — removes containers, volumes, nginx configs, certs, cron jobs, and app directory.
- `[ ]` Add mailcow installation automation or documented handoff.
- `[ ]` Add Stalwart installation automation.
- `[ ]` Add robust rollback behavior.
- `[ ]` Add domain DNS preflight validation before certbot.
- `[ ]` Add log file output for installer.

## Testing And Quality

- `[x]` Initial frontend build passed before backend conversion.
- `[x]` Build passes after Prisma v7 migration, Zod v4 fixes, and dark theme cleanup.
- `[ ]` Add unit tests for auth helpers.
- `[ ]` Add unit tests for mail-core adapters with mocked fetch.
- `[ ]` Add API route tests.
- `[ ]` Add Playwright smoke tests:
  - `[ ]` Login
  - `[ ]` Dashboard loads
  - `[ ]` Add domain
  - `[ ]` DNS verification
  - `[ ]` Create mailbox
  - `[ ]` Create alias
  - `[ ]` Quarantine action
  - `[ ]` Compose mail

## Documentation

- `[x]` Blueprint retained in `kasemail-vps-mail-server-blueprint/`.
- `[x]` `progress.md` created.
- `[ ]` Add `README.md` for the actual app.
- `[ ]` Add environment variable documentation.
- `[ ]` Add VPS install documentation.
- `[ ]` Add mailcow API key setup documentation.
- `[ ]` Add DNS record documentation.
- `[ ]` Add backup/restore documentation.
- `[ ]` Add upgrade documentation.

## Current Completion Estimate

- Frontend screen coverage: 85%
- Clean dark theme conversion: 70%
- Real API coverage: 70%
- Frontend-to-API wiring: 65%
- Database/schema readiness: 80%
- Mailcow integration: 30%
- Stalwart integration: 5%
- Real webmail backend: 10%
- Quarantine backend: 10%
- VPS installer: 55%
- Production security hardening: 40%
- Automated tests: 0%

Overall product completion: about 55%.

## Next Work Queue

1. Create and test the first Prisma migration (`npx prisma migrate dev`) once PostgreSQL is available.
2. Remove mock fallbacks from admin routes after database seed is verified.
3. Add consistent design token naming system for neutral colors.
4. Add 2FA enrollment and verification.
5. Add quarantine adapter/API.
6. Add webmail IMAP/JMAP/SMTP adapter.
7. Test `scripts/install-vps.sh` on a clean VPS.
8. Add CSRF enforcement to all mutation routes.
9. Add rate limiting to login and high-traffic endpoints.
10. Write automated tests (unit + Playwright smoke).
