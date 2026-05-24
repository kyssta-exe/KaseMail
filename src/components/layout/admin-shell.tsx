"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { KaseLogo } from "@/components/ui/kase-logo"
import { GlassCard } from "@/components/ui/glass-card"
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
  Settings,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workspaces", href: "/workspaces", icon: LayoutGrid },
  { label: "Domains", href: "/domains", icon: Globe2 },
  { label: "Mailboxes", href: "/mailboxes", icon: Mail },
  { label: "Aliases", href: "/aliases", icon: Send },
  { label: "DNS Setup", href: "/dns", icon: Network },
  { label: "Server Health", href: "/server-health", icon: ShieldCheck },
  { label: "Security", href: "/security/quarantine", icon: Shield },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden kase-bg">
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
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-60 flex-shrink-0 border-r border-white/[0.06] bg-[rgba(10,16,34,0.84)] backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-5 pb-4">
            <KaseLogo />
            <button className="lg:hidden text-[#a7b0c3]" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3">
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

          <div className="border-t border-white/[0.06] p-4">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-400 text-xs font-bold text-white">
                S
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#f8fafc] truncate">Superadmin</p>
                <p className="text-xs text-[#a7b0c3] truncate">superadmin@kase.com</p>
              </div>
              <ChevronDown className="h-4 w-4 text-[#a7b0c3]" />
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
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center gap-4 border-b border-white/[0.06] px-6 bg-[rgba(5,8,22,0.6)] backdrop-blur-xl">
          <button className="lg:hidden text-[#a7b0c3]" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-[#a7b0c3] hover:border-white/20 hover:text-[#f8fafc] transition-colors w-full max-w-md"
          >
            <Search className="h-4 w-4" />
            <span>Search emails, domains, mailboxes...</span>
            <kbd className="ml-auto hidden md:inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-xs text-[#717b91]">
              <span>⌘</span>K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
              <Shield className="h-4.5 w-4.5" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-400 text-xs font-bold text-white ml-1">
              S
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
