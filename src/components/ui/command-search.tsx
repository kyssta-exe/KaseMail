"use client"

import { useEffect, useState } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { Globe2, Mail, Send, Network, Shield, LayoutDashboard, Search } from "lucide-react"

type CommandSearchProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mailMode?: boolean
}

export function CommandSearch({ open, onOpenChange, mailMode }: CommandSearchProps) {
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const commands = mailMode
    ? [
        { label: "Search Emails", icon: Search, action: () => {} },
        { label: "Compose New Email", icon: Mail, action: () => {} },
      ]
    : [
        { label: "Add Domain", icon: Globe2, action: () => router.push("/domains") },
        { label: "Create Mailbox", icon: Mail, action: () => router.push("/mailboxes") },
        { label: "Add Alias", icon: Send, action: () => router.push("/aliases") },
        { label: "Open DNS Setup", icon: Network, action: () => router.push("/dns") },
        { label: "Open Quarantine", icon: Shield, action: () => router.push("/security/quarantine") },
        { label: "Open Dashboard", icon: LayoutDashboard, action: () => router.push("/dashboard") },
      ]

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {commands.map((cmd) => (
            <CommandItem
              key={cmd.label}
              onSelect={() => {
                cmd.action()
                onOpenChange(false)
              }}
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              <span>{cmd.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
