"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Mailbox } from "@/lib/types"
import { api } from "@/lib/api-service"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusChip, statusToChip } from "@/components/ui/status-chip"
import { AppButton } from "@/components/ui/app-button"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  KeyRound,
  Gauge,
  Ban,
  Trash2,
  Plus,
  Mail,
  HardDrive,
  Users,
  AlertTriangle,
} from "lucide-react"

const columns = [
  "Email Address",
  "Owner Name",
  "Domain",
  "Storage Used",
  "Quota",
  "Status",
  "Last Login",
  "",
] as const

function formatStorageGb(gb: number) {
  return `${gb} GB`
}

function mapMailbox(mailbox: any): Mailbox {
  return {
    id: mailbox.id,
    email: mailbox.address,
    name: mailbox.localPart,
    domain: mailbox.domain?.name || mailbox.address?.split("@")[1] || "",
    storageUsed: "0 GB",
    quota: `${Math.round((mailbox.quotaMb || 0) / 1024)} GB`,
    status: mailbox.status === "SUSPENDED" ? "suspended" : "active",
    lastLogin: "-",
  }
}

type WorkspaceOption = { id: string; name: string }
type DomainOption = { id: string; name: string; workspaceId: string }

export default function MailboxesPage() {
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([])
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([])
  const [domains, setDomains] = useState<DomainOption[]>([])

  const [formName, setFormName] = useState("")
  const [formWorkspace, setFormWorkspace] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formDomain, setFormDomain] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formQuota, setFormQuota] = useState("10")

  useEffect(() => {
    api.getMailboxes().then((items) => setMailboxes(items.map(mapMailbox)))
    api.getWorkspaces().then((items) => {
      const mapped = items.map((w: WorkspaceOption) => ({ id: w.id, name: w.name }))
      setWorkspaces(mapped)
      if (mapped[0]) setFormWorkspace(mapped[0].id)
    })
    api.getDomains().then((items) => {
      const mapped = items.map((d: any) => ({ id: d.id, name: d.name, workspaceId: d.workspaceId }))
      setDomains(mapped)
      if (mapped[0]) setFormDomain(mapped[0].name)
    })
  }, [])

  const total = mailboxes.length
  const active = mailboxes.filter((m) => m.status === "active").length
  const suspended = mailboxes.filter((m) => m.status === "suspended").length

  const filtered = mailboxes.filter((m) => {
    const q = search.toLowerCase()
    return (
      m.email.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.domain.toLowerCase().includes(q)
    )
  })

  async function handleCreate() {
    try {
      const domain = domains.find((d) => d.name === formDomain && d.workspaceId === formWorkspace)
      if (!formWorkspace || !domain?.id) throw new Error("Select a workspace and domain")
      await api.createMailbox({
        workspaceId: formWorkspace,
        domainId: domain.id,
        localPart: formEmail,
        name: formName,
        password: formPassword,
        quotaMb: Number(formQuota) * 1024,
      })
      const items = await api.getMailboxes()
      setMailboxes(items.map(mapMailbox))
      setCreateOpen(false)
      setFormName("")
      setFormEmail("")
      setFormPassword("")
      setFormQuota("10")
      toast.success(`Mailbox ${formEmail}@${formDomain} created successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Mailbox creation failed")
    }
  }

  async function handleResetPassword(mailbox: Mailbox) {
    try {
      const newPassword = crypto.randomUUID().slice(0, 14)
      await api.resetMailboxPassword(mailbox.id, newPassword)
      toast.success(`Password reset for ${mailbox.email}. Temporary password: ${newPassword}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset failed")
    }
  }

  function handleEditQuota(mailbox: Mailbox) {
    toast.success(`Quota updated for ${mailbox.email}`)
  }

  async function handleToggleSuspend(mailbox: Mailbox) {
    const next = mailbox.status === "active" ? "SUSPENDED" : "ACTIVE"
    try {
      await api.updateMailbox(mailbox.id, { status: next })
      setMailboxes((prev) => prev.map((m) => m.id === mailbox.id ? { ...m, status: next === "SUSPENDED" ? "suspended" : "active" } : m))
      toast.success(`${next === "SUSPENDED" ? "Suspended" : "Reactivated"} ${mailbox.email}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Mailbox update failed")
    }
  }

  async function handleDelete(mailbox: Mailbox) {
    try {
      await api.deleteMailbox(mailbox.id)
      setMailboxes((prev) => prev.filter((m) => m.id !== mailbox.id))
      toast.success(`Deleted mailbox ${mailbox.email}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Mailbox deletion failed")
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#f8fafc]">Mailboxes</h1>
            <p className="mt-1 text-sm text-[#a7b0c3]">Manage mailboxes across all domains.</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <AppButton onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Mailbox
            </AppButton>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Mailbox</DialogTitle>
                <DialogDescription>
                  Add a new mailbox to a domain.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#a7b0c3]">Workspace</label>
                  <Select value={formWorkspace} onValueChange={(v) => v && setFormWorkspace(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#a7b0c3]">Full Name</label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#a7b0c3]">Email / Username</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="john"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="flex-1"
                    />
                    <span className="flex items-center text-sm text-[#a7b0c3]">@</span>
                    <Select value={formDomain} onValueChange={(v) => v && setFormDomain(v)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.filter((d) => !formWorkspace || d.workspaceId === formWorkspace).map((d) => (
                          <SelectItem key={d.id} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#a7b0c3]">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#a7b0c3]">Quota (GB)</label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="10"
                    value={formQuota}
                    onChange={(e) => setFormQuota(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                <Mail className="h-5 w-5 text-[#4f8cff]" />
              </div>
              <div>
                <p className="text-xs text-[#a7b0c3]">Total Mailboxes</p>
                <p className="text-xl font-semibold text-[#f8fafc]">{total}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                <Users className="h-5 w-5 text-[#4ade80]" />
              </div>
              <div>
                <p className="text-xs text-[#a7b0c3]">Active</p>
                <p className="text-xl font-semibold text-[#f8fafc]">{active}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                <AlertTriangle className="h-5 w-5 text-[#f87171]" />
              </div>
              <div>
                <p className="text-xs text-[#a7b0c3]">Suspended</p>
                <p className="text-xl font-semibold text-[#f8fafc]">{suspended}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                <HardDrive className="h-5 w-5 text-[#fbbf24]" />
              </div>
              <div>
                <p className="text-xs text-[#a7b0c3]">Storage Used</p>
                <p className="text-xl font-semibold text-[#f8fafc]">-</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Table */}
        <GlassCard>
          <div className="p-4 pb-0">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7b0c3]" />
              <Input
                placeholder="Search by email, name, or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-medium text-[#a7b0c3]",
                        !col && "w-10"
                      )}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((mailbox) => (
                  <tr
                    key={mailbox.id}
                    className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-[#f8fafc]">{mailbox.email}</td>
                    <td className="px-4 py-3 text-[#cbd5e1]">{mailbox.name}</td>
                    <td className="px-4 py-3 text-[#cbd5e1]">{mailbox.domain}</td>
                    <td className="px-4 py-3 text-[#cbd5e1]">{mailbox.storageUsed}</td>
                    <td className="px-4 py-3 text-[#cbd5e1]">{mailbox.quota}</td>
                    <td className="px-4 py-3">
                      <StatusChip status={statusToChip(mailbox.status)}>
                        {mailbox.status.charAt(0).toUpperCase() + mailbox.status.slice(1)}
                      </StatusChip>
                    </td>
                    <td className="px-4 py-3 text-[#cbd5e1]">{mailbox.lastLogin}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a7b0c3] transition-colors hover:bg-white/[0.06] hover:text-[#f8fafc]" />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={4}>
                          <DropdownMenuItem onClick={() => handleResetPassword(mailbox)}>
                            <KeyRound className="h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditQuota(mailbox)}>
                            <Gauge className="h-4 w-4" />
                            Edit Quota
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleSuspend(mailbox)}>
                            <Ban className="h-4 w-4" />
                            {mailbox.status === "active" ? "Suspend" : "Reactivate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(mailbox)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-[#a7b0c3]">
                      No mailboxes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </AdminShell>
  )
}
