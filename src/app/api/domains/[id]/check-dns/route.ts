import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { domainHealth } from "@/lib/dns"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params

    const domain = await prisma.domain.findUnique({ where: { id } })
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

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

    let newStatus: string
    if (allPassed) {
      newStatus = "ACTIVE"
    } else if (anyFailed) {
      newStatus = "DNS_PENDING"
    } else {
      newStatus = "DNS_PENDING"
    }

    await prisma.domain.update({
      where: { id: domain.id },
      data: { status: newStatus as any },
    })

    return NextResponse.json({ health, checks })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
