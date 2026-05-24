# 01 - Text-Only Visual Spec For DeepSeek

DeepSeek cannot see images. This file describes the visual identity and every important layout decision in words.

## Product name

Use `KaseMail` for the full email product and `Kase` for compact branding.

## Visual identity

The brand is a premium private email platform. The supplied logo is a bold white abstract K mark made from rounded pill-like geometric shapes. The UI should feel secure, calm, futuristic, and expensive.

## Overall aesthetic

Imagine a dark private control room for email infrastructure, softened with premium SaaS design.

The interface uses:

- near-black and deep navy backgrounds
- subtle blue and violet light sources
- glassmorphism panels with blur and translucent borders
- large rounded corners
- thin dividers
- soft outer glows
- clean modern sans-serif typography
- white primary text
- cool gray secondary text
- purple-to-blue gradient buttons
- green, amber, and red status chips

The app must feel like a high-end product, not like server admin software.

## Base colors

Use these exact semantic colors unless the implementation has a better theme token structure:

```css
--background: #050816;
--background-deep: #03050f;
--surface-1: rgba(10, 16, 34, 0.84);
--surface-2: rgba(15, 23, 48, 0.78);
--surface-3: rgba(20, 30, 60, 0.62);
--border-soft: rgba(255, 255, 255, 0.09);
--border-strong: rgba(139, 92, 246, 0.42);
--text-primary: #f8fafc;
--text-secondary: #a7b0c3;
--text-muted: #717b91;
--accent-blue: #4f8cff;
--accent-violet: #8b5cf6;
--accent-cyan: #38bdf8;
--success: #22c55e;
--warning: #f59e0b;
--danger: #ef4444;
```

## Main gradient

Primary button gradient:

```css
linear-gradient(90deg, #8b5cf6 0%, #4f8cff 100%)
```

Soft panel glow:

```css
box-shadow:
  0 0 0 1px rgba(255,255,255,0.08),
  0 24px 80px rgba(23, 37, 84, 0.35),
  0 0 44px rgba(139, 92, 246, 0.08);
```

Active item glow:

```css
box-shadow:
  inset 0 0 0 1px rgba(139,92,246,0.55),
  0 0 24px rgba(79,140,255,0.22),
  0 0 4px rgba(255,255,255,0.35);
```

## Background style

Every primary page should sit on a layered background:

1. Base near-black navy.
2. Large blurred radial blue glow in the top-right.
3. Large blurred violet glow in the bottom-left.
4. Optional subtle star/noise texture at 2 to 5 percent opacity.
5. Optional curved planetary horizon or orbital light arc in hero/login/sidebar areas.

Implementation can use CSS radial gradients instead of bitmap images.

Suggested app shell background:

```css
background:
  radial-gradient(circle at 85% 10%, rgba(79, 140, 255, 0.16), transparent 32%),
  radial-gradient(circle at 10% 85%, rgba(139, 92, 246, 0.18), transparent 34%),
  linear-gradient(135deg, #050816 0%, #03050f 55%, #071124 100%);
```

Suggested login hero background:

```css
background:
  radial-gradient(circle at 16% 20%, rgba(79, 140, 255, 0.16), transparent 30%),
  radial-gradient(circle at 72% 70%, rgba(139, 92, 246, 0.20), transparent 34%),
  linear-gradient(135deg, #050816 0%, #02030a 65%, #0a1022 100%);
```

## Glass panel style

Cards, drawers, reading panes, and modals should use:

```css
background: linear-gradient(180deg, rgba(15,23,48,0.72), rgba(8,13,30,0.88));
border: 1px solid rgba(255,255,255,0.09);
backdrop-filter: blur(18px);
border-radius: 24px;
```

For very prominent panels, add a subtle violet highlight at the top-right:

```css
::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background: radial-gradient(circle at 90% 0%, rgba(139,92,246,0.28), transparent 36%);
}
```

## Typography

Use Inter or Geist. If neither is available, use system UI.

Recommended sizes:

- Hero headline: 56 to 72 px, 1.05 line-height, weight 650 to 750.
- Page title: 30 to 40 px, 1.1 line-height, weight 650.
- Card metric: 28 to 38 px, weight 700.
- Section heading: 18 to 24 px, weight 600.
- Body text: 14 to 16 px, line-height 1.6.
- Table text: 13 to 14 px.
- Helper text: 12 to 13 px.

Letter spacing should be slightly negative for big headings and normal for body.

## Spacing and radius

Use generous spacing.

- App padding: 24 to 32 px.
- Card padding: 20 to 28 px.
- Sidebar width: 232 to 280 px.
- Table row height: 58 to 72 px.
- Button height: 44 to 56 px.
- Input height: 48 to 58 px.
- Small radius: 12 px.
- Button radius: 12 to 16 px.
- Card radius: 20 to 28 px.
- Large modal radius: 28 to 34 px.

## Icon style

Use lucide-react icons with:

- 18 to 22 px icons in nav
- 20 to 26 px icons in metric cards
- 14 to 18 px icons inside buttons and chips
- stroke width around 1.75
- icons inherit muted text by default
- active icons use violet/blue gradient or violet color

## Status chips

Use small rounded pills with dot + label.

Success:

```css
background: rgba(34, 197, 94, 0.10);
color: #4ade80;
border: 1px solid rgba(34, 197, 94, 0.20);
```

Warning:

```css
background: rgba(245, 158, 11, 0.10);
color: #fbbf24;
border: 1px solid rgba(245, 158, 11, 0.20);
```

Danger:

```css
background: rgba(239, 68, 68, 0.10);
color: #f87171;
border: 1px solid rgba(239, 68, 68, 0.20);
```

Neutral:

```css
background: rgba(148, 163, 184, 0.10);
color: #cbd5e1;
border: 1px solid rgba(148, 163, 184, 0.16);
```

## Motion

Motion should be subtle.

- Page transition: opacity 0 -> 1 and y 8 -> 0 over 180 to 260 ms.
- Card hover: y -2 px, border brighter, shadow stronger.
- Button hover: gradient brightens, soft glow increases.
- Modal entry: scale 0.98 -> 1, opacity 0 -> 1.
- Command palette: fade and slide down.
- Status pulse: small opacity pulse only on live service indicators.

## Light mode

Dark mode is the main product identity. Light mode can exist, but do not compromise the dark premium version.

Light mode should use:

- off-white canvas
- white cards
- navy text
- same blue/violet accents
- lower glow intensity
- subtle borders

## Accessibility basics

- Text contrast must remain readable on dark backgrounds.
- Inputs must have visible focus rings.
- Buttons need hover and focus states.
- Tables need keyboard-reachable actions.
- Do not rely on color alone for critical statuses; include labels and icons.
