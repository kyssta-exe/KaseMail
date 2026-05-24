# 03 - Component and CSS Recipes For DeepSeek

Use this file to implement the visual system without seeing images.

## Recommended file structure

```text
apps/web/src/app/(auth)/login/page.tsx
apps/web/src/app/(admin)/dashboard/page.tsx
apps/web/src/app/(admin)/domains/page.tsx
apps/web/src/app/(admin)/dns/page.tsx
apps/web/src/app/(admin)/mailboxes/page.tsx
apps/web/src/app/(admin)/aliases/page.tsx
apps/web/src/app/(admin)/security/quarantine/page.tsx
apps/web/src/app/(mail)/inbox/page.tsx
apps/web/src/components/layout/admin-shell.tsx
apps/web/src/components/layout/mail-shell.tsx
apps/web/src/components/ui/glass-card.tsx
apps/web/src/components/ui/gradient-button.tsx
apps/web/src/components/ui/status-chip.tsx
apps/web/src/components/ui/command-search.tsx
apps/web/src/components/ui/storage-meter.tsx
apps/web/src/components/ui/metric-card.tsx
apps/web/src/components/domain/domain-table.tsx
apps/web/src/components/domain/add-domain-drawer.tsx
apps/web/src/components/dns/dns-record-card.tsx
apps/web/src/components/mail/message-list.tsx
apps/web/src/components/mail/reading-pane.tsx
apps/web/src/components/mail/compose-modal.tsx
apps/web/src/components/security/quarantine-table.tsx
apps/web/src/lib/mock-data.ts
apps/web/src/lib/rbac.ts
apps/web/src/lib/types.ts
```

## Tailwind theme tokens

Add tokens similar to this:

```ts
colors: {
  void: '#050816',
  midnight: '#03050f',
  surface: '#0a1022',
  surface2: '#0f1730',
  kaseBlue: '#4f8cff',
  kaseViolet: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444'
},
borderRadius: {
  xl2: '1.25rem',
  xl3: '1.5rem',
  xl4: '2rem'
},
boxShadow: {
  glow: '0 0 44px rgba(139, 92, 246, 0.16)',
  panel: '0 24px 80px rgba(2, 6, 23, 0.45)'
}
```

## Global CSS helpers

```css
.kase-bg {
  background:
    radial-gradient(circle at 85% 10%, rgba(79, 140, 255, 0.16), transparent 32%),
    radial-gradient(circle at 10% 85%, rgba(139, 92, 246, 0.18), transparent 34%),
    linear-gradient(135deg, #050816 0%, #03050f 55%, #071124 100%);
}

.kase-glass {
  position: relative;
  background: linear-gradient(180deg, rgba(15,23,48,0.72), rgba(8,13,30,0.88));
  border: 1px solid rgba(255,255,255,0.09);
  box-shadow: 0 24px 80px rgba(2,6,23,0.45), 0 0 44px rgba(139,92,246,0.08);
  backdrop-filter: blur(18px);
}

.kase-glow-edge::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(circle at 92% 0%, rgba(139,92,246,0.26), transparent 34%);
}

.kase-gradient-text {
  background: linear-gradient(90deg, #4f8cff 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.kase-gradient-button {
  background: linear-gradient(90deg, #8b5cf6 0%, #4f8cff 100%);
  box-shadow: 0 12px 36px rgba(79,140,255,0.22), 0 0 28px rgba(139,92,246,0.18);
}

.kase-gradient-button:hover {
  filter: brightness(1.08);
  box-shadow: 0 16px 44px rgba(79,140,255,0.30), 0 0 34px rgba(139,92,246,0.24);
}
```

## GlassCard contract

Props:

```ts
type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  as?: React.ElementType;
};
```

Default classes:

```text
relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/50 shadow-panel backdrop-blur-xl
```

If `glow` is true, add a pseudo-element or child div with radial violet/blue highlight.

