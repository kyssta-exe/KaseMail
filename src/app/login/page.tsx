"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Globe, Shield, Users, ChevronRight } from "lucide-react"
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

const featureCards = [
  {
    icon: Globe,
    title: "Custom domains",
    helper: "Use your domain, your identity.",
  },
  {
    icon: Lock,
    title: "Private inboxes",
    helper: "Encrypted, secure, and yours alone.",
  },
  {
    icon: Users,
    title: "Admin-managed accounts",
    helper: "Built for teams and organizations.",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      await api.login(email, password)
      toast.success("Signed in")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#050816]">
      {/* Decorative background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.04),transparent_60%)]" />
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.05),transparent_60%)]" />
      </div>

      {/* Left Panel — Hero */}
      <div className="relative z-10 hidden w-full flex-col justify-between px-10 py-10 lg:flex lg:w-[54%] xl:px-16 2xl:px-24">
        {/* Subtle orbital arcs — purely decorative */}
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[700px] w-[700px] opacity-30">
          <svg viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="500" rx="380" ry="160" stroke="url(#orbital1)" strokeWidth="0.8" opacity="0.25" />
            <ellipse cx="200" cy="500" rx="300" ry="120" stroke="url(#orbital2)" strokeWidth="0.6" opacity="0.18" />
            <defs>
              <linearGradient id="orbital1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4f8cff" stopOpacity="0" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#4f8cff" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="orbital2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="50%" stopColor="#4f8cff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Logo */}
        <motion.div {...fadeUp(0.05)} className="relative z-10">
          <KaseLogo size="lg" />
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Hero content area */}
        <div className="relative z-10 max-w-[650px]">
          <motion.h1
            {...fadeUp(0.15)}
            className="text-[68px] font-bold leading-[1.08] tracking-tight text-white 2xl:text-[76px]"
          >
            Private email hosting,
            <br />
            built for{" "}
            <span className="text-slate-200">
              clarity and control.
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.25)}
            className="mt-6 max-w-[520px] text-[20px] leading-[1.55] text-[#a7b0c3] 2xl:text-[22px]"
          >
            KaseMail is private email hosting and webmail for individuals and teams who value privacy, control, and a
            distraction-free inbox.
          </motion.p>

          {/* Feature cards */}
          <motion.div {...fadeUp(0.35)} className="mt-12 flex gap-5">
            {featureCards.map((card) => {
              const Icon = card.icon
              return (
                <GlassCard
                  key={card.title}
                  className="w-[190px] shrink-0 rounded-[18px] p-5"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/20">
                    <Icon className="h-4.5 w-4.5 text-[#8b5cf6]" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-white">{card.title}</h3>
                  <p className="mt-1 text-[13px] leading-snug text-[#a7b0c3]">{card.helper}</p>
                </GlassCard>
              )
            })}
          </motion.div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <motion.div
          {...fadeUp(0.45)}
          className="relative z-10 flex items-center gap-6 pb-2 text-[13px] text-[#5a6276]"
        >
          <span>&copy; 2024 Kase. All rights reserved.</span>
          <span className="h-3 w-px bg-white/8" />
          <button className="transition-colors hover:text-[#a7b0c3]">Privacy</button>
          <span className="h-3 w-px bg-white/8" />
          <button className="transition-colors hover:text-[#a7b0c3]">Terms</button>
        </motion.div>
      </div>

      {/* Thin vertical divider */}
      <div className="relative z-10 hidden w-px bg-white/[0.06] lg:block" />

      {/* Right Panel — Login */}
      <div className="relative z-10 flex w-full items-center justify-center px-6 py-10 lg:w-[46%]">
        {/* Violet glow accent near top-right of card */}
        <div className="pointer-events-none absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.06),transparent_50%)] lg:-right-20" />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease }}
          className="w-full max-w-[560px]"
        >
          <GlassCard glow className="rounded-[34px] px-10 py-12 sm:px-14 sm:py-14">
            {/* Mobile logo — visible only on small screens */}
            <div className="mb-8 flex justify-center lg:hidden">
              <KaseLogo size="md" />
            </div>

            {/* K logo badge */}
            <motion.div {...fadeUp(0.1)} className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-slate-400 text-2xl font-bold text-white shadow-lg shadow-black/40">
                K
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div {...fadeUp(0.18)} className="mt-8 text-center">
              <h1 className="text-[28px] font-bold tracking-tight text-white sm:text-[32px]">Welcome back</h1>
              <p className="mt-2 text-[15px] text-[#a7b0c3]">Sign in to access your inbox.</p>
            </motion.div>

            {/* Form */}
            <motion.form {...fadeUp(0.26)} className="mt-10 space-y-5" onSubmit={handleSubmit}>
              {/* Email field */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-4.5 w-4.5 text-[#5a6276]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@yourdomain.com"
                  className={cn(
                    "h-13 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-[15px] text-white",
                    "placeholder:text-[#5a6276] outline-none transition-all duration-200",
                    "focus:border-[#4f8cff]/40 focus:bg-white/[0.06] focus:shadow-[0_0_24px_rgba(148,163,184,0.04)]"
                  )}
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-4.5 w-4.5 text-[#5a6276]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Enter your password"
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

              {/* Forgot password */}
              <div className="flex justify-end">
                <button className="text-[13px] text-[#5a6276] transition-colors hover:text-[#4f8cff]">
                  Forgot password?
                </button>
              </div>

              {/* Continue button */}
              <AppButton className="relative h-13 w-full rounded-2xl text-[15px] font-semibold" disabled={loading}>
                <span className="flex w-full items-center justify-between">
                  {loading ? "Signing in..." : "Continue"}
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </AppButton>
            </motion.form>

            {/* Divider with dot */}
            <motion.div {...fadeUp(0.34)} className="relative my-10 flex items-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
              <div className="mx-3 h-2 w-2 rounded-full bg-[#4f8cff] shadow-[0_0_12px_rgba(79,140,255,0.5)]" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
            </motion.div>

            {/* Security note */}
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

        {/* Mobile footer */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 text-[12px] text-[#5a6276] lg:hidden">
          <span>&copy; 2024 Kase</span>
          <span className="h-3 w-px bg-white/8" />
          <button className="hover:text-[#a7b0c3]">Privacy</button>
          <span className="h-3 w-px bg-white/8" />
          <button className="hover:text-[#a7b0c3]">Terms</button>
        </div>
      </div>
    </div>
  )
}
