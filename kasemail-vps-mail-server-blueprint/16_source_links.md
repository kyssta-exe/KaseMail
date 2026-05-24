# Source links and research notes

Access date: 2026-05-23.

Core mail server and webmail projects:

1. mailcow documentation - https://docs.mailcow.email/
2. mailcow system prerequisites - https://docs.mailcow.email/getstarted/prerequisite-system/
3. mailcow installation - https://docs.mailcow.email/getstarted/install/
4. mailcow backup/restore - https://docs.mailcow.email/backup_restore/b_n_r-backup/
5. mailcow API notes - https://github.com/mailcow/mailcow-apiblueprint and https://demo.mailcow.email/api/
6. Stalwart getting started - https://stalw.art/docs/install/
7. Stalwart DNS setup - https://stalw.art/docs/install/dns/
8. Stalwart WebUI and management - https://stalw.art/docs/management/webui/
9. Stalwart security - https://stalw.art/docs/install/security/
10. Docker Mailserver - https://docker-mailserver.github.io/docker-mailserver/latest/
11. Docker Mailserver DKIM/DMARC/SPF - https://docker-mailserver.github.io/docker-mailserver/latest/config/best-practices/dkim_dmarc_spf/
12. Mail-in-a-Box - https://github.com/mail-in-a-box/mailinabox and https://mailinabox.email/
13. Roundcube - https://roundcube.net/
14. SnappyMail - https://snappymail.eu/documentation
15. SOGo - https://www.sogo.nu/
16. WildDuck - https://docs.wildduck.email/

Deliverability and sender policy:

17. Google Email Sender Guidelines - https://support.google.com/a/answer/81126?hl=en
18. Yahoo Sender Best Practices - https://senders.yahooinc.com/best-practices/
19. Microsoft DMARC setup documentation - https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure
20. Spamhaus resources - https://www.spamhaus.org/resource-hub/ip-domain-reputation/

Spacemail feature reference:

21. Spacemail landing page - https://www.spacemail.com/
22. Spaceship Spacemail getting started - https://www.spaceship.com/knowledgebase/getting-started-with-spacemail/
23. Spaceship Spacemail setup - https://www.spaceship.com/knowledgebase/setup-spacemail-email/
24. Spacemail calendar and mobile apps announcement - https://www.newsfilecorp.com/release/275294/Spaceship-Levels-Up-Business-Email-Communication-Introducing-Calendar-Mobile-Apps-for-Spacemail

Important interpretation:

- For a private replacement for Spacemail, do not write SMTP, IMAP, DKIM, spam filtering, and queue handling from scratch. Use a proven mail core, then build your own private panel and webmail UI on top.
- The fastest viable route is mailcow now, with a custom KaseMail panel wrapping mailcow API later.
- The best product-building route is Stalwart because it has a modern protocol surface and WebUI/API, but the custom webmail and admin UX still need engineering.
- Deliverability is not guaranteed by software alone. DNS, PTR/rDNS, IP reputation, user behavior, complaints, and blocklists control whether Gmail/Yahoo/Outlook place mail in inbox.
