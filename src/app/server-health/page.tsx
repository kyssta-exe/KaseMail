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

const serviceIcons = {
  SMTP: Mail,
  IMAP: Server,
  Webmail: Globe,
  "Spam Filter": Shield,
  "SSL Certificates": Lock,
} as Record<string, any>

const levels: Record<string, { icon: any; className: string }> = {
  INFO: { icon: Info, className: "text-[#4f8cff]" },
  WARN: { icon: AlertTriangle, className: "text-[#fbbf24]" },
  ERROR: { icon: XCircle, className: "text-[#f87171]" },
}

export default function ServerHealthPage() {
  const [serviceRows, setServiceRows] = useState<{ name: string; status: string }[]>([])
  const [metricRows, setMetricRows] = useState<{ label: string; value: string; icon: any; progress: number }[]>([])
  const [logRows, setLogRows] = useState<{ timestamp: string; level: string; service: string; message: string }[]>([])

  useEffect(() => {
    api.getServerHealth().then((data) => {
      const health = data.health ?? data
      if (health.services) {
        setServiceRows(health.services)
      } else {
        setServiceRows(Object.keys(serviceIcons).map((name) => ({ name, status: "unknown" })))
      }
      setMetricRows([
        { label: "CPU Usage", value: health.cpu?.usage || "-", icon: Cpu, progress: health.cpu?.percentage ?? 0 },
        { label: "Memory Usage", value: health.memory ? `${health.memory.used} / ${health.memory.total}` : "-", icon: MemoryStick, progress: health.memory?.percentage ?? 0 },
        { label: "Disk Usage", value: health.disk?.percentage ? `${health.disk.percentage}%` : "-", icon: HardDrive, progress: health.disk?.percentage ?? 0 },
        { label: "Uptime", value: health.uptime || "-", icon: Clock, progress: 100 },
      ])
      if (health.recentLogs?.length) {
        setLogRows(health.recentLogs.map((log: any) => ({
          timestamp: new Date(log.createdAt).toLocaleString(),
          level: log.level || "INFO",
          service: log.targetType || "System",
          message: log.action || log.message || "Audit event",
        })))
      }
    }).catch(() => setServiceRows(Object.keys(serviceIcons).map((name) => ({ name, status: "unknown" }))))
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
            const Icon = serviceIcons[s.name] || Server
            const chipStatus = statusToChip(s.status)
            return (
              <GlassCard key={s.name} className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(79,140,255,0.10)]">
                    <Icon className="h-4.5 w-4.5 text-[#4f8cff]" />
                  </div>
                  <span className="text-sm font-medium text-[#f8fafc]">{s.name}</span>
                </div>
                <StatusChip status={chipStatus}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</StatusChip>
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
