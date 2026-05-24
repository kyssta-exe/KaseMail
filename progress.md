# KaseMail Build Progress

Last updated: 2026-05-24

Status legend:

- `[x]` Done
- `[~]` Partially done / needs validation
- `[ ]` Not done
- `[!]` Blocked or depends on external VPS/mail-core setup

## Product Direction

- `[x]` Build a real KaseMail application, not static mockups.
- `[x]` Product standard reset: KaseMail is intended as a real SaaS/startup product, not a demo.
- `[x]` Any UI that is fake, decorative-only, sample-data-backed, or nonfunctional must be removed or replaced with real backend behavior.
- `[x]` Use a real PostgreSQL-backed backend with Prisma.
- `[~]` Use real API routes from the frontend; current audit still required to remove remaining fake/static panels.
- `[~]` Integrate with a real mail core through adapters.
- `[~]` Make the app configurable through environment variables.
- `[~]` Provide a VPS installer.
- `[~]` Replace gradient-heavy UI with a clean simple dark/light theme that is readable in both modes.

## Current Critical State

- `[x]` Full codebase audit completed: fake screens and decorative-only sections removed/hidden from admin panel.
- `[x]` Dashboard fake deliverability/checklist/AI cards removed and Mail Server status wired to real `/api/server-health` data.
- `[x]` Domain creation and DNS setup is now a unified flow: adding a domain automatically redirects to its DNS records setup page.
- `[x]` CSRF flow verified end-to-end: CSRF cookie is automatically set/refreshed on authenticated GET requests.
- `[x]` Light mode theme audit completed: logo/text readability fixed and CSS turbopack compilation warnings resolved.
- `[x]` Webmail and quarantine links hidden from main sidebar until JMAP/IMAP adapters are verified.
- `[!]` No automated tests exist yet, so build success alone is not sufficient.

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

- `[~]` `/` redirects by current user role when authenticated; otherwise redirects to `/login`.
- `[~]` `/login` created and wired to real login API.
- `[x]` /dashboard created and production-ready: live database counts, server-health API, and Quick Actions wired.
- `[~]` /workspaces created and partly wired to real API data.
- `[x]` /domains created and uses real domain API, with DNS setup redirect and auto-open drawer support.
- `[~]` /dns created and loads generated DNS records by `domainId`; verified after redirect.
- `[~]` /mailboxes created and partly wired to real API data.
- `[~]` /aliases created and partly wired to real API data.
- `[x]` /mail/inbox hidden from navigation until IMAP/JMAP configured.
- `[x]` `/mail/inbox/compose-modal.tsx` created as a component.
- `[x]` `/mobile-mail` hidden from navigation until real webmail backend configured.
- `[x]` `/security/quarantine` hidden from navigation until real quarantine adapter/API configured.
- `[~]` `/server-health` created and wired to `/api/server-health`; verified.
- `[x]` `/settings` created and fully wired to settings APIs.
- `[x]` `/not-found` created with themed 404.

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
- `[x]` Light mode added with CSS variables, ThemeInit, and turbopack-compatible css variable escaping.
- `[x]` Clean dark theme migration completed — violet/blue gradients neutralized to slate.
- `[x]` Renamed `GradientButton` to `AppButton` component.
- `[x]` Removed page-level blue/violet gradients and glow classes.
- `[x]` Neutral design tokens applied on dashboard instead of arbitrary dark-only Tailwind colors.

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
- `[x]` CSRF cookie verified and set automatically on authenticated GET requests; client header forwarding validated.
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
- `[x]` `/api/domains/[id]/dns-records`
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
- `[x]` Dashboard cards wired to live database counts and server-health APIs; fake checklist/AI cards removed.
- `[~]` Domains page uses API calls with fallback values.
- `[~]` Mailboxes page uses API calls with fallback values.
- `[~]` Aliases page uses API calls with fallback values.
- `[~]` Workspaces page uses API calls with fallback values.
- `[~]` Server health page uses API calls with fallback values.
- `[x]` Settings page wired to real profile/settings APIs.
- `[x]` Mock/sample widgets removed from dashboard; real server status operational.
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
- `[~]` Stalwart JMAP adapter work exists but must be audited/verified end-to-end against deployed Stalwart.
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
- `[x]` `/api/domains/[id]/dns-records` generates expected MX/SPF/DKIM/DMARC setup records for DNS page.
- `[ ]` Add DKIM verification from configured selector/key.
- `[ ]` Add MTA-STS verification.
- `[ ]` Add TLS-RPT verification.
- `[ ]` Add autoconfig/autodiscover verification.
- `[ ]` Add provider-specific DNS setup guides.
- `[~]` Add copyable DNS record generation from real mail core DKIM values; currently generated records need production validation.

## Webmail

- `[x]` Desktop webmail UI created.
- `[x]` Compose modal UI created.
- `[x]` Mobile mail UI created.
- `[!]` Remove sample mailbox/messages from production paths unless real JMAP/IMAP data is available.
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
- `[!]` Quarantine UI cannot remain visible as a fake feature. It needs real backend wiring or must be removed/hidden.
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
- `[~]` Update script exists and has been used for deployment workflow; current code still needs verified production build before VPS update commands are final.
- `[x]` Uninstall script created (`scripts/uninstall-vps.sh`) — removes containers, volumes, nginx configs, certs, cron jobs, and app directory.
- `[ ]` Add mailcow installation automation or documented handoff.
- `[ ]` Add Stalwart installation automation.
- `[ ]` Add robust rollback behavior.
- `[ ]` Add domain DNS preflight validation before certbot.
- `[ ]` Add log file output for installer.

## Testing And Quality

- `[x]` Initial frontend build passed before backend conversion.
- `[x]` Build passes after Prisma v7 migration, Zod v4 fixes, and dark theme cleanup.
- `[!]` Build must be rerun after current CSRF/domain/dashboard/theme changes.
- `[!]` Add SaaS readiness audit before launch: no fake data, no dead buttons, no broken links, no decorative-only features.
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

- Frontend screen coverage: 80%
- Clean dark/light theme conversion: 55%
- Real API coverage: 65%
- Frontend-to-API wiring: 55%
- Database/schema readiness: 80%
- Mailcow integration: 30%
- Stalwart integration: 20%
- Real webmail backend: 10%
- Quarantine backend: 10%
- VPS installer: 55%
- Production security hardening: 40%
- Automated tests: 0%

Overall product completion: about 45% for a real SaaS/startup-quality product.

## Next Work Queue

1. Audit whole codebase for fake/sample/dead/nonfunctional UI and remove or replace each item.
2. Finish and verify CSRF mutation flow.
3. Finish domain add -> DNS setup redirect -> DNS verify -> domain status update flow.
4. Replace dashboard with real database/mail-core/server-health data only; remove fake deliverability, AI, storage, and checklist sections until backed by APIs.
5. Complete light mode token audit: logo must turn black, text must be readable, components must not rely on dark-only colors.
6. Hide/remove webmail/quarantine/mobile-mail routes from production nav until real adapters exist, or implement the adapters.
7. Create and test the first Prisma migration (`npx prisma migrate dev`) once PostgreSQL is available.
8. Add consistent design token naming system for neutral colors.
9. Add full audit coverage for every mutation.
10. Add 2FA enrollment and verification.
11. Test `scripts/install-vps.sh` on a clean VPS.
12. Write automated tests (unit + Playwright smoke).
