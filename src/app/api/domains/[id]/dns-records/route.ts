import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { getMailCore } from "@/lib/mail-core"

export const GET = apiHandler(async (_req, { user, params }) => {
  const domain = await prisma.domain.findUnique({ where: { id: params.id } })
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 })

  const mailHost = process.env.MAIL_HOST || `mail.${domain.name}`
  const ip = process.env.MAIL_IP || "0.0.0.0"

  let dkimRecord = null
  try {
    const mailCore = getMailCore()
    const dkim = await mailCore.getDkim(domain.name)
    if (dkim) {
      dkimRecord = {
        type: "TXT",
        host: `${dkim.selector || "k1"}._domainkey`,
        value: `v=DKIM1; k=rsa; p=${dkim.publicKey}`,
        ttl: "3600",
      }
    }
  } catch {}

  const records = [
    { type: "MX", host: "@", value: mailHost, priority: "10", ttl: "3600" },
    { type: "TXT", host: "@", value: "v=spf1 mx ~all", ttl: "3600" },
    { type: "TXT", host: "_dmarc", value: `v=DMARC1; p=quarantine; rua=mailto:postmaster@${domain.name}`, ttl: "3600" },
  ]

  if (dkimRecord) {
    records.push(dkimRecord)
  }

  return NextResponse.json({ domainName: domain.name, records })
})
