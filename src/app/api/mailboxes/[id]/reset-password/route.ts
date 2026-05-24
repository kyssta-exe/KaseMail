import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth, hashPassword } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { z } from "zod"

const schema = z.object({
  newPassword: z.string().min(6),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(["SUPERADMIN", "WORKSPACE_ADMIN"])
    const { id } = await params
    const body = schema.parse(await req.json())

    const mailbox = await prisma.mailbox.findUnique({ where: { id } })
    if (!mailbox) {
      return NextResponse.json({ error: "Mailbox not found" }, { status: 404 })
    }

    const hashed = await hashPassword(body.newPassword)

    await prisma.mailbox.update({
      where: { id },
      data: { passwordHash: hashed } as any,
    })

    await logAudit({
      actorUserId: user.id,
      workspaceId: mailbox.workspaceId,
      action: "MAILBOX_PASSWORD_RESET",
      targetType: "Mailbox",
      targetId: mailbox.id,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
    }
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
