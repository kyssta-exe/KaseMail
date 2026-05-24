"use client"

import { useState, useEffect } from "react"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api-service"
import { toast } from "sonner"
import {
  Shield, ShieldAlert, Ban, XCircle, CheckCheck,
  Trash2, UserPlus, ChevronDown, Search,
} from "lucide-react"

type QuarantineMsg = {
  id: string
  sender: string
  subject: string
  reason?: string
  score?: number
  createdAt: string
  status: string
}

export default function QuarantinePage() {
  const [messages, setMessages] = useState<QuarantineMsg[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  async function load() {
    setLoading(true)
    try {
      const data: any = await api.getQuarantineMessages()
      setMessages(data.messages || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load")
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = search
    ? messages.filter((m) => m.sender.toLowerCase().includes(search.toLowerCase()) || m.subject?.toLowerCase().includes(search.toLowerCase()))
    : messages

  async function act(action: string, id: string) {
    try {
      if (action === "release") await api.releaseQuarantine(id)
      else if (action === "delete") await api.deleteQuarantine(id)
      else if (action === "allowlist") await api.allowlistQuarantine(id)
      else if (action === "block") await api.blockQuarantine(id)
      toast.success(`Message ${action}ed`)
      await load()
    } catch (err: any) {
      toast.error(err.message || "Action failed")
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[rgba(148,163,184,0.06)] p-2 mt-1 shrink-0">
            <Shield className="h-5 w-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#f8fafc] tracking-tight">Quarantine</h1>
            <p className="text-sm text-[#a7b0c3] mt-0.5">{messages.length} quarantined messages</p>
          </div>
        </div>
        <AppButton onClick={load} variant="secondary" className="shrink-0">
          Refresh
        </AppButton>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#717b91]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sender or subject..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3.5 py-2 text-sm text-[#f8fafc] placeholder-[#717b91] outline-none focus:border-[rgba(139,92,246,0.40)] transition-colors"
            />
          </div>
          <span className="text-xs text-[#717b91]">
            {filtered.length} of {messages.length}
          </span>
        </div>

        <GlassCard className="p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-[#717b91]">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-sm text-[#717b91] gap-2">
              <Shield className="h-8 w-8 text-[#5a6276]" />
              <span>No quarantined messages</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="py-3 px-2 w-10"><Checkbox /></th>
                    <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">Sender</th>
                    <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">Subject</th>
                    <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">Date</th>
                    <th className="text-center py-3 px-2 text-[#a7b0c3] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((msg) => (
                    <tr key={msg.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2"><Checkbox /></td>
                      <td className="py-3 px-2 text-[#f8fafc] whitespace-nowrap">{msg.sender}</td>
                      <td className="py-3 px-2 text-[#d0d5e0] max-w-[220px] truncate">{msg.subject || "(No subject)"}</td>
                      <td className="py-3 px-2">
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border", msg.status === "quarantined" ? "text-[#fbbf24] bg-[rgba(245,158,11,0.10)] border-[rgba(245,158,11,0.20)]" : "text-[#717b91]")}>
                          {msg.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-[#717b91] whitespace-nowrap text-xs">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ""}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => act("release", msg.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8b5cf6] hover:bg-[rgba(148,163,184,0.06)] transition-colors" title="Release"><CheckCheck className="h-3.5 w-3.5" /></button>
                          <button onClick={() => act("delete", msg.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#f87171] hover:bg-[rgba(239,68,68,0.12)] transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => act("allowlist", msg.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#4ade80] hover:bg-[rgba(34,197,94,0.12)] transition-colors" title="Allowlist"><UserPlus className="h-3.5 w-3.5" /></button>
                          <button onClick={() => act("block", msg.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#f87171] hover:bg-[rgba(239,68,68,0.12)] transition-colors" title="Block"><Ban className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </AdminShell>
  )
}
