import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { checkTxtContains, domainHealth } from "@/lib/dns"
import { checkDomainOwnership } from "@/lib/rbac"
import { AppError } from "@/lib/errors"
import { getMailCore } from "@/lib/mail-core"

export const POST = apiHandler(async (_req, { user, params }) => {
  await checkDomainOwnership(user.id, params.id)
  const domain = await prisma.domain.findUnique({ where: { id: params.id } })
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 })

  const mailHost = process.env.MAIL_HOST?.trim()
  if (!mailHost) throw new AppError("MAIL_HOST is required before DNS can be verified", 500)
  const ip = process.env.MAIL_IP?.trim()

  const checks = await domainHealth(domain.name, mailHost, ip)
  const dkim = await getMailCore().getDkim(domain.name).catch(() => null)
  if (dkim?.publicKey) {
    const host = `${dkim.selector || "k1"}._domainkey.${domain.name}`
    const result = await checkTxtContains(host, dkim.publicKey)
    checks.push({
      type: "DKIM",
      host,
      expected: dkim.publicKey,
      actual: result.actual,
      status: result.status,
    })
  }

  await prisma.dnsCheck.createMany({
    data: checks.map((c) => ({
      domainId: domain.id,
      type: c.type,
      host: c.host,
      expected: c.expected,
      actual: c.actual,
      status: c.status,
    })),
  })

  const allPassed = checks.every((c) => c.status === "verified")
  const newStatus = allPassed ? "ACTIVE" : "DNS_PENDING"

  await prisma.domain.update({
    where: { id: domain.id },
    data: { status: newStatus as any },
  })

  return NextResponse.json({ checks })
}, { rateLimit: { key: "dns-check:{userId}", max: 10, windowMs: 60000 } })
