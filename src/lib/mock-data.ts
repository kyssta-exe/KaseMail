import type { Domain, Mailbox, Alias, QuarantinedMessage, EmailMessage, DNSRecord, KPI, ActivityEvent } from "./types"

export const mockDomains: Domain[] = [
  { id: "1", name: "acme-corp.com", status: "healthy", mailboxes: 1248, dnsStatus: "valid", dkim: "pass", dmarc: "pass", createdDate: "Jan 12, 2024" },
  { id: "2", name: "acme.org", status: "healthy", mailboxes: 356, dnsStatus: "valid", dkim: "pass", dmarc: "pass", createdDate: "Feb 03, 2024" },
  { id: "3", name: "acme.net", status: "warning", mailboxes: 189, dnsStatus: "warning", dkim: "pass", dmarc: "quarantine", createdDate: "Feb 18, 2024" },
  { id: "4", name: "acme.io", status: "error", mailboxes: 72, dnsStatus: "invalid", dkim: "fail", dmarc: "reject", createdDate: "Mar 05, 2024" },
  { id: "5", name: "acme.co.uk", status: "healthy", mailboxes: 91, dnsStatus: "valid", dkim: "pass", dmarc: "pass", createdDate: "Mar 22, 2024" },
  { id: "6", name: "acme.tech", status: "warning", mailboxes: 23, dnsStatus: "warning", dkim: "pass", dmarc: "none", createdDate: "Apr 10, 2024" },
  { id: "7", name: "acme.dev", status: "healthy", mailboxes: 11, dnsStatus: "valid", dkim: "pass", dmarc: "pass", createdDate: "May 01, 2024" },
]

export const mockMailboxes: Mailbox[] = [
  { id: "1", email: "daniel@acme-corp.com", name: "Daniel Carter", domain: "acme-corp.com", storageUsed: "2.43 GB", quota: "10 GB", status: "active", lastLogin: "2 min ago" },
  { id: "2", email: "sarah@acme-corp.com", name: "Sarah Mitchell", domain: "acme-corp.com", storageUsed: "1.8 GB", quota: "10 GB", status: "active", lastLogin: "15 min ago" },
  { id: "3", email: "kevin@acme.org", name: "Kevin Zhang", domain: "acme.org", storageUsed: "3.2 GB", quota: "20 GB", status: "active", lastLogin: "1 hour ago" },
  { id: "4", email: "laura@acme.net", name: "Laura Bennett", domain: "acme.net", storageUsed: "4.1 GB", quota: "10 GB", status: "suspended", lastLogin: "3 days ago" },
  { id: "5", email: "alex@acme.io", name: "Alex Rivera", domain: "acme.io", storageUsed: "0.8 GB", quota: "5 GB", status: "active", lastLogin: "5 hours ago" },
  { id: "6", email: "michael@acme.co.uk", name: "Michael Thompson", domain: "acme.co.uk", storageUsed: "1.2 GB", quota: "10 GB", status: "active", lastLogin: "Yesterday" },
  { id: "7", email: "noah@acme.tech", name: "Noah Williams", domain: "acme.tech", storageUsed: "0.3 GB", quota: "5 GB", status: "active", lastLogin: "2 days ago" },
]

export const mockAliases: Alias[] = [
  { id: "1", alias: "hello@acme-corp.com", destination: "daniel@acme-corp.com", status: "active" },
  { id: "2", alias: "support@acme-corp.com", destination: "sarah@acme-corp.com", status: "active" },
  { id: "3", alias: "info@acme.org", destination: "kevin@acme.org", status: "active" },
  { id: "4", alias: "admin@acme.net", destination: "laura@acme.net", status: "disabled" },
  { id: "5", alias: "contact@acme.io", destination: "alex@acme.io", status: "active" },
]

export const mockQuarantined: QuarantinedMessage[] = [
  { id: "1", sender: "promo@flashdeals.today", subject: "Limited time offer just for you!", reason: "spam", score: 85, date: "May 20, 2024 10:24 AM" },
  { id: "2", sender: "security@account-alerts.co", subject: "Unusual sign-in detected", reason: "phishing", score: 96, date: "May 20, 2024 09:11 AM" },
  { id: "3", sender: "info@winner-notify.com", subject: "You've won a free iPhone!", reason: "spam", score: 82, date: "May 20, 2024 08:47 AM" },
  { id: "4", sender: "billing@amaz0n-secure.com", subject: "Verify your payment details", reason: "phishing", score: 94, date: "May 20, 2024 07:33 AM" },
  { id: "5", sender: "noreply@updates.service", subject: "Important policy update", reason: "spam", score: 61, date: "May 19, 2024 11:59 PM" },
  { id: "6", sender: "hr@globalcareers.io", subject: "Open Positions in Your Area", reason: "spam", score: 45, date: "May 19, 2024 10:15 PM" },
  { id: "7", sender: "it-support@corp-secure.net", subject: "Password expires tomorrow", reason: "phishing", score: 91, date: "May 19, 2024 09:02 PM" },
  { id: "8", sender: "newsletter@techinsights.com", subject: "This week in tech", reason: "spam", score: 38, date: "May 19, 2024 08:41 PM" },
]

