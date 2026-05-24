# 14 - Operations, Backup, Monitoring, and Runbooks

## Daily operations

Check:

- Mail queue size.
- Deferred/bounced messages.
- Disk usage.
- Memory and CPU.
- Backup success.
- TLS certificate status.
- Spam/quarantine volume.
- Failed logins and SMTP auth failures.
- Blocklist status for server IP.

## Weekly operations

- Review DMARC aggregate reports.
- Review spam false positives.
- Review workspace storage growth.
- Apply safe updates on staging first if possible.
- Verify backup repository integrity.

## Monthly operations

- Test restore to a separate VPS or local VM.
- Review admin accounts and 2FA status.
- Rotate unused app passwords.
- Review DNS status for all domains.
- Review outbound volume and reputation.
- Update incident runbooks.

## Backup strategy

Back up all of this:

- Mail storage volumes.
- Database volumes.
- DKIM private keys.
- TLS/acme state if not easy to recreate.
- KaseMail panel DB.
- KaseMail `.env` and secrets.
- Reverse proxy config.
- Installer answer file.

Use:

- Restic or Borg for encrypted offsite backups.
- S3-compatible storage with object lock if available.
- Retention: 7 daily, 4 weekly, 6 monthly as a starting point.

## Monitoring alerts

Alert on:

- Backup failed or stale > 26 hours.
- Disk usage > 80 percent.
- Mail queue > threshold.
- TLS cert expires in < 14 days.
- Port 25 unreachable.
- DNS check fails for active domain.
- High SMTP auth failures.
- Spike in outbound mail.
- DKIM signing failure.
- DMARC reports show unexpected senders.

## Incident runbooks

### Compromised mailbox

1. Suspend mailbox or disable SMTP submission.
2. Revoke sessions and app passwords.
3. Reset password and require 2FA.
4. Inspect outbound queue and remove spam.
5. Check aliases/forwards/rules for persistence.
6. Review logs for source IP and time.
7. Notify affected workspace admin/user.
8. Watch blocklists and DMARC reports.

### Server IP blacklisted

1. Stop spam source first.
2. Check outbound queue.
3. Confirm no open relay.
4. Fix compromised account or script.
5. Review SPF/DKIM/DMARC/PTR.
6. Request delisting only after root cause is fixed.
7. Consider temporary outbound smart host.

### Disk full

1. Stop non-critical services if necessary.
2. Identify largest mailboxes/logs/backups.
3. Do not delete Docker volumes blindly.
4. Rotate/compress logs.
5. Increase disk or move storage.
6. Restart services and verify mail flow.

### Restore

1. Provision clean VPS.
2. Install same mail core version or compatible newer version.
3. Restore config, database, mail storage, DKIM keys, panel DB, secrets.
4. Do not point production MX until validation passes.
5. Verify mailboxes, aliases, DKIM, TLS, and queues.
6. Switch DNS only after successful test.
