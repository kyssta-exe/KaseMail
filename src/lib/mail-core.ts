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
  listMailboxes(domain?: string): Promise<any[]>
  createAlias(address: string, targets: string[]): Promise<{ id: string }>
  deleteAlias(id: string): Promise<void>
  getDkim(domain: string): Promise<any>
  createDomain(domain: string): Promise<void>
  deleteDomain(domain: string): Promise<void>
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
    if (!res.ok) throw new Error(`mailcow API ${res.status}: ${text.slice(0, 300)}`)
    return text ? JSON.parse(text) : undefined as T
  }

  async createMailbox(input: CreateMailboxInput) {
    const result = await this.request(`/api/v1/add/mailbox`, {
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
    await this.request(`/api/v1/delete/mailbox`, {
      method: "POST",
      body: JSON.stringify({ items: [id] }),
    })
  }

  async suspendMailbox(id: string) {
    await this.request(`/api/v1/edit/mailbox`, {
      method: "POST",
      body: JSON.stringify({ items: [id], attr: { active: "0" } }),
    })
  }

  async listMailboxes(domain = "all") {
    return this.request<any[]>(`/api/v1/get/mailbox/${encodeURIComponent(domain)}`, { method: "GET" })
  }

  async createAlias(address: string, targets: string[]) {
    const result = await this.request("/api/v1/add/alias", {
      method: "POST",
      body: JSON.stringify({ active: "1", address, goto: targets.join(",") }),
    })
    return { id: String(result) }
  }

  async deleteAlias(id: string) {
    await this.request(`/api/v1/delete/alias`, {
      method: "POST",
      body: JSON.stringify({ items: [id] }),
    })
  }

  async getDkim(domain: string) {
    return this.request(`/api/v1/get/dkim/${encodeURIComponent(domain)}`, { method: "GET" })
  }

  async createDomain(domain: string) {
    await this.request("/api/v1/add/domain", {
      method: "POST",
      body: JSON.stringify({ domain, active: "1" }),
    })
  }

  async deleteDomain(domain: string) {
    await this.request(`/api/v1/delete/domain`, {
      method: "POST",
      body: JSON.stringify({ items: [domain] }),
    })
  }
}

// Stub for Stalwart adapter - implement when switching mail core
class StalwartClient implements MailCoreAdapter {
  async createMailbox(_input: CreateMailboxInput): Promise<{ id: string }> {
    throw new Error("Stalwart adapter not yet implemented")
  }
  async deleteMailbox(_id: string): Promise<void> {
    throw new Error("Stalwart adapter not yet implemented")
  }
  async suspendMailbox(_id: string): Promise<void> {
    throw new Error("Stalwart adapter not yet implemented")
  }
  async listMailboxes(_domain?: string): Promise<any[]> {
    throw new Error("Stalwart adapter not yet implemented")
  }
  async createAlias(_address: string, _targets: string[]): Promise<{ id: string }> {
    throw new Error("Stalwart adapter not yet implemented")
  }
  async deleteAlias(_id: string): Promise<void> {
    throw new Error("Stalwart adapter not yet implemented")
  }
  async getDkim(_domain: string): Promise<any> {
    throw new Error("Stalwart adapter not yet implemented")
  }
  async createDomain(_domain: string): Promise<void> {
    throw new Error("Stalwart adapter not yet implemented")
  }
  async deleteDomain(_domain: string): Promise<void> {
    throw new Error("Stalwart adapter not yet implemented")
  }
}

export function getMailCore(): MailCoreAdapter {
  if (config.mailCoreAdapter === "stalwart") return new StalwartClient()
  return new MailcowClient()
}
