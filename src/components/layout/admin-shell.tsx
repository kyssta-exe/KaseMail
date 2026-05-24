"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { KaseLogo } from "@/components/ui/kase-logo"
import { CommandSearch } from "@/components/ui/command-search"
import {
  LayoutDashboard,
  LayoutGrid,
  Globe2,
  Mail,
  Send,
  Network,
  ShieldCheck,
  Shield,
  History,
  Settings,
  Search,
  ChevronDown,
  Menu,
  X,
  LogOut,
  PanelRightOpen,
} from "lucide-react"

type Role = "SUPERADMIN" | "WORKSPACE_ADMIN" | "WORKSPACE_USER" | "INDIVIDUAL_USER"

const allNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPERADMIN", "WORKSPACE_ADMIN"] as Role[] },
  { label: "Workspaces", href: "/workspaces", icon: LayoutGrid, roles: ["SUPERADMIN"] as Role[] },
  { label: "Domains", href: "/domains", icon: Globe2, roles: ["SUPERADMIN", "WORKSPACE_ADMIN"] as Role[] },
  { label: "Mailboxes", href: "/mailboxes", icon: Mail, roles: ["SUPERADMIN", "WORKSPACE_ADMIN"] as Role[] },
  { label: "Aliases", href: "/aliases", icon: Send, roles: ["SUPERADMIN", "WORKSPACE_ADMIN"] as Role[] },
  { label: "DNS Setup", href: "/dns", icon: Network, roles: ["SUPERADMIN", "WORKSPACE_ADMIN"] as Role[] },
  { label: "Server Health", href: "/server-health", icon: ShieldCheck, roles: ["SUPERADMIN"] as Role[] },
  { label: "Audit Logs", href: "/audit-logs", icon: History, roles: ["SUPERADMIN"] as Role[] },
  // { label: "Security", href: "/security/quarantine", icon: Shield, roles: ["SUPERADMIN", "WORKSPACE_ADMIN"] as Role[] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["SUPERADMIN", "WORKSPACE_ADMIN"] as Role[] },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [role, setRole] = useState<Role>("SUPERADMIN")
  const [user, setUser] = useState<{ email: string; displayName: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.role) setRole(data.user.role)
        if (data.user) setUser(data.user)
        if (data.user && (data.user.role === "WORKSPACE_USER" || data.user.role === "INDIVIDUAL_USER")) {
          const target = data.user.role === "WORKSPACE_USER" ? "/workspaces" : "/mail/inbox"
          if (pathname !== target && !pathname.startsWith("/api/")) router.replace(target)
        }
      })
      .catch(() => {})
  }, [pathname, router])

  const navItems = allNavItems.filter((item) => item.roles.includes(role))

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <CommandSearch open={commandOpen} onOpenChange={setCommandOpen} />

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-60 flex-shrink-0 border-r backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ borderColor: "var(--sidebar-border)", background: "color-mix(in srgb, var(--sidebar) 84%, transparent)" }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-5 pb-4">
            <KaseLogo />
            <button className="lg:hidden text-[#a7b0c3]" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-[#f8fafc] shadow-[inset_0_0_0_1px_rgba(148,163,184,0.25),0_0_16px_rgba(0,0,0,0.25),0_0_1px_rgba(255,255,255,0.35)] bg-[linear-gradient(180deg,rgba(148,163,184,0.08),rgba(148,163,184,0.04))]"
                      : "text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.04]"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", isActive && "text-[#8b5cf6]")} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* <div className="border-t px-4 py-3" style={{ borderColor: "var(--sidebar-border)" }}>
            <Link
              href="/mail/inbox"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.04] transition-all"
            >
              <PanelRightOpen className="h-4 w-4" />
              Switch to Webmail
            </Link>
          </div> */}

          <div className="border-t px-4 py-3" style={{ borderColor: "var(--sidebar-border)" }}>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-400 text-xs font-bold text-white">
                {(user?.displayName || user?.email || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                  {user?.displayName || "User"}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header
          className="flex h-16 items-center gap-4 px-6 backdrop-blur-xl"
          style={{ borderBottom: "1px solid var(--border)", background: "color-mix(in srgb, var(--sidebar) 60%, transparent)" }}
        >
          <button className="lg:hidden text-[#a7b0c3]" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors w-full max-w-md"
            style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--sidebar) 40%, transparent)", color: "var(--muted-foreground)" }}
          >
            <Search className="h-4 w-4" />
            <span>Search emails, domains, mailboxes...</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
                } catch {}
                router.push("/login")
              }}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
