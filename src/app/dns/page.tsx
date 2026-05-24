"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api-service"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { StatusChip, statusToChip } from "@/components/ui/status-chip"
import { CheckCircle2, Circle, Copy, Shield, Globe, AlertCircle, ArrowLeft, ArrowRight, CheckCheck } from "lucide-react"

type DnsRecord = {
  type: string
  host: string
  value: string
  priority?: string
  ttl: string
}

type CheckResult = {
  type: string
  status: "verified" | "pending" | "failed"
  host: string
  expected: string
}

function RecordField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[11px] font-medium uppercase tracking-wider text-[#5a6276]">{label}</span>
      <p className="mt-0.5 text-sm font-mono text-[#cbd5e1] break-all">{value}</p>
    </div>
  )
}

export default function DNSSetupPage() {
  const [domainId, setDomainId] = useState<string | null>(null)
  const [domainName, setDomainName] = useState("")
  const [records, setRecords] = useState<DnsRecord[]>([])
  const [checks, setChecks] = useState<CheckResult[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setDomainId(params.get("domainId"))
  }, [])

  useEffect(() => {
    if (domainId === null) return
    if (!domainId) {
      setLoading(false)
      return
    }
    setLoading(true)
    api.getDomain(domainId).then((dom) => {
      setDomainName(dom.name)
      return api.getDnsRecords(domainId)
    }).then((recs) => {
      setRecords(recs)
      setLoading(false)
    }).catch(() => {
      toast.error("Failed to load domain DNS records")
      setLoading(false)
    })
  }, [domainId])

  async function handleCopy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied`)
    } catch {
      toast.error("Copy failed")
    }
  }

  async function handleVerify() {
    if (!domainId) return
    setVerifying(true)
    try {
      const result = await api.checkDns(domainId)
      setChecks(result.checks || [])
      const allPassed = (result.checks || []).every((c: any) => c.status === "verified")
      if (allPassed) {
        toast.success("All DNS records verified! Domain is active.")
      } else {
        const pending = (result.checks || []).filter((c: any) => c.status !== "verified").length
        toast.info(`${pending} record(s) still pending. Check your DNS provider.`)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed")
    }
    setVerifying(false)
  }

  if (!domainId) {
    return (
      <AdminShell>
        <div className="flex flex-col items-center justify-center py-24">
          <Globe className="h-12 w-12 text-[#5a6276] mb-4" />
          <h2 className="text-xl font-semibold text-[#f8fafc]">No domain selected</h2>
          <p className="text-sm text-[#a7b0c3] mt-2">Select a domain from the domains page to set up DNS.</p>
          <Link href="/domains">
            <AppButton className="mt-6">Go to Domains</AppButton>
          </Link>
        </div>
      </AdminShell>
    )
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24">
          <div className="animate-pulse text-[#a7b0c3]">Loading DNS records...</div>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-2 text-sm text-[#5a6276]">
          <Link href="/domains" className="transition-colors hover:text-[#a7b0c3]">Domains</Link>
          <span className="text-white/20">/</span>
          <span className="text-[#a7b0c3]">DNS Setup</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">DNS Setup</h1>
            <p className="mt-1 text-sm text-[#a7b0c3]">
              Add these DNS records at your domain provider, then verify.
            </p>
          </div>
          <Link href="/domains">
            <AppButton variant="secondary" className="shrink-0 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Domains
            </AppButton>
          </Link>
        </div>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/20">
              <Globe className="h-5 w-5 text-[#a7b0c3]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{domainName}</p>
              <p className="text-xs text-[#a7b0c3]">
                {checks.length > 0
                  ? `${checks.filter((c) => c.status === "verified").length} of ${checks.length} records verified`
                  : "Records not yet verified"}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">Required DNS Records</h2>

          <div className="space-y-4">
            {records.map((rec, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">
                    {rec.type} Record
                    {i === 0 && <span className="ml-2 inline-flex items-center rounded-full border border-[#4f8cff]/20 bg-[#4f8cff]/10 px-2 py-0.5 text-[11px] font-medium text-[#4f8cff]">Required</span>}
                  </h3>
                  {checks[i] && (
                    <StatusChip status={statusToChip(checks[i].status)}>
                      {checks[i].status === "verified" ? "Verified" : checks[i].status === "failed" ? "Error" : "Pending"}
                    </StatusChip>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                  <RecordField label="Type" value={rec.type} />
                  <RecordField label="Host / Name" value={rec.host} />
                  {rec.priority && <RecordField label="Priority" value={rec.priority} />}
                  <RecordField label="TTL" value={rec.ttl} />
                </div>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <RecordField label="Value / Points to" value={rec.value} />
                  <button
                    onClick={() => handleCopy(rec.value, rec.type)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#a7b0c3] transition-colors hover:border-[#4f8cff]/30 hover:text-[#4f8cff]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-sm text-[#a7b0c3]">
              After adding these records at your DNS provider, click verify to confirm they are set correctly.
            </p>
            <AppButton className="mt-4 gap-2" onClick={handleVerify} disabled={verifying}>
              <Shield className="h-4 w-4" />
              {verifying ? "Verifying..." : "Verify DNS Now"}
            </AppButton>
          </div>
        </GlassCard>

        {checks.length > 0 && (
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Verification Results</h2>
            <div className="space-y-3">
              {checks.map((check, i) => (
                <div key={i} className="flex items-center gap-3">
                  {check.status === "verified" ? (
                    <CheckCheck className="h-5 w-5 text-[#4ade80] shrink-0" />
                  ) : check.status === "failed" ? (
                    <AlertCircle className="h-5 w-5 text-[#f87171] shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-[#5a6276] shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-[#f8fafc]">{check.type} record</p>
                    <p className="text-xs text-[#a7b0c3]">
                      Expected <span className="font-mono">{check.expected}</span> on <span className="font-mono">{check.host}</span>
                    </p>
                  </div>
                  <StatusChip status={statusToChip(check.status)}>
                    {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                  </StatusChip>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </AdminShell>
  )
}
