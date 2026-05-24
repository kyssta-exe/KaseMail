# Prompt - Build Webmail

Build the **KaseMail webmail frontend** using:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Goal

Create a premium desktop and mobile webmail experience that feels clean, fast, secure, and futuristic.

## Visual direction

Match the latest `mockups/05-webmail-inbox.png`, `mockups/06-compose-and-ai-draft.png`, and `mockups/07-mobile-webmail.png` together with `09_ui_ux_design_system.md`.

The UI should include:

- dark premium shell
- subtle blue/violet glow
- rounded glass panels
- minimal but expressive icons
- large search bar
- polished reading pane
- elegant compose experience

## Core features

- folders: Inbox, Starred, Sent, Drafts, Archive, Spam, Trash
- message list with sender, subject, preview, timestamp, attachment, star, unread state
- reading pane with sender details and actions
- compose modal / compose workspace
- reply / forward / archive / delete actions
- attachments
- signatures
- identities
- settings
- search
- responsive mobile layout
- storage widget

## Security requirements

- block remote images by default
- sanitize HTML mail rendering
- do not leak tracking pixels by default
- design for 2FA and session-aware settings

## Premium touches

- draft autosave indicator
- keyboard shortcuts
- subtle page transitions
- command bar access
- optional AI helper panel for copy refinement or deliverability guidance

## Build target

Frontend prototype first, then connect IMAP/SMTP or JMAP adapters later.
