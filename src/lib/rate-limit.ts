const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): void {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (entry.count >= maxRequests) {
    throw new Error("Too many requests. Try again later.")
  }

  entry.count++
}
