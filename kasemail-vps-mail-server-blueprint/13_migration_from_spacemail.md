# 13 - Migration from Spacemail

## Goal

Move from Spacemail to KaseMail without losing messages or breaking inbound mail.

## Safe migration timeline

### Day -7 to -3: prepare

- Deploy KaseMail/mailcow/Stalwart on the VPS.
- Configure PTR/rDNS.
- Add test subdomain like `test.example.com` first.
- Verify send/receive and DNS.
- Create equivalent mailboxes and aliases.
- Create `postmaster@` and `abuse@`.
- Configure backups.

### Day -3 to -1: migrate mail data

- For each Spacemail mailbox, create destination mailbox.
- Use IMAP migration with source server, username, and password/app password.
- Run initial sync while Spacemail is still active.
- Validate folder counts and sample messages.
- Lower DNS TTL for MX records if possible.

### Cutover day

- Pause user sending if possible.
- Run final incremental IMAP sync.
- Change MX to KaseMail.
- Publish final SPF/DKIM/DMARC values.
- Confirm inbound mail lands on new server.
- Send outbound tests.
- Watch mail logs and queue.

### Day +1 to +14: monitor and keep rollback

- Keep Spacemail subscription active during rollback window.
- Keep old mailboxes accessible.
- Monitor DMARC reports, bounces, and user complaints.
- Check spam folders at Gmail/Yahoo/Outlook.
- Fix DNS warnings.

## Spacemail features to replace

| Spacemail-style feature | KaseMail replacement |
|---|---|
| Custom domain email | mailcow/Stalwart domains + DNS wizard |
| Webmail | SOGo/Roundcube interim, KaseMail webmail later |
| IMAP/SMTP/POP3 | mail core protocols, POP3 optional |
| 2FA | panel 2FA + mail core 2FA/app passwords where supported |
| Aliases | alias management in panel/mail core |
| Catch-all | domain catch-all in panel/mail core |
| Forwarding | mailbox/user forwarding policy |
| Auto-reply | vacation/Sieve UI |
| Spam management | Rspamd/Stalwart spam/quarantine UI |
| Migration tool | IMAP migration jobs |
| Calendar/mobile apps | SOGo/Stalwart CalDAV/CardDAV + responsive PWA |
| AI draft assist | optional opt-in KaseMail feature |

## IMAP migration command examples

With mailcow, use built-in sync jobs where possible. Generic `imapsync` example:

```bash
imapsync   --host1 SOURCE_IMAP_HOST --user1 user@domain.com --password1 'SOURCE_PASSWORD' --ssl1   --host2 mail.example.com --user2 user@domain.com --password2 'DEST_PASSWORD' --ssl2   --automap --syncinternaldates --useuid
```

Do not put real passwords in shell history. Prefer environment variables, a password file with strict permissions, or built-in migration UI.

## Rollback plan

If delivery fails badly:

1. Change MX back to Spacemail.
2. Pause outbound from KaseMail.
3. Run IMAP sync from KaseMail back to Spacemail only if messages arrived during cutover.
4. Keep KaseMail running for logs and analysis.
5. Fix DNS/PTR/reputation issues before trying again.
