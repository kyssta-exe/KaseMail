import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api-handler"

export const GET = apiHandler(async () => {
  const current = process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0"
  const repo = process.env.KASEMAIL_GITHUB_REPO || "kyssta-exe/KaseMail"
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json({ current, latest: null, updateAvailable: false, error: "GitHub unreachable" })
    const data = await res.json()
    const latest = data.tag_name?.replace(/^v/, "") || null
    return NextResponse.json({ current, latest, updateAvailable: latest ? latest !== current : false, releaseUrl: data.html_url || null })
  } catch {
    return NextResponse.json({ current, latest: null, updateAvailable: false, error: "Check failed" })
  }
})
