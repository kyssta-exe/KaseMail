# 00 - Read Me First: Viability, Limits, and Safe Rollout

## What you can realistically build

You can build a private mail hosting service that feels like Spacemail for your own domains and selected users. The system can support custom domains, mailboxes, aliases, admin-only user creation, workspace roles, spam controls, migration, a good webmail UI, and strong security.

The safest path is not to write a mail server from scratch. SMTP, IMAP, DKIM signing, queue handling, spam filtering, inbound filtering, TLS policies, backscatter prevention, bounce handling, and deliverability edge cases are specialized and high-risk. Use a proven mail core and build your product UI around it.

## What cannot be guaranteed

No self-hosted server can guarantee inbox placement at Gmail, Yahoo, Outlook, or corporate gateways. Even with perfect SPF, DKIM, DMARC, TLS, and PTR, a new or abused VPS IP can still land in spam while its reputation warms up.

Treat this as infrastructure, not a subscription-free magic box. The monthly cost moves from Spacemail to VPS, backup storage, monitoring, and your maintenance time.

## Minimum safe deployment rule

Before switching MX records away from Spacemail:

1. Deploy the server on a clean VPS with port 25 open.
2. Set PTR/rDNS to the mail hostname.
3. Configure A/AAAA, MX, SPF, DKIM, DMARC, MTA-STS, TLS-RPT, autoconfig/autodiscover.
4. Create `postmaster@`, `abuse@`, and an admin mailbox for every hosted domain.
5. Send and receive test email to Gmail, Yahoo, Outlook, iCloud, Proton, and another self-hosted account.
6. Check headers for SPF pass, DKIM pass, DMARC pass, TLS, and correct HELO hostname.
7. Run backups and perform a test restore.
8. Keep Spacemail active for a rollback window.

## Private registration model

Your requirement says users can register, but also says only admins can create accounts because it is private. Implement this as:

- Public registration: disabled by default.
- Invite-only registration: optional, created by superadmin or workspace admin.
- Self-service signup: optional future feature, but every account stays pending until an admin approves it and assigns a workspace/domain.

No signup path should create a mailbox, DNS configuration, alias, or sending identity without admin approval.
