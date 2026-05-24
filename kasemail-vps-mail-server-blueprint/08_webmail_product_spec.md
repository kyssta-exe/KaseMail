# 08 - Webmail Product Specification

## Webmail goals

The webmail should feel fast, clean, and obvious. It should not be a Gmail clone, but it can use familiar patterns: left folders, message list, reading pane, keyboard shortcuts, fast search, compose modal, labels/folders, and mobile responsiveness.

## Core features

- Inbox, sent, drafts, archive, spam, trash, custom folders.
- Conversation view and classic message view.
- Full-text search if supported by mail core.
- Compose, reply, reply-all, forward.
- Draft autosave.
- Attachments.
- Signatures.
- Sender identities and aliases.
- CC/BCC.
- Rich text and plaintext toggle.
- Scheduled send later if implemented by queue service.
- Snooze/remind later if implemented by metadata service.
- Read receipts disabled by default; warn users if enabling.
- Filters/rules UI, backed by Sieve or mail-core filtering.
- Vacation auto-reply UI.
- Forwarding UI if policy allows.
- Block/allow sender.
- Mark spam/not spam.
- Import/migration status.
- Contacts autocomplete.
- Calendar and contacts in phase 2/3.
- PWA/mobile responsive interface.

## Security UX

- Remote images blocked by default.
- External sender warning for suspicious lookalikes.
- Attachment warning for risky files.
- Link preview should show actual target host.
- Phishing banner when SPF/DKIM/DMARC or spam engine flags are bad.
- Password-protected email links only if implemented carefully and not marketed as end-to-end encryption unless it truly is.

## AI draft assistant

Optional and disabled by default.

Rules:

- Workspace-level opt-in.
- User-level opt-in.
- Clear indicator when email content is sent to an AI provider.
- Never train on private email unless explicitly consented.
- Redact quoted history where possible.
- Log only metadata, not full message content.

## Technical options

### If using mailcow

- Use SOGo immediately for day-1 webmail.
- Build KaseMail webmail separately using IMAP/SMTP.
- For filtering, integrate with Sieve/ManageSieve.
- For search, rely on Dovecot full-text indexing where available or a separate safe index later.

### If using Stalwart

- Prefer JMAP for webmail because it is JSON/HTTP and more natural for modern web apps.
- IMAP remains available for desktop/mobile clients.
- Calendar/contacts can use CalDAV/CardDAV/WebDAV if enabled.

## Acceptance criteria

- Inbox opens in under 1.5 seconds for a small mailbox and remains usable for 50k+ messages with pagination/virtualization.
- Compose autosaves reliably.
- Attachments up to configured size limit work.
- HTML email is sanitized.
- Sender identity enforcement prevents spoofing.
- Keyboard shortcuts have a setting and help overlay.
- Mobile UI supports reading, search, compose, and attachments.
- Webmail works with 2FA/app-password policies.
