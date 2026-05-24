async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`)
  return data
}

export const api = {
  login: (email: string, password: string) =>
    apiFetch<{ user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () =>
    apiFetch<{ success: boolean }>("/api/auth/logout", { method: "POST" }),
  getMe: () => apiFetch<{ user: any }>("/api/auth/me"),

  getDomains: async () => (await apiFetch<{ domains: any[] }>("/api/domains")).domains,
  getDomain: async (id: string) => (await apiFetch<{ domain: any }>(`/api/domains/${id}`)).domain,
  createDomain: (data: { workspaceId: string; name: string; defaultQuotaMb?: number; catchAll?: boolean }) =>
    apiFetch<any>("/api/domains", { method: "POST", body: JSON.stringify(data) }),
  checkDns: (id: string) =>
    apiFetch<any>(`/api/domains/${id}/check-dns`, { method: "POST" }),
  deleteDomain: (id: string) =>
    apiFetch<any>(`/api/domains/${id}`, { method: "DELETE" }),

  getMailboxes: async () => (await apiFetch<{ mailboxes: any[] }>("/api/mailboxes")).mailboxes,
  createMailbox: (data: { workspaceId: string; domainId: string; localPart: string; name: string; password: string; quotaMb: number }) =>
    apiFetch<any>("/api/mailboxes", { method: "POST", body: JSON.stringify(data) }),
  updateMailbox: (id: string, data: any) =>
    apiFetch<any>(`/api/mailboxes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteMailbox: (id: string) =>
    apiFetch<any>(`/api/mailboxes/${id}`, { method: "DELETE" }),
  resetMailboxPassword: (id: string, newPassword: string) =>
    apiFetch<any>(`/api/mailboxes/${id}/reset-password`, { method: "POST", body: JSON.stringify({ newPassword }) }),

  getAliases: async () => (await apiFetch<{ aliases: any[] }>("/api/aliases")).aliases,
  createAlias: (data: { workspaceId: string; domainId: string; address: string; targets: string[] }) =>
    apiFetch<any>("/api/aliases", { method: "POST", body: JSON.stringify(data) }),
  deleteAlias: (id: string) =>
    apiFetch<any>(`/api/aliases/${id}`, { method: "DELETE" }),

  getWorkspaces: async () => (await apiFetch<{ workspaces: any[] }>("/api/workspaces")).workspaces,
  createWorkspace: (data: { name: string; slug: string; type?: string }) =>
    apiFetch<any>("/api/workspaces", { method: "POST", body: JSON.stringify(data) }),

  getServerHealth: () => apiFetch<any>("/api/server-health"),

  getAuditLogs: async (params?: { take?: number; skip?: number }) =>
    (await apiFetch<{ auditLogs: any[] }>(`/api/audit-logs?${new URLSearchParams(params as any)}`)).auditLogs,

  getProfile: () => apiFetch<{ user: any; settings: any; csrfToken: string }>("/api/settings/profile"),
  updateProfile: (data: any) =>
    apiFetch<any>("/api/settings/profile", { method: "PATCH", body: JSON.stringify(data) }),

  getSecuritySettings: () => apiFetch<{ twoFactorEnabled: boolean; sessions: any[] }>("/api/settings/security"),
  updateSecuritySettings: (data: any) =>
    apiFetch<any>("/api/settings/security", { method: "PATCH", body: JSON.stringify(data) }),

  getMailPreferences: () => apiFetch<any>("/api/settings/mail-preferences"),
  updateMailPreferences: (data: any) =>
    apiFetch<any>("/api/settings/mail-preferences", { method: "PATCH", body: JSON.stringify(data) }),

  getAppearance: () => apiFetch<any>("/api/settings/appearance"),
  updateAppearance: (data: any) =>
    apiFetch<any>("/api/settings/appearance", { method: "PATCH", body: JSON.stringify(data) }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<any>("/api/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }),

  getSessions: () => apiFetch<{ sessions: any[] }>("/api/auth/sessions"),
  deleteSession: (sessionId: string) =>
    apiFetch<any>("/api/auth/sessions", { method: "DELETE", body: JSON.stringify({ sessionId }) }),

  forgotPassword: (email: string) =>
    apiFetch<any>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    apiFetch<any>("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),
}
