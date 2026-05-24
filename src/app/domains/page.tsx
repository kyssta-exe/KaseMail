"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { StatusChip, statusToChip } from "@/components/ui/status-chip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import {
  Globe,
  Plus,
  Search,
  RefreshCw,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Info,
} from "lucide-react"
import { api } from "@/lib/api-service"
import type { Domain } from "@/lib/types"

type WorkspaceOption = { id: string; name: string }
type DomainApi = {
  id: string
  name: string
  status: "CREATED" | "AWAITING_OWNERSHIP" | "DNS_PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED"
  createdAt?: string
  dkimPublicKey?: string | null
  dnsChecks?: { type: string; status: "verified" | "pending" | "failed"; checkedAt: string }[]
  _count?: { mailboxes: number }
}

function latestChecksByType(checks: DomainApi["dnsChecks"] = []) {
  const latest = new Map<string, { type: string; status: "verified" | "pending" | "failed"; checkedAt: string }>()
  for (const check of checks) {
    if (!latest.has(check.type)) latest.set(check.type, check)
  }
  return latest
}

function mapDomain(domain: DomainApi): Domain {
  const latestChecks = latestChecksByType(domain.dnsChecks)
  const checkValues = [...latestChecks.values()]
  const status: Domain["status"] = domain.status === "ACTIVE" ? "healthy" : domain.status === "DNS_PENDING" ? "warning" : domain.status === "SUSPENDED" ? "error" : "warning"
  const dnsStatus: Domain["dnsStatus"] = checkValues.length === 0
    ? "warning"
    : checkValues.every((check) => check.status === "verified")
      ? "valid"
      : checkValues.some((check) => check.status === "failed")
        ? "invalid"
        : "warning"
  const dmarcStatus = latestChecks.get("DMARC")?.status === "verified" ? "pass" : "none"
  return {
    id: domain.id,
    name: domain.name,
    status,
    mailboxes: domain._count?.mailboxes ?? 0,
    dnsStatus,
    dkim: domain.dkimPublicKey ? "pass" : "fail",
    dmarc: dmarcStatus,
    createdDate: domain.createdAt ? new Date(domain.createdAt).toLocaleDateString() : "-",
  }
}

