import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"

export const GET = apiHandler(async () => {
  const results: Record<string, any> = {}
  try { await prisma.$queryRaw`SELECT 1`; results.database = "ok" } catch { results.database = "error" }
  results.uptime = process.uptime()
  results.memory = process.memoryUsage()
  results.node = process.version
  results.timestamp = new Date().toISOString()
  return NextResponse.json(results)
})
