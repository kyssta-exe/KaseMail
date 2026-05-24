import { cn } from "@/lib/utils"

type KaseLogoProps = {
  className?: string
  iconOnly?: boolean
  size?: "sm" | "md" | "lg"
}

export function KaseLogo({ className, iconOnly = false, size = "md" }: KaseLogoProps) {
  const iconSize = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8"
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl"

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "rounded-xl border border-slate-700 bg-slate-200 flex items-center justify-center font-bold text-slate-950 shadow-none",
          iconSize
        )}
      >
        K
      </div>
      {!iconOnly && (
        <span className={cn("font-semibold tracking-tight text-[#f8fafc]", textSize)}>KaseMail</span>
      )}
    </div>
  )
}
