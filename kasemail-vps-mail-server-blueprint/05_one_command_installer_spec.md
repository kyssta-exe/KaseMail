# 05 - One-Command Installer Specification

## Goal

A user should be able to run one command on a fresh VPS, answer questions, and receive:

- Mail core installed.
- HTTPS ready.
- Admin panel and webmail hostnames reserved.
- DNS records printed and saved.
- Firewall/ports checked.
- Backups configured or explicitly skipped.
- Post-install health checklist generated.

Example command once you host your repo:

```bash
curl -fsSL https://raw.githubusercontent.com/YOURORG/kasemail/main/scripts/install.sh | sudo bash
```

For safety, the better command is:

```bash
curl -fsSL -o install.sh https://raw.githubusercontent.com/YOURORG/kasemail/main/scripts/install.sh
less install.sh
sudo bash install.sh
```

## Questions the installer must ask

- Primary domain, example: `example.com`.
- Mail hostname, default: `mail.example.com`.
- Panel hostname, default: `panel.example.com`.
- Webmail hostname, default: `webmail.example.com`.
- Superadmin email, default: `admin@example.com`.
- Superadmin password or option to generate one.
- Timezone.
- Mail core: `mailcow` or `stalwart`.
- Enable POP3: yes/no, default no.
- Enable ClamAV/antivirus if using mailcow: yes/no.
- Enable MTA-STS/TLS-RPT: yes/no.
- Backup target: local only, S3-compatible, Backblaze B2, Wasabi, or skip for now.
- Outbound relay/smart host: none or SMTP relay credentials.
- Use Cloudflare DNS API for automatic DNS: yes/no.

## Installer phases

1. Preflight checks: OS, root, memory, disk, hostname, ports, port 25 connectivity, existing services.
2. Install dependencies: git, curl, jq, Docker, Docker Compose.
3. Create `/opt/kasemail` and answer file.
4. Install selected mail core.
5. Create reverse proxy configuration.
6. Generate DNS records file.
7. Start containers/services.
8. Wait for health endpoints.
9. Print next steps and warnings.
10. Save post-install report to `/opt/kasemail/install-report.md`.

## Important installer constraints

- Never silently overwrite an existing mail server.
- Never create an open relay.
- Never expose admin APIs without authentication and IP restrictions.
- Never store secrets world-readable.
- Never continue if port 25 is blocked unless user explicitly chooses inbound-only testing.
- Always print a rollback command and backup location.

## Files included

- `scripts/install.sh` - combined starter installer.
- `scripts/install-mailcow-reference.sh` - mailcow-specific reference path.
- `scripts/install-stalwart-reference.sh` - Stalwart-specific reference path.
- `scripts/generate-dns-records.sh` - generates DNS checklist from answers.
- `scripts/postinstall-checks.sh` - local service and DNS checks.
- `config/docker-compose.*.example.yml` - reference Compose files.
- `config/Caddyfile.example` - reverse proxy reference.

## Acceptance criteria

The installer is production-ready only when all these pass on a fresh VPS snapshot:

- Idempotent rerun does not corrupt data.
- Secrets are written with `0600` or Docker secrets.
- `docker compose ps` reports healthy services.
- No service binds unexpectedly to public ports.
- DNS file includes all required records.
- Admin can create domain, mailbox, alias, and send/receive mail.
- Backup job completes and restore is tested.
- TLS certificate renewal is tested.
- Logs do not expose passwords or API keys.
