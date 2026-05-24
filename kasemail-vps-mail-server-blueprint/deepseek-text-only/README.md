# README - DeepSeek v4 Flash Architect Text-Only Guide

This folder exists because DeepSeek v4 Flash Architect may not be able to inspect the PNG mockups. Treat the markdown files here as the source of truth for the UI and implementation plan.

## How to use this folder

Give DeepSeek the files in this order:

1. `deepseek-text-only/00_deepseek_master_architect_prompt.md`
2. `deepseek-text-only/01_text_only_visual_spec.md`
3. `deepseek-text-only/02_screen_by_screen_ui_blueprint.md`
4. `deepseek-text-only/03_component_and_css_recipes.md`
5. `deepseek-text-only/04_phase_prompts_for_deepseek.md`
6. `09_ui_ux_design_system.md`
7. `07_admin_panel_product_spec.md`
8. `08_webmail_product_spec.md`
9. `10_database_schema_and_api_design.md`

The PNG mockups are still included for humans in `mockups/`, but the AI should not rely on seeing them.

## Main instruction for DeepSeek

Do not ask to view images. Use the text descriptions in this folder to recreate the designs.

## Expected output from DeepSeek

DeepSeek should produce:

- production-ready architecture decisions
- small implementation phases
- file trees
- code tasks
- acceptance criteria
- visual component contracts
- Tailwind/shadcn component plans
- API boundaries ready for backend integration later

## UI quality target

The product should look like a premium futuristic private email hosting platform, not a generic admin dashboard. The design should combine:

- dark deep navy background
- soft blue and violet glow
- glassmorphism cards
- rounded corners
- clean typography
- spacious layout
- polished tables and modals
- smooth Framer Motion transitions
- excellent responsive behavior

## Important product rules

- No public registration.
- Only admins create accounts, workspaces, domains, mailboxes, aliases, and users.
- Roles: superadmin, workspace admin, workspace user, individual user.
- First build a frontend prototype with mock data.
- Structure the code so mailcow or Stalwart APIs can be connected later.
- Do not build SMTP, IMAP, DKIM, queueing, or spam filtering from scratch.
