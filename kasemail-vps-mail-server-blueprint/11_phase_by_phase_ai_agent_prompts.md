# 11 - Phase-by-Phase AI Agent Prompts

Use these prompts with a coding AI agent. Give the agent this entire zip first. Make it work in small pull requests. Do not let it skip tests or security review.

## Master instruction for every phase

```text
You are implementing KaseMail, a private VPS-hosted email platform. Use the project blueprint, source links, mockups, and scripts in this repository. Do not build SMTP/IMAP/DKIM/spam filtering from scratch. Integrate with the chosen mail core. Treat security and deliverability as product requirements. Every phase must include tests, docs, rollback notes, and acceptance criteria. Do not expose secrets in logs. Do not create an open relay. Do not add public registration unless explicitly enabled and approved.
```

## Phase 0 - Repository scaffold

```text
Create a production-ready monorepo for KaseMail with apps/panel, apps/webmail, apps/api, packages/ui, packages/auth, packages/mail-core, packages/dns, packages/config, and infra. Use TypeScript. Add linting, formatting, unit tests, Playwright skeleton, Dockerfiles, docker-compose.dev.yml, .env.example, README, and CI. Implement the Kase visual design tokens from 09_UI_UX_DESIGN_SYSTEM.md. Do not implement mail sending yet.
```

Acceptance:

- `pnpm test`, `pnpm lint`, and `pnpm typecheck` pass.
- UI package has buttons, cards, table, sidebar, badge, modal, toast.
- Login mockup can be reproduced as a static page.

## Phase 1 - Auth and RBAC

```text
Implement authentication, sessions, 2FA scaffolding, app roles, and RBAC for superadmin, workspace_admin, workspace_user, and individual_user. Registration must be closed by default. Implement invite-only flow but keep it disabled until policy enables it. Add audit logs for login, logout, failed login, role change, invite creation, and password changes. Use secure password hashing and session cookies.
```

Acceptance:

- Permission tests for every role.
- Superadmin can create workspace.
- Workspace admin cannot access another workspace.
- Workspace user cannot create mailbox.
- Individual user maps to personal workspace.

## Phase 2 - Mail core adapter

```text
Create a mail-core abstraction with adapters for mailcow first and Stalwart later. Implement domain, mailbox, alias, DKIM, quota, and queue methods. Use typed interfaces, retries, timeouts, and audit-safe logging. Add a fake adapter for tests. For mailcow, use API key auth and restrict the API to internal network/IP allowlist.
```

Acceptance:

- Fake adapter tests pass.
- Mailcow adapter can create/list/delete a test mailbox on a staging mailcow.
- Secrets never appear in logs.

## Phase 3 - Domain DNS wizard

```text
Build the custom domain wizard. It must generate ownership TXT, MX, SPF, DKIM, DMARC, MTA-STS, TLS-RPT, SRV/autoconfig guidance, and check DNS status. Domain cannot become active until required records pass. Create copy buttons, provider notes, status badges, and a background checker. Match mockups/04-domain-dns-wizard.png.
```

Acceptance:

- DNS checker handles TXT chunking and propagation delays.
- UI shows pending/verified/failure states.
- Domain activation is blocked if DKIM or ownership token is missing.

## Phase 4 - Mailboxes, aliases, and workspace admin

```text
Implement workspace admin pages for domains, mailboxes, aliases, catch-all, forwarding, vacation replies, quotas, and mailbox suspension. Match mockups/03-workspace-admin-dashboard.png. All actions must call the mail-core adapter and write audit logs.
```

Acceptance:

- Workspace admin can manage only assigned workspace.
- Mailbox creation creates mail-core mailbox and local metadata.
- Alias cannot target unauthorized external recipients unless policy allows.

## Phase 5 - Webmail MVP

```text
Build webmail MVP using IMAP/SMTP or JMAP depending on selected mail core. Implement folders, message list, reading pane, compose, reply, forward, drafts, attachments, identities, signatures, block remote images, sanitized HTML, and mobile layout. Match mockups/05-webmail-inbox.png and mockups/07-mobile-webmail.png.
```

Acceptance:

- User can read, search, compose, reply, and send.
- User can only send from approved identities.
- HTML sanitizer tests pass.
- Remote images blocked by default.

## Phase 6 - Spam/quarantine and security dashboard

```text
Implement spam/quarantine dashboard. Integrate with the mail core where possible for quarantine, allowlist, blocklist, spam thresholds, and training. Add phishing banners in webmail based on headers/flags. Match mockups/08-spam-quarantine.png.
```

Acceptance:

- Admin can release/reject quarantine message.
- User can mark spam/not spam.
- Allow/block list is scoped correctly.

## Phase 7 - Migration from Spacemail

```text
Implement IMAP migration jobs with dry run, incremental sync, progress, retries, and clear error messages. Add a Spacemail migration guide screen asking for source IMAP host, username, app password, destination mailbox, and folder mapping. Do not log source passwords. Use a queue worker.
```

Acceptance:

- Dry run estimates messages/folders.
- Migration can resume safely.
- Credentials are encrypted at rest or not persisted beyond job runtime.

## Phase 8 - Backups, monitoring, and production hardening

```text
Implement backup job orchestration, health checks, update checks, alerts, and post-install diagnostics. Add restore runbook and a monthly restore-test reminder. Add dashboard cards for backup freshness, TLS expiry, DNS health, queue health, and failed logins.
```

Acceptance:

- Backup job status visible in UI.
- Restore test documented.
- Alerts fire for backup failure, TLS expiry, queue growth, disk usage, and login attack.

## Phase 9 - Calendar, contacts, and mobile polish

```text
Add contacts and calendar integration using SOGo/CardDAV/CalDAV or Stalwart WebDAV/CalDAV/CardDAV. Add PWA support, push notifications if safe, and mobile-first compose/read flows.
```

Acceptance:

- Contacts autocomplete works.
- Calendar invite display works.
- Mobile webmail is usable for core tasks.
