# 01 - Research Summary and Stack Decision

## Feature target based on Spacemail-like usage

Spacemail positions itself as simple secure custom-domain business email with spam filtering, calendar, webmail, multi-device access, IMAP/SMTP/POP3 access, 2FA, migration tooling, aliases, catch-all, forwarding, and spam-management controls. This blueprint targets those features plus stronger private admin controls.

## Stack comparison

| Stack | Best use | Pros | Cons | Recommendation |
|---|---|---|---|---|
| mailcow | Fastest reliable Spacemail replacement | Dockerized full suite, admin UI, domains, mailboxes, DKIM generation, Rspamd, quarantine, SOGo webmail, backups, domain admin/user separation | Heavier VPS footprint, UI is not as sleek as a custom product, many containers | Best day-1 deployment |
| Stalwart | Building a custom modern product | Modern all-in-one mail/collaboration server, JMAP/IMAP/SMTP/CalDAV/CardDAV/WebDAV, WebUI, API/CLI, tenants/roles concepts | Newer operational model, custom webmail still needs engineering | Best product foundation if you want custom UI |
| Mail-in-a-Box | Personal appliance | One-box install, DNS automation, Roundcube, Nextcloud contacts/calendar, backup helpers | Intentionally not highly customizable | Good for personal only, not for this product |
| Docker Mailserver | Minimal config-driven mail stack | Production-ready simple Docker mail server, no SQL, easy versioned config | No polished admin UI by default | Good if building all panel UX yourself |
| WildDuck | API-first mail backend | HTTP API, Gmail-like design philosophy, scalable architecture | More moving parts, MongoDB/Redis/Haraka/ZoneMTA patterns | Consider only for advanced product work |

## Decision

For a private replacement of Spacemail on a VPS:

- **Phase 1:** use mailcow as the real mail server. It gets you working email, DKIM, anti-spam, quarantine, webmail, aliases, catch-all, migrations, and admin controls quickly.
- **Phase 2:** build the KaseMail custom admin panel as a wrapper around mailcow API.
- **Phase 3:** build the KaseMail webmail UI. First connect via IMAP/SMTP, then move to JMAP if using Stalwart.
- **Phase 4:** optionally migrate the mail core to Stalwart if you want deeper product control and a modern JMAP-first backend.

## Why not build Postfix/Dovecot by hand first

You can, but it is a high-maintenance route. Your target is a polished Spacemail/Gmail-like private service, not a research project in MTA hardening. Building on mailcow or Stalwart lets you focus on the panel, UX, RBAC, migration, automation, monitoring, and DNS health.
