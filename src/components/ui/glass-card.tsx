"use client"

import { cn } from "@/lib/utils"

type GlassCardProps = {
  children: React.ReactNode
  className?: string
  glow?: boolean
  as?: React.ElementType
}

export function GlassCard({ children, className, glow = false, as: Component = "div" }: GlassCardProps) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-[20px] shadow-[0_18px_60px_rgba(0,0,0,0.32)]",
        glow && "kase-glow-edge",
        className
      )}
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      {glow && (
        <div
          className="pointer-events-none absolute inset-0 rounded-inherit"
          style={{
            background: "transparent",
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </Component>
  )
}
