# 02 - Screen-by-Screen UI Blueprint For Text-Only AI

This is the screen recreation guide. DeepSeek cannot inspect images, so implement from this file.

## Screen 01 - Landing and Login

### Purpose

Private access entry point for KaseMail. It must feel like a premium product landing page and login page combined.

### Canvas

Desktop mockup is 4:3 landscape. Use a full viewport split-screen layout.

- Left panel: about 54 percent width.
- Right panel: about 46 percent width.
- Thin vertical divider at the split.
- Rounded outer viewport corners only in mockup; production can be full viewport.
- Deep navy and near-black background.
- Faint orbital arcs and a glowing planetary horizon near the bottom-left.
- Subtle blue/violet glow near top-right of login card.

### Left content

Top-left logo row:

- White abstract K logo mark.
- Text `kase` in lowercase, large, white.
- Align around 80 to 90 px from left and 180 to 210 px from top on desktop.

Hero headline:

Text:

`Private email hosting,`  
`built for clarity and control.`

- Huge white sans-serif type.
- `clarity and control` is blue-to-violet gradient text.
- Use line-height around 1.08.
- Text block width around 650 px.

Supporting paragraph:

`KaseMail is private email hosting and webmail for individuals and teams who value privacy, control, and a distraction-free inbox.`

- Muted cool gray.
- 19 to 22 px.
- 1.55 line-height.
- Max width 520 px.

Feature cards row:

Three compact glass cards, each with icon, title, and two-line helper text.

1. Globe icon, title `Custom domains`, helper `Use your domain, your identity.`
2. Lock icon, title `Private inboxes`, helper `Encrypted, secure, and yours alone.`
3. Users icon, title `Admin-managed accounts`, helper `Built for teams and organizations.`

Cards:

- width about 190 px
- height about 130 px
- radius 16 to 20 px
- border rgba white 0.10
- dark translucent background
- icon in violet/blue

Footer:

Small muted text at bottom:

- `© 2024 Kase. All rights reserved.`
- `Privacy`
- `Terms`

### Right content

Login card:

- Centered in right panel.
- Width around 540 to 580 px.
- Height around 700 px.
- Large radius 34 px.
- Glass panel background.
- Subtle violet glow along top-right edge.
- Thin border.

Inside login card:

1. K logo inside a small rounded square badge at top center.
2. Heading `Welcome back`.
3. Subtitle `Sign in to access your inbox.`
4. Email field with envelope icon and placeholder `you@yourdomain.com`.
5. Password field with lock icon, placeholder `Enter your password`, and eye icon.
6. `Forgot password?` link aligned right below password field.
7. Full-width gradient button `Continue` with arrow icon at the far right.
8. Horizontal divider with a tiny glowing dot at center.
9. Security note with shield icon:
   - `Private access only`
   - `All connections are encrypted end-to-end.`

### Responsive behavior

On mobile:

- Stack hero and login card vertically.
- Hide decorative feature cards if space is constrained.
- Keep login form first after logo if used as app auth screen.

## Screen 02 - Superadmin Dashboard

### Purpose

Global owner overview for the entire private KaseMail installation.

### App shell

- Left sidebar width around 240 px.
- Main content starts after sidebar.
- Top search bar above content, centered left, width 430 to 520 px.
- Top-right icons: shield, bell with small badge, user avatar.
- Sidebar has faint planetary glow at bottom-left.

### Sidebar

Top:

- White K logo + `KaseMail`.

Nav items:

1. Dashboard - active, glass highlighted, violet glow.
2. Workspaces
3. Domains
4. Mailboxes
5. Aliases
6. DNS Setup
7. Server Health
8. Security
9. Settings

Bottom profile:

- Avatar `S`
- `Superadmin`
- `superadmin@kase.com`
- dropdown chevron

### Header

Title: `Superadmin Overview` with small shield/check icon.

Subtitle: `Secure. Private. Built for control.`

Right side: date range dropdown `Last 7 days`.

### KPI cards

Six cards in one row on wide desktop.

Each card is glassy, radius about 18 to 22 px, with icon top-left, label, large value, and trend.

1. Total domains: `128`, trend `up 12% vs last 7 days`.
2. Active mailboxes: `2,845`, trend `up 8% vs last 7 days`.
3. Storage used: `1.42 TB`, progress bar, `28% of 5 TB`.
4. Emails sent today: `34,782`, trend `up 15% vs yesterday`.
5. DNS issues: `2`, trend `2 resolved`.
6. Server health: `100%`, `All systems operational`.

