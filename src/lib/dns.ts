import { promises as dns } from "node:dns"

export type DnsStatus = "verified" | "pending" | "failed"

export async function checkMx(domain: string, expectedHost: string): Promise<DnsStatus> {
  try {
    const records = await dns.resolveMx(domain)
    return records.some((r) => r.exchange.replace(/\.$/, "") === expectedHost.replace(/\.$/, ""))
      ? "verified"
      : "pending"
  } catch {
    return "failed"
  }
}

export async function checkTxtContains(host: string, expectedFragment: string): Promise<DnsStatus> {
  try {
    const records = await dns.resolveTxt(host)
    const flattened = records.map((chunks) => chunks.join("")).join("\n")
    return flattened.includes(expectedFragment) ? "verified" : "pending"
  } catch {
    return "failed"
  }
}

export async function checkA(host: string, expectedIp: string): Promise<DnsStatus> {
  try {
    const records = await dns.resolve4(host)
    return records.includes(expectedIp) ? "verified" : "pending"
  } catch {
    return "failed"
  }
}

export async function domainHealth(domain: string, mailHost: string, ip: string) {
  return {
    a: await checkA(mailHost, ip),
    mx: await checkMx(domain, mailHost),
    spf: await checkTxtContains(domain, "v=spf1"),
    dmarc: await checkTxtContains(`_dmarc.${domain}`, "v=DMARC1"),
  }
}
