import { config } from "./config"

type JmapSession = {
  apiUrl: string
  downloadUrl: string
  uploadUrl: string
  eventSourceUrl: string
  capabilities: Record<string, any>
  primaryAccounts: Record<string, string>
  username: string
}

let sessionCache: { data: JmapSession; expiry: number } | null = null

async function getJmapSession(email: string, password: string): Promise<JmapSession> {
  if (sessionCache && Date.now() < sessionCache.expiry) return sessionCache.data
  const stalwartUrl = config.stalwart.apiUrl.replace(/\/$/, "")
  const res = await fetch(`${stalwartUrl}/api/session`, {
    headers: {
      Authorization: "Basic " + Buffer.from(`${email}:${password}`).toString("base64"),
    },
  })
  if (!res.ok) throw new Error(`JMAP session failed: ${res.status}`)
  const data = await res.json()
  sessionCache = { data, expiry: Date.now() + 300000 }
  return data
}

async function jmapCall(
  email: string,
  password: string,
  requests: { method: string; params: any }[]
): Promise<any[]> {
  const session = await getJmapSession(email, password)
  const res = await fetch(session.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${email}:${password}`).toString("base64"),
    },
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:blob",
      ],
      methodCalls: requests.map((r) => [r.method, r.params, "r1"]),
    }),
  })
  if (!res.ok) throw new Error(`JMAP call failed: ${res.status}`)
  const data = await res.json()
  return data.methodResponses || []
}

export async function getMailboxes(email: string, password: string) {
  const responses = await jmapCall(email, password, [
    { method: "Mailbox/get", params: { accountId: "primary", ids: null } },
  ])
  const mailboxes = responses[0]?.[1]?.list || []
  return mailboxes.map((m: any) => ({
    id: m.id,
    name: m.name,
    role: m.role || null,
    totalEmails: m.totalEmails || 0,
    unreadEmails: m.unreadEmails || 0,
    sortOrder: m.sortOrder || 0,
  }))
}

export async function getMessages(
  email: string,
  password: string,
  mailboxId: string,
  limit = 50,
  position = 0
) {
  const responses = await jmapCall(email, password, [
    {
      method: "Email/query",
      params: {
        accountId: "primary",
        filter: { inMailbox: mailboxId },
        limit,
        position,
        sort: [{ property: "receivedAt", isAscending: false }],
      },
    },
  ])
  const queryResult = responses[0]?.[1]
  const ids = queryResult?.ids || []
  if (ids.length === 0) return { messages: [], total: queryResult?.total || 0, position: queryResult?.position || 0 }

  const getResponses = await jmapCall(email, password, [
    {
      method: "Email/get",
      params: {
        accountId: "primary",
        ids,
        properties: [
          "id", "subject", "from", "to", "cc", "bcc",
          "receivedAt", "sentAt", "hasAttachment", "size",
          "preview", "keywords",
        ],
      },
    },
  ])
  const messages = getResponses[0]?.[1]?.list || []
  return {
    messages: messages.map((m: any) => ({
      id: m.id,
      subject: m.subject || "(No subject)",
      from: m.from?.[0] || {},
      to: m.to || [],
      cc: m.cc || [],
      bcc: m.bcc || [],
      preview: m.preview || "",
      receivedAt: m.receivedAt,
      hasAttachment: m.hasAttachment || false,
      size: m.size || 0,
      unread: !(m.keywords?.$seen),
      starred: !!m.keywords?.$flagged,
    })),
    total: queryResult?.total || 0,
    position: queryResult?.position || 0,
  }
}

export async function getMessage(email: string, password: string, messageId: string) {
  const responses = await jmapCall(email, password, [
    { method: "Email/get", params: { accountId: "primary", ids: [messageId] } },
  ])
  const msg = responses[0]?.[1]?.list?.[0]
  if (!msg) throw new Error("Message not found")
  return {
    id: msg.id,
    subject: msg.subject || "(No subject)",
    from: msg.from?.[0] || {},
    to: msg.to || [],
    cc: msg.cc || [],
    bcc: msg.bcc || [],
    replyTo: msg.replyTo || [],
    textBody: msg.textBody?.[0]?.content || "",
    htmlBody: msg.htmlBody?.[0]?.content || "",
    attachments: (msg.attachments || []).map((a: any) => ({
      id: a.blobId,
      name: a.name,
      type: a.type,
      size: a.size,
    })),
    receivedAt: msg.receivedAt,
    sentAt: msg.sentAt,
    hasAttachment: msg.hasAttachment || false,
    unread: !(msg.keywords?.$seen),
    starred: !!msg.keywords?.$flagged,
    isDraft: !!msg.keywords?.$draft,
  }
}

export async function sendMessage(
  email: string,
  password: string,
  to: string[],
  subject: string,
  textBody: string,
  htmlBody?: string,
  cc?: string[],
  bcc?: string[],
  inReplyTo?: string
) {
  const identity = `${email} <${email}>`
  const now = new Date().toISOString()
  const data: any = {
    email: {
      keywords: { $seen: true },
      from: [{ name: email.split("@")[0], email }],
      to: to.map((a) => ({ name: a.split("@")[0], email: a })),
      subject,
      receivedAt: now,
      sentAt: now,
      textBody: [{ content: textBody }],
    },
  }
  if (htmlBody) data.email.htmlBody = [{ content: htmlBody }]
  if (cc?.length) data.email.cc = cc.map((a) => ({ name: a.split("@")[0], email: a }))
  if (bcc?.length) data.email.bcc = bcc.map((a) => ({ name: a.split("@")[0], email: a }))
  if (inReplyTo) data.email.inReplyTo = inReplyTo

  const session = await getJmapSession(email, password)
  const res = await fetch(session.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${email}:${password}`).toString("base64"),
    },
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls: [
        ["Email/set", { accountId: "primary", create: { "new-email": data.email } }, "r1"],
        [
          "EmailSubmission/set",
          {
            accountId: "primary",
            create: { "new-submission": { emailId: "#new-email", identityId: "#new-identity" } },
          },
          "r2",
        ],
      ],
    }),
  })
  if (!res.ok) throw new Error(`Send failed: ${res.status}`)
  return { success: true }
}