### Middle widgets

1. Deliverability Score card
   - Semicircle gauge in violet/blue.
   - Score `98` and label `Excellent`.
   - Checklist: SPF pass, DKIM pass, DMARC pass, IP Reputation excellent, Spam Complaints low.
   - Link `View full deliverability report ->`.

2. Domain Setup Checklist card
   - Badge `3 of 6 completed`.
   - First three items checked and muted/struck.
   - Remaining: Create MX records, Enable DKIM signing, Set up DMARC policy.
   - Link `View setup guide ->`.

3. Mail Server Status card
   - Rows: SMTP operational, IMAP operational, Webmail operational, Spam Filter operational, SSL Certificates valid.
   - Green status chips.

4. Quick Actions card
   - Gradient button `Add Domain`.
   - Secondary buttons `Create Mailbox`, `Add Alias`.

5. AI helper card
   - Cosmic glow background.
   - Text `Need help improving deliverability?`
   - Supporting copy: `Let Kase AI analyze your setup and suggest improvements.`
   - Button `Analyze Now ->`.

### Bottom widgets

1. Recent Activity table
   - Columns: Event, Details, User, Time.
   - Rows include domain added, mailbox created, DNS records updated, login, backup completed.

2. Storage Usage card
   - Donut chart with center `1.42 TB Used`.
   - Legend: Mailboxes, Backups, Attachments, Others.

### Responsive behavior

- KPI cards wrap to 2 columns on tablet and 1 column on mobile.
- Sidebar collapses to icon rail or drawer.
- Complex charts can stack vertically.

## Screen 03 - Workspace Admin Domains Page

### Purpose

Workspace admin manages domains. The mockup shows the Domains page with Add Domain drawer open.

### Layout

Same app shell as dashboard.

Sidebar active item: `Domains`.

Header:

- Title `Domains`.
- Subtitle `Manage and monitor your email domains.`
- Top-right gradient button `Add Domain`.

### Summary cards

Four cards:

1. Total Domains: `128`, trend `up 12% vs last 7 days`.
2. Healthy Domains: `116`, `90% of total`.
3. Warning Domains: `8`, `6% of total`.
4. Error Domains: `4`, `4% of total`.

### Table panel

Controls row:

- Search input `Search domains...`.
- Filter dropdown `All Status`.
- Filter dropdown `DNS Status`.
- Button `More filters`.
- Refresh icon button.

Table columns:

- Domain
- Status
- Mailboxes
- DNS Status
- DKIM
- DMARC
- Created Date
- Actions

Example rows:

- `acme-corp.com`, Primary badge, Healthy, 1,248 mailboxes, DNS Valid, DKIM Pass, DMARC Pass, Jan 12, 2024.
- `acme.org`, Healthy, 356, Valid, Pass, Pass, Feb 03, 2024.
- `acme.net`, Warning, 189, Warning, Pass, Quarantine, Feb 18, 2024.
- `acme.io`, Error, 72, Invalid, Fail, Reject, Mar 05, 2024.
- `acme.co.uk`, Healthy, 91, Valid, Pass, Pass, Mar 22, 2024.
- `acme.tech`, Warning, 23, Warning, Pass, None, Apr 10, 2024.
- `acme.dev`, Healthy, 11, Valid, Pass, Pass, May 01, 2024.

Bottom:

- `Showing 1 to 7 of 7 domains`.
- Pagination controls.

### Add Domain drawer

Right-side glass drawer, width around 360 to 420 px.

Top:

- close X in top-right.
- Icon badge: globe with plus.
- Title `Add Domain`.
- Subtitle `Add a new domain to start sending and receiving emails.`

Form:

- Label `Domain name`, input placeholder `e.g., yourdomain.com`.
- Helper `Enter the domain you want to add.`
- Label `Default mailbox quota`, numeric input `10`, unit dropdown `GB`.
- Helper `Set the default storage quota for mailboxes.`
- Toggle `Enable catch-all` with helper `Automatically accept emails sent to unknown addresses.`
- Info box: `Make sure your DNS records are properly configured for the domain to work correctly.` Link `View DNS Setup Guide ->`.
- Primary gradient button `Add domain` with plus icon.
- Secondary button `Cancel`.

