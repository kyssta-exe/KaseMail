import { cn } from "@/lib/utils"
import Image from "next/image"
import kaseIcon from "./kase-icon.png"

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
          "relative overflow-hidden rounded-xl border border-slate-700 bg-slate-200 shadow-none",
          iconSize
        )}
      >
        <Image src={kaseIcon} alt="KaseMail" fill sizes="40px" className="object-cover" priority={size === "lg"} />
      </div>
      {!iconOnly && (
        <span className={cn("font-semibold tracking-tight text-[#f8fafc]", textSize)}>KaseMail</span>
      )}
    </div>
  )
}