export default function DomainsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dnsFilter, setDnsFilter] = useState("all")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [domains, setDomains] = useState<Domain[]>([])
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([])
  const [workspaceId, setWorkspaceId] = useState("")
  const [domainName, setDomainName] = useState("")

  async function loadDomains() {
    api.getDomains().then((items) => setDomains(items.map(mapDomain)))
  }

  useEffect(() => {
    loadDomains()
    api.getWorkspaces().then((items) => {
      const options = items.map((workspace: WorkspaceOption) => ({ id: workspace.id, name: workspace.name }))
      setWorkspaces(options)
      setWorkspaceId((current) => current || options[0]?.id || "")
    })

    const params = new URLSearchParams(window.location.search)
    if (params.get("add") === "true") {
      setDrawerOpen(true)
    }
  }, [])

  const filtered = domains.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || d.status === statusFilter
    const matchesDns = dnsFilter === "all" || d.dnsStatus === dnsFilter
    return matchesSearch && matchesStatus && matchesDns
  })

  const total = domains.length
  const healthy = domains.filter((d) => d.status === "healthy").length
  const warning = domains.filter((d) => d.status === "warning").length
  const error = domains.filter((d) => d.status === "error").length

  async function handleAddDomain() {
    if (!domainName.trim()) {
      toast.error("Enter a domain name")
      return
    }
    try {
      if (!workspaceId) throw new Error("Select a workspace before adding a domain")
      const res = await api.createDomain({ workspaceId, name: domainName.trim() })
      toast.success("Domain added. Redirecting to DNS setup...")
      setDrawerOpen(false)
      setDomainName("")
      router.push(`/dns?domainId=${res.domain.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Domain creation failed")
    }
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f8fafc]">Domains</h1>
          <p className="mt-1 text-sm text-[#a7b0c3]">Manage and monitor your email domains.</p>
        </div>
        <AppButton onClick={() => setDrawerOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Domain
        </AppButton>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-5">
          <p className="text-sm text-[#a7b0c3]">Total Domains</p>
          <p className="mt-1 text-2xl font-semibold text-[#f8fafc]">{total}</p>
          <span className="mt-1 inline-block text-xs font-medium text-[#4ade80]">live from database</span>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm text-[#a7b0c3]">Active</p>
          <p className="mt-1 text-2xl font-semibold text-[#f8fafc]">{healthy}</p>
          <span className="mt-1 inline-block text-xs font-medium text-[#4ade80]">{total ? Math.round(healthy / total * 100) : 0}% of total</span>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm text-[#a7b0c3]">DNS Pending</p>
          <p className="mt-1 text-2xl font-semibold text-[#f8fafc]">{warning}</p>
          <span className="mt-1 inline-block text-xs font-medium text-[#fbbf24]">{total ? Math.round(warning / total * 100) : 0}% of total</span>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm text-[#a7b0c3]">Errors</p>
          <p className="mt-1 text-2xl font-semibold text-[#f8fafc]">{error}</p>
          <span className="mt-1 inline-block text-xs font-medium text-[#f87171]">{total ? Math.round(error / total * 100) : 0}% of total</span>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7b0c3]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search domains..."
              className="h-9 rounded-xl border-white/10 bg-white/[0.04] pl-9 text-sm text-[#f8fafc] placeholder:text-[#a7b0c3]"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
            <SelectTrigger className="h-9 min-w-[130px] rounded-xl border-white/10 bg-white/[0.04] text-[#f8fafc]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dnsFilter} onValueChange={(value) => setDnsFilter(value || "all")}>
            <SelectTrigger className="h-9 min-w-[130px] rounded-xl border-white/10 bg-white/[0.04] text-[#f8fafc]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">DNS Status</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="invalid">Invalid</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" className="h-9 rounded-xl text-[#a7b0c3] hover:text-[#f8fafc]">
            <SlidersHorizontal className="mr-1.5 h-4 w-4" />
            More filters
          </Button>
          <Button
            variant="ghost"
            className="h-9 w-9 rounded-xl text-[#a7b0c3] hover:text-[#f8fafc]"
            onClick={loadDomains}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs font-medium uppercase tracking-wider text-[#a7b0c3]">
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Mailboxes</th>
                <th className="px-5 py-3">DNS Status</th>
                <th className="px-5 py-3">DKIM</th>
                <th className="px-5 py-3">DMARC</th>
                <th className="px-5 py-3">Created Date</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((domain) => (
                <tr
                  key={domain.id}
                  className="border-b border-white/[0.04] transition-colors last:border-b-0 hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <span className="font-medium text-[#f8fafc]">{domain.name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusChip status={statusToChip(domain.status)}>
                      {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                    </StatusChip>
                  </td>
                  <td className="px-5 py-4 text-[#c1c6d4]">
                    {domain.mailboxes.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <StatusChip status={statusToChip(domain.dnsStatus)}>
                      {domain.dnsStatus === "valid"
                        ? "DNS Valid"
                        : domain.dnsStatus === "warning"
                          ? "DNS Warning"
                          : "DNS Invalid"}
                    </StatusChip>
                  </td>
                  <td className="px-5 py-4">
                    <StatusChip status={statusToChip(domain.dkim)}>
                      DKIM {domain.dkim.charAt(0).toUpperCase() + domain.dkim.slice(1)}
                    </StatusChip>
                  </td>
                  <td className="px-5 py-4">
                    <StatusChip status={statusToChip(domain.dmarc)}>
                      DMARC{" "}
                      {domain.dmarc.charAt(0).toUpperCase() + domain.dmarc.slice(1)}
                    </StatusChip>
                  </td>
                  <td className="px-5 py-4 text-[#c1c6d4]">{domain.createdDate}</td>
                  <td className="px-5 py-4">
                    <Link href={`/dns?domainId=${domain.id}`}>
                      <Button
                        variant="ghost"
                        className="h-8 rounded-lg text-xs text-[#4f8cff] hover:bg-[rgba(79,140,255,0.1)] hover:text-[#4f8cff]"
                      >
                        Setup DNS
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4">
          <p className="text-sm text-[#a7b0c3]">Showing {filtered.length} of {total} domains</p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-8 w-8 rounded-lg text-[#a7b0c3] hover:text-[#f8fafc]"
              disabled
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-sm font-medium text-[#f8fafc]">
              1
            </span>
            <Button
              variant="ghost"
              className="h-8 w-8 rounded-lg text-[#a7b0c3] hover:text-[#f8fafc]"
              disabled
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </GlassCard>

      <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="border-l border-white/[0.06] bg-[rgba(10,16,34,0.96)] backdrop-blur-2xl sm:max-w-[400px]">
          <div className="flex h-full flex-col">
            <DrawerHeader className="relative border-b border-white/[0.06] px-6 py-5">
              <DrawerClose className="absolute right-4 top-4 rounded-lg p-1 text-[#a7b0c3] transition-colors hover:bg-white/[0.06] hover:text-[#f8fafc]">
                <X className="h-5 w-5" />
              </DrawerClose>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]">
                <Globe2 className="h-5 w-5" />
              </div>
              <DrawerTitle className="text-lg font-semibold text-[#f8fafc]">
                Add Domain
              </DrawerTitle>
              <DrawerDescription className="text-sm text-[#a7b0c3]">
                Add a new domain to start sending and receiving emails.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#f8fafc]">
                  Workspace
                </label>
                <Select value={workspaceId} onValueChange={(value) => setWorkspaceId(value || "")}>
                  <SelectTrigger className="h-10 rounded-xl border-white/10 bg-white/[0.04] text-sm text-[#f8fafc]">
                    <SelectValue placeholder="Select workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((workspace) => (
                      <SelectItem key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#f8fafc]">
                  Domain name
                </label>
                <Input
                  value={domainName}
                  onChange={(event) => setDomainName(event.target.value)}
                  placeholder="e.g., yourdomain.com"
                  className="h-10 rounded-xl border-white/10 bg-white/[0.04] text-sm text-[#f8fafc] placeholder:text-[#a7b0c3]"
                />
                <p className="mt-1 text-xs text-[#717b91]">
                  Enter the domain you want to add.
                </p>
              </div>

              <div className="rounded-xl border border-[rgba(79,140,255,0.2)] bg-[rgba(79,140,255,0.06)] px-4 py-3">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4f8cff]" />
                  <div>
                    <p className="text-sm text-[#c1c6d4]">
                      Make sure your DNS records are properly configured for the domain to work
                      correctly.
                    </p>
                    <a
                      href="#"
                      className="mt-1 inline-block text-sm font-medium text-[#4f8cff] hover:underline"
                    >
                      View DNS Setup Guide &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <DrawerFooter className="border-t border-white/[0.06] px-6 py-4">
              <AppButton
                className="w-full"
                onClick={handleAddDomain}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add domain
              </AppButton>
              <AppButton
                variant="secondary"
                className="w-full"
                onClick={() => setDrawerOpen(false)}
              >
                Cancel
              </AppButton>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </AdminShell>
  )
}
