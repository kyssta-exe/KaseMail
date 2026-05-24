"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { KaseLogo } from "@/components/ui/kase-logo"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { api } from "@/lib/api-service"

const ease = [0.21, 0.47, 0.32, 0.98] as const

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease, delay } },
})

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const tokenParam = token ?? ""

  if (!token) {
    return (
      <div className="relative flex min-h-screen w-full overflow-hidden bg-[#050816]">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.04),transparent_60%)]" />
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.05),transparent_60%)]" />
        </div>
        <div className="relative z-10 flex w-full items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease }}
            className="w-full max-w-[560px]"
          >
            <GlassCard glow className="rounded-[34px] px-10 py-12 sm:px-14 sm:py-14">
              <motion.div {...fadeUp(0.1)} className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-400 text-2xl font-bold text-white shadow-lg shadow-black/40">
                  K
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.18)} className="mt-8 text-center">
                <h1 className="text-[28px] font-bold tracking-tight text-white sm:text-[32px]">Invalid reset link</h1>
                <p className="mt-2 text-[15px] text-[#a7b0c3]">
                  This password reset link is missing or invalid. Please request a new one.
                </p>
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      await api.resetPassword(tokenParam, password)
      setSuccess(true)
      toast.success("Password reset successful")
      setTimeout(() => router.push("/login"), 3000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reset failed")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen w-full overflow-hidden bg-[#050816]">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.04),transparent_60%)]" />
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.05),transparent_60%)]" />
        </div>
        <div className="relative z-10 flex w-full items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease }}
            className="w-full max-w-[560px]"
          >
            <GlassCard glow className="rounded-[34px] px-10 py-12 sm:px-14 sm:py-14">
              <motion.div {...fadeUp(0.1)} className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-400 text-2xl font-bold text-white shadow-lg shadow-black/40">
                  K
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.18)} className="mt-8 text-center">
                <h1 className="text-[28px] font-bold tracking-tight text-white sm:text-[32px]">Password reset</h1>
                <p className="mt-2 text-[15px] text-[#a7b0c3]">
                  Password reset successful. Redirecting to login...
                </p>
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#050816]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.04),transparent_60%)]" />
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.05),transparent_60%)]" />
      </div>

      <div className="relative z-10 flex w-full items-center justify-center px-6 py-10">
        <div className="pointer-events-none absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.06),transparent_50%)] lg:-right-20" />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease }}
          className="w-full max-w-[560px]"
        >
          <GlassCard glow className="rounded-[34px] px-10 py-12 sm:px-14 sm:py-14">
            <div className="mb-8 flex justify-center lg:hidden">
              <KaseLogo size="md" />
            </div>

            <motion.div {...fadeUp(0.1)} className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-400 text-2xl font-bold text-white shadow-lg shadow-black/40">
                K
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.18)} className="mt-8 text-center">
              <h1 className="text-[28px] font-bold tracking-tight text-white sm:text-[32px]">Reset your password</h1>
              <p className="mt-2 text-[15px] text-[#a7b0c3]">Enter your new password below.</p>
            </motion.div>

            <motion.form {...fadeUp(0.26)} className="mt-10 space-y-5" onSubmit={handleSubmit}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-4.5 w-4.5 text-[#5a6276]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  placeholder="New password"
                  className={cn(
                    "h-13 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-12 text-[15px] text-white",
                    "placeholder:text-[#5a6276] outline-none transition-all duration-200",
                    "focus:border-[#4f8cff]/40 focus:bg-white/[0.06] focus:shadow-[0_0_24px_rgba(148,163,184,0.04)]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#5a6276] transition-colors hover:text-[#a7b0c3]"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-4.5 w-4.5 text-[#5a6276]" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  placeholder="Confirm new password"
                  className={cn(
                    "h-13 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-12 text-[15px] text-white",
                    "placeholder:text-[#5a6276] outline-none transition-all duration-200",
                    "focus:border-[#4f8cff]/40 focus:bg-white/[0.06] focus:shadow-[0_0_24px_rgba(148,163,184,0.04)]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#5a6276] transition-colors hover:text-[#a7b0c3]"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              <AppButton className="relative h-13 w-full rounded-2xl text-[15px] font-semibold" disabled={loading}>
                <span className="flex w-full items-center justify-between">
                  {loading ? "Resetting..." : "Reset password"}
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </AppButton>
            </motion.form>

            <motion.div {...fadeUp(0.34)} className="relative my-10 flex items-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
              <div className="mx-3 h-2 w-2 rounded-full bg-[#4f8cff] shadow-[0_0_12px_rgba(79,140,255,0.5)]" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
            </motion.div>

            <motion.div {...fadeUp(0.42)} className="text-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/6 bg-white/[0.03] px-5 py-2.5">
                <Shield className="h-4 w-4 text-[#4f8cff]" />
                <div className="text-left text-[13px] leading-snug text-[#5a6276]">
                  <span className="block text-white/70">Private access only</span>
                  All connections are encrypted end-to-end.
                </div>
              </div>
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
