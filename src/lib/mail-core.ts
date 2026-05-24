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
  private token: string | null = null
  private tokenExpiry = 0

  constructor() {
    this.baseUrl = config.stalwart.apiUrl.replace(/\/$/, "")
  }

  private async authHeaders(): Promise<Record<string, string>> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return { Authorization: `Bearer ${this.token}` }
    }
    const res = await fetch(`${this.baseUrl}/api/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: config.stalwart.adminUser || "admin",
        secret: config.stalwart.apiKey,
      }),
    })
    if (!res.ok) throw new Error(`Stalwart auth failed: ${res.status}`)
    const data = await res.json()
    this.token = data.token
    this.tokenExpiry = Date.now() + 300000
    return { Authorization: `Bearer ${this.token}` }
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const headers = await this.authHeaders()
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`Stalwart API ${res.status}: ${text.slice(0, 300)}`)
    }
    if (res.status === 204 || res.headers.get("content-length") === "0") return undefined as T
    return res.json()
  }

  async createMailbox(input: CreateMailboxInput): Promise<{ id: string }> {
    const account = await this.request<any>("POST", "/api/account", {
      name: `${input.localPart}@${input.domain}`,
      description: input.name,
      secrets: { password: input.password },
      quota: { limit: input.quotaMb * 1024 * 1024 },
    })
    return { id: account.name || `${input.localPart}@${input.domain}` }
  }

  async deleteMailbox(id: string): Promise<void> {
    await this.request("DELETE", `/api/account/${encodeURIComponent(id)}`)
  }

  async suspendMailbox(id: string): Promise<void> {
    await this.request("PATCH", `/api/account/${encodeURIComponent(id)}`, { active: false })
  }

  async unsuspendMailbox(id: string): Promise<void> {
    await this.request("PATCH", `/api/account/${encodeURIComponent(id)}`, { active: true })
  }

  async listMailboxes(domain?: string): Promise<any[]> {
    const accounts = await this.request<any[]>("GET", "/api/account")
    if (domain) return accounts.filter((a: any) => a.name?.endsWith(`@${domain}`))
    return accounts
  }

  async createAlias(address: string, targets: string[]): Promise<{ id: string }> {
    const group = await this.request<any>("POST", "/api/group", {
      name: address,
      members: targets,
      description: `Alias for ${targets.join(", ")}`,
    })
    return { id: group.name || address }
  }

  async deleteAlias(id: string): Promise<void> {
    await this.request("DELETE", `/api/group/${encodeURIComponent(id)}`)
  }

  async getDkim(domain: string): Promise<{ selector: string; privateKey: string; publicKey: string } | null> {
    try {
      const dkim = await this.request<any>("GET", `/api/dkim/${encodeURIComponent(domain)}`)
      if (!dkim) return null
      return {
        selector: dkim.selector || "default",
        privateKey: dkim.private_key || dkim.privateKey || "",
        publicKey: dkim.public_key || dkim.publicKey || "",
      }
    } catch {
      return null
    }
  }

  async createDomain(domain: string): Promise<void> {
    await this.request("POST", "/api/domain", { name: domain })
  }

  async deleteDomain(domain: string): Promise<void> {
    await this.request("DELETE", `/api/domain/${encodeURIComponent(domain)}`)
  }

  async healthCheck(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, { signal: AbortSignal.timeout(5000) })
      if (res.ok) return { ok: true, message: "Stalwart mail server reachable" }
      return { ok: false, message: `Stalwart returned HTTP ${res.status}` }
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
