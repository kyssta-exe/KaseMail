"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-service"
import { cn } from "@/lib/utils"
import { MailShell } from "@/components/layout/mail-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { KaseLogo } from "@/components/ui/kase-logo"
import {
  Paperclip, Star, ChevronLeft, ChevronDown, ExternalLink,
  Shield, Trash2, Archive, MoreHorizontal, Reply, Forward,
  FileText, Download, Mail, Lock, RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

type Folder = { id: string; name: string; unreadEmails: number }
type Message = { id: string; subject: string; from: any; preview: string; receivedAt: string; hasAttachment: boolean; unread: boolean; starred: boolean; to: any[]; cc: any[]; bcc: any[]; textBody?: string; htmlBody?: string }

export default function InboxPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [activeFolderId, setActiveFolderId] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [position, setPosition] = useState(0)

  const connect = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email || !password) return
    setConnecting(true)
    try {
      const data: any = await api.getMailFolders(email, password)
      const folderList: Folder[] = (data.folders || []).map((f: any) => ({ id: f.id, name: f.name, unreadEmails: f.unreadEmails || 0 }))
      setFolders(folderList)
      if (folderList.length > 0) setActiveFolderId(folderList[0].id)
      setConnected(true)
    } catch (err: any) {
      toast.error(err.message || "Connection failed")
    } finally {
      setConnecting(false)
    }
  }, [email, password])

  const loadMessages = useCallback(async (folderId: string, pos = 0) => {
    if (!email || !password || !folderId) return
    setLoading(true)
    try {
      const data: any = await api.getMessages(email, password, folderId, 50, pos)
      setMessages(data.messages || [])
      setTotal(data.total || 0)
      setPosition(data.position || 0)
    } catch (err: any) {
      toast.error(err.message || "Failed to load messages")
    } finally {
      setLoading(false)
    }
  }, [email, password])

  useEffect(() => {
    if (activeFolderId) loadMessages(activeFolderId)
  }, [activeFolderId, loadMessages])

  const selected = messages.find((m) => m.id === selectedId)

  async function handleAction(action: string) {
    if (!selectedId || !email || !password) return
    try {
      if (action === "delete") {
        await api.updateMessage(selectedId, email, password, "delete")
      } else if (action === "read") {
        await api.updateMessage(selectedId, email, password, "read")
      } else if (action === "unread") {
        await api.updateMessage(selectedId, email, password, "unread")
      }
      await loadMessages(activeFolderId)
      toast.success(action === "delete" ? "Deleted" : "Updated")
    } catch (err: any) {
      toast.error(err.message || "Action failed")
    }
  }

  if (!connected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] p-4">
        <GlassCard className="w-full max-w-sm p-8">
          <div className="flex justify-center mb-6">
            <KaseLogo iconOnly size="lg" />
          </div>
          <h1 className="text-center text-xl font-bold text-[#f8fafc] mb-1">Connect Mailbox</h1>
          <p className="text-center text-sm text-[#a7b0c3] mb-6">Enter your email credentials to access webmail.</p>
          <form onSubmit={connect} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6276]" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@domain.com" className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-[15px] text-white placeholder:text-[#5a6276] outline-none focus:border-[#4f8cff]/40 transition-colors" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6276]" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-[15px] text-white placeholder:text-[#5a6276] outline-none focus:border-[#4f8cff]/40 transition-colors" />
            </div>
            <AppButton type="submit" className="w-full h-12 rounded-2xl" disabled={connecting}>
              {connecting ? "Connecting..." : "Connect"}
            </AppButton>
          </form>
        </GlassCard>
      </div>
    )
  }

  const unreadCount = messages.filter((m) => m.unread).length

  return (
    <MailShell
      messageList={
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-[#f8fafc]">
                {folders.find((f) => f.id === activeFolderId)?.name || "Inbox"}
              </h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#8b5cf6]/20 px-2 py-0.5 text-xs font-medium text-[#8b5cf6]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadMessages(activeFolderId)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
              <button className="flex items-center gap-1.5 text-xs text-[#a7b0c3] hover:text-[#f8fafc] transition-colors">
                Sort <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-[#717b91]">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-[#717b91]">No messages</div>
            ) : (
              messages.map((msg) => {
                const senderName = msg.from?.name || msg.from?.email || "Unknown"
                const senderEmail = msg.from?.email || ""
                const time = msg.receivedAt ? new Date(msg.receivedAt).toLocaleDateString() : ""
                return (
                  <button
                    key={msg.id}
                    onClick={() => { setSelectedId(msg.id); handleAction("read") }}
                    className={cn(
                      "w-full text-left px-5 py-3.5 border-b border-white/[0.04] transition-all duration-200 group",
                      selectedId === msg.id ? "bg-[linear-gradient(180deg,rgba(148,163,184,0.06),rgba(148,163,184,0.03))] shadow-[inset_0_0_0_1px_rgba(139,92,246,0.4),0_0_20px_rgba(79,140,255,0.12)]" : "hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {msg.unread ? <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#8b5cf6]" /> : <div className="mt-1.5 h-2 w-2 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={cn("text-sm truncate", msg.unread ? "font-semibold text-[#f8fafc]" : "font-medium text-[#d1d5db]")}>{senderName}</span>
                          <span className="text-xs text-[#717b91] shrink-0 ml-2">{time}</span>
                        </div>
                        <p className={cn("text-sm truncate mb-0.5", msg.unread ? "text-[#f8fafc]" : "text-[#a7b0c3]")}>{msg.subject || "(No subject)"}</p>
                        <p className="text-xs text-[#717b91] truncate">{msg.preview}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 mt-1">
                        {msg.hasAttachment && <Paperclip className="h-3.5 w-3.5 text-[#717b91]" />}
                        {msg.starred && <Star className="h-3.5 w-3.5 text-[#eab308] fill-[#eab308]" />}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
          {total > 50 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] text-xs text-[#717b91]">
              <span>{position + 1}-{Math.min(position + 50, total)} of {total}</span>
              <div className="flex gap-2">
                <button onClick={() => loadMessages(activeFolderId, Math.max(0, position - 50))} disabled={position === 0} className="text-[#a7b0c3] hover:text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                <button onClick={() => loadMessages(activeFolderId, position + 50)} disabled={position + 50 >= total} className="text-[#a7b0c3] hover:text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          )}
        </div>
      }
      readingPane={
        <div className="flex flex-col h-full p-6">
          <GlassCard glow className="flex-1 flex flex-col">
            <div className="flex items-center gap-1 px-4 py-3 border-b border-white/[0.06]">
              <button onClick={() => { if (selected) handleAction("unread") }} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors"><ExternalLink className="h-4 w-4" /></button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors"><Shield className="h-4 w-4" /></button>
              <button onClick={() => handleAction("delete")} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors"><Trash2 className="h-4 w-4" /></button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors"><Archive className="h-4 w-4" /></button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-sm text-[#717b91]">Select a message</div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <h2 className="text-xl font-semibold text-[#f8fafc] truncate">{selected.subject || "(No subject)"}</h2>
                    <span className="shrink-0 rounded-full bg-[#8b5cf6]/20 px-2.5 py-0.5 text-xs font-medium text-[#8b5cf6]">
                      {folders.find((f) => f.id === activeFolderId)?.name || "Inbox"}
                    </span>
                  </div>
                  {selected.starred && <Star className="h-5 w-5 text-[#eab308] fill-[#eab308] shrink-0" />}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-400 text-sm font-bold text-white">
                    {(selected.from?.name || selected.from?.email || "U")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#f8fafc]">{selected.from?.name || selected.from?.email || "Unknown"}</span>
                      {selected.from?.email && <span className="text-xs text-[#a7b0c3]">&lt;{selected.from.email}&gt;</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#717b91]">
                      <span>to me</span>
                      <span className="text-[#717b91]">·</span>
                      <span>{selected.receivedAt ? new Date(selected.receivedAt).toLocaleString() : ""}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-[#d1d5db] leading-relaxed whitespace-pre-line">
                  {selected.textBody || selected.htmlBody?.replace(/<[^>]*>/g, "") || "(No content)"}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                  <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[#f8fafc] hover:bg-white/[0.08] transition-colors"><Reply className="h-4 w-4" /> Reply</button>
                  <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[#f8fafc] hover:bg-white/[0.08] transition-colors"><Forward className="h-4 w-4" /> Forward</button>
                  <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[#f8fafc] hover:bg-white/[0.08] transition-colors"><Archive className="h-4 w-4" /> Archive</button>
                  <button onClick={() => handleAction("delete")} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[#ef4444] hover:bg-white/[0.08] transition-colors"><Trash2 className="h-4 w-4" /> Delete</button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      }
    />
  )
}
