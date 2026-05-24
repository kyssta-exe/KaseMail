# 05 - DeepSeek Context Loading Order And Prompting Strategy

DeepSeek v4 Flash Architect may perform best if it receives smaller, focused context blocks. Use this strategy.

## First message

Paste `00_deepseek_master_architect_prompt.md`.

Ask DeepSeek to acknowledge:

```text
Acknowledge the constraints. You cannot see images. You must use text-only design specs. Do not build yet.
```

## Second message

Paste:

- `01_text_only_visual_spec.md`
- `02_screen_by_screen_ui_blueprint.md`

Ask:

```text
Summarize the KaseMail visual system and list the reusable components you will need. Do not code yet.
```

## Third message

Paste:

- `03_component_and_css_recipes.md`
- `04_phase_prompts_for_deepseek.md`

Ask for Phase 0.

## Per-phase workflow

For each phase:

1. Paste only the relevant phase prompt.
2. Ask DeepSeek to output a file plan first.
3. Review the plan.
4. Ask it to implement one route or component group at a time.
5. Ask for acceptance criteria and tests after each phase.

## Prompt guardrails

Use this reminder at the end of every prompt:

```text
Do not rely on images. Do not ask to inspect PNGs. Follow the text-only visual blueprint exactly. Keep the UI premium, dark, glassy, spacious, and futuristic.
```

## When DeepSeek drifts into generic UI

Paste this correction:

```text
The UI is becoming too generic. Re-align with KaseMail's visual system: deep navy background, glassmorphism cards, soft blue/violet glow, thin translucent borders, premium spacious typography, rounded cards, gradient buttons, and subtle futuristic ambient lighting. Avoid cPanel-style density and plain gray dashboards.
```

## When DeepSeek overbuilds backend

Paste this correction:

```text
Stop backend expansion. This phase is frontend prototype and adapter boundaries only. Do not build SMTP, IMAP, DKIM, queues, spam filtering, or mail server internals from scratch. Keep all mail operations mocked behind interfaces.
```

## When DeepSeek ignores private-access rule

Paste this correction:

```text
Remove public registration. KaseMail is private. Only admins create users, workspaces, domains, mailboxes, and aliases. Login page can include forgot password, but no signup flow.
```
