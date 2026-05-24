"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    setDone(true)
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const role = data.user?.role
        if (role === "SUPERADMIN" || role === "WORKSPACE_ADMIN") router.replace("/dashboard")
        else if (role === "WORKSPACE_USER") router.replace("/workspaces")
        else if (role === "INDIVIDUAL_USER") router.replace("/mail/inbox")
        else router.replace("/login")
      })
      .catch(() => router.replace("/login"))
  }, [router, done])

  return null
}
