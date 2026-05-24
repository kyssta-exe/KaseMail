# 10 - Database Schema and API Design

## Recommended app stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui or Radix primitives.
- API: Next.js route handlers, NestJS, or Fastify.
- Database: PostgreSQL.
- ORM: Prisma or Drizzle.
- Queue: Redis + BullMQ or Faktory/Sidekiq equivalent.
- Auth: Auth.js, Lucia, or custom secure session system.
- Mail core integration: mailcow API or Stalwart JMAP/management API.
- DNS checks: Node `dns.promises` plus external resolver fallback.

## Core tables

See `code-examples/prisma-schema.prisma` for a starter schema.

Key models:

- `User`
- `Workspace`
- `WorkspaceMember`
- `Domain`
- `DnsCheck`
- `Mailbox`
- `Alias`
- `RoleAssignment`
- `Invite`
- `AuditLog`
- `MailMigrationJob`
- `BackupJob`
- `SecurityEvent`

## Domain state machine

```text
created -> awaiting_ownership -> dns_pending -> active -> suspended -> archived
```

Rules:

- `active` requires ownership TXT, MX, SPF, DKIM, DMARC, and mail host reachability.
- Outbound sending should stay locked until at least DKIM and SPF/DMARC alignment pass.
- Suspension disables mailbox creation and outbound sending but should keep inbound optional depending on policy.

## Mailbox state machine

```text
created -> active -> suspended -> archived -> deleted
```

Rules:

- Delete should be soft first.
- Purge only after retention window.
- Suspending a user should disable SMTP submission immediately.

## API endpoints

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/2fa/verify`
- `POST /api/auth/password-reset/request`
- `POST /api/auth/password-reset/confirm`

### Workspaces

- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/workspaces/:id`
- `PATCH /api/workspaces/:id`
- `POST /api/workspaces/:id/suspend`

### Domains

- `POST /api/workspaces/:id/domains`
- `GET /api/domains/:id`
- `POST /api/domains/:id/check-dns`
- `POST /api/domains/:id/rotate-dkim`
- `POST /api/domains/:id/activate`
- `POST /api/domains/:id/suspend`

### Mailboxes

- `POST /api/domains/:id/mailboxes`
- `GET /api/workspaces/:id/mailboxes`
- `PATCH /api/mailboxes/:id`
- `POST /api/mailboxes/:id/reset-password`
- `POST /api/mailboxes/:id/suspend`
- `DELETE /api/mailboxes/:id`

### Aliases

- `POST /api/domains/:id/aliases`
- `PATCH /api/aliases/:id`
- `DELETE /api/aliases/:id`

### Webmail

- `GET /api/mail/folders`
- `GET /api/mail/messages?folder=&cursor=`
- `GET /api/mail/messages/:id`
- `POST /api/mail/send`
- `POST /api/mail/drafts`
- `POST /api/mail/messages/:id/move`
- `POST /api/mail/messages/:id/mark-spam`

## RBAC design

Every API call checks:

1. Is the user authenticated?
2. Is 2FA required and completed for this action?
3. What workspace/domain/mailbox is being accessed?
4. Does the user have a role that grants the action?
5. Are workspace/global policies satisfied?
6. Is the action rate limited?
7. Is the action written to audit log?

## Reconciliation jobs

Run periodic jobs:

- Compare KaseMail domains to mail core domains.
- Compare mailboxes/aliases to mail core state.
- Fetch DKIM keys and DNS check results.
- Fetch quota/storage usage.
- Fetch mail queue/deferred stats.
- Fetch backup status.
- Detect drift and show repair actions.
