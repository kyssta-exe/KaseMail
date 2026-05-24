# 04 - Phase Prompts For DeepSeek v4 Flash Architect

Use these prompts one phase at a time. DeepSeek should not try to build everything in one response.

## Phase 0 - Repository and architecture plan

```text
Using the KaseMail blueprint and text-only visual specs, create the architecture plan for the frontend prototype.

Remember: you cannot see images. Use the text-only visual specs only.

Output:
1. monorepo structure
2. app routes
3. component hierarchy
4. mock data modules
5. shared types
6. design token plan
7. testing plan
8. first implementation task list

Stack: Next.js App Router, React, TypeScript, Tailwind, shadcn/ui, Framer Motion, lucide-react.

Do not implement backend mail server logic. Create adapter interfaces only.
```

## Phase 1 - Design system and app shell

```text
Implement the KaseMail visual system from the text-only visual specs.

Build:
- Tailwind theme tokens
- global CSS helpers for dark gradient background, glass panels, gradient text, gradient buttons, glow edges
- GlassCard component
- GradientButton component
- StatusChip component
- MetricCard component
- CommandSearch component
- AdminShell layout
- MailShell layout
- mock Kase logo component using image asset if available, with text fallback

Acceptance criteria:
- dark deep-navy app background
- glassmorphism cards
- blue/violet gradient buttons
- active nav glow
- responsive sidebar collapse foundation
- accessible focus rings
```

## Phase 2 - Login and private access page

```text
Build the split-screen login page exactly from the text-only screen blueprint.

Requirements:
- left hero with Kase logo, headline, gradient words, supporting paragraph, three feature cards, footer links
- right floating glass login card with logo badge, welcome heading, email/password fields, forgot password link, Continue button, security note
- CSS-only ambient background with orbital/planet glow style
- no public registration
- validation UI for empty email/password
- mobile stacking behavior
- Framer Motion entrance animations

Use mock auth only.
```

## Phase 3 - Superadmin dashboard

```text
Build the Superadmin Overview dashboard from the text-only screen blueprint.

Requirements:
- AdminShell
- sidebar nav
- top command/search bar
- 6 KPI cards
- deliverability gauge
- domain setup checklist
- mail server status card
- quick actions card
- Kase AI deliverability helper card
- recent activity table
- storage usage donut chart or CSS/SVG chart
- date range dropdown
- responsive wrapping

Use mock data. Do not call real APIs.
```

## Phase 4 - Domains page and Add Domain drawer

```text
Build the Domains page and Add Domain drawer.

Requirements:
- summary cards for total, healthy, warning, error domains
- domain table with search, filters, refresh, pagination
- exact columns from the blueprint
- status chips for Healthy, Warning, Error, Valid, Invalid, Pass, Fail, Reject, Quarantine, None
- Add Domain drawer with domain input, quota input, GB dropdown, catch-all toggle, info box, primary and cancel buttons
- form validation for invalid domain
- toast on successful mock submit

Use reusable table and drawer components where useful.
```

## Phase 5 - DNS setup wizard

```text
Build the DNS Setup Wizard from the text-only blueprint.

Requirements:
- breadcrumb, title, subtitle, Exit Wizard button
- domain header with progress bar
- 5-step vertical DNS wizard
- copyable DNS record cards for MX, SPF, DKIM, DMARC
- status badges: Verified, Error, Pending
- Verify DNS Now button
- right rail onboarding checklist
- provider tips card with Cloudflare dropdown
- need help card
- bottom explanation banner
- toast when copying records
- mock verification action updates UI state
```

## Phase 6 - Mailboxes and aliases admin

```text
Build Mailboxes and Aliases admin pages using the same premium visual system.

Mailboxes page:
- overview metrics
- table columns: Email Address, Owner Name, Domain, Storage Used, Quota, Status, Last Login, Actions
- create mailbox modal with full name, username, domain dropdown, password, quota, webmail access toggle, SMTP/IMAP toggle
- actions: reset password, disable mailbox, edit quota, delete mailbox

Aliases page:
- table columns: Alias address, Destination mailbox, Status, Actions
- add alias modal with alias name, domain dropdown, forward-to mailbox, save button
- search and filters
- mock validation and toasts
```

## Phase 7 - Webmail inbox and reading pane

```text
Build the desktop Webmail Inbox from the text-only screen blueprint.

Requirements:
- MailShell with left sidebar, Compose button, folders, user card, storage card
- top search bar
- inbox message list with exact example messages
- selected message highlight
- reading pane with toolbar, subject, sender details, attachment card, email body, signature, bottom action buttons
- unread dot, star, attachment icons
- responsive behavior: on smaller screens, show either list or message detail, not both
- remote images blocked state foundation
- sanitized HTML rendering placeholder
```

## Phase 8 - Compose modal and Kase AI helper

```text
Build the Compose Email modal from the text-only screen blueprint.

Requirements:
- large glass compose panel over dimmed inbox
- New message header with minimize, expand, close
- To row with recipient chip and Cc/Bcc links
- Subject row
- rich text toolbar
- editor body
- attachment chip
- bottom action icons
- Save draft button
- gradient Send button with dropdown
- Kase AI side card with Enhance subject and Improve clarity sections
- Apply button updates subject
- mock draft autosave indicator
```

## Phase 9 - Security, spam, quarantine, server health, settings

```text
Build the remaining admin pages.

Spam and Quarantine:
- use the exact screen blueprint
- metric cards
- quarantine table
- row action icons with tooltips
- spam threshold slider
- phishing patterns widget
- filter training status widget
- quarantine storage widget

Server Health:
- SMTP, IMAP, Webmail, Spam filter, SSL certificate status
- disk usage, memory usage, queue size, recent logs

Settings:
- tabs Profile, Security, Connected Domains, Mail Preferences, Appearance
- profile form, 2FA toggle, sessions list, signature editor, vacation responder, light/dark mode, compact/comfortable view
```

## Phase 10 - Responsive polish and QA

```text
Polish the KaseMail prototype.

Requirements:
- mobile layouts for login, dashboard, domains, DNS wizard, webmail
- keyboard navigation and visible focus states
- command palette keyboard shortcut
- skeleton loading states
- empty states for tables
- toast notifications
- hover states
- Framer Motion page transitions
- Playwright smoke tests for login, dashboard nav, add domain, copy DNS, webmail compose, quarantine action
- run lint and typecheck

Output final QA checklist and known limitations.
```

## Phase 11 - Backend integration boundary

```text
Define backend API contracts without implementing real mail server internals.

Create TypeScript interfaces for:
- mail core adapter
- domain adapter
- DNS verification adapter
- mailbox adapter
- alias adapter
- quarantine adapter
- health adapter

Create mock implementation first.
Create mailcow implementation stubs second.
Create Stalwart implementation stubs third.

Do not create an open relay. Do not expose secrets. Do not send real mail in the prototype.
```
