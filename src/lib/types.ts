export type NavItem = {
  label: string
  href: string
  icon: string
  badge?: string
}

export type Domain = {
  id: string
  name: string
  status: "healthy" | "warning" | "error"
  mailboxes: number
  dnsStatus: "valid" | "warning" | "invalid"
  dkim: "pass" | "fail"
  dmarc: "pass" | "quarantine" | "reject" | "none"
  createdDate: string
}

export type Mailbox = {
  id: string
  email: string
  name: string
  domain: string
  storageUsed: string
  quota: string
  status: "active" | "suspended"
  lastLogin: string
}

export type Alias = {
  id: string
  alias: string
  destination: string
  status: "active" | "disabled"
}

export type QuarantinedMessage = {
  id: string
  sender: string
  subject: string
  reason: "spam" | "phishing" | "malware" | "policy" | "other"
  score: number
  date: string
}

export type EmailMessage = {
  id: string
  sender: string
  senderEmail: string
  subject: string
  preview: string
  time: string
  unread: boolean
  starred: boolean
  hasAttachment: boolean
  body?: string
  attachments?: { name: string; size: string }[]
}

export type DNSRecord = {
  type: string
  host: string
  value: string
  priority?: string
  ttl: string
  status: "verified" | "pending" | "error"
}

export type KPI = {
  title: string
  value: string
  trend: string
  icon: string
  trendTone?: "success" | "warning" | "danger" | "neutral"
}

export type ActivityEvent = {
  event: string
  details: string
  user: string
  time: string
}
