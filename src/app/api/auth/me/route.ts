import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { apiHandler } from "@/lib/api-handler"

export const GET = apiHandler(async () => {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ user: null })
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      twoFactorOn: user.twoFactorOn,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  })
})
