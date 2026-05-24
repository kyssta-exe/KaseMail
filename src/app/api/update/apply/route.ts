import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api-handler"
import { execSync } from "child_process"

export const POST = apiHandler(async () => {
  try {
    const output = execSync("bash scripts/update.sh 2>&1", { timeout: 300000, cwd: process.cwd() }).toString()
    return NextResponse.json({ success: true, output })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Update failed", output: e.stdout?.toString() || "" }, { status: 500 })
  }
}, { roles: ["SUPERADMIN"], rateLimit: { key: "update-apply:{userId}", max: 1, windowMs: 300000 } })
