import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"

export const GET = apiHandler(async (req) => {
  const url = new URL(req.url)
  const take = parseInt(url.searchParams.get("take") || "50")
  const skip = parseInt(url.searchParams.get("skip") || "0")
  const auditLogs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take, skip, include: { actor: { select: { email: true, displayName: true } } } })
  const total = await prisma.auditLog.count()
  return NextResponse.json({ auditLogs, total })
})
