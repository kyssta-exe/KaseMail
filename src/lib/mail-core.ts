import { config } from "./config"

export type CreateMailboxInput = {
  localPart: string
  domain: string
  name: string
  password: string
  quotaMb: number
}

export type MailCoreAdapter = {
  createMailbox(input: CreateMailboxInput): Promise<{ id: string }>
  deleteMailbox(id: string): Promise<void>
  suspendMailbox(id: string): Promise<void>
  unsuspendMailbox(id: string): Promise<void>
  listMailboxes(domain?: string): Promise<any[]>
  createAlias(address: string, targets: string[]): Promise<{ id: string }>
  deleteAlias(id: string): Promise<void>
  getDkim(domain: string): Promise<{ selector: string; privateKey: string; publicKey: string } | null>
  createDomain(domain: string): Promise<void>
  deleteDomain(domain: string): Promise<void>
  healthCheck(): Promise<{ ok: boolean; message: string }>
}

class StalwartClient implements MailCoreAdapter {
  private baseUrl: string
  private basicAuth: string

  constructor() {
    this.baseUrl = config.stalwart.apiUrl.replace(/\/$/, "")
    this.basicAuth = "Basic " + Buffer.from(`${config.stalwart.adminUser || "admin"}:${config.stalwart.apiKey}`).toString("base64")
  }

