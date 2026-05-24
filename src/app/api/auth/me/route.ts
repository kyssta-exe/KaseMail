import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { apiHandler } from "@/lib/api-handler"

export const GET = apiHandler(async () => {
  const user = await getCurrentUser()
  return NextResponse.json({ user })
})
