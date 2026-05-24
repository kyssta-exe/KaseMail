import { prisma } from "./prisma"
import type { Prisma } from "@prisma/client"

export async function logAudit(params: Prisma.AuditLogUncheckedCreateInput) {
  try {
    await prisma.auditLog.create({ data: params })
  } catch (e) {
    console.error("Audit log error:", e)
  }
}
