import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { apiHandler } from "@/lib/api-handler"

export const POST = apiHandler(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
    cookieStore.delete("session")
  }
  return NextResponse.json({ success: true })
}, { auth: false, csrf: true })
