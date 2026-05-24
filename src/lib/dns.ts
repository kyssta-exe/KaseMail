import { promises as dns } from "node:dns"

export type DnsStatus = "verified" | "pending" | "failed"
export type DnsCheckResult = {
  status: DnsStatus
  actual: string | null
}

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/\.$/, "")
}

export async function checkMx(domain: string, expectedHost: string): Promise<DnsCheckResult> {
  try {
    const records = await dns.resolveMx(domain)
    const actual = records
      .sort((a, b) => a.priority - b.priority)
      .map((r) => `${r.priority} ${normalizeHost(r.exchange)}`)
      .join(", ")
    return {
      status: records.some((r) => normalizeHost(r.exchange) === normalizeHost(expectedHost)) ? "verified" : "pending",
      actual: actual || null,
    }
  } catch {
    return { status: "failed", actual: null }
  }
}

export async function checkTxtContains(host: string, expectedFragment: string): Promise<DnsCheckResult> {
  try {
    const records = await dns.resolveTxt(host)
    const flattened = records.map((chunks) => chunks.join("")).join("\n")
    return {
      status: flattened.includes(expectedFragment) ? "verified" : "pending",
      actual: flattened || null,
    }
  } catch {
    return { status: "failed", actual: null }
  }
}

export async function checkA(host: string, expectedIp: string): Promise<DnsCheckResult> {
  try {
    const records = await dns.resolve4(host)
    return {
      status: records.includes(expectedIp) ? "verified" : "pending",
      actual: records.join(", ") || null,
    }
  } catch {
    return { status: "failed", actual: null }
  }
}

export async function domainHealth(domain: string, mailHost: string, ip?: string) {
  const checks = [
    ...(ip ? [{ type: "A", host: mailHost, expected: ip, result: await checkA(mailHost, ip) }] : []),
    { type: "MX", host: domain, expected: mailHost, result: await checkMx(domain, mailHost) },
    { type: "SPF", host: domain, expected: "v=spf1", result: await checkTxtContains(domain, "v=spf1") },
    { type: "DMARC", host: `_dmarc.${domain}`, expected: "v=DMARC1", result: await checkTxtContains(`_dmarc.${domain}`, "v=DMARC1") },
  ]
  return checks.map((check) => ({
    type: check.type,
    host: check.host,
    expected: check.expected,
    actual: check.result.actual,
    status: check.result.status,
  }))
}
