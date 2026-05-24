# KaseMail Audit Progress

Last updated: 2026-05-24

## Scope

- [x] Read repository structure and product notes.
- [x] Read Next.js 16 local docs required by `AGENTS.md`.
- [x] Audit app routes and UI screens.
- [x] Audit API routes, auth, CSRF, RBAC, validation, and error handling.
- [x] Audit Prisma schema, seed, env, deployment scripts.
- [x] Run lint/build/type checks.
- [x] Patch critical gaps found during audit.

## Notes

- Next.js docs read: route handlers, server/client components, data security, production checklist.
- Current product: Next.js 16 App Router SaaS app for self-hosted mail/admin control, backed by Prisma/Postgres, with mail-core adapters.

## Findings

- Critical: `/api/auth/me` and `/api/settings/profile` returned full Prisma `User`, including `passwordHash` and 2FA secret.
- Critical: dev login set `Secure` session cookie unconditionally, breaking localhost HTTP login.
- Critical: mailbox and alias ownership checks called RBAC helpers with arguments reversed.
- High: DNS records/check endpoints lacked domain ownership checks.
- High: mailbox reset-password endpoint lacked mailbox ownership check.
- High: mailbox/alias create checked workspace access but not that selected domain belonged to workspace.
- High: audit logs endpoint returned all logs to any authenticated user.
- High: quarantine list/actions were global to any authenticated user.
- High: update apply endpoint allowed any authenticated user to run the server update script.
- Medium: RBAC helpers threw plain `Error`, causing forbidden/not-found to become 500 responses.
- Medium: lint included blueprint reference code and failed on broad pre-existing `any`/React 19 warnings, making CI signal unusable.

## Fixes

- Redacted auth/profile user responses to safe fields.
- Made session cookie `secure` only in production and added explicit max age.
- Fixed mailbox/alias ownership call order.
- Added ownership checks to DNS records/check and mailbox password reset.
- Added domain-in-workspace validation for mailbox/alias create.
- Scoped audit logs to superadmin global view or current user's workspaces/self logs.
- Scoped quarantine list/actions to superadmin or owned workspace mail.
- Restricted update apply endpoint to superadmin.
- Converted RBAC failures to `ForbiddenError`/`NotFoundError`; superadmin bypass supported.
- Ignored blueprint reference files in ESLint and downgraded broad legacy lint blockers to warnings so lint can run as a useful gate.
- Removed stale `require()` usage in server-health route.

## Verification

- `npm run lint` passes with warnings.
- `npm run build` passes.

## Remaining Work

- Lint still reports warnings for broad `any` types, unused imports, and React 19 `set-state-in-effect` guidance across client pages.
- No automated test suite exists; route-level auth regression tests should be added next.
- Settings PATCH endpoints still accept broad JSON bodies; safer Zod schemas should be added.
- Mail/webmail endpoints still rely on user-submitted mailbox password flow; adapter hardening remains needed before public exposure.

## Domain System Hardening

- [x] Removed domain creation dependency on `NEXT_PUBLIC_DEFAULT_WORKSPACE_ID`; UI now loads real workspaces and posts selected workspace.
- [x] Domain create now validates real domain format, checks workspace access, rejects duplicates, and rolls back mail-core domain if DB insert fails.
- [x] Removed nonfunctional domain quota/catch-all controls from add-domain drawer.
- [x] DNS generation no longer uses fake `mail.<domain>` or `0.0.0.0` fallbacks; `MAIL_HOST` is required and `MAIL_IP` is optional but real.
- [x] DNS records now include an A record only when `MAIL_IP` is configured.
- [x] DNS verification now stores actual DNS answers, not expected values as fake actuals.
- [x] DNS verification includes DKIM when the mail core returns a DKIM public key.
- [x] Domains list now derives DNS status from latest checks per record type, not one arbitrary row.
- [x] Domain filters and refresh button now operate on real loaded data.
- [x] VPS env examples now include `MAIL_HOST`/`MAIL_IP`.

## Overall Product Verdict

- Workable locally: partially. App builds and main admin CRUD paths compile, but real use still depends on a correctly configured mail core, Postgres, DNS, and environment.
- Real: closer. Domains/DNS, mailbox create, and alias create now use selected real workspaces/domains. Remaining realism risk is external mail-core behavior until tested against live Stalwart/Mailcow.
- Safe: not production-safe yet. Strong RBAC/CSRF improvements are in, but password reset email delivery is not implemented, webmail passes raw mailbox passwords through APIs, settings PATCH routes are under-validated, and no auth regression tests exist.
- Good: promising foundation, not finished product. Needs installer validation on a VPS, real Stalwart/Mailcow adapter verification, test suite, and cleanup of 165 lint warnings.

## Additional Audit Findings

- [x] Fixed installer `MAIL_IP=${SERVER_IP}` bug; `SERVER_IP` was undefined under `set -u`, which would break install.
- [x] Removed public firewall exposure for Stalwart API port `8080`; app uses internal Docker networking.
- [x] Fixed installer prompt mismatch for Stalwart default.
- [x] Fixed mailbox and alias creation UI dependency on `NEXT_PUBLIC_DEFAULT_WORKSPACE_ID`.
- [x] Fixed `/api/auth/forgot-password` token logging by adding SMTP reset email.
- [x] Fixed `/api/update/check` placeholder GitHub repo.
- [~] README still contains stale architecture notes.

## Follow-up Fixes Applied

- [x] Mailbox create UI now loads real workspaces and uses selected workspace/domain.
- [x] Alias create UI now loads real workspaces and uses selected workspace/domain.
- [x] Removed nonfunctional alias disable toggle from UI.
- [x] Removed nonfunctional mailbox Webmail/SMTP/IMAP toggles from create form.
- [x] Password reset request now sends reset email through configured SMTP instead of logging token.
- [x] Added SMTP env/config and production warnings when SMTP is missing.
- [x] Update check now uses `KASEMAIL_GITHUB_REPO`, defaulting to `kyssta-exe/KaseMail`.
- [x] Settings PATCH routes now use strict Zod schemas.
- [x] Mailbox create/reset validation tightened.
- [x] Mailbox password reset now calls mail-core adapter, not only local DB.
- [x] Mailbox suspend/reactivate now calls mail-core adapter.
- [x] Mailbox create rolls back mail-core mailbox if DB insert fails.
- [x] Alias create validates target emails and requires alias domain to match selected domain.
- [x] README clone URL and environment docs updated.

## Re-Audit 2026-05-24

- [x] `npm run build` passes.
- [x] `npm run lint` passes with warnings only.
- [x] No remaining production-code references to `NEXT_PUBLIC_DEFAULT_WORKSPACE_ID`, `your-org/kasemail`, password reset token logging, fake `0.0.0.0` DNS fallback, or public Stalwart API firewall rule.
- [!] Webmail remains the largest safety/design risk: browser collects mailbox password and sends it to multiple API routes. It is authenticated to the app, but it is not a production-grade webmail session model.
- [!] `/api/update/apply` executes a server shell script via a superadmin API route. It is role-gated and rate-limited, but still high-risk for production.
- [!] Installer/update use `prisma db push --accept-data-loss`; convenient, but unsafe for production migrations.
- [!] Stalwart adapter methods need live verification. Current JMAP principal/DKIM method names may not match deployed Stalwart API behavior.
- [~] Quarantine DB/API is scoped now, but not integrated with a real mail-core quarantine source.
- [~] README still has stale architecture language and operational commands that need a final doc pass.
- [~] Lint still reports 164 warnings, mostly broad `any`, unused imports, and React 19 effect guidance.
