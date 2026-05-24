import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { domainHealth } from "@/lib/dns"

export const POST = apiHandler(async (_req, { params }) => {
  const domain = await prisma.domain.findUnique({ where: { id: params.id } })
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 })

  const mailHost = process.env.MAIL_HOST || `mail.${domain.name}`
  const ip = process.env.MAIL_IP || "0.0.0.0"

  const health = await domainHealth(domain.name, mailHost, ip)

  const checks = [
    { type: "A", host: mailHost, expected: ip, status: health.a },
    { type: "MX", host: domain.name, expected: mailHost, status: health.mx },
    { type: "SPF", host: domain.name, expected: "v=spf1", status: health.spf },
    { type: "DMARC", host: `_dmarc.${domain.name}`, expected: "v=DMARC1", status: health.dmarc },
  ]

  await prisma.dnsCheck.createMany({
    data: checks.map((c) => ({
      domainId: domain.id,
      type: c.type,
      host: c.host,
      expected: c.expected,
      actual: c.status === "verified" ? c.expected : null,
      status: c.status,
    })),
  })

  const allPassed = checks.every((c) => c.status === "verified")
  const anyFailed = checks.some((c) => c.status === "failed")
  const newStatus = allPassed ? "ACTIVE" : "DNS_PENDING"

  await prisma.domain.update({
    where: { id: domain.id },
    data: { status: newStatus as any },
  })

  return NextResponse.json({ health, checks })
}, { rateLimit: { key: "dns-check:{userId}", max: 10, windowMs: 60000 } })
