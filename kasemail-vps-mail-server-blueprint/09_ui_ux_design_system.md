# 09 - UI/UX Design System

## Design goal

KaseMail should look **premium, futuristic, and product-ready**. The UI must feel like a modern private email platform that could credibly replace a premium hosted mail provider.

This revision replaces the earlier flatter mockup direction with a stronger visual language based on the user-provided design brief:

- Modern premium SaaS dashboard.
- Clean, minimal, high-end composition.
- Futuristic but calm and trustworthy.
- Soft gradients and controlled glow.
- Glassmorphism panels over deep navy surfaces.
- Spacious layouts with clean typography.
- Split-screen landing/login page.
- Command bar, rich tables, guided setup flows, and polished webmail.
- Dark-first visual system, with light mode as a later implementation target.

## Brand

Use the supplied Kase logo mark as the primary visual anchor.

Brand principles:

- Private.
- Secure.
- Elegant.
- Calm.
- Controlled.
- Minimal.
- Premium.

Use **Kase** or **KaseMail** consistently in the UI.

## Visual direction

The intended style is inspired by the *quality level* of premium software such as modern AI products and hosted email tools, but **must remain original**.

### Core characteristics

- Deep navy / near-black background.
- Soft blue and violet gradient lighting.
- Rounded glass panels with thin borders.
- Subtle luminous edges and ambient glows.
- High contrast white typography.
- Muted supporting copy.
- Spacious card spacing.
- Refined iconography.
- Clean tables with readable status badges.
- Elegant, uncluttered forms.

Avoid:

- Heavy cPanel-like density.
- Harsh neon overload.
- Busy gradients.
- Overly flat generic dashboard styling.
- Visual noise and unnecessary decoration.

## Color system

| Token | Value | Usage |
|---|---|---|
| Background / Void | `#050816` | Primary page background |
| Surface 1 | `#0A1022` | App shell and panels |
| Surface 2 | `#0F1730` | Elevated cards and modal layers |
| Border | `rgba(255,255,255,0.10)` | Thin glass borders |
| Text Primary | `#F8FAFC` | Main headings and key content |
| Text Secondary | `#A7B0C3` | Supporting copy |
| Accent Blue | `#4F8CFF` | Buttons, focus, links |
| Accent Violet | `#8B5CF6` | Gradient blend, badges, highlights |
| Success | `#22C55E` | Verified / healthy states |
| Warning | `#F59E0B` | Pending / warning states |
| Danger | `#EF4444` | Failures / phishing / destructive actions |
| Info Glow | `rgba(99,102,241,0.35)` | Ambient shadows and glow accents |

Recommended primary gradient:

- `linear-gradient(90deg, #8B5CF6 0%, #4F8CFF 100%)`

Recommended surface treatment:

- Background blur 16–24px.
- Border: `1px solid rgba(255,255,255,0.08)`.
- Shadow: soft, cool blue/violet outer glow at low opacity.

## Typography

Recommended implementation fonts:

- Inter
- Geist
- SF Pro / system UI fallback

Scale:

- Hero headline: 56–72px.
- Page title: 32–40px.
- Section title: 20–24px.
- Body: 15–17px.
- Helper text: 13–14px.
- Data tables: 14–15px.

Typography rules:

- Use generous line-height.
- Keep headings crisp and short.
- Prefer sentence case over all-caps.
- Use muted copy for helper text.

## Layout system

### Landing / login

- Split-screen composition.
- Left: logo, hero message, short value proposition, feature pills.
- Right: elevated login card.
- Optional space-like glow / orbital curve / atmospheric gradient in background.

### Admin app shell

- Left sidebar navigation.
- Top global search / command bar (`Ctrl+K`).
- Main content in stacked card sections.
- Optional right rail for contextual widgets.

### Webmail shell

- Left navigation with Compose and folders.
- Center message list.
- Right reading pane.
- Large search bar at top.
- Compose experience as a modal or focused workspace.

### Mobile

- Prioritize webmail first.
- Use bottom navigation or compact top actions.
- Large touch targets.
- Preserve premium look without crowding.

## Components

Required premium components:

