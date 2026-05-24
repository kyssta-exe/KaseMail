import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl" style={{ background: "var(--muted)" }}>
            <span className="text-3xl font-bold" style={{ color: "var(--muted-foreground)" }}>404</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
          Page not found
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
