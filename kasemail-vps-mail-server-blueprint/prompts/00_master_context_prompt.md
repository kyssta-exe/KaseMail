# Master AI Agent Context Prompt

You are building KaseMail, a private self-hosted email platform for a VPS. Use the provided blueprint docs, mockups, scripts, and source links. The product must support superadmin, workspace admins, workspace users, and individual users. Registration is closed by default. Admins create accounts or invites. Users can use custom domains, mailboxes, aliases, catch-all, forwarding, filters, and webmail.

Do not build SMTP, IMAP, DKIM, queues, or spam filtering from scratch. Integrate with mailcow for the first production path and keep Stalwart as a future adapter. Deliverability, security, backups, and DNS are core product features.

For every task: create tests, update docs, include rollback notes, avoid logging secrets, and avoid creating an open relay.

## Text-only AI note

If the coding agent is DeepSeek v4 Flash Architect or any model that cannot see images, do not rely on PNG mockups. Use `deepseek-text-only/01_text_only_visual_spec.md` and `deepseek-text-only/02_screen_by_screen_ui_blueprint.md` as the visual source of truth.
