import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api-handler"
import { getMailCore } from "@/lib/mail-core"

export const GET = apiHandler(async () => {
  const adapter = getMailCore()
  const health = await adapter.healthCheck()
  return NextResponse.json(health)
})
