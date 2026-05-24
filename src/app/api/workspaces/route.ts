import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.string().optional(),
})

export async function GET() {
  try {
    const user = await requireAuth()
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: user.id } },
      },
      include: {
        _count: {
          select: {
            members: true,
            domains: true,
            mailboxes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ workspaces })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(["SUPERADMIN"])
    const body = createSchema.parse(await req.json())

    const workspace = await prisma.workspace.create({
      data: {
        name: body.name,
        slug: body.slug,
        type: body.type ?? "team",
      },
    })

    await logAudit({
      actorUserId: user.id,
      workspaceId: workspace.id,
      action: "WORKSPACE_CREATED",
      targetType: "Workspace",
      targetId: workspace.id,
    })

    return NextResponse.json({ workspace })
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
    }
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (e.code === "P2002") return NextResponse.json({ error: "Slug already taken" }, { status: 409 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
