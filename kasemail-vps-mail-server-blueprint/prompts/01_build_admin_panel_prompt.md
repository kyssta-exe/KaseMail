# Prompt - Build Admin Panel

Build the **KaseMail admin panel** as a production-ready frontend foundation using:

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Objective

Create a premium, futuristic, private email-hosting dashboard that can replace the feel of a commercial hosted mail control panel.

## Product rules

- No public registration.
- Only admins can create domains, users, mailboxes, and aliases.
- Support roles: superadmin, workspace admin, workspace user, individual user.
- Use mock data first, but structure the code so backend APIs can be connected later.

## Visual direction

Match the premium visual language defined in `09_ui_ux_design_system.md` and the latest files in `mockups/`:

- dark deep-navy shell
- soft blue/violet gradients
- glassmorphism cards
- clean typography
- spacious layout
- elegant tables and filters
- high-end SaaS polish

## Screens to implement

1. Superadmin dashboard
2. Workspace/domain management
3. DNS setup wizard
4. Mailboxes management
5. Aliases management
6. Server health
7. Security / spam / quarantine
8. Settings

## Required interactions

- Search and filter controls.
- Add Domain modal.
- Create Mailbox modal.
- Add Alias modal.
- Copy DNS record actions.
- Toast notifications.
- Loading states.
- Empty states.
- Hover states.
- Command palette (`Ctrl+K`).
- Responsive behavior.

## Data modules to mock

- domains
- mailboxes
- aliases
- dns records
- activity logs
- storage usage
- deliverability score
- quarantine queue
- health checks

## Quality bar

The result should feel like a polished commercial product, not an internal admin panel. Use reusable components, strong layout consistency, and production-quality file organization.

## Testing

Add Playwright coverage for:

- role boundaries
- modal flows
- navigation
- table filtering
- responsive states
