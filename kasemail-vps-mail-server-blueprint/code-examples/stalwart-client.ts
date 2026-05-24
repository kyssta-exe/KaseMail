export type StalwartClientOptions = {
  baseUrl: string;
  username: string;
  password: string;
  timeoutMs?: number;
};

// Starter wrapper only. Verify object names and method calls against current
// Stalwart JMAP/management API docs before production use.
export class StalwartClient {
  private baseUrl: string;
  private authHeader: string;
  private timeoutMs: number;

  constructor(options: StalwartClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.authHeader = `Basic ${Buffer.from(`${options.username}:${options.password}`).toString("base64")}`;
    this.timeoutMs = options.timeoutMs ?? 15000;
  }

  async jmap<T>(methodCalls: unknown[]): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}/jmap`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": this.authHeader
        },
        body: JSON.stringify({ using: ["urn:ietf:params:jmap:core"], methodCalls })
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`Stalwart API ${res.status}: ${text.slice(0, 300)}`);
      return JSON.parse(text) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  async createAccountPlaceholder(email: string, displayName: string) {
    // Replace this with the current Account/set schema from Stalwart docs.
    return this.jmap([
      ["Core/set", { accountId: "", create: { temp: { type: "individual", email, name: displayName } } }, "0"]
    ]);
  }
}
