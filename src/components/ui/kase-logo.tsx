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
          "relative overflow-hidden rounded-xl",
          iconSize
        )}
        style={{ filter: "var(--logo-filter)" }}
      >
        <Image src={kaseIcon} alt="KaseMail" fill sizes="40px" className="object-contain" priority={size === "lg"} />
      </div>
      {!iconOnly && (
        <span className={cn("font-semibold tracking-tight", textSize)} style={{ color: "var(--foreground)" }}>
          KaseMail
        </span>
      )}
    </div>
  )
}
