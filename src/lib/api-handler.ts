import { NextResponse } from "next/server"
import { requireAuth } from "./auth"
import { csrfGuard, setCsrfCookie } from "./csrf"
import { rateLimit } from "./rate-limit"
import { AppError, UnauthorizedError } from "./errors"
import { cookies } from "next/headers"

type RateLimitRule = { key: string; max: number; windowMs: number }

type ApiConfig = {
  auth?: boolean
  csrf?: boolean
  rateLimit?: RateLimitRule | RateLimitRule[]
  roles?: string[]
}

function resolveKey(template: string, req: Request, user?: any): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  return template.replace(/\{ip\}/g, ip).replace(/\{userId\}/g, user?.id || "anon")
}

export function apiHandler(
  handler: (req: Request, context: { user: any; params: any }) => Promise<NextResponse>,
  config: ApiConfig = {}
) {
  return async (req: Request, routeContext?: { params?: any }) => {
    try {
      let user: any = null

      if (config.auth !== false) {
        user = await requireAuth(config.roles)
        const cookieStore = await cookies()
        if (!cookieStore.get("csrf-token")?.value) {
          await setCsrfCookie()
        }
      }

      const method = req.method.toUpperCase()

      if (config.csrf !== false && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        await csrfGuard(req)
      }

      if (config.rateLimit) {
        const rules = Array.isArray(config.rateLimit) ? config.rateLimit : [config.rateLimit]
        for (const r of rules) {
          rateLimit(resolveKey(r.key, req, user), r.max, r.windowMs)
        }
      }

      const params = routeContext?.params ? await Promise.resolve(routeContext.params) : {}

      return await handler(req, { user, params })
    } catch (e: any) {
      if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 })
      if (e instanceof AppError) return NextResponse.json({ error: e.message }, { status: e.status })
      if (e?.issues) return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
      console.error("apiHandler:", e)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}
