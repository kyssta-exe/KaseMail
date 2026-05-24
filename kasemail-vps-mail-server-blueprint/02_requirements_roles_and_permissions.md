# 02 - Requirements, Roles, and Permissions

## Product name used in this blueprint

Working name: **KaseMail**.

## Account hierarchy

### Superadmin

Global owner of the installation.

Can:

- Create, suspend, archive, and delete workspaces.
- Add any domain to any workspace.
- Create and delete all mailboxes, aliases, groups, catch-all rules, and forwards.
- Manage global mail server settings, queues, rate limits, spam policy, outbound relay, IP reputation notes, and TLS settings.
- View all audit logs.
- Trigger backup, restore, migration, DKIM rotation, and domain health checks.
- Impersonate a workspace admin only through a fully logged break-glass flow.

Cannot:

- Read user mailbox contents by default from the admin panel. Add a legal/consent-gated break-glass feature only if you truly need it.

### Workspace admin

Administrator for one workspace.

Can:

- Manage workspace profile and default quotas.
- Add domains if superadmin allows domain management for that workspace.
- Create workspace users and mailboxes for assigned domains.
- Create aliases, groups, forwards, vacation replies, and catch-all within workspace limits.
- View delivery logs for workspace domains.
- Manage per-domain spam allow/block rules.
- Start migrations for users in their workspace.

Cannot:

- Change global MTA settings, reverse DNS, server TLS policy, backup storage, or other workspaces.
- Bypass global sending limits.

### Workspace user

Normal mailbox user inside a workspace.

Can:

- Use webmail.
- Configure signature, identities assigned to them, app passwords, 2FA, filters, vacation replies, forwarding if allowed, and client settings.
- View their own login/activity history.
- Start a self-service migration if workspace policy allows it.

Cannot:

- Create new mailboxes or domains.
- Add unapproved sending identities.
- Disable security controls enforced by admins.

### Individual user

A single-person workspace owner. This is useful for your own personal domains and selected private users.

Can:

- Own a personal workspace with one or more custom domains.
- Administer only their personal workspace if superadmin grants it.

Implementation rule:

- Model individual users as a workspace with `workspace_type = personal` and one owner. This keeps all RBAC consistent.

## Registration modes

| Mode | Description | Default |
|---|---|---|
| Closed | Only superadmin can create users and workspaces | Enabled |
| Invite-only | Workspace admins can invite users if policy allows | Optional |
| Request access | User submits request; admin approves before mailbox exists | Optional |
| Public signup | Not recommended for a private mail server | Disabled |

## Feature matrix

| Feature | Superadmin | Workspace admin | Workspace user | Individual user |
|---|---:|---:|---:|---:|
| Create workspace | Yes | No | No | No |
| Add domain | Yes | Optional | No | Optional for own workspace |
| Verify DNS | Yes | Yes if domain admin | View only | Yes if owner |
| Create mailbox | Yes | Yes in workspace | No | Optional for own workspace |
| Create alias | Yes | Yes in workspace | Request or self if allowed | Yes if owner |
| View global mail queue | Yes | No | No | No |
| View workspace delivery logs | Yes | Yes | Own messages only | Own workspace |
| Manage spam policy | Global | Workspace/domain | Own allow/block | Own workspace |
| Manage backups | Yes | No | No | No |
| Use webmail | Yes if mailbox | Yes if mailbox | Yes | Yes |