export async function markAsRead(email: string, password: string, messageId: string) {
  await jmapCall(email, password, [
    { method: "Email/set", params: { accountId: "primary", update: { [messageId]: { keywords: { $seen: true } } } } },
  ])
}

export async function markAsUnread(email: string, password: string, messageId: string) {
  await jmapCall(email, password, [
    { method: "Email/set", params: { accountId: "primary", update: { [messageId]: { keywords: { $seen: false } } } } },
  ])
}

export async function moveMessage(email: string, password: string, messageId: string, targetMailboxId: string) {
  await jmapCall(email, password, [
    { method: "Email/set", params: { accountId: "primary", update: { [messageId]: { mailboxIds: { [targetMailboxId]: true } } } } },
  ])
}

export async function deleteMessage(email: string, password: string, messageId: string) {
  await jmapCall(email, password, [
    { method: "Email/set", params: { accountId: "primary", destroy: [messageId] } },
  ])
}

export async function saveDraft(
  email: string,
  password: string,
  to: string[],
  subject: string,
  textBody: string,
  draftId?: string
) {
  const draft: any = {
    keywords: { $draft: true },
    from: [{ name: email.split("@")[0], email }],
    to: to.map((a) => ({ name: a.split("@")[0], email: a })),
    subject,
    textBody: [{ content: textBody }],
  }
  const method = draftId ? "update" : "create"
  const value: any = {}
  if (draftId) value[draftId] = draft
  else value["new-draft"] = draft

  const methodName = draftId ? "Email/set" : "Email/set"
  const params: any = { accountId: "primary" }
  if (draftId) params.update = value
  else params.create = value

  await jmapCall(email, password, [{ method: methodName, params }])
  return { success: true }
}