## Screen 04 - DNS Setup Wizard

### Purpose

Guided domain DNS verification screen. Must make complex DNS setup feel simple and premium.

### Layout

Same app shell. Sidebar active item: `DNS Setup`.

Header:

- Breadcrumb: `DNS Setup > Add Domain`.
- Title `DNS Setup Wizard`.
- Subtitle `Follow the steps below to configure your domain and start sending secure email.`
- Button `Exit Wizard`.

Domain header card:

- Globe icon.
- Domain `acme.com`.
- Link `Change Domain`.
- Right side progress label `Verification Progress`.
- Progress bar about 60 percent filled.
- Text `3 of 5 verified`.

### Step list

Five vertical steps connected by a subtle glowing line.

Each step row has:

- numbered circular badge
- title
- small Required or Recommended badge
- helper description
- DNS record card or verification action
- status badge on right

Step 1 - Add MX record:

- Required.
- Description: `Point your domain to KaseMail mail servers.`
- Record card fields:
  - Type: MX
  - Host / Name: @
  - Value / Points to: mx.kasemail.net
  - Priority: 10
  - TTL: 3600
  - Copy button
- Status: Verified green.

Step 2 - Add SPF record:

- Required.
- Type: TXT
- Host: @
- Value: `v=spf1 include:spf.kasemail.net ~all`
- TTL: 3600
- Status: Verified.

Step 3 - Add DKIM record:

- Required.
- Type: TXT
- Host: `k1._domainkey`
- Value: `v=DKIM1; k=rsa; p=MIIBIjANBgkq...` truncated in UI.
- TTL: 3600
- Status: Verified.

Step 4 - Add DMARC record:

- Recommended.
- Type: TXT
- Host: `_dmarc`
- Value: `v=DMARC1; p=quarantine; rua=mailto:postmaster@acme.com`
- TTL: 3600
- Status: Error red.
- Helper: `Invalid value or not found`.
- Link: `View details ->`.

Step 5 - Verify DNS:

- Required.
- Description: `We'll check your DNS settings and activate your domain.`
- Card text: `Run verification to make sure all DNS records are correct and active.`
- Button: gradient `Verify DNS Now` with shield icon.
- Status: Pending gray.

### Right rail

Onboarding Checklist card:

- Badge `3 of 5 completed`.
- Items:
  - Add Domain checked
  - Verify Domain Ownership checked
  - DNS Setup active/in progress
  - Create Mailboxes pending
  - Send Test Email pending

Provider Tips card:

- Dropdown: Cloudflare.
- Steps:
  1. Log in to Cloudflare and select acme.com.
  2. Go to DNS > Records.
  3. Click Add record and choose type, name, and value from wizard.
  4. Set TTL to Auto and save.
- Link `View detailed guide`.

Need Help card:

- Headset icon.
- Text `Our DNS experts are here to help you every step of the way.`
- Button `Contact Support ->`.

Bottom banner:

- Shield icon.
- Heading `Why these records matter`.
- Explain deliverability and spoofing protection.
- Button `Learn more`.

## Screen 05 - Webmail Inbox

### Purpose

User-facing webmail desktop interface. Familiar like a modern email client, but original and premium.

### Layout

Three columns:

1. Left sidebar: 250 to 280 px.
2. Message list: 470 to 540 px.
3. Reading pane: remaining width.

Full dark shell with soft glow. Left sidebar has planetary glow at bottom.

### Left sidebar

Top:

- K logo + `KaseMail`.
- Large gradient `Compose` button with edit icon.

Folders:

- Inbox active, badge 12
- Starred
- Sent
- Drafts badge 3
- Archive
- Spam badge 8
- Trash
- Settings

Bottom:

- User card: avatar `D`, `Daniel Carter`, `daniel@kase.com`, dropdown.
- Storage card: `2.43 GB of 10 GB used`, progress bar.
- Footer: copyright, Privacy, Terms.

### Top bar

Search input `Search emails` with shortcut hint `Command K` or `Ctrl+K` depending platform.

Top-right global icons: shield, bell with badge 3, user avatar.

### Message list

Header:

- `Inbox`
- `12 unread`
- right aligned `Sort` dropdown.

Rows:

Each row has unread dot if unread, sender, subject, preview, time/date, attachment icon if present, star icon.

Selected row:

