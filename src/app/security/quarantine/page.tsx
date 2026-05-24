"use client"

import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { StatusChip } from "@/components/ui/status-chip"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { mockQuarantined } from "@/lib/mock-data"
import { toast } from "sonner"
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Ban,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Search,
  CheckCheck,
  Trash2,
  UserPlus,
  ArrowUpRight,
  Sliders,
  Brain,
  HardDrive,
  Check,
} from "lucide-react"

const summaryCards = [
  { title: "Quarantined Emails", value: "2,847", trend: "up 18%", tone: "success" as const, icon: ShieldAlert },
  { title: "Blocked Senders", value: "312", trend: "up 11%", tone: "success" as const, icon: Ban },
  { title: "Phishing Alerts", value: "128", trend: "up 22%", tone: "success" as const, icon: ShieldAlert },
  { title: "False Positives", value: "23", trend: "down 8%", tone: "danger" as const, icon: XCircle },
  { title: "Protection Health", value: "98%", trend: "Excellent", subtitle: "All systems operational", tone: "success" as const, icon: ShieldCheck },
]

const reasonColors: Record<string, string> = {
  spam: "text-[#fbbf24] bg-[rgba(245,158,11,0.10)] border-[rgba(245,158,11,0.20)]",
  phishing: "text-[#f87171] bg-[rgba(239,68,68,0.10)] border-[rgba(239,68,68,0.20)]",
  malware: "text-[#ef4444] bg-[rgba(239,68,68,0.10)] border-[rgba(239,68,68,0.20)]",
  policy: "text-[#4f8cff] bg-[rgba(79,140,255,0.10)] border-[rgba(79,140,255,0.20)]",
  other: "text-[#cbd5e1] bg-[rgba(148,163,184,0.10)] border-[rgba(148,163,184,0.16)]",
}

const reasonLegend = [
  { key: "spam", label: "Spam" },
  { key: "phishing", label: "Phishing" },
  { key: "malware", label: "Malware" },
  { key: "policy", label: "Policy Violation" },
  { key: "other", label: "Other" },
]

const phishingPatterns = [
  { label: "Fake Microsoft Login", pct: 24, count: 45 },
  { label: "Account Suspension Scam", pct: 18, count: 32 },
  { label: "Invoice / Payment Scam", pct: 15, count: 28 },
]

const trainingChecks = [
  { label: "Spam Detection", done: true },
  { label: "Phishing Detection", done: true },
  { label: "URL Analysis", done: true },
  { label: "Attachment Scan", done: false },
]

