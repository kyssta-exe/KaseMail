"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Search,
  ChevronLeft,
  Trash2,
  Folder,
  MoreHorizontal,
  Star,
  Mail,
  PenSquare,
  Settings,
  Edit,
  SendHorizontal,
  ArrowLeft,
  Sparkles,
} from "lucide-react"

const messages = [
  { id: 1, sender: "Acme Corp", initial: "A", color: "from-slate-500 to-slate-400", subject: "Your domain setup is complete", time: "2m ago", preview: "Hi Superadmin, Your domain has been successfully configured..." },
  { id: 2, sender: "System", initial: "S", color: "from-[#ef4444] to-[#f97316]", subject: "Security alert: new login", time: "15m ago", preview: "A new sign-in was detected from an unrecognized device." },
  { id: 3, sender: "Team Lead", initial: "T", color: "from-[#22c55e] to-[#10b981]", subject: "Project roadmap update", time: "1h ago", preview: "Here's the updated roadmap for Q2..." },
  { id: 4, sender: "Cloud Services", initial: "C", color: "from-[#06b6d4] to-[#3b82f6]", subject: "Storage usage summary", time: "3h ago", preview: "Your storage usage has increased by 15% this month." },
  { id: 5, sender: "Kase Security", initial: "K", color: "from-[#f59e0b] to-[#eab308]", subject: "Weekly security digest", time: "6h ago", preview: "Here's your weekly security summary for May 16–22." },
  { id: 6, sender: "Michael Gray", initial: "M", color: "from-[#717b91] to-[#94a3b8]", subject: "Re: Meeting notes", time: "Yesterday", preview: "Thanks for sharing the notes. I've added a few comments..." },
]

export default function MobileMailPage() {
  const [view, setView] = useState<"inbox" | "detail">("inbox")

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#05080f] p-4">
      <div className="relative w-full max-w-[400px] h-[820px] rounded-[44px] border border-white/[0.08] bg-[#0b1020] overflow-hidden flex flex-col shadow-[0_0_60px_rgba(148,163,184,0.06)]">
        {view === "inbox" ? (
          <InboxView onSelectMessage={() => setView("detail")} />
        ) : (
          <DetailView onBack={() => setView("inbox")} />
        )}
      </div>
    </div>
  )
}