export const mockEmails: EmailMessage[] = [
  { id: "1", sender: "Sarah Mitchell", senderEmail: "sarah@acme.com", subject: "Project update & next steps", preview: "Hi Daniel, I've attached the latest project...", time: "9:41 AM", unread: true, starred: true, hasAttachment: true, body: "Hi Daniel,\n\nI've attached the latest project update, which includes progress on all key milestones, outstanding risks, and the revised timeline.\n\nWe're on track to complete Phase 1 by the end of the month. Please let me know if you have any feedback or if you'd like to sync this week.\n\nThanks,\nSarah", attachments: [{ name: "project-update-may.pdf", size: "1.2 MB" }] },
  { id: "2", sender: "Kevin Zhang", senderEmail: "kevin@acme.org", subject: "Q2 performance dashboard", preview: "Here's the Q2 dashboard for your review...", time: "8:23 AM", unread: true, starred: false, hasAttachment: false },
  { id: "3", sender: "Laura Bennett", senderEmail: "laura@acme.net", subject: "Re: Budget approval", preview: "Thanks for the update. Let me review and get back...", time: "Yesterday", unread: false, starred: false, hasAttachment: false },
  { id: "4", sender: "Product Team", senderEmail: "product@acme.com", subject: "Product roadmap - May update", preview: "Here's what's coming in the next quarter...", time: "Yesterday", unread: false, starred: true, hasAttachment: true },
  { id: "5", sender: "Alex Rivera", senderEmail: "alex@acme.io", subject: "Design system feedback", preview: "I've reviewed the new components and have a few...", time: "May 10", unread: false, starred: false, hasAttachment: false },
  { id: "6", sender: "Michael Thompson", senderEmail: "michael@acme.co.uk", subject: "Client meeting recap", preview: "Summary of today's client meeting...", time: "May 9", unread: false, starred: false, hasAttachment: false },
  { id: "7", sender: "Noah Williams", senderEmail: "noah@acme.tech", subject: "Onboarding plan", preview: "Here's the updated onboarding schedule...", time: "May 9", unread: true, starred: false, hasAttachment: true },
  { id: "8", sender: "System Notifications", senderEmail: "system@kase.com", subject: "Security alert", preview: "New login detected from an unknown device...", time: "May 8", unread: false, starred: false, hasAttachment: false },
]

export const mockKPIs: KPI[] = [
  { title: "Total Domains", value: "128", trend: "up 12% vs last 7 days", icon: "Globe", trendTone: "success" },
  { title: "Active Mailboxes", value: "2,845", trend: "up 8% vs last 7 days", icon: "Users", trendTone: "success" },
  { title: "Storage Used", value: "1.42 TB", trend: "28% of 5 TB", icon: "HardDrive", trendTone: "neutral" },
  { title: "Emails Sent Today", value: "34,782", trend: "up 15% vs yesterday", icon: "Send", trendTone: "success" },
  { title: "DNS Issues", value: "2", trend: "2 resolved", icon: "AlertTriangle", trendTone: "warning" },
  { title: "Server Health", value: "100%", trend: "All systems operational", icon: "ShieldCheck", trendTone: "success" },
]

export const mockActivities: ActivityEvent[] = [
  { event: "Domain Added", details: "acme.tech added to workspace", user: "Superadmin", time: "2 min ago" },
  { event: "Mailbox Created", details: "noah@acme.tech created", user: "Superadmin", time: "5 min ago" },
  { event: "DNS Records Updated", details: "SPF record updated for acme.io", user: "Superadmin", time: "15 min ago" },
  { event: "Login", details: "New login from 203.0.113.42", user: "Daniel Carter", time: "1 hour ago" },
  { event: "Backup Completed", details: "Full system backup completed", user: "System", time: "3 hours ago" },
  { event: "Alias Created", details: "support@acme-corp.com created", user: "Superadmin", time: "5 hours ago" },
  { event: "DKIM Key Rotated", details: "DKIM key rotated for acme.org", user: "Superadmin", time: "1 day ago" },
]

export const mockDNSRecords: DNSRecord[] = [
  { type: "MX", host: "@", value: "mx.kasemail.net", priority: "10", ttl: "3600", status: "verified" },
  { type: "TXT", host: "@", value: "v=spf1 include:spf.kasemail.net ~all", ttl: "3600", status: "verified" },
  { type: "TXT", host: "k1._domainkey", value: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...", ttl: "3600", status: "verified" },
  { type: "TXT", host: "_dmarc", value: "v=DMARC1; p=quarantine; rua=mailto:postmaster@acme.com", ttl: "3600", status: "error" },
]
