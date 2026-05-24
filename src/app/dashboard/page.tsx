"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { MetricCard } from "@/components/ui/metric-card"
import { StatusChip, statusToChip } from "@/components/ui/status-chip"
import { AppButton } from "@/components/ui/app-button"
import { api } from "@/lib/api-service"
import {
  ShieldCheck,
  ChevronDown,
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [kpis, setKpis] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    Promise.allSettled([
      api.getDomains(),
      api.getMailboxes(),
      api.getServerHealth(),
      api.getAuditLogs({ take: 7 }),
    ]).then((results) => {
      const domains = results[0].status === "fulfilled" ? results[0].value : []
      const mailboxes = results[1].status === "fulfilled" ? results[1].value : []
      const health = results[2].status === "fulfilled" ? results[2].value : null
      const logs = results[3].status === "fulfilled" ? results[3].value : []

      setKpis([
        {
          title: "Total Domains",
          value: String(domains.length),
          trend: "live from database",
          icon: "Globe",
          trendTone: "success",
        },
        {
          title: "Active Mailboxes",
          value: String(mailboxes.filter((m: any) => m.status !== "DELETED").length),
          trend: "live from database",
          icon: "Users",
          trendTone: "success",
        },
        {
          title: "Storage Used",
          value: health?.disk?.used || "0 GB",
          trend: health?.disk?.percentage !== undefined ? `${health.disk.percentage}% capacity` : "configured server",
          icon: "HardDrive",
          trendTone: "neutral",
        },
        {
          title: "Emails Sent Today",
          value: health?.mail?.sentToday || "0",
          trend: "from mail core",
          icon: "Send",
          trendTone: "neutral",
        },
        {
          title: "DNS Issues",
          value: String(domains.filter((d: any) => d.status !== "ACTIVE" && d.status !== "healthy").length),
          trend: "domains pending verification",
          icon: "AlertTriangle",
          trendTone: "warning",
        },
        {
          title: "Server Health",
          value: health?.health === "healthy" ? "Healthy" : health?.health === "degraded" ? "Degraded" : "Unknown",
          trend: health?.summary || "health endpoint",
          icon: "ShieldCheck",
          trendTone: health?.health === "healthy" ? "success" : "neutral",
        },
      ])

      if (logs.length) {
        setActivities(
          logs.map((log: any) => ({
            event: log.action || "Audit event",
            details: `${log.targetType || "System"}${log.targetId ? ` ${log.targetId}` : ""}`,
            user: log.actor?.email || "System",
            time: log.createdAt ? new Date(log.createdAt).toLocaleString() : "-",
          }))
        )
      }

      if (health?.services) {
        setServices(health.services)
      }
    })
  }, [])

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-muted/20 p-2 mt-1 shrink-0">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Superadmin Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Secure. Private. Built for control.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground cursor-pointer hover:bg-muted/10 transition-colors shrink-0">
          <span>Last 7 days</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Mail Server Status</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{service.name}</span>
                  <StatusChip status={statusToChip(service.status)}>
                    {service.status === "healthy" ? "Operational" : service.status === "error" ? "Degraded" : "Unknown"}
                  </StatusChip>
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-sm text-muted-foreground">Loading server health...</p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <AppButton variant="primary" onClick={() => router.push("/domains?add=true")}>
                Add Domain
              </AppButton>
              <AppButton variant="secondary" onClick={() => router.push("/mailboxes")}>
                Create Mailbox
              </AppButton>
              <AppButton variant="secondary" onClick={() => router.push("/aliases")}>
                Add Alias
              </AppButton>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-3 px-2 text-muted-foreground font-medium">Event</th>
                    <th className="py-3 px-2 text-muted-foreground font-medium">Details</th>
                    <th className="py-3 px-2 text-muted-foreground font-medium">User</th>
                    <th className="py-3 px-2 text-right text-muted-foreground font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                    >
                      <td className="py-3 px-2 text-foreground font-medium">{activity.event}</td>
                      <td className="py-3 px-2 text-muted-foreground">{activity.details}</td>
                      <td className="py-3 px-2 text-muted-foreground">{activity.user}</td>
                      <td className="py-3 px-2 text-right text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </td>
                    </tr>
                  ))}
                  {activities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No recent activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </AdminShell>
  )
}
