"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { MetricCard } from "@/components/ui/metric-card"
import { StatusChip } from "@/components/ui/status-chip"
import { AppButton } from "@/components/ui/app-button"
import { cn } from "@/lib/utils"
import { mockKPIs, mockActivities } from "@/lib/mock-data"
import { api } from "@/lib/api-service"
import {
  ShieldCheck,
  ChevronDown,
  Check,
  ArrowUpRight,
  Sparkles,
} from "lucide-react"

const statusServices = [
  { name: "SMTP", status: "success" as const },
  { name: "IMAP", status: "success" as const },
  { name: "Webmail", status: "success" as const },
  { name: "Spam Filter", status: "success" as const },
  { name: "SSL Certificates", status: "success" as const },
]

const checklistItems = [
  { label: "Register Domain", done: true },
  { label: "Verify Ownership", done: true },
  { label: "Basic DNS Setup", done: true },
  { label: "Create MX Records", done: false },
  { label: "Enable DKIM Signing", done: false },
  { label: "Set up DMARC Policy", done: false },
]

const deliverabilityChecks = [
  { label: "SPF", detail: "Pass" },
  { label: "DKIM", detail: "Pass" },
  { label: "DMARC", detail: "Pass" },
  { label: "IP Reputation", detail: "Excellent" },
  { label: "Spam Complaints", detail: "Low" },
]

const storageLegend = [
  { label: "Mailboxes", value: "45%", color: "#8b5cf6" },
  { label: "Backups", value: "25%", color: "#4f8cff" },
  { label: "Attachments", value: "20%", color: "#22c55e" },
  { label: "Others", value: "10%", color: "#f59e0b" },
]

