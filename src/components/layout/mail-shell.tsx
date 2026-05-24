"use client"

import { useState } from "react"
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
  Bell,
  Shield,
  ChevronDown,
  Edit3,
  Menu,
} from "lucide-react"

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

  return (
    <div className="flex h-screen overflow-hidden kase-bg">
      <CommandSearch open={commandOpen} onOpenChange={setCommandOpen} mailMode />

      <aside className="hidden lg:flex w-[268px] flex-shrink-0 flex-col border-r border-white/[0.06] bg-[rgba(10,16,34,0.84)] backdrop-blur-2xl">
        <div className="p-4 pb-3">
          <KaseLogo />
        </div>

        <div className="px-3 mb-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-950 transition-all hover:bg-slate-300">
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

        <div className="border-t border-white/[0.06] p-4 space-y-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-400 text-xs font-bold text-white">
              D
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#f8fafc] truncate">Daniel Carter</p>
              <p className="text-xs text-[#a7b0c3] truncate">daniel@kase.com</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#a7b0c3]" />
          </div>
          <div className="px-3">
            <div className="flex items-center justify-between text-xs text-[#a7b0c3] mb-1.5">
              <span>2.43 GB of 10 GB used</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
              <div className="h-full w-[24%] rounded-full bg-gradient-to-r from-slate-500 to-slate-400" />
            </div>
          </div>
          <div className="flex gap-4 px-3 text-xs text-[#717b91]">
            <span>© 2024 Kase</span>
            <span>Privacy</span>
            <span>Terms</span>
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
        <header className="flex h-14 items-center gap-4 border-b border-white/[0.06] px-4 bg-[rgba(5,8,22,0.6)] backdrop-blur-xl">
          <button className="lg:hidden text-[#a7b0c3]" onClick={() => setMobileView("list")}>
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#a7b0c3] hover:border-white/20 transition-colors w-full max-w-md"
          >
            <Search className="h-4 w-4" />
            <span>Search emails</span>
            <kbd className="ml-auto hidden md:inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-xs text-[#717b91]">
              <span>⌘</span>K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-xl text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
              <Shield className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-xl text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white">
                3
              </span>
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-400 text-[10px] font-bold text-white ml-1">
              D
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className={cn(
            "w-full lg:w-[520px] flex-shrink-0 border-r border-white/[0.06] overflow-y-auto",
            "hidden lg:block",
            mobileView === "list" ? "block" : "hidden"
          )}>
            {messageList}
          </div>
          <div className={cn(
            "flex-1 overflow-y-auto",
            mobileView === "detail" ? "block" : "hidden lg:block"
          )}>
            {readingPane}
          </div>
        </div>
      </div>
    </div>
  )
}
