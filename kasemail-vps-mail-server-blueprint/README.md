# KaseMail VPS Mail Server Blueprint

This blueprint is a research-backed starter kit for building a private VPS-hosted email platform that can replace a premium hosted mail subscription for personal or team use.

## What is included

- production planning documents
- mail-stack recommendations
- VPS, DNS, and deliverability notes
- one-command installer guidance
- security hardening notes
- admin panel and webmail product specs
- updated premium futuristic UI mockups based on the Kase logo
- AI-agent build prompts
- example scripts and code snippets

## UI note

The mockups in `mockups/` were revised to follow a higher-end, futuristic design direction:

- deep navy / near-black surfaces
- soft blue and violet gradients
- glassmorphism cards
- clean premium layout
- split-screen login
- polished dashboard and webmail experience

## Key folders

- `mockups/` - premium PNG UI mockups based on your Kase logo.
- `prompts/` - prompts for AI coding agents and implementation phases.
- `scripts/` - installation and helper scripts.
- `code-examples/` - code snippets and adapters.
- `config/` - example infra configuration.

## Recommended path

For fastest production viability:

1. use mailcow as the first production mail core
2. build KaseMail panel + webmail UI on top of it
3. keep Stalwart as a future API-first option
4. test in staging before switching away from SpaceMail

## DeepSeek v4 Flash Architect support

This package now includes a full text-only design and prompt pack for DeepSeek v4 Flash Architect in:

- `deepseek-text-only/`

Use that folder when the AI model cannot see or parse the PNG mockups. It contains detailed descriptions of every screen, the visual system, CSS recipes, component contracts, and phase-by-phase prompts.
