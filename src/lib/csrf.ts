import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

const CSRF_COOKIE = "csrf-token"
const CSRF_HEADER = "x-csrf-token"

export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  let token = cookieStore.get(CSRF_COOKIE)?.value
  if (!token) {
    token = uuidv4()
  }
  return token
}

export async function setCsrfCookie(): Promise<string> {
  const token = uuidv4()
  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  })
  return token
}

export function validateCsrf(req: Request): boolean {
  const cookieHeader = req.headers.get("cookie") || ""
  const cookieMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]*)`))
  const cookieToken = cookieMatch ? cookieMatch[1] : null
  const headerToken = req.headers.get(CSRF_HEADER)
  if (!cookieToken || !headerToken) return false
  return cookieToken === headerToken
}

export async function csrfGuard(req: Request): Promise<void> {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return
  if (!validateCsrf(req)) {
    const { AppError } = await import("./errors")
    throw new AppError("CSRF validation failed", 403)
  }
}