export default function QuarantinePage() {
  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[rgba(148,163,184,0.06)] p-2 mt-1 shrink-0">
            <Shield className="h-5 w-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#f8fafc] tracking-tight">Spam &amp; Quarantine</h1>
            <p className="text-sm text-[#a7b0c3] mt-0.5">Monitor, manage, and fine-tune your email protection.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-[#f8fafc] cursor-pointer hover:bg-white/[0.06] transition-colors shrink-0">
          <span>Last 7 days</span>
          <ChevronDown className="h-4 w-4 text-[#a7b0c3]" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {summaryCards.map((card) => (
              <GlassCard key={card.title} className="p-5 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="rounded-xl bg-[rgba(148,163,184,0.06)] p-2.5">
                    <card.icon className="h-5 w-5 text-[#8b5cf6]" />
                  </div>
                </div>
                <p className="text-sm text-[#a7b0c3] mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-[#f8fafc] tracking-tight">{card.value}</p>
                <p className={cn("text-xs mt-1.5", card.tone === "success" && "text-[#4ade80]", card.tone === "danger" && "text-[#f87171]")}>
                  {card.trend}
                </p>
                {"subtitle" in card && card.subtitle && (
                  <p className="text-xs text-[#717b91] mt-0.5">{card.subtitle}</p>
                )}
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-lg font-semibold text-[#f8fafc]">Quarantined Messages</h3>
                <p className="text-sm text-[#a7b0c3] mt-0.5">Emails blocked or quarantined by KaseMail protection.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5 mb-4">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-[#a7b0c3] cursor-pointer hover:bg-white/[0.06] transition-colors">
                <span>Filters</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#717b91]" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3.5 py-2 text-sm text-[#f8fafc] placeholder-[#717b91] outline-none focus:border-[rgba(139,92,246,0.40)] transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="py-3 px-2 w-10">
                      <Checkbox />
                    </th>
                    <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">Sender</th>
                    <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">Subject</th>
                    <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">Reason</th>
                    <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">Score</th>
                    <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">Date</th>
                    <th className="text-center py-3 px-2 text-[#a7b0c3] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockQuarantined.map((msg) => (
                    <tr key={msg.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2">
                        <Checkbox />
                      </td>
                      <td className="py-3 px-2 text-[#f8fafc] whitespace-nowrap">{msg.sender}</td>
                      <td className="py-3 px-2 text-[#d0d5e0] max-w-[220px] truncate">{msg.subject}</td>
                      <td className="py-3 px-2">
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border capitalize", reasonColors[msg.reason])}>
                          {msg.reason}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={cn("font-mono text-xs font-semibold px-2 py-0.5 rounded-md", msg.score >= 90 ? "text-[#f87171] bg-[rgba(239,68,68,0.10)]" : msg.score >= 70 ? "text-[#fbbf24] bg-[rgba(245,158,11,0.10)]" : "text-[#4ade80] bg-[rgba(34,197,94,0.10)]")}>
                          {msg.score}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-[#717b91] whitespace-nowrap text-xs">{msg.date}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger render={<button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8b5cf6] hover:bg-[rgba(148,163,184,0.06)] transition-colors" onClick={() => toast("Message released")}><CheckCheck className="h-3.5 w-3.5" /></button>} />
                            <TooltipContent>Release</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger render={<button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#f87171] hover:bg-[rgba(239,68,68,0.12)] transition-colors" onClick={() => toast("Message deleted")}><Trash2 className="h-3.5 w-3.5" /></button>} />
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger render={<button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#4ade80] hover:bg-[rgba(34,197,94,0.12)] transition-colors" onClick={() => toast("Sender allowlisted")}><UserPlus className="h-3.5 w-3.5" /></button>} />
                            <TooltipContent>Allowlist</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger render={<button className="flex h-7 w-7 items-center justify-center rounded-lg text-[#f87171] hover:bg-[rgba(239,68,68,0.12)] transition-colors" onClick={() => toast("Sender blocked")}><Ban className="h-3.5 w-3.5" /></button>} />
                            <TooltipContent>Block</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-sm text-[#717b91]">Showing 1 to 8 of 2,847 results</p>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, "...", 356].map((page, i) => (
                  <button key={i} className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors", page === 1 ? "bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]" : "text-[#a7b0c3] hover:bg-white/[0.06] hover:text-[#f8fafc]")}>
                    {page}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-[#717b91] font-medium">Reason:</span>
                {reasonLegend.map((r) => (
                  <span key={r.key} className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border capitalize", reasonColors[r.key])}>
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="h-4 w-4 text-[#8b5cf6]" />
              <h3 className="text-sm font-semibold text-[#f8fafc]">Spam Threshold</h3>
            </div>
            <p className="text-xs text-[#a7b0c3] mb-4">Adjust sensitivity of spam filtering.</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#717b91]">Current Level:</span>
              <StatusChip status="warning">Medium</StatusChip>
            </div>
            <div className="mb-4">
              <Slider defaultValue={[50]} min={0} max={100} />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-[#717b91]">Low</span>
                <span className="text-xs text-[#717b91]">Medium</span>
                <span className="text-xs text-[#717b91]">High</span>
              </div>
            </div>
            <AppButton variant="primary" className="w-full" onClick={() => toast("Threshold saved")}>
              Save Changes
            </AppButton>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-[#f87171]" />
              <h3 className="text-sm font-semibold text-[#f8fafc]">Recent Phishing Patterns</h3>
            </div>
            <div className="space-y-3 mb-4">
              {phishingPatterns.map((p) => (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#d0d5e0]">{p.label}</span>
                    <span className="text-[#f87171] text-xs">up {p.pct}%</span>
                  </div>
                  <p className="text-xs text-[#717b91]">Detected {p.count} times</p>
                </div>
              ))}
            </div>
            <button className="text-sm text-[#4f8cff] hover:text-[#6ba3ff] transition-colors flex items-center gap-1">
              View all patterns
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-[#8b5cf6]" />
              <h3 className="text-sm font-semibold text-[#f8fafc]">Filter Training Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#a7b0c3]">AI Model</span>
                <span className="text-xs text-[#f8fafc] font-medium">v2.8.4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#a7b0c3]">Last trained</span>
                <span className="text-xs text-[#717b91]">May 22, 2024</span>
              </div>
            </div>
            <div className="mt-4 mb-4">
              <Progress value={92}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-[#a7b0c3]">Training accuracy</span>
                  <span className="text-xs text-[#4ade80]">92%</span>
                </div>
              </Progress>
            </div>
            <div className="space-y-2.5">
              {trainingChecks.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-xs">
                  <div className={cn("flex h-4 w-4 items-center justify-center rounded-full shrink-0", item.done ? "bg-[rgba(74,222,128,0.10)]" : "border border-white/10")}>
                    {item.done && <Check className="h-2.5 w-2.5 text-[#4ade80]" />}
                  </div>
                  <span className={item.done ? "text-[#4ade80]" : "text-[#717b91]"}>{item.label}</span>
                  {!item.done && <span className="text-[#717b91]">Pending</span>}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="h-4 w-4 text-[#4f8cff]" />
              <h3 className="text-sm font-semibold text-[#f8fafc]">Quarantine Storage</h3>
            </div>
            <p className="text-xs text-[#a7b0c3] mb-3">1.42 TB used of 5 TB</p>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
              <div className="h-full w-[28%] rounded-full bg-gradient-to-r from-slate-500 to-slate-400" />
            </div>
            <button className="text-sm text-[#4f8cff] hover:text-[#6ba3ff] transition-colors flex items-center gap-1">
              Manage storage
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </GlassCard>
        </div>
      </div>
    </AdminShell>
  )
}
