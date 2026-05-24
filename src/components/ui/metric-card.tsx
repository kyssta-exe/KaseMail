"use client"

import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

type MetricCardProps = {
  title: string
  value: string
  icon: string
  trend?: string
  trendTone?: "success" | "warning" | "danger" | "neutral"
  children?: React.ReactNode
}

export function MetricCard({ title, value, icon, trend, trendTone = "neutral", children }: MetricCardProps) {
  const IconComponent = (LucideIcons[icon as keyof typeof LucideIcons] || LucideIcons.Box) as LucideIcon

  return (
    <GlassCard className="p-5 min-w-0">
      <div className="flex items-start justify-between mb-3">
        <div className="rounded-xl bg-[rgba(148,163,184,0.06)] p-2.5">
          <IconComponent className="h-5 w-5 text-[#8b5cf6]" />
        </div>
      </div>
      <p className="text-sm text-[#a7b0c3] mb-1">{title}</p>
      <p className="text-3xl font-bold text-[#f8fafc] tracking-tight">{value}</p>
      {trend && (
        <p
          className={cn(
            "text-xs mt-1.5",
            trendTone === "success" && "text-[#4ade80]",
            trendTone === "warning" && "text-[#fbbf24]",
            trendTone === "danger" && "text-[#f87171]",
            trendTone === "neutral" && "text-[#a7b0c3]"
          )}
        >
          {trend}
        </p>
      )}
      {children}
    </GlassCard>
  )
}