- Purple border and subtle glow.
- Sender: Sarah Mitchell.
- Subject: Project update & next steps.
- Preview: `Hi Daniel, I've attached the latest project...`
- Time: 9:41 AM.
- Shows paperclip and star.

Other rows:

- Kevin Zhang - Q2 performance dashboard - 8:23 AM.
- Laura Bennett - Re: Budget approval - Yesterday.
- Product Team - Product roadmap - May update - Yesterday.
- Alex Rivera - Design system feedback - May 10.
- Michael Thompson - Client meeting recap - May 9.
- Noah Williams - Onboarding plan - May 9.
- System Notifications - Security alert - May 8.

### Reading pane

Large glass panel with toolbar at top.

Toolbar icons:

- back arrow
- open/external
- report/spam or shield
- delete
- archive/mailbox
- more menu

Title row:

- `Project update & next steps`
- small `Inbox` pill
- star icon on right

Sender block:

- Circular gradient avatar `S`.
- Sender `Sarah Mitchell`.
- Address `sarah@acme.com`.
- `to me` with dropdown.
- Time `9:41 AM`.

Attachment card:

- document icon
- `project-update-may.pdf`
- `1.2 MB`
- download icon

Body:

```text
Hi Daniel,

I've attached the latest project update, which includes progress on all key milestones, outstanding risks, and the revised timeline.

We're on track to complete Phase 1 by the end of the month. Please let me know if you have any feedback or if you'd like to sync this week.

Thanks,
Sarah
```

Signature:

- `Sarah Mitchell` in violet.
- `Project Manager, Acme Inc.`
- `sarah@acme.com`
- `+1 (415) 555-0198`

Bottom action buttons:

- Reply
- Forward
- Archive
- Delete

## Screen 06 - Compose Email Modal With AI Assistant

### Purpose

Polished compose window layered over webmail. Includes optional Kase AI writing helper.

### Layout

The underlying inbox is dimmed or visible behind the modal.

Compose modal:

- Large centered glass panel.
- Width around 700 to 780 px for editor.
- Attached AI side panel to right, width around 280 to 330 px.
- Modal has strong top-right violet glow.
- Radius 26 to 32 px.

### Compose header

- Title `New message`.
- Window controls on right: minimize, expand, close.

### Recipient row

- Label `To`.
- Recipient chip `Sarah Mitchell <sarah@acme.com>` with remove X.
- Right links `Cc` and `Bcc`.

### Subject row

- Label `Subject`.
- Text `Project update & next steps`.

### Formatting toolbar

- Dropdown `Paragraph`.
- Bold, italic, underline, strikethrough.
- Bullet list, numbered list, indent.
- Link.
- Image.
- Table/grid.
- More menu.

### Editor body

Use the same draft body as the selected email reply.

### Attachment chip

- Document icon.
- `project-update-may.pdf`.
- `1.2 MB`.
- Remove X.

### Footer actions

Left icons:

- attachment
- image
- emoji
- code/snippet or variables
- formatting A

Right buttons:

- Secondary `Save draft`.
- Primary gradient `Send` with paper-plane icon.
- Small dropdown arrow beside Send.

### AI assistant card

Title row:

- Sparkle icon.
- `Kase AI`.
- `Beta` chip.
- close X.

Content:

- Heading: `Here are a few ways to improve your email.`

Suggestion 1:

- Title `Enhance subject`.
- Helper `Make your subject clearer and more actionable.`
- Suggested subject chip: `Project Update: Phase 1 Progress & Next Steps`.
- Button `Apply`.

Suggestion 2:

- Title `Improve clarity`.
- Helper `Your email is clear and well-structured.`
- Checklist: Clear greeting, Key details included, Actionable closing.

Bottom:

- Button `See more suggestions`.
- Privacy note: `AI suggestions are private and never stored.`

## Screen 07 - Mobile Webmail

### Purpose

Mobile-responsive webmail presentation. The mockup shows two phones: inbox list and email detail.

### Mobile inbox screen

Top:

- iOS-like status bar time 9:41.
- K logo and `KaseMail`.
- Search icon.
- Avatar `S`.

Tabs:

- Inbox active with badge 28.
- Primary.
- Updates with badge 12.

Message cards:

1. Acme Corp - `Your domain setup is complete` - 2m ago.
2. System - `Security alert: new login` - 15m ago.
3. Team Lead - `Project roadmap update` - 1h ago.
4. Cloud Services - `Storage usage summary` - 3h ago.
5. Kase Security - `Weekly security digest` - 6h ago.
6. Michael Gray - `Re: Meeting notes` - Yesterday.

Cards are rounded, dark, separated by enough space, with colored circular avatars/icons and small unread dots.

Floating compose button:

- Bottom-right above nav.
- Purple/blue gradient square with edit icon.

Bottom nav:

- Mail active.
- Compose.
- Folders.
- Settings.

### Mobile detail screen

Top actions:

- Back arrow.
- Delete.
- Folder.
- More menu.

Subject:

- `Your domain setup is complete`.
- `Inbox` chip.
- Star icon.

Sender:

- acme purple avatar.
- `Acme Corp`.
- `to you@yourdomain.com`.
- Time 2m ago.

Hero image/banner in email:

- Space/planet glow with KaseMail logo.

Body:

- Greeting `Hi Superadmin,`
- Domain active confirmation.
- Checklist of actions: send and receive, manage mailboxes and aliases, configure DNS records, set up SPF/DKIM/DMARC.
- Primary button `Go to Domain Settings`.
- Signoff from KaseMail Team.

Bottom reply bar:

- Input-like bar `Reply` and arrow.

## Screen 08 - Spam and Quarantine Dashboard

### Purpose

Security operations page for spam, phishing, and quarantine management.

### Layout

Same admin shell. Sidebar `Security` section expanded. Active item: `Spam & Quarantine`.

Header:

- Title `Spam & Quarantine` with shield icon.
- Subtitle `Monitor, manage, and fine-tune your email protection.`
- Date range `Last 7 days`.

### Summary cards

1. Quarantined Emails: `2,847`, up 18 percent.
2. Blocked Senders: `312`, up 11 percent.
3. Phishing Alerts: `128`, up 22 percent.
4. False Positives: `23`, down 8 percent.
5. Protection Health: `98%`, `Excellent`, `All systems operational`.

### Main table

Card title: `Quarantined Messages`.

Subtitle: `Emails blocked or quarantined by KaseMail protection.`

Controls:

- Filters dropdown.
- Search input `Search messages...`.

Columns:

- checkbox
- Sender
- Subject
- Reason
- Score
- Date
- Actions

Rows:

- promo@flashdeals.today - Limited time offer just for you! - Spam - 85 - May 20, 2024 10:24 AM
- security@account-alerts.co - Unusual sign-in detected - Phishing - 96 - May 20, 2024 09:11 AM
- info@winner-notify.com - You've won a free iPhone! - Spam - 82 - May 20, 2024 08:47 AM
- billing@amaz0n-secure.com - Verify your payment details - Phishing - 94 - May 20, 2024 07:33 AM
- noreply@updates.service - Important policy update - Spam - 61 - May 19, 2024 11:59 PM
- hr@globalcareers.io - Open Positions in Your Area - Spam - 45 - May 19, 2024 10:15 PM
- it-support@corp-secure.net - Password expires tomorrow - Phishing - 91 - May 19, 2024 09:02 PM
- newsletter@techinsights.com - This week in tech - Spam - 38 - May 19, 2024 08:41 PM

Actions per row:

- release/approve icon
- delete icon
- allowlist sender icon
- block sender icon

Footer:

- `Showing 1 to 8 of 2,847 results`.
- Pagination `1 2 3 ... 356`.
- Reason legend: Spam, Phishing, Malware, Policy Violation, Other.

### Right sidebar widgets

1. Spam Threshold
   - Text `Adjust sensitivity of spam filtering.`
   - Current Level: Medium.
   - Slider Low / Medium / High.
   - Button `Save Changes`.

2. Recent Phishing Patterns
   - Fake Microsoft Login up 24 percent, detected 45 times.
   - Account Suspension Scam up 18 percent, detected 32 times.
   - Invoice / Payment Scam up 15 percent, detected 28 times.
   - Link `View all patterns ->`.

3. Filter Training Status
   - AI Model v2.8.4.
   - Last trained date.
   - Circular progress 92 percent, `Up to date`.
   - Checks: Spam Detection, Phishing Detection, URL Analysis, Attachment Scan.

4. Quarantine Storage
   - `1.42 TB used of 5 TB`.
   - 28 percent progress bar.
   - Link `Manage storage ->`.