  private async jmapCall(requests: { method: string; params: any }[]): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/jmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: this.basicAuth },
      body: JSON.stringify({
        using: ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
        methodCalls: requests.map((r) => [r.method, { accountId: "srv", ...r.params }, "0"]),
      }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`Stalwart JMAP ${res.status}: ${text.slice(0, 300)}`)
    }
    const data = await res.json()
    const err = data.methodResponses?.find((r: any) => r[0] === "error")
    if (err) throw new Error(`Stalwart error: ${JSON.stringify(err[1])}`)
    return data.methodResponses || []
  }

  async createMailbox(input: CreateMailboxInput): Promise<{ id: string }> {
    const email = `${input.localPart}@${input.domain}`
    const res = await this.jmapCall([
      {
        method: "x:Principal/set",
        params: {
          create: {
            "new": { "@type": "Individual", name: email, description: input.name, emails: [email], secrets: [input.password], roles: ["user"], quota: input.quotaMb * 1048576 },
          },
        },
      },
    ])
    const created = res[0]?.[1]?.created?.["new"]
    return { id: created?.id || email }
  }

  async deleteMailbox(id: string): Promise<void> {
    const email = id.includes("@") ? id : `${id}@unknown`
    await this.jmapCall([{ method: "x:Principal/set", params: { destroy: [email] } }])
  }

  async suspendMailbox(id: string): Promise<void> {
    const email = id.includes("@") ? id : `${id}@unknown`
    await this.jmapCall([{ method: "x:Principal/set", params: { update: { [email]: { "@type": "Individual", active: false } } } }])
  }

  async unsuspendMailbox(id: string): Promise<void> {
    const email = id.includes("@") ? id : `${id}@unknown`
    await this.jmapCall([{ method: "x:Principal/set", params: { update: { [email]: { "@type": "Individual", active: true } } } }])
  }

  async listMailboxes(domain?: string): Promise<any[]> {
    const filter: any = { "@type": "Individual" }
    if (domain) filter.emails = domain
    const res = await this.jmapCall([{ method: "x:Principal/query", params: { filter, limit: 500 } }])
    const ids = res[0]?.[1]?.ids || []
    if (ids.length === 0) return []
    const getRes = await this.jmapCall([{ method: "x:Principal/get", params: { ids } }])
    return getRes[0]?.[1]?.list || []
  }

  async createAlias(address: string, targets: string[]): Promise<{ id: string }> {
    const res = await this.jmapCall([
      {
        method: "x:Principal/set",
        params: {
          create: { "new": { "@type": "Group", name: address, emails: [address], members: targets, description: `Alias for ${targets.join(", ")}` } },
        },
      },
    ])
    const created = res[0]?.[1]?.created?.["new"]
    return { id: created?.id || address }
  }

  async deleteAlias(id: string): Promise<void> {
    await this.jmapCall([{ method: "x:Principal/set", params: { destroy: [id] } }])
  }

  async getDkim(domain: string): Promise<{ selector: string; privateKey: string; publicKey: string } | null> {
    try {
      const res = await this.jmapCall([{ method: "x:Dkim/query", params: { filter: { domain } } }])
      const ids = res[0]?.[1]?.ids || []
      if (ids.length === 0) return null
      const getRes = await this.jmapCall([{ method: "x:Dkim/get", params: { ids } }])
      const dkim = getRes[0]?.[1]?.list?.[0]
      if (!dkim) return null
      return { selector: dkim.selector || "default", privateKey: dkim.privateKey || "", publicKey: dkim.publicKey || "" }
    } catch { return null }
  }

  async createDomain(domain: string): Promise<void> {
    await this.jmapCall([{ method: "x:Principal/set", params: { create: { "new": { "@type": "Domain", name: domain } } } }])
  }

  async deleteDomain(domain: string): Promise<void> {
    await this.jmapCall([{ method: "x:Principal/set", params: { destroy: [domain] } }])
  }

  async healthCheck(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/account`, {
        headers: { Authorization: this.basicAuth },
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) return { ok: true, message: "Stalwart reachable" }
      return { ok: false, message: `Stalwart HTTP ${res.status}` }
    } catch (e: any) {
      return { ok: false, message: e.message || "Stalwart connection failed" }
    }
  }
}

class MailcowClient implements MailCoreAdapter {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = config.mailcow.apiUrl.replace(/\/$/, "")
    this.apiKey = config.mailcow.apiKey
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        ...(init.headers ?? {}),
      },
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Mailcow API ${res.status}: ${text.slice(0, 300)}`)
    return text ? JSON.parse(text) : undefined as T
  }

  async createMailbox(input: CreateMailboxInput) {
    const result = await this.request<any>("/api/v1/add/mailbox", {
      method: "POST",
      body: JSON.stringify({
        active: "1",
        domain: input.domain,
        local_part: input.localPart,
        name: input.name,
        password: input.password,
        password2: input.password,
        quota: input.quotaMb,
        force_pw_update: "0",
        tls_enforce_in: "1",
        tls_enforce_out: "1",
      }),
    })
    return { id: String(result) }
  }

  async deleteMailbox(id: string) {
    await this.request("/api/v1/delete/mailbox", { method: "POST", body: JSON.stringify({ items: [id] }) })
  }

  async suspendMailbox(id: string) {
    await this.request("/api/v1/edit/mailbox", { method: "POST", body: JSON.stringify({ items: [id], attr: { active: "0" } }) })
  }

  async unsuspendMailbox(id: string) {
    await this.request("/api/v1/edit/mailbox", { method: "POST", body: JSON.stringify({ items: [id], attr: { active: "1" } }) })
  }

  async listMailboxes(domain = "all") {
    return this.request<any[]>(`/api/v1/get/mailbox/${encodeURIComponent(domain)}`, { method: "GET" })
  }

  async createAlias(address: string, targets: string[]) {
    const result = await this.request<any>("/api/v1/add/alias", {
      method: "POST",
      body: JSON.stringify({ active: "1", address, goto: targets.join(",") }),
    })
    return { id: String(result) }
  }

  async deleteAlias(id: string) {
    await this.request("/api/v1/delete/alias", { method: "POST", body: JSON.stringify({ items: [id] }) })
  }

  async getDkim(domain: string) {
    try {
      return await this.request<any>(`/api/v1/get/dkim/${encodeURIComponent(domain)}`, { method: "GET" })
    } catch { return null }
  }

  async createDomain(domain: string) {
    await this.request("/api/v1/add/domain", { method: "POST", body: JSON.stringify({ domain, active: "1" }) })
  }

  async deleteDomain(domain: string) {
    await this.request("/api/v1/delete/domain", { method: "POST", body: JSON.stringify({ items: [domain] }) })
  }

  async healthCheck(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/domains`, {
        headers: { "X-API-Key": this.apiKey },
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) return { ok: true, message: "Mailcow API reachable" }
      return { ok: false, message: `Mailcow returned HTTP ${res.status}` }
    } catch (e: any) {
      return { ok: false, message: e.message || "Mailcow connection failed" }
    }
  }
}

export function getMailCore(): MailCoreAdapter {
  if (config.mailCoreAdapter === "stalwart") return new StalwartClient()
  return new MailcowClient()
}
