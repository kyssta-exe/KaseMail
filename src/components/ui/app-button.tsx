"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { forwardRef, type ComponentPropsWithoutRef } from "react"

type AppButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, "variant"> & {
  variant?: "primary" | "secondary" | "danger"
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "h-12 rounded-xl px-5 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500/50 cursor-pointer",
          variant === "primary" &&
            "bg-slate-200 text-slate-950 hover:bg-slate-300",
          variant === "secondary" &&
            "bg-transparent border border-slate-700 text-slate-200 hover:bg-slate-800",
          variant === "danger" &&
            "bg-red-950/40 border border-red-800/60 text-red-300 hover:bg-red-900/50",
          className
        )}
        {...props}
      />
    )
  }
)
AppButton.displayName = "AppButton"