## GradientButton contract

Variants:

- primary: blue/violet gradient
- secondary: transparent glass with white border
- danger: red translucent

Default primary classes:

```text
h-12 rounded-2xl px-5 text-sm font-medium text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-kaseBlue/50
```

## StatusChip contract

Props:

```ts
type StatusChipProps = {
  status: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  children: React.ReactNode;
  dot?: boolean;
};
```

Status labels to support:

- Healthy
- Warning
- Error
- Valid
- Invalid
- Pass
- Fail
- Reject
- Quarantine
- None
- Operational
- Pending
- Verified

## AdminShell contract

AdminShell should render:

- fixed or sticky left sidebar
- top command/search bar
- top-right status icons
- main scrollable content
- background gradients
- optional right rail

Sidebar nav items:

```ts
[
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Workspaces', href: '/workspaces', icon: LayoutGrid },
  { label: 'Domains', href: '/domains', icon: Globe2 },
  { label: 'Mailboxes', href: '/mailboxes', icon: Mail },
  { label: 'Aliases', href: '/aliases', icon: Send },
  { label: 'DNS Setup', href: '/dns', icon: Network },
  { label: 'Server Health', href: '/server-health', icon: ShieldCheck },
  { label: 'Security', href: '/security/quarantine', icon: Shield },
  { label: 'Settings', href: '/settings', icon: Settings }
]
```

Active nav item should be a rounded glass pill with violet border and glow.

## MailShell contract

MailShell should render:

- left mail sidebar with Compose button and folders
- top search bar
- message list slot
- reading pane slot
- responsive behavior for mobile

Desktop grid suggestion:

```css
grid-template-columns: 268px minmax(420px, 520px) minmax(560px, 1fr);
```

Mobile behavior:

- one column
- show only folder list, message list, or message detail at a time
- use bottom nav for Mail, Compose, Folders, Settings

## MetricCard contract

Props:

```ts
type MetricCardProps = {
  title: string;
  value: string;
  icon: React.ComponentType;
  trend?: string;
  trendTone?: 'success' | 'warning' | 'danger' | 'neutral';
  children?: React.ReactNode;
};
```

Visual:

- icon top-left in colored outline
- label muted
- value large white
- trend small under value
- optional progress bar

## DNSRecordCard contract

Props:

```ts
type DNSRecordCardProps = {
  type: 'MX' | 'TXT' | 'CNAME' | 'SRV';
  host: string;
  value: string;
  priority?: string;
  ttl: string;
  status: 'verified' | 'pending' | 'error';
  onCopy?: () => void;
};
```

Layout:

- grid columns for type, host, value, priority, ttl, copy
- value column truncates with tooltip or copy button
- status appears outside or right aligned in row

## Quarantine action icons

Use four icon buttons per row:

1. Release: shield/check, violet/blue.
2. Delete: trash, red.
3. Allowlist: user plus, green.
4. Block: ban icon, red.

Tooltips required.

## Command palette

Use a dialog or cmdk-like component.

Trigger:

- keyboard Ctrl+K / Command+K
- clicking search bar

Commands:

- Add Domain
- Create Mailbox
- Add Alias
- Open DNS Setup
- Open Quarantine
- Open Server Health
- Search Mailboxes
- Search Domains

## Empty states

Every table should have a premium empty state.

Example domain empty state:

- large globe-plus icon in violet glass square
- title `No domains yet`
- copy `Add your first domain to start sending and receiving private email.`
- button `Add Domain`

## Loading states

Use skeletons with dark translucent bars and subtle shimmer.

Avoid bright gray skeletons that break the dark premium aesthetic.

## Toasts

Toast examples:

- `Domain added. DNS setup is ready.`
- `DNS record copied.`
- `Mailbox created.`
- `Alias saved.`
- `Message sent.`
- `Quarantined message released.`

Toasts should appear top-right or bottom-right, dark glass, with small status icon.
