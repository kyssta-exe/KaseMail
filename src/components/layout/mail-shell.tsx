"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { KaseLogo } from "@/components/ui/kase-logo"
import { CommandSearch } from "@/components/ui/command-search"
import {
  Inbox,
  Star,
  Send,
  FileText,
  Archive,
  AlertTriangle,
  Trash2,
  Settings,
  Search,
  Edit3,
  ChevronDown,
  Menu,
  LayoutDashboard,
} from "lucide-react"

type Role = "SUPERADMIN" | "WORKSPACE_ADMIN" | "WORKSPACE_USER" | "INDIVIDUAL_USER"

const folders = [
  { label: "Inbox", icon: Inbox, badge: "12", href: "/mail/inbox" },
  { label: "Starred", icon: Star, href: "/mail/starred" },
  { label: "Sent", icon: Send, href: "/mail/sent" },
  { label: "Drafts", icon: FileText, badge: "3", href: "/mail/drafts" },
  { label: "Archive", icon: Archive, href: "/mail/archive" },
  { label: "Spam", icon: AlertTriangle, badge: "8", href: "/mail/spam" },
  { label: "Trash", icon: Trash2, href: "/mail/trash" },
  { label: "Settings", icon: Settings, href: "/mail/settings" },
]

const adminRoles: Role[] = ["SUPERADMIN", "WORKSPACE_ADMIN"]

export function MailShell({
  children,
  messageList,
  readingPane,
}: {
  children?: React.ReactNode
  messageList?: React.ReactNode
  readingPane?: React.ReactNode
}) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [activeFolder, setActiveFolder] = useState("Inbox")
  const [mobileView, setMobileView] = useState<"list" | "detail">("list")
  const [role, setRole] = useState<Role | null>(null)
  const [user, setUser] = useState<{ email: string; displayName: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.role) setRole(data.user.role)
        if (data.user) setUser(data.user)
      })
      .catch(() => {})
  }, [])

  const isAdmin = role && adminRoles.includes(role)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <CommandSearch open={commandOpen} onOpenChange={setCommandOpen} mailMode />

      <aside
        className="hidden lg:flex w-[268px] flex-shrink-0 flex-col border-r backdrop-blur-2xl"
        style={{ borderColor: "var(--sidebar-border)", background: "color-mix(in srgb, var(--sidebar) 84%, transparent)" }}
      >
        <div className="p-4 pb-3">
          <KaseLogo />
        </div>

        <div className="px-3 mb-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-all"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Edit3 className="h-4 w-4" />
            Compose
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-2">
          {folders.map((folder) => {
            const Icon = folder.icon
            const isActive = activeFolder === folder.label
            return (
              <button
                key={folder.label}
                onClick={() => setActiveFolder(folder.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-[#f8fafc] shadow-[inset_0_0_0_1px_rgba(148,163,184,0.25),0_0_16px_rgba(0,0,0,0.25)] bg-[linear-gradient(180deg,rgba(148,163,184,0.08),rgba(148,163,184,0.04))]"
                    : "text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.04]"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", isActive && "text-[#8b5cf6]")} />
                <span className="flex-1 text-left">{folder.label}</span>
                {folder.badge && (
                  <span className="rounded-full bg-[#8b5cf6]/20 px-2 py-0.5 text-xs font-medium text-[#8b5cf6]">
                    {folder.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="px-4 py-3">
          {isAdmin && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.04] transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
        </div>

        <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
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
            <ChevronDown className="h-4 w-4 text-[#a7b0c3]" />
          </div>
          <div className="flex gap-4 px-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <span>© 2026 Kase</span>
            <Link href="/privacy" className="hover:text-[#a7b0c3]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#a7b0c3]">Terms</Link>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 opacity-30">
          <div
            className="h-full w-full"
            style={{
              background: "radial-gradient(circle at 30% 100%, rgba(148,163,184,0.08), transparent 60%)",
            }}
          />
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header
          className="flex h-14 items-center gap-4 px-4 backdrop-blur-xl"
          style={{ borderBottom: "1px solid var(--border)", background: "color-mix(in srgb, var(--sidebar) 60%, transparent)" }}
        >
          <button
            className="lg:hidden"
            style={{ color: "var(--muted-foreground)" }}
            onClick={() => setMobileView("list")}
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors w-full max-w-md"
            style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--sidebar) 40%, transparent)", color: "var(--muted-foreground)" }}
          >
            <Search className="h-4 w-4" />
            <span>Search emails</span>
          </button>

          {messageList && !readingPane && (
            <button className="lg:hidden ml-auto" style={{ color: "var(--muted-foreground)" }} onClick={() => {}}>
              <Edit3 className="h-5 w-5" />
            </button>
          )}
        </header>

        <div className="flex flex-1 min-h-0">
          {messageList && (
            <div
              className={cn(
                "w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 overflow-y-auto border-r",
                readingPane && mobileView === "detail" && "hidden lg:block"
              )}
              style={{ borderColor: "var(--border)" }}
            >
              {messageList}
            </div>
          )}

          {readingPane && (
            <div
              className={cn(
                "flex-1 overflow-y-auto",
                !readingPane && "hidden",
                messageList && mobileView === "list" && "hidden lg:block"
              )}
            >
              {readingPane}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  )
}
