# 15 - Code Examples Index

The `code-examples/` folder contains starting points for an AI agent or developer. They are not a complete application, but they define the shape of the production implementation.

Files:

- `prisma-schema.prisma` - starter data model for workspaces, users, domains, mailboxes, aliases, DNS checks, migrations, backups, and audit logs.
- `mailcow-client.ts` - typed mailcow API wrapper starter.
- `stalwart-client.ts` - Stalwart management/JMAP wrapper starter.
- `dns-checker.ts` - Node DNS checker for MX/TXT/A/AAAA.
- `nextjs-route-mailbox-create.ts` - API route example with RBAC and audit logging.
- `threat-model.md` - security design prompts and abuse cases.
- `docker-compose.production.yml` - example production app stack around a mail core.

Implementation rule:

- Treat these examples as scaffolding. Before production, verify every endpoint against the current mail core API documentation and run integration tests against a staging server.
