"use client"

import { cn } from "@/lib/utils"

type StatusChipProps = {
  status: "success" | "warning" | "danger" | "neutral" | "info"
  children: React.ReactNode
  dot?: boolean
}

const statusStyles: Record<string, string> = {
  success: "bg-[rgba(34,197,94,0.10)] text-[#4ade80] border-[rgba(34,197,94,0.20)]",
  warning: "bg-[rgba(245,158,11,0.10)] text-[#fbbf24] border-[rgba(245,158,11,0.20)]",
  danger: "bg-[rgba(239,68,68,0.10)] text-[#f87171] border-[rgba(239,68,68,0.20)]",
  neutral: "bg-[rgba(148,163,184,0.10)] text-[#cbd5e1] border-[rgba(148,163,184,0.16)]",
  info: "bg-[rgba(79,140,255,0.10)] text-[#4f8cff] border-[rgba(79,140,255,0.20)]",
}

const dotStyles: Record<string, string> = {
  success: "bg-[#4ade80]",
  warning: "bg-[#fbbf24]",
  danger: "bg-[#f87171]",
  neutral: "bg-[#cbd5e1]",
  info: "bg-[#4f8cff]",
}

export function StatusChip({ status, children, dot = true }: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
        statusStyles[status]
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[status])} />}
      {children}
    </span>
  )
}

export function statusToChip(s: string): StatusChipProps["status"] {
  const map: Record<string, StatusChipProps["status"]> = {
    healthy: "success",
    active: "success",
    valid: "success",
    pass: "success",
    verified: "success",
    operational: "success",
    excellent: "success",
    primary: "info",
    warning: "warning",
    pending: "warning",
    quarantine: "warning",
    error: "danger",
    danger: "danger",
    invalid: "danger",
    fail: "danger",
    reject: "danger",
    suspended: "danger",
    disabled: "neutral",
    none: "neutral",
  }
  return map[s.toLowerCase()] ?? "neutral"
}
