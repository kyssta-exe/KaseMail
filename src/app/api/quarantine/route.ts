import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"

export const GET = apiHandler(async () => {
  const messages = await prisma.quarantineMessage.findMany({ where: { status: "quarantined" }, orderBy: { createdAt: "desc" }, take: 100 })
  return NextResponse.json({ messages })
})
