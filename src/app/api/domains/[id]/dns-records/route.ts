import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { getMailCore } from "@/lib/mail-core"
import { checkDomainOwnership } from "@/lib/rbac"
import { AppError } from "@/lib/errors"

function hostForZone(hostname: string, domain: string): string {
  const normalizedHost = hostname.replace(/\.$/, "").toLowerCase()
  const normalizedDomain = domain.replace(/\.$/, "").toLowerCase()
  if (normalizedHost === normalizedDomain) return "@"
  if (normalizedHost.endsWith(`.${normalizedDomain}`)) {
    return normalizedHost.slice(0, -(normalizedDomain.length + 1))
  }
  return normalizedHost
}

export const GET = apiHandler(async (_req, { user, params }) => {
  await checkDomainOwnership(user.id, params.id)
  const domain = await prisma.domain.findUnique({ where: { id: params.id } })
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 })

  const mailHost = process.env.MAIL_HOST?.trim()
  if (!mailHost) throw new AppError("MAIL_HOST is required before DNS records can be generated", 500)
  const mailIp = process.env.MAIL_IP?.trim()
  let dkimRecord = null
  try {
    const mailCore = getMailCore()
    const dkim = await mailCore.getDkim(domain.name)
    if (dkim) {
      await prisma.domain.update({
        where: { id: domain.id },
        data: {
          dkimSelector: dkim.selector || "k1",
          dkimPublicKey: dkim.publicKey,
        },
      })
      dkimRecord = {
        type: "TXT",
        host: `${dkim.selector || "k1"}._domainkey`,
        value: `v=DKIM1; k=rsa; p=${dkim.publicKey}`,
        ttl: "3600",
      }
    }
  } catch {}

  const records = [
    ...(mailIp ? [{ type: "A", host: hostForZone(mailHost, domain.name), value: mailIp, ttl: "3600" }] : []),
    { type: "MX", host: "@", value: mailHost, priority: "10", ttl: "3600" },
    { type: "TXT", host: "@", value: "v=spf1 mx ~all", ttl: "3600" },
    { type: "TXT", host: "_dmarc", value: `v=DMARC1; p=quarantine; rua=mailto:postmaster@${domain.name}`, ttl: "3600" },
  ]

  if (dkimRecord) {
    records.push(dkimRecord)
  }

  return NextResponse.json({ domainName: domain.name, records })
})