export default function DashboardPage() {
  const [kpis, setKpis] = useState(mockKPIs)
  const [activities, setActivities] = useState(mockActivities)

  useEffect(() => {
    Promise.allSettled([api.getDomains(), api.getMailboxes(), api.getServerHealth(), api.getAuditLogs({ take: 7 })]).then((results) => {
      const domains = results[0].status === "fulfilled" ? results[0].value : []
      const mailboxes = results[1].status === "fulfilled" ? results[1].value : []
      const health = results[2].status === "fulfilled" ? results[2].value : null
      const logs = results[3].status === "fulfilled" ? results[3].value : []
      setKpis([
        { title: "Total Domains", value: String(domains.length), trend: "live from database", icon: "Globe", trendTone: "success" },
        { title: "Active Mailboxes", value: String(mailboxes.filter((m: any) => m.status !== "DELETED").length), trend: "live from database", icon: "Users", trendTone: "success" },
        { title: "Storage Used", value: health?.storage?.used || "0 GB", trend: health?.storage?.label || "configured server", icon: "HardDrive", trendTone: "neutral" },
        { title: "Emails Sent Today", value: health?.mail?.sentToday || "0", trend: "from mail core", icon: "Send", trendTone: "neutral" },
        { title: "DNS Issues", value: String(domains.filter((d: any) => d.status !== "ACTIVE").length), trend: "domains pending verification", icon: "AlertTriangle", trendTone: "warning" },
        { title: "Server Health", value: health?.health || "Unknown", trend: health?.summary || "health endpoint", icon: "ShieldCheck", trendTone: health?.health === "100%" ? "success" : "neutral" },
      ])
      if (logs.length) {
        setActivities(logs.map((log: any) => ({
          event: log.action || "Audit event",
          details: `${log.targetType || "System"}${log.targetId ? ` ${log.targetId}` : ""}`,
          user: log.actor?.email || "System",
          time: log.createdAt ? new Date(log.createdAt).toLocaleString() : "-",
        })))
      }
    })
  }, [])

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[rgba(148,163,184,0.06)] p-2 mt-1 shrink-0">
            <ShieldCheck className="h-5 w-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#f8fafc] tracking-tight">Superadmin Overview</h1>
            <p className="text-sm text-[#a7b0c3] mt-0.5">Secure. Private. Built for control.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-[#f8fafc] cursor-pointer hover:bg-white/[0.06] transition-colors shrink-0">
          <span>Last 7 days</span>
          <ChevronDown className="h-4 w-4 text-[#a7b0c3]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi) => (
          <MetricCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
            trendTone={kpi.trendTone}
          >
            {kpi.title === "Storage Used" && (
              <div className="mt-3">
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[28%] rounded-full bg-gradient-to-r from-slate-500 to-slate-400" />
                </div>
              </div>
            )}
          </MetricCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Deliverability Score</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-14 shrink-0">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#4f8cff" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 45 A 40 40 0 0 1 90 45"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 10 45 A 40 40 0 0 1 90 45"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="123.15 125.66"
                />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#4ade80]">98</p>
              <p className="text-sm text-[#a7b0c3]">Excellent</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {deliverabilityChecks.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-[#a7b0c3]">{item.label}</span>
                <span
                  className={cn(
                    "font-medium",
                    item.detail === "Pass" && "text-[#4ade80]",
                    item.detail === "Excellent" && "text-[#4ade80]",
                    item.detail === "Low" && "text-[#fbbf24]"
                  )}
                >
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-5 text-sm text-[#4f8cff] hover:text-[#6ba3ff] transition-colors flex items-center gap-1">
            View full deliverability report
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#f8fafc]">Domain Setup Checklist</h3>
            <span className="rounded-full bg-[rgba(148,163,184,0.06)] px-3 py-1 text-xs font-medium text-[#8b5cf6]">
              3 of 6 completed
            </span>
          </div>
          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border shrink-0",
                    item.done
                      ? "border-[#4ade80]/30 bg-[rgba(74,222,128,0.10)]"
                      : "border-white/10 bg-white/[0.04]"
                  )}
                >
                  {item.done && <Check className="h-3 w-3 text-[#4ade80]" />}
                </div>
                <span className={cn(item.done ? "text-[#4ade80] line-through" : "text-[#d0d5e0]")}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-5 text-sm text-[#4f8cff] hover:text-[#6ba3ff] transition-colors flex items-center gap-1">
            View setup guide
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Mail Server Status</h3>
          <div className="space-y-3">
            {statusServices.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <span className="text-sm text-[#d0d5e0]">{service.name}</span>
                <StatusChip status={service.status}>Operational</StatusChip>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <AppButton variant="primary">Add Domain</AppButton>
            <AppButton variant="secondary">Create Mailbox</AppButton>
            <AppButton variant="secondary">Add Alias</AppButton>
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2 relative overflow-hidden" glow>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, rgba(148,163,184,0.06), transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(148,163,184,0.04), transparent 50%)",
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-[#8b5cf6]" />
                <h3 className="text-lg font-semibold text-[#f8fafc]">AI Assistant</h3>
              </div>
              <p className="text-sm text-[#a7b0c3]">Need help improving deliverability?</p>
              <p className="text-sm text-[#717b91] mt-0.5">
                Let Kase AI analyze your setup and suggest improvements.
              </p>
            </div>
            <AppButton variant="primary" className="flex items-center gap-2 shrink-0">
              Analyze Now
              <ArrowUpRight className="h-4 w-4" />
            </AppButton>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">Event</th>
                  <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">Details</th>
                  <th className="text-left py-3 px-2 text-[#a7b0c3] font-medium">User</th>
                  <th className="text-right py-3 px-2 text-[#a7b0c3] font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-2 text-[#f8fafc]">{activity.event}</td>
                    <td className="py-3 px-2 text-[#a7b0c3]">{activity.details}</td>
                    <td className="py-3 px-2 text-[#a7b0c3]">{activity.user}</td>
                    <td className="py-3 px-2 text-right text-[#717b91] whitespace-nowrap">
                      {activity.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Storage Usage</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 mb-5">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, #475569 0deg 162deg, #64748b 162deg 252deg, #22c55e 252deg 324deg, #f59e0b 324deg 360deg)",
                }}
              />
              <div className="absolute inset-[6px] rounded-full bg-[rgba(10,16,34,0.95)] flex items-center justify-center flex-col">
                <span className="text-sm text-[#a7b0c3]">1.42 TB</span>
                <span className="text-xs text-[#717b91]">Used</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-2">
              {storageLegend.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-[#a7b0c3]">{item.label}</span>
                  <span className="text-sm text-[#717b91]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </AdminShell>
  )
}