function InboxView({ onSelectMessage }: { onSelectMessage: () => void }) {
  return (
    <>
      {/* Status bar */}
      <div className="flex items-center justify-center px-6 pt-3 pb-1">
        <span className="text-sm font-semibold text-[#f8fafc]">9:41</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-400 text-xs font-bold text-white">
            K
          </div>
          <span className="text-base font-semibold text-[#f8fafc]">KaseMail</span>
        </div>
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-[#a7b0c3]" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-500 text-sm font-bold text-white">
            S
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-5 py-3">
        <Tab active badge="28">Inbox</Tab>
        <Tab>Primary</Tab>
        <Tab badge="12">Updates</Tab>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-5 space-y-2.5 pb-4">
        {messages.map((msg) => (
          <button
            key={msg.id}
            onClick={onSelectMessage}
            className="w-full text-left rounded-2xl bg-[#141a2e]/80 p-3.5 border border-white/[0.04] hover:bg-[#1a2140]/80 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white",
                  msg.color
                )}
              >
                {msg.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold text-[#f8fafc]">{msg.sender}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-xs text-[#717b91]">{msg.time}</span>
                    <div className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
                  </div>
                </div>
                <p className="text-sm text-[#d1d5db] truncate mb-0.5">{msg.subject}</p>
                <p className="text-xs text-[#717b91] truncate">{msg.preview}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Floating compose button */}
      <button className="absolute bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-400 shadow-lg shadow-black/30 hover:brightness-110 transition-all z-10">
        <PenSquare className="h-6 w-6 text-white" />
      </button>

      {/* Bottom nav */}
      <div className="flex items-center justify-around px-6 py-3 border-t border-white/[0.06] bg-[#0b1020]">
        <NavItem icon={Mail} label="Mail" active />
        <NavItem icon={PenSquare} label="Compose" />
        <NavItem icon={Folder} label="Folders" />
        <NavItem icon={Settings} label="Settings" />
      </div>
    </>
  )
}

function DetailView({ onBack }: { onBack: () => void }) {
  return (
    <>
      {/* Top actions */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
            <Trash2 className="h-5 w-5" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
            <Folder className="h-5 w-5" />
          </button>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
        {/* Subject */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg font-semibold text-[#f8fafc]">Your domain setup is complete</h1>
            <span className="shrink-0 rounded-full bg-[#8b5cf6]/20 px-2.5 py-0.5 text-[11px] font-medium text-[#8b5cf6]">
              Inbox
            </span>
          </div>
          <Star className="h-5 w-5 text-[#a7b0c3] shrink-0 mt-1" />
        </div>

        {/* Sender */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-400 text-sm font-bold text-white">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#f8fafc]">Acme Corp</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#717b91]">
              <span>to you@yourdomain.com</span>
              <span>·</span>
              <span>2m ago</span>
            </div>
          </div>
        </div>

        {/* Hero banner */}
        <div className="relative h-36 rounded-2xl bg-slate-900 border border-white/[0.06] flex items-center justify-center overflow-hidden">
          <div className="absolute w-24 h-24 rounded-full bg-[#8b5cf6]/20 blur-3xl" />
          <div className="absolute w-16 h-16 rounded-full bg-[#4f8cff]/20 blur-2xl top-4 right-8" />
          <div className="flex items-center gap-3 z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-400 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#f8fafc]">KaseMail</span>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 text-sm text-[#d1d5db] leading-relaxed">
          <p>Hi Superadmin,</p>
          <p>
            Great news! Your domain has been successfully configured and is now active. You can start using all the features of your KaseMail domain right away.
          </p>

          {/* Checklist */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#f8fafc]">Getting started checklist</h3>
            <ChecklistItem checked>Send and receive email</ChecklistItem>
            <ChecklistItem checked>Manage mailboxes and aliases</ChecklistItem>
            <ChecklistItem>Configure DNS records</ChecklistItem>
            <ChecklistItem>Set up SPF/DKIM/DMARC</ChecklistItem>
          </div>

          <button className="w-full rounded-xl bg-gradient-to-r from-slate-500 to-slate-400 py-3 text-sm font-semibold text-white shadow-lg shadow-black/25 hover:brightness-110 transition-all">
            Go to Domain Settings
          </button>

          <div className="pt-2 space-y-1">
            <p>Best regards,</p>
            <p className="font-semibold text-[#f8fafc]">KaseMail Team</p>
          </div>
        </div>
      </div>

      {/* Reply bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-white/[0.06] bg-[#0b1020]">
        <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-[#717b91]">
          Reply
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-400">
          <SendHorizontal className="h-4 w-4 text-white" />
        </button>
      </div>
    </>
  )
}

function Tab({ active, badge, children }: { active?: boolean; badge?: string; children: React.ReactNode }) {
  return (
    <button
      className={cn(
        "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-[#8b5cf6]/20 text-[#8b5cf6]"
          : "text-[#a7b0c3] hover:text-[#f8fafc]"
      )}
    >
      {children}
      {badge && (
        <span className="rounded-full bg-[#8b5cf6]/30 px-1.5 py-0.5 text-[10px] font-medium text-[#8b5cf6]">
          {badge}
        </span>
      )}
    </button>
  )
}

function NavItem({ icon: Icon, label, active }: { icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean }) {
  return (
    <button className="flex flex-col items-center gap-1">
      <Icon
        className={cn(
          "h-5 w-5",
          active ? "text-[#8b5cf6]" : "text-[#717b91]"
        )}
      />
      <span
        className={cn(
          "text-[10px] font-medium",
          active ? "text-[#8b5cf6]" : "text-[#717b91]"
        )}
      >
        {label}
      </span>
    </button>
  )
}

function ChecklistItem({ checked, children }: { checked?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-[#a7b0c3]">
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
          checked ? "border-[#22c55e] bg-[#22c55e]/20" : "border-white/20"
        )}
      >
        {checked && (
          <svg className="h-2.5 w-2.5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {children}
    </div>
  )
}
