export type MailcowClientOptions = {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
};

export type CreateMailboxInput = {
  localPart: string;
  domain: string;
  name: string;
  password: string;
  quotaMb: number;
};

export class MailcowClient {
  private baseUrl: string;
  private apiKey: string;
  private timeoutMs: number;

  constructor(options: MailcowClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs ?? 15000;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
          ...(init.headers ?? {})
        }
      });
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`mailcow API ${res.status}: ${text.slice(0, 300)}`);
      }
      return text ? JSON.parse(text) as T : (undefined as T);
    } finally {
      clearTimeout(timer);
    }
  }

  async createMailbox(input: CreateMailboxInput) {
    return this.request("/api/v1/add/mailbox", {
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
        tls_enforce_out: "1"
      })
    });
  }

  async listMailboxes(domain = "all") {
    return this.request(`/api/v1/get/mailbox/${encodeURIComponent(domain)}`, { method: "GET" });
  }

  async createAlias(address: string, targets: string[]) {
    return this.request("/api/v1/add/alias", {
      method: "POST",
      body: JSON.stringify({ active: "1", address, goto: targets.join(",") })
    });
  }

  async getDkim(domain: string) {
    return this.request(`/api/v1/get/dkim/${encodeURIComponent(domain)}`, { method: "GET" });
  }
}
