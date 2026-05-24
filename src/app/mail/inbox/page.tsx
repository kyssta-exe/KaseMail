"use client"

import { useState } from "react"
import { mockEmails } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { MailShell } from "@/components/layout/mail-shell"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Paperclip,
  Star,
  ChevronLeft,
  ChevronDown,
  ExternalLink,
  Shield,
  Trash2,
  Archive,
  MoreHorizontal,
  Reply,
  Forward,
  FileText,
  Download,
  type LucideIcon,
} from "lucide-react"

export default function InboxPage() {
  const [selectedEmailId, setSelectedEmailId] = useState(mockEmails[0].id)
  const selectedEmail = mockEmails.find((e) => e.id === selectedEmailId) ?? mockEmails[0]
  const unreadCount = mockEmails.filter((e) => e.unread).length

  return (
    <MailShell
      messageList={
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-[#f8fafc]">Inbox</h1>
              <span className="rounded-full bg-[#8b5cf6]/20 px-2 py-0.5 text-xs font-medium text-[#8b5cf6]">
                {unreadCount} unread
              </span>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-[#a7b0c3] hover:text-[#f8fafc] transition-colors">
              Sort
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockEmails.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedEmailId(email.id)}
                className={cn(
                  "w-full text-left px-5 py-3.5 border-b border-white/[0.04] transition-all duration-200 group",
                  selectedEmailId === email.id
                    ? "bg-[linear-gradient(180deg,rgba(148,163,184,0.06),rgba(148,163,184,0.03))] shadow-[inset_0_0_0_1px_rgba(139,92,246,0.4),0_0_20px_rgba(79,140,255,0.12)]"
                    : "hover:bg-white/[0.02]"
                )}
              >
                <div className="flex items-start gap-3">
                  {email.unread ? (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#8b5cf6]" />
                  ) : (
                    <div className="mt-1.5 h-2 w-2 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={cn(
                          "text-sm truncate",
                          email.unread ? "font-semibold text-[#f8fafc]" : "font-medium text-[#d1d5db]"
                        )}
                      >
                        {email.sender}
                      </span>
                      <span className="text-xs text-[#717b91] shrink-0 ml-2">{email.time}</span>
                    </div>
                    <p
                      className={cn(
                        "text-sm truncate mb-0.5",
                        email.unread ? "text-[#f8fafc]" : "text-[#a7b0c3]"
                      )}
                    >
                      {email.subject}
                    </p>
                    <p className="text-xs text-[#717b91] truncate">{email.preview}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 mt-1">
                    {email.hasAttachment && <Paperclip className="h-3.5 w-3.5 text-[#717b91]" />}
                    {email.starred && <Star className="h-3.5 w-3.5 text-[#eab308] fill-[#eab308]" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      }
      readingPane={
        <div className="flex flex-col h-full p-6">
          <GlassCard glow className="flex-1 flex flex-col">
            <div className="flex items-center gap-1 px-4 py-3 border-b border-white/[0.06]">
              <ToolbarButton icon={ChevronLeft} />
              <ToolbarButton icon={ExternalLink} />
              <ToolbarButton icon={Shield} />
              <ToolbarButton icon={Trash2} />
              <ToolbarButton icon={Archive} />
              <ToolbarButton icon={MoreHorizontal} />
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <h2 className="text-xl font-semibold text-[#f8fafc] truncate">{selectedEmail.subject}</h2>
                  <span className="shrink-0 rounded-full bg-[#8b5cf6]/20 px-2.5 py-0.5 text-xs font-medium text-[#8b5cf6]">
                    Inbox
                  </span>
                </div>
                {selectedEmail.starred && <Star className="h-5 w-5 text-[#eab308] fill-[#eab308] shrink-0" />}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-400 text-sm font-bold text-white">
                  {selectedEmail.sender[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#f8fafc]">{selectedEmail.sender}</span>
                    <span className="text-xs text-[#a7b0c3]">&lt;{selectedEmail.senderEmail}&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#717b91]">
                    <span>to me</span>
                    <span className="text-[#717b91]">·</span>
                    <span>{selectedEmail.time}</span>
                  </div>
                </div>
              </div>
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <FileText className="h-8 w-8 text-[#4f8cff]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f8fafc] truncate">{selectedEmail.attachments[0].name}</p>
                    <p className="text-xs text-[#717b91]">{selectedEmail.attachments[0].size}</p>
                  </div>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              )}
              {selectedEmail.body && (
                <div className="text-sm text-[#d1d5db] leading-relaxed whitespace-pre-line">{selectedEmail.body}</div>
              )}
              <div className="border-t border-white/[0.06] pt-4 space-y-0.5">
                <p className="text-sm font-semibold text-[#8b5cf6]">{selectedEmail.sender}</p>
                <p className="text-xs text-[#717b91]">Project Manager, Acme Inc.</p>
                <p className="text-xs text-[#717b91]">{selectedEmail.senderEmail}</p>
                <p className="text-xs text-[#717b91]">+1 (415) 555-0198</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <ActionButton icon={Reply} label="Reply" />
                <ActionButton icon={Forward} label="Forward" />
                <ActionButton icon={Archive} label="Archive" />
                <ActionButton icon={Trash2} label="Delete" danger />
              </div>
            </div>
          </GlassCard>
        </div>
      }
    />
  )
}

function ToolbarButton({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
      <Icon className="h-4 w-4" />
    </button>
  )
}

function ActionButton({ icon: Icon, label, danger }: { icon: LucideIcon; label: string; danger?: boolean }) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium hover:bg-white/[0.08] transition-colors",
        danger ? "text-[#ef4444]" : "text-[#f8fafc]"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}
