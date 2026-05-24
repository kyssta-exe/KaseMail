# KaseMail

Self-hosted email management panel with webmail, domain/DNS management, quarantine, and audit logging.

## Architecture

```
                    ┌──────────────┐
                    │   Browser    │
                    └──────┬───────┘
                           │ HTTPS
                    ┌──────▼───────┐
                    │    nginx     │  reverse proxy + TLS termination
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼─────┐ ┌───▼────┐ ┌────▼─────┐
       │  KaseMail  │ │ Webmail│ │ Stalwart │
       │  (Next.js) │ │ (JMAP) │ │Mailserver│
       │  :3000     │ │  :3000 │ │  :8080   │
       └──────┬─────┘ └────────┘ └────┬─────┘
              │                        │
       ┌──────▼─────┐          ┌───────▼──────┐
       │ PostgreSQL │          │  Mail Store  │
       │  :5432     │          │  (Dovecot)   │
       └────────────┘          └──────────────┘
```

## Quick Start

### 1. Requirements

- Ubuntu 22.04 or 24.04 VPS
- Domain with DNS access (to add MX, A, TXT records)
- Git, Docker, nginx, certbot — auto-installed by script

### 2. Install

```bash
ssh root@your-vps
git clone https://github.com/your-org/kasemail /opt/kasemail
cd /opt/kasemail
sudo bash scripts/install-vps.sh
```

Follow the interactive prompts:
- Superadmin email & password
- Panel domain (e.g., `panel.example.com`)
- Webmail domain (e.g., `mail.example.com`)
- Mail domain (e.g., `example.com`)
- SSL: Let's Encrypt or self-signed

### 3. DNS Records

After install, add these DNS records for your mail domain:

| Type | Name  | Value                          |
|------|-------|--------------------------------|
| A    | mail  | `<VPS_IP>`                     |
| A    | panel | `<VPS_IP>`                     |
| MX   | @     | `mail.example.com`             |
| TXT  | @     | `v=spf1 mx ~all`               |
| TXT  | _dmarc| `v=DMARC1; p=none;`            |

### 4. Access

- Panel: `https://panel.example.com`
- Webmail: `https://mail.example.com`

## Development

```bash
# Install dependencies
npm install

# Start PostgreSQL (Docker)
docker run -d --name kasemail-pg -e POSTGRES_DB=kasemail -e POSTGRES_USER=kasemail -e POSTGRES_PASSWORD=devpass -p 5432:5432 postgres:16-alpine

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://kasemail:password@localhost:5432/kasemail` |
| `JWT_SECRET` | Token signing secret | auto-generated |
| `MAIL_CORE_ADAPTER` | Mail server adapter (`stalwart` or `mailcow`) | `stalwart` |
| `STALWART_API_URL` | Stalwart management API URL | `http://stalwart:8080` |
| `STALWART_API_KEY` | Stalwart auth token | auto-generated |
| `NEXT_PUBLIC_APP_URL` | Public panel URL | `http://localhost:3000` |
| `NEXT_PUBLIC_WEBMAIL_URL` | Public webmail URL | `http://localhost:3000` |

## Commands

```bash
# Build
npm run build

# Type check
npm run typecheck

# Lint
npm run lint

# Start production
npm start
```

## Deployment

```bash
# Uninstall
sudo bash scripts/uninstall-vps.sh

# View logs
docker compose -f /opt/kasemail/scripts/docker-compose.production.yml logs -f

# Restart app
docker compose -f /opt/kasemail/scripts/docker-compose.production.yml restart app

# Run migration manually
docker compose -f /opt/kasemail/scripts/docker-compose.production.yml run --rm migration
```

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Database**: PostgreSQL 16 + Prisma 7
- **Cache**: Redis 7
- **Mail Server**: Stalwart (Docker)
- **Auth**: JWT + HTTP-only cookies
- **API Protocol**: REST + JMAP (webmail)
- **Security**: CSRF tokens, rate limiting, RBAC