- Glass metric cards.
- Status badge system.
- Search / command bar.
- Domain health cards.
- DNS record cards with copy actions.
- Mailbox table with quota indicators.
- Quarantine table with action icons.
- Deliverability score gauge.
- Onboarding checklist.
- AI helper suggestion card.
- Rich compose editor shell.
- Storage usage widget.
- Profile / session / security cards.

## Interaction and motion

Implementation target:

- Build with Next.js, React, Tailwind CSS, shadcn/ui, and Framer Motion.

Motion guidelines:

- Soft fade/slide transitions.
- Subtle hover elevation.
- Gentle button glow on hover.
- Animated status indicators.
- Toast notifications.
- Loading skeletons.
- Smooth page transitions.

Do not over-animate core workflow screens.

## Product constraints

- No public registration.
- Only admin-created users and mailboxes.
- Private-access messaging should be visible on the login experience.
- Role system includes: superadmin, workspace admin, workspace user, individual user.

## Mockups included

- `mockups/01-login.png` - split-screen landing/login.
- `mockups/02-superadmin-dashboard.png` - superadmin overview.
- `mockups/03-workspace-admin-dashboard.png` - workspace admin domains view.
- `mockups/04-domain-dns-wizard.png` - step-by-step DNS setup.
- `mockups/05-webmail-inbox.png` - desktop inbox and reading pane.
- `mockups/06-compose-and-ai-draft.png` - compose window with AI assistance.
- `mockups/07-mobile-webmail.png` - mobile webmail concept.
- `mockups/08-spam-quarantine.png` - spam and quarantine operations.

## Canonical build brief for the frontend

Use the following design brief when rebuilding or extending the UI:

```text
Create a modern, premium email hosting web app UI called “KaseMail” built with Next.js, React, Tailwind CSS, shadcn/ui, and Framer Motion.

The app should feel like a polished private email platform with a clean modern interface inspired by premium email services, Google Gemini-style softness, and SpaceMail-style hosting dashboards — but do not copy any brand directly.

Main goal:
Build a beautiful private mail hosting dashboard where the admin can manage domains, mailboxes, aliases, DNS setup, and users. Also include a user-facing webmail interface with inbox, compose, folders, and settings.

Design style:
- Minimal, premium SaaS dashboard
- Soft gradients, glassmorphism cards, rounded corners
- Light and dark mode
- Spacious layout
- Smooth animations
- Clean typography
- Modern sidebar navigation
- Top command/search bar
- Beautiful empty states
- Professional icons
- Mobile responsive design
- Use dummy/mock data for now

Branding:
App name: KaseMail
Tagline: Private email hosting, beautifully managed.
Colors: deep navy, soft blue, white, subtle purple gradients, light gray backgrounds
Mood: secure, calm, premium, modern, trustworthy

User roles:
1. Admin
2. Mailbox User

Important:
This is a private platform. There should be no public registration. Only the admin can create accounts, domains, and mailboxes.
```

## AI image prompt for generating more mockups

```text
Create a premium futuristic UI mockup for KaseMail, a private email hosting and webmail platform. Use the supplied Kase logo as the brand anchor. Design a clean, minimal, high-end SaaS interface with a dark deep-navy background, soft blue-violet gradient glows, rounded glassmorphism panels, subtle borders, and spacious typography. The product should feel calm, secure, modern, and polished. Build screens such as a split-screen login page, superadmin dashboard, workspace admin domains page, DNS setup wizard, mailboxes page, aliases page, webmail inbox, compose modal, mobile webmail, settings, and spam quarantine. Include roles for superadmin, workspace admin, workspace user, and individual user. No public registration. Use original design patterns only; do not copy any brand directly.
```

## DeepSeek / text-only implementation note

If the implementation agent cannot inspect image files, use these files as the design source of truth instead of the PNG mockups:

- `deepseek-text-only/01_text_only_visual_spec.md`
- `deepseek-text-only/02_screen_by_screen_ui_blueprint.md`
- `deepseek-text-only/03_component_and_css_recipes.md`
- `deepseek-text-only/04_phase_prompts_for_deepseek.md`

The PNG mockups remain in `mockups/` for human visual reference. The markdown files above describe the mockups in enough detail for a text-only model to recreate the design.
