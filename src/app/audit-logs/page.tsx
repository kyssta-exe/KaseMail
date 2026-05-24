"use client"

import { useEffect, useState, useCallback } from "react"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api-service"
import { History, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

const TAKE = 100

function formatAction(action: string): string {
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [skip, setSkip] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(() => {
    setLoading(true)
    setError(null)
    api.getAuditLogs({ take: TAKE, skip })
      .then((data) => {
        setLogs(data)
        setTotal(skip + data.length)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load audit logs"))
      .finally(() => setLoading(false))
  }, [skip])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const page = Math.floor(skip / TAKE) + 1
  const totalPages = Math.max(1, Math.ceil(total / TAKE))
  const isFirstPage = skip === 0
  const isLastPage = skip + TAKE >= total

  return (
    <AdminShell>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(79,140,255,0.10)] border border-[rgba(79,140,255,0.20)]">
          <History className="h-6 w-6 text-[#4f8cff]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Audit Logs</h1>
          <p className="text-sm text-[#a7b0c3]">Track all administrative actions.</p>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4f8cff] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-sm text-[#f87171]">{error}</p>
            <AppButton variant="secondary" onClick={fetchLogs}>
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Retry
            </AppButton>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <History className="h-10 w-10 text-[#717b91] mb-3" />
            <p className="text-sm text-[#a7b0c3]">No audit logs yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left text-xs font-medium uppercase tracking-wider text-[#a7b0c3]">
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Target</th>
                    <th className="px-5 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-white/[0.04] transition-colors last:border-b-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 text-[#a7b0c3] whitespace-nowrap font-mono text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-[#f8fafc]">
                        {log.actor?.displayName || log.actor?.email || "System"}
                      </td>
                      <td className="px-5 py-4 text-[#c1c6d4]">
                        {formatAction(log.action)}
                      </td>
                      <td className="px-5 py-4 text-[#c1c6d4]">
                        {log.targetType}{log.targetId ? ` ${log.targetId}` : ""}
                      </td>
                      <td className="px-5 py-4 text-[#717b91] max-w-[200px] truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4">
              <p className="text-sm text-[#a7b0c3]">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-lg text-[#a7b0c3] hover:text-[#f8fafc]"
                  disabled={isFirstPage}
                  onClick={() => setSkip(skip - TAKE)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-sm font-medium text-[#f8fafc]">
                  {page}
                </span>
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-lg text-[#a7b0c3] hover:text-[#f8fafc]"
                  disabled={isLastPage}
                  onClick={() => setSkip(skip + TAKE)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </GlassCard>
    </AdminShell>
  )
}
