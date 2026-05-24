"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusChip, statusToChip } from "@/components/ui/status-chip"
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Clock,
  Server,
  Mail,
  Globe,
  Shield,
  Lock,
  Info,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { api } from "@/lib/api-service"

const services = [
  { name: "SMTP", icon: Mail },
  { name: "IMAP", icon: Server },
  { name: "Webmail", icon: Globe },
  { name: "Spam Filter", icon: Shield },
  { name: "SSL Certificates", icon: Lock },
]

const metrics = [
  { label: "CPU Usage", value: "42%", icon: Cpu, progress: 42 },
  { label: "Memory Usage", value: "6.8 / 16 GB", icon: MemoryStick, progress: 42.5 },
  { label: "Disk Usage", value: "45%", icon: HardDrive, progress: 45 },
  { label: "Uptime", value: "127 days", icon: Clock, progress: 100 },
]

const levels = {
  INFO: { icon: Info, className: "text-[#4f8cff]" },
  WARN: { icon: AlertTriangle, className: "text-[#fbbf24]" },
  ERROR: { icon: XCircle, className: "text-[#f87171]" },
} as const

const logs = [
  { timestamp: "2026-05-23 08:14:22", level: "INFO" as const, service: "SMTP", message: "Connection established from 203.0.113.42" },
  { timestamp: "2026-05-23 08:12:07", level: "INFO" as const, service: "IMAP", message: "Mailbox sync completed for user@kase.com" },
  { timestamp: "2026-05-23 08:09:55", level: "WARN" as const, service: "Spam Filter", message: "Bayesian filter confidence below threshold (78.2%)" },
  { timestamp: "2026-05-23 08:05:30", level: "ERROR" as const, service: "SSL Certificates", message: "Certificate for mail.kase.com expires in 14 days" },
  { timestamp: "2026-05-23 07:58:44", level: "INFO" as const, service: "Webmail", message: "Session created for admin@kase.com" },
  { timestamp: "2026-05-23 07:45:12", level: "INFO" as const, service: "SMTP", message: "Queue drained — 1,243 messages delivered" },
  { timestamp: "2026-05-23 07:30:01", level: "WARN" as const, service: "IMAP", message: "Connection pool at 85% capacity" },
  { timestamp: "2026-05-23 07:22:18", level: "ERROR" as const, service: "Spam Filter", message: "RBL lookup timed out for zen.spamhaus.org" },
  { timestamp: "2026-05-23 07:10:05", level: "INFO" as const, service: "SMTP", message: "TLS handshake completed — cipher TLS_AES_256_GCM_SHA384" },
  { timestamp: "2026-05-23 06:55:33", level: "INFO" as const, service: "SSL Certificates", message: "Auto-renewal check passed for all domains" },
]

export default function ServerHealthPage() {
  const [serviceRows, setServiceRows] = useState(services)
  const [metricRows, setMetricRows] = useState(metrics)
  const [logRows, setLogRows] = useState(logs)

  useEffect(() => {
    api.getServerHealth().then((data) => {
      const health = data.health ?? data
      if (health.services) {
        setServiceRows(health.services.map((service: any) => ({ name: service.name, icon: services.find((s) => s.name === service.name)?.icon || Server })))
      }
      setMetricRows([
        { label: "CPU Usage", value: health.cpu?.usage || "0%", icon: Cpu, progress: Number.parseInt(health.cpu?.usage || "0") },
        { label: "Memory Usage", value: `${health.memory?.used || "0 GB"} / ${health.memory?.total || "0 GB"}`, icon: MemoryStick, progress: health.memory?.percentage || 0 },
        { label: "Disk Usage", value: `${health.disk?.percentage || 0}%`, icon: HardDrive, progress: health.disk?.percentage || 0 },
        { label: "Uptime", value: health.uptime || "-", icon: Clock, progress: 100 },
      ])
      if (health.recentLogs?.length) {
        setLogRows(health.recentLogs.map((log: any) => ({
          timestamp: new Date(log.createdAt).toLocaleString(),
          level: "INFO" as const,
          service: log.targetType || "System",
          message: log.action || "Audit event",
        })))
      }
    }).catch(() => undefined)
  }, [])

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(79,140,255,0.10)] border border-[rgba(79,140,255,0.20)]">
            <Activity className="h-6 w-6 text-[#4f8cff]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#f8fafc]">Server Health</h1>
            <p className="text-sm text-[#a7b0c3]">Monitor your mail server infrastructure.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {serviceRows.map((s) => {
            const Icon = s.icon
            return (
              <GlassCard key={s.name} className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(79,140,255,0.10)]">
                    <Icon className="h-4.5 w-4.5 text-[#4f8cff]" />
                  </div>
                  <span className="text-sm font-medium text-[#f8fafc]">{s.name}</span>
                </div>
                <StatusChip status={statusToChip("operational")}>Operational</StatusChip>
              </GlassCard>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricRows.map((m) => {
            const Icon = m.icon
            return (
              <GlassCard key={m.label} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(79,140,255,0.10)]">
                      <Icon className="h-4.5 w-4.5 text-[#4f8cff]" />
                    </div>
                    <span className="text-sm text-[#a7b0c3]">{m.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#f8fafc]">{m.value}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-400 transition-all duration-500"
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
              </GlassCard>
            )
          })}
        </div>

        <GlassCard className="p-5">
          <h2 className="text-base font-semibold text-[#f8fafc] mb-4">Recent Server Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left">
                  <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wider text-[#717b91]">Timestamp</th>
                  <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wider text-[#717b91]">Level</th>
                  <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wider text-[#717b91]">Service</th>
                  <th className="pb-3 text-xs font-medium uppercase tracking-wider text-[#717b91]">Message</th>
                </tr>
              </thead>
              <tbody>
                {logRows.map((log, i) => {
                  const LevelIcon = levels[log.level].icon
                  return (
                    <tr key={i} className="border-b border-white/[0.04] last:border-0">
                      <td className="py-3 pr-4 text-[#a7b0c3] whitespace-nowrap font-mono text-xs">{log.timestamp}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", levels[log.level].className)}>
                          <LevelIcon className="h-3.5 w-3.5" />
                          {log.level}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-[#f8fafc] whitespace-nowrap text-xs font-medium">{log.service}</td>
                      <td className="py-3 text-[#717b91] text-xs">{log.message}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </AdminShell>
  )
}
