import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MailcowClient } from "./mailcow-client";

const Body = z.object({
  domainId: z.string().min(1),
  localPart: z.string().regex(/^[a-z0-9._-]+$/i),
  displayName: z.string().min(1).max(120),
  quotaMb: z.number().int().min(100).max(102400)
});

export async function POST(req: NextRequest) {
  const actor = await requireUser(req);
  const body = Body.parse(await req.json());
  const domain = await db.domain.findUniqueOrThrow({ where: { id: body.domainId }, include: { workspace: true } });

  await requirePermission(actor, "mailbox:create", { workspaceId: domain.workspaceId });
  if (domain.status !== "ACTIVE") {
    return NextResponse.json({ error: "Domain is not active" }, { status: 409 });
  }

  const address = `${body.localPart}@${domain.name}`.toLowerCase();
  const password = crypto.randomUUID() + crypto.randomUUID();

  const mailcow = new MailcowClient({ baseUrl: process.env.MAILCOW_BASE_URL!, apiKey: process.env.MAILCOW_API_KEY! });
  await mailcow.createMailbox({
    localPart: body.localPart,
    domain: domain.name,
    name: body.displayName,
    password,
    quotaMb: body.quotaMb
  });

  const mailbox = await db.mailbox.create({
    data: {
      workspaceId: domain.workspaceId,
      domainId: domain.id,
      localPart: body.localPart,
      address,
      quotaMb: body.quotaMb,
      status: "ACTIVE"
    }
  });

  await audit(actor.id, "mailbox.create", "Mailbox", mailbox.id, { address });

  return NextResponse.json({ mailbox, initialPassword: password });
}

async function requireUser(_req: NextRequest) { throw new Error("Implement auth"); }
async function requirePermission(_actor: unknown, _perm: string, _scope: unknown) { throw new Error("Implement RBAC"); }
async function audit(_actorId: string, _action: string, _targetType: string, _targetId: string, _metadata: unknown) { throw new Error("Implement audit"); }
const db: any = {};
