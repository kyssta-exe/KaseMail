"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { StatusChip, statusToChip } from "@/components/ui/status-chip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Plus,
  Send,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import type { Alias } from "@/lib/types"
import { api } from "@/lib/api-service"

function mapAlias(alias: any): Alias {
  return {
    id: alias.id,
    alias: alias.address,
    destination: Array.isArray(alias.targets) ? alias.targets.join(", ") : alias.targets || "",
    status: "active",
  }
}

export default function AliasesPage() {
  const [aliases, setAliases] = useState<Alias[]>([])
  const [domains, setDomains] = useState<{ id: string; name: string }[]>([])
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [aliasName, setAliasName] = useState("")
  const [aliasDomain, setAliasDomain] = useState("")
  const [forwardTo, setForwardTo] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: "delete" | "disable"; id: string } | null>(null)

  useEffect(() => {
    api.getAliases().then((items) => setAliases(items.map(mapAlias)))
    api.getDomains().then((items) => {
      const mapped = items.map((d: any) => ({ id: d.id, name: d.name }))
      setDomains(mapped)
      if (mapped[0]) setAliasDomain(mapped[0].name)
    })
  }, [])

  const filtered = aliases.filter((a) =>
    a.alias.toLowerCase().includes(search.toLowerCase()) ||
    a.destination.toLowerCase().includes(search.toLowerCase())
  )

  const total = aliases.length
  const active = aliases.filter((a) => a.status === "active").length
  const disabled = aliases.filter((a) => a.status === "disabled").length

  async function handleAdd() {
    if (!aliasName || !aliasDomain || !forwardTo) {
      toast.error("Please fill in all fields")
      return
    }
    try {
      const domain = domains.find((d) => d.name === aliasDomain)
      const workspaceId = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || ""
      if (!workspaceId || !domain?.id) throw new Error("Default workspace/domain is not configured")
      await api.createAlias({ workspaceId, domainId: domain.id, address: `${aliasName}@${aliasDomain}`, targets: [forwardTo] })
      const items = await api.getAliases()
      setAliases(items.map(mapAlias))
      toast.success("Alias created successfully")
      setDialogOpen(false)
      setAliasName("")
      setForwardTo("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Alias creation failed")
    }
  }

  function handleToggleStatus(id: string) {
    const target = aliases.find((a) => a.id === id)
    if (!target) return
    const isActive = target.status === "active"
    setConfirmAction({ type: "disable", id })
    setConfirmOpen(true)
  }

  function executeToggle() {
    if (!confirmAction || confirmAction.type !== "disable") return
    const target = aliases.find((a) => a.id === confirmAction.id)
    if (!target) return
    const isActive = target.status === "active"
    setAliases((prev) =>
      prev.map((a) =>
        a.id === confirmAction.id
          ? { ...a, status: isActive ? "disabled" as const : "active" as const }
          : a
      )
    )
    toast.success(isActive ? "Alias disabled" : "Alias enabled")
    setConfirmOpen(false)
    setConfirmAction(null)
  }

  function handleDelete(id: string) {
    setConfirmAction({ type: "delete", id })
    setConfirmOpen(true)
  }

  async function executeDelete() {
    if (!confirmAction || confirmAction.type !== "delete") return
    try {
      await api.deleteAlias(confirmAction.id)
      setAliases((prev) => prev.filter((a) => a.id !== confirmAction.id))
      toast.success("Alias deleted successfully")
      setConfirmOpen(false)
      setConfirmAction(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Alias deletion failed")
    }
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f8fafc]">Aliases</h1>
          <p className="mt-1 text-sm text-[#a7b0c3]">Manage email aliases and forwarding.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<AppButton><Plus className="mr-1.5 h-4 w-4" />Add Alias</AppButton>} />
          <DialogContent className="border border-white/[0.06] bg-[rgba(10,16,34,0.96)] backdrop-blur-2xl text-[#f8fafc] sm:max-w-[400px]">
            <DialogHeader>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]">
                <Send className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-semibold text-[#f8fafc]">Add Alias</DialogTitle>
              <DialogDescription className="text-sm text-[#a7b0c3]">
                Create a new email alias for forwarding.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#f8fafc]">Alias Name</label>
                <Input
                  value={aliasName}
                  onChange={(e) => setAliasName(e.target.value)}
                  placeholder="e.g., hello"
                  className="h-10 rounded-xl border-white/10 bg-white/[0.04] text-sm text-[#f8fafc] placeholder:text-[#a7b0c3]"
                />
                <p className="mt-1 text-xs text-[#717b91]">
                  {aliasName ? `${aliasName}@${aliasDomain}` : "The local part of the alias address."}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#f8fafc]">Domain</label>
                <Select value={aliasDomain} onValueChange={(v: string | null) => { if (v) setAliasDomain(v); }}>
                  <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-white/[0.04] text-[#f8fafc]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border border-white/[0.06] bg-[rgba(10,16,34,0.96)] backdrop-blur-2xl text-[#f8fafc]">
                    {domains.map((d) => (
                      <SelectItem key={d.id} value={d.name} className="text-[#f8fafc] focus:bg-white/[0.06]">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#f8fafc]">Forward To</label>
                <Input
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  placeholder="e.g., user@domain.com"
                  className="h-10 rounded-xl border-white/10 bg-white/[0.04] text-sm text-[#f8fafc] placeholder:text-[#a7b0c3]"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-white/[0.06] px-0 pb-0 pt-4">
              <Button
                variant="outline"
                className="h-10 flex-1 rounded-xl border-white/10 text-[#a7b0c3] hover:text-[#f8fafc]"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <AppButton onClick={handleAdd} className="flex-1">
                <Plus className="mr-1.5 h-4 w-4" />
                Save
              </AppButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard className="p-5">
          <p className="text-sm text-[#a7b0c3]">Total Aliases</p>
          <p className="mt-1 text-2xl font-semibold text-[#f8fafc]">{total}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm text-[#a7b0c3]">Active</p>
          <p className="mt-1 text-2xl font-semibold text-[#f8fafc]">{active}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm text-[#a7b0c3]">Disabled</p>
          <p className="mt-1 text-2xl font-semibold text-[#f8fafc]">{disabled}</p>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7b0c3]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search aliases..."
              className="h-9 rounded-xl border-white/10 bg-white/[0.04] pl-9 text-sm text-[#f8fafc] placeholder:text-[#a7b0c3]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs font-medium uppercase tracking-wider text-[#a7b0c3]">
                <th className="px-5 py-3">Alias Address</th>
                <th className="px-5 py-3">Destination Mailbox</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alias) => (
                <tr
                  key={alias.id}
                  className="border-b border-white/[0.04] transition-colors last:border-b-0 hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <span className="font-medium text-[#f8fafc]">{alias.alias}</span>
                  </td>
                  <td className="px-5 py-4 text-[#c1c6d4]">{alias.destination}</td>
                  <td className="px-5 py-4">
                    <StatusChip status={statusToChip(alias.status)}>
                      {alias.status.charAt(0).toUpperCase() + alias.status.slice(1)}
                    </StatusChip>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 rounded-lg text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06]"
                        onClick={() => handleToggleStatus(alias.id)}
                        title={alias.status === "active" ? "Disable" : "Enable"}
                      >
                        {alias.status === "active" ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 rounded-lg text-[#f87171] hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.1)]"
                        onClick={() => handleDelete(alias.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-[#a7b0c3]">
                    No aliases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4">
          <p className="text-sm text-[#a7b0c3]">
            Showing {filtered.length} of {aliases.length} aliases
          </p>
        </div>
      </GlassCard>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border border-white/[0.06] bg-[rgba(10,16,34,0.96)] backdrop-blur-2xl text-[#f8fafc] sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#f8fafc]">
              {confirmAction?.type === "delete" ? "Delete Alias" : confirmAction?.type === "disable" && aliases.find((a) => a.id === confirmAction?.id)?.status === "active" ? "Disable Alias" : "Enable Alias"}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#a7b0c3]">
              {confirmAction?.type === "delete"
                ? "This action cannot be undone. The alias will be permanently removed."
                : aliases.find((a) => a.id === confirmAction?.id)?.status === "active"
                  ? "The alias will stop forwarding emails to the destination mailbox."
                  : "The alias will resume forwarding emails to the destination mailbox."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-white/[0.06] px-0 pb-0 pt-4">
            <Button
              variant="outline"
              className="h-9 flex-1 rounded-xl border-white/10 text-[#a7b0c3] hover:text-[#f8fafc]"
              onClick={() => {
                setConfirmOpen(false)
                setConfirmAction(null)
              }}
            >
              Cancel
            </Button>
            <AppButton
              variant={confirmAction?.type === "delete" ? "danger" : "primary"}
              className="flex-1"
              onClick={confirmAction?.type === "delete" ? executeDelete : executeToggle}
            >
              {confirmAction?.type === "delete"
                ? "Delete"
                : aliases.find((a) => a.id === confirmAction?.id)?.status === "active"
                  ? "Disable"
                  : "Enable"}
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
