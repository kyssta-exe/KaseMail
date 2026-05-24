"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { StatusChip, statusToChip } from "@/components/ui/status-chip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Users,
  Globe2,
  Mail,
  HardDrive,
  Calendar,
  MoreHorizontal,
  Building2,
} from "lucide-react"
import { api } from "@/lib/api-service"

const fallbackWorkspaces = [
  {
    id: "1",
    name: "Acme Corp",
    members: 24,
    domains: 3,
    mailboxes: 1892,
    status: "active",
    storageUsed: "450 GB",
    createdDate: "Jan 12, 2024",
  },
  {
    id: "2",
    name: "Acme Org",
    members: 12,
    domains: 2,
    mailboxes: 445,
    status: "active",
    storageUsed: "120 GB",
    createdDate: "Feb 03, 2024",
  },
  {
    id: "3",
    name: "Acme Tech",
    members: 5,
    domains: 1,
    mailboxes: 23,
    status: "active",
    storageUsed: "8 GB",
    createdDate: "Apr 10, 2024",
  },
  {
    id: "4",
    name: "Old Workspace",
    members: 0,
    domains: 1,
    mailboxes: 0,
    status: "suspended",
    storageUsed: "0 GB",
    createdDate: "Mar 15, 2023",
  },
]

const summaryCards = [
  { label: "Total Workspaces", value: "4" },
  { label: "Active", value: "3", tone: "success" },
  { label: "Suspended", value: "1", tone: "danger" },
] as const

export default function WorkspacesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState(fallbackWorkspaces)
  const [name, setName] = useState("")

  useEffect(() => {
    api.getWorkspaces()
      .then((items) => setWorkspaces(items.map((w: any) => ({
        id: w.id,
        name: w.name,
        members: w._count?.members ?? 0,
        domains: w._count?.domains ?? 0,
        mailboxes: w._count?.mailboxes ?? 0,
        status: "active",
        storageUsed: "0 GB",
        createdDate: w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "-",
      }))))
      .catch(() => setWorkspaces(fallbackWorkspaces))
  }, [])

  async function handleCreateWorkspace() {
    if (!name.trim()) {
      toast.error("Enter a workspace name")
      return
    }
    try {
      const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      await api.createWorkspace({ name: name.trim(), slug })
      const items = await api.getWorkspaces()
      setWorkspaces(items.map((w: any) => ({
        id: w.id,
        name: w.name,
        members: w._count?.members ?? 0,
        domains: w._count?.domains ?? 0,
        mailboxes: w._count?.mailboxes ?? 0,
        status: "active",
        storageUsed: "0 GB",
        createdDate: w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "-",
      })))
      toast.success("Workspace created successfully")
      setDialogOpen(false)
      setName("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Workspace creation failed")
    }
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f8fafc]">Workspaces</h1>
          <p className="mt-1 text-sm text-[#a7b0c3]">Manage workspaces and organizations.</p>
        </div>
        <AppButton onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Workspace
        </AppButton>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <GlassCard key={card.label} className="p-5">
            <p className="text-sm text-[#a7b0c3]">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-[#f8fafc]">{card.value}</p>
            {"tone" in card && (
              <span
                className={cn(
                  "mt-1 inline-block text-xs font-medium",
                  card.tone === "success" && "text-[#4ade80]",
                  card.tone === "danger" && "text-[#f87171]",
                )}
              >
                {card.tone === "success" ? "Currently active" : "Requires attention"}
              </span>
            )}
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {workspaces.map((workspace) => (
          <GlassCard key={workspace.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#f8fafc]">{workspace.name}</h3>
                  <StatusChip status={statusToChip(workspace.status)}>
                    {workspace.status.charAt(0).toUpperCase() + workspace.status.slice(1)}
                  </StatusChip>
                </div>
              </div>
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-lg text-[#a7b0c3] hover:text-[#f8fafc]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-[#a7b0c3]">
                <Users className="h-4 w-4 shrink-0" />
                <span>{workspace.members} members</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#a7b0c3]">
                <Globe2 className="h-4 w-4 shrink-0" />
                <span>
                  {workspace.domains} {workspace.domains === 1 ? "domain" : "domains"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#a7b0c3]">
                <Mail className="h-4 w-4 shrink-0" />
                <span>{workspace.mailboxes.toLocaleString()} mailboxes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#a7b0c3]">
                <HardDrive className="h-4 w-4 shrink-0" />
                <span>{workspace.storageUsed} used</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-2 text-xs text-[#717b91]">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created {workspace.createdDate}</span>
              </div>
              <Button
                variant="ghost"
                className="h-8 rounded-lg text-xs text-[#4f8cff] hover:bg-[rgba(79,140,255,0.1)] hover:text-[#4f8cff]"
                onClick={() => toast.info(`Managing ${workspace.name}`)}
              >
                Manage
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border border-white/[0.06] bg-[rgba(10,16,34,0.96)] backdrop-blur-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#f8fafc]">
              Create Workspace
            </DialogTitle>
            <DialogDescription className="text-sm text-[#a7b0c3]">
              Create a new workspace and organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#f8fafc]">
                Workspace name
              </label>
              <Input
                placeholder="e.g., Acme Corp"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-10 rounded-xl border-white/10 bg-white/[0.04] text-sm text-[#f8fafc] placeholder:text-[#a7b0c3]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#f8fafc]">
                Description
              </label>
              <Textarea
                placeholder="Brief description of the workspace..."
                className="min-h-[80px] rounded-xl border-white/10 bg-white/[0.04] text-sm text-[#f8fafc] placeholder:text-[#a7b0c3]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#f8fafc]">
                Admin email
              </label>
              <Input
                type="email"
                placeholder="admin@example.com"
                className="h-10 rounded-xl border-white/10 bg-white/[0.04] text-sm text-[#f8fafc] placeholder:text-[#a7b0c3]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <DialogClose className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-[#f8fafc] hover:bg-white/[0.08]">
              Cancel
            </DialogClose>
            <AppButton
              className="flex-1"
              onClick={handleCreateWorkspace}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Create
            </AppButton>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
