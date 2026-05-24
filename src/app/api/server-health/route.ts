import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { getMailCore } from "@/lib/mail-core"
import { execSync } from "child_process"

function getUptime(): string {
  const sec = process.uptime()
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function getCpuUsage(): { usage: string; percentage: number } {
  try {
    const os = require("os") as typeof import("os")
    const cpus = os.cpus()
    const totalIdle = cpus.reduce((a, c) => a + c.times.idle, 0)
    const totalTick = cpus.reduce((a, c) => a + Object.values(c.times).reduce((s, v) => s + v, 0), 0)
    const usage = 100 - (totalIdle / totalTick) * 100
    return { usage: `${usage.toFixed(1)}%`, percentage: Math.round(usage) }
  } catch {
    return { usage: "N/A", percentage: 0 }
  }
}

function getDiskUsage(): { percentage: number; used: string; total: string } {
  try {
    const os = require("os") as typeof import("os")
    const total = os.totalmem()
    const free = os.freemem()
    const used = total - free
    const toGb = (b: number) => `${(b / 1073741824).toFixed(1)} GB`
    return { percentage: Math.round((used / total) * 100), used: toGb(used), total: toGb(total) }
  } catch {
    return { percentage: 0, used: "0 GB", total: "0 GB" }
  }
}

export const GET = apiHandler(async () => {
  const memory = process.memoryUsage()
  const cpu = getCpuUsage()
  const disk = getDiskUsage()

  let mailCoreHealth = { ok: false, message: "Not checked" }
  try {
    mailCoreHealth = await getMailCore().healthCheck()
  } catch {}

  let dbOk = false
  try { await prisma.$queryRaw`SELECT 1`; dbOk = true } catch {}

  return NextResponse.json({
    health: dbOk && mailCoreHealth.ok ? "healthy" : "degraded",
    summary: dbOk ? (mailCoreHealth.ok ? "All systems operational" : "Mail server degraded") : "Database error",
    services: [
      { name: "Database", status: dbOk ? "healthy" : "error" },
      { name: "Mail Server", status: mailCoreHealth.ok ? "healthy" : mailCoreHealth.message.includes("reachable") ? "healthy" : "error" },
      { name: "SMTP", status: mailCoreHealth.ok ? "healthy" : "unknown" },
      { name: "IMAP", status: mailCoreHealth.ok ? "healthy" : "unknown" },
      { name: "Webmail", status: mailCoreHealth.ok ? "healthy" : "unknown" },
    ],
    cpu: { usage: cpu.usage, percentage: cpu.percentage },
    memory: { used: `${(memory.rss / 1073741824).toFixed(1)} GB`, total: `${(require("os").totalmem() / 1073741824).toFixed(1)} GB`, percentage: Math.round((memory.rss / require("os").totalmem()) * 100) },
    disk,
    uptime: getUptime(),
    node: process.version,
    mail: mailCoreHealth,
    timestamp: new Date().toISOString(),
  })
})
