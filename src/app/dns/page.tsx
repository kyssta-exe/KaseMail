"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Globe,
  ArrowLeft,
  Shield,
  CheckCircle2,
  Circle,
  Copy,
  ChevronDown,
  Headphones,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  CheckCheck,
} from "lucide-react"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { StatusChip, statusToChip } from "@/components/ui/status-chip"

type WizardStep = {
  id: number
  title: string
  required: boolean
  description: string
  record?: {
    type: string
    host: string
    value: string
    priority?: string
    ttl: string
  }
  status: "verified" | "pending" | "error"
  errorMessage?: string
  isVerifyStep?: boolean
}

const steps: WizardStep[] = [
  {
    id: 1,
    title: "Add MX record",
    required: true,
    description: "Point your domain to KaseMail mail servers.",
    record: { type: "MX", host: "@", value: "mx.kasemail.net", priority: "10", ttl: "3600" },
    status: "verified",
  },
  {
    id: 2,
    title: "Add SPF record",
    required: true,
    description: "Authorize KaseMail to send emails on your behalf.",
    record: { type: "TXT", host: "@", value: "v=spf1 include:spf.kasemail.net ~all", ttl: "3600" },
    status: "verified",
  },
  {
    id: 3,
    title: "Add DKIM record",
    required: true,
    description: "Digitally sign outgoing emails to prevent tampering.",
    record: {
      type: "TXT",
      host: "k1._domainkey",
      value: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...",
      ttl: "3600",
    },
    status: "verified",
  },
  {
    id: 4,
    title: "Add DMARC record",
    required: false,
    description: "Define how receivers should handle unauthenticated email.",
    record: {
      type: "TXT",
      host: "_dmarc",
      value: "v=DMARC1; p=quarantine; rua=mailto:postmaster@acme.com",
      ttl: "3600",
    },
    status: "error",
    errorMessage: "Invalid value or not found",
  },
  {
    id: 5,
    title: "Verify DNS",
    required: true,
    description: "We'll check your DNS settings and activate your domain.",
    status: "pending",
    isVerifyStep: true,
  },
]

const checklistItems = [
  { label: "Add Domain", completed: true },
  { label: "Verify Domain Ownership", completed: true },
  { label: "DNS Setup", active: true, completed: false },
  { label: "Create Mailboxes", completed: false },
  { label: "Send Test Email", completed: false },
]

const cloudflareSteps = [
  "Log in to Cloudflare and select acme.com.",
  "Go to DNS > Records.",
  "Click Add record and choose type, name, and value from wizard.",
  "Set TTL to Auto and save.",
]

function StepBadge({ step, status }: { step: number; status: WizardStep["status"] }) {
  const base =
    "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300"
  if (status === "verified") {
    return (
      <div
        className={cn(
          base,
          "bg-slate-700 text-slate-300 ring-1 ring-slate-600"
        )}
      >
        <CheckCheck className="h-5 w-5" />
      </div>
    )
  }
  if (status === "error") {
    return (
      <div
        className={cn(
          base,
          "bg-slate-700 text-slate-300 ring-1 ring-slate-600"
        )}
      >
        {step}
      </div>
    )
  }
  return (
    <div
      className={cn(
        base,
        "bg-white/[0.04] text-[#5a6276] ring-1 ring-white/10"
      )}
    >
      {step}
    </div>
  )
}

function RecordField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[11px] font-medium uppercase tracking-wider text-[#5a6276]">{label}</span>
      <p className="mt-0.5 text-sm font-mono text-[#cbd5e1] break-all">{value}</p>
    </div>
  )
}

export default function DNSSetupPage() {
  const [providerOpen, setProviderOpen] = useState(true)

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#5a6276]">
          <Link href="/dns" className="transition-colors hover:text-[#a7b0c3]">
            DNS Setup
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-[#a7b0c3]">Add Domain</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">DNS Setup Wizard</h1>
            <p className="mt-1 text-sm text-[#a7b0c3]">
              Follow the steps below to configure your domain and start sending secure email.
            </p>
          </div>
          <AppButton variant="secondary" className="shrink-0 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Exit Wizard
          </AppButton>
        </div>

        {/* Domain Header Card */}
        <GlassCard className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/20">
                <Globe className="h-5 w-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">acme.com</p>
                <button className="text-xs text-[#4f8cff] transition-colors hover:text-[#8b5cf6]">
                  Change Domain
                </button>
              </div>
            </div>
            <div className="flex flex-col items-start gap-1.5 sm:items-end">
              <span className="text-xs font-medium text-[#a7b0c3]">Verification Progress</span>
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10 sm:w-36">
                  <div
                    className="h-full w-[60%] rounded-full bg-gradient-to-r from-slate-500 to-slate-400 shadow-md shadow-black/30 transition-all duration-500"
                  />
                </div>
                <span className="whitespace-nowrap text-xs font-medium text-[#cbd5e1]">3 of 5 verified</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left – Steps */}
          <div className="xl:col-span-2">
            <GlassCard className="p-6">
              <h2 className="mb-6 text-lg font-semibold text-white">Configuration Steps</h2>
              <div className="relative">
                {/* Glowing connecting line */}
                <div className="absolute left-[22px] top-0 h-full w-px bg-gradient-to-b from-slate-500 via-slate-400 to-white/10 shadow-md shadow-black/20" />

                <div className="space-y-0">
                  {steps.map((step, index) => {
                    const isLast = index === steps.length - 1
                    return (
                      <div key={step.id} className={cn("relative flex gap-5", !isLast && "pb-10")}>
                        {/* Badge */}
                        <StepBadge step={step.id} status={step.status} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-white">{step.title}</h3>
                            {step.required ? (
                              <span className="inline-flex items-center rounded-full border border-[#4f8cff]/20 bg-[#4f8cff]/10 px-2 py-0.5 text-[11px] font-medium text-[#4f8cff]">
                                Required
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full border border-[#fbbf24]/20 bg-[#fbbf24]/10 px-2 py-0.5 text-[11px] font-medium text-[#fbbf24]">
                                Recommended
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-[#a7b0c3]">{step.description}</p>

                          {/* DNS Record Card */}
                          {step.record && (
                            <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                              <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                                <RecordField label="Type" value={step.record.type} />
                                <RecordField label="Host / Name" value={step.record.host} />
                                {step.record.priority && (
                                  <RecordField label="Priority" value={step.record.priority} />
                                )}
                                <RecordField label="TTL" value={step.record.ttl} />
                              </div>
                              <div className="mt-3 flex items-start justify-between gap-4">
                                <RecordField label="Value / Points to" value={step.record.value} />
                                <button
                                  onClick={() => handleCopy(step.record!.value, step.record!.type)}
                                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#a7b0c3] transition-colors hover:border-[#4f8cff]/30 hover:text-[#4f8cff]"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Error message */}
                          {step.errorMessage && (
                            <div className="mt-2 flex items-center gap-2">
                              <AlertCircle className="h-3.5 w-3.5 text-[#f87171]" />
                              <span className="text-xs text-[#f87171]">{step.errorMessage}</span>
                              <button className="ml-1 text-xs font-medium text-[#4f8cff] transition-colors hover:text-[#8b5cf6]">
                                View details
                                <ArrowRight className="ml-0.5 inline h-3 w-3" />
                              </button>
                            </div>
                          )}

                          {/* Verify step content */}
                          {step.isVerifyStep && (
                            <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                              <p className="text-sm text-[#a7b0c3]">
                                Run verification to make sure all DNS records are correct and active.
                              </p>
                              <AppButton className="mt-4 gap-2">
                                <Shield className="h-4 w-4" />
                                Verify DNS Now
                              </AppButton>
                            </div>
                          )}
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0 pt-0.5">
                          <StatusChip status={statusToChip(step.status)}>
                            {step.status === "verified"
                              ? "Verified"
                              : step.status === "error"
                                ? "Error"
                                : "Pending"}
                          </StatusChip>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Rail */}
          <div className="space-y-5">
            {/* Onboarding Checklist */}
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Onboarding Checklist</h3>
                <span className="inline-flex items-center rounded-full border border-[#4f8cff]/20 bg-[#4f8cff]/10 px-2.5 py-0.5 text-xs font-medium text-[#4f8cff]">
                  3 of 5 completed
                </span>
              </div>
              <ul className="space-y-2.5">
                {checklistItems.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-[#4ade80]" />
                    ) : item.active ? (
                      <div className="relative flex h-4.5 w-4.5 shrink-0 items-center justify-center">
                        <Circle className="h-4.5 w-4.5 text-[#4f8cff]" />
                        <div className="absolute h-2 w-2 rounded-full bg-[#4f8cff] shadow-[0_0_8px_rgba(79,140,255,0.5)]" />
                      </div>
                    ) : (
                      <Circle className="h-4.5 w-4.5 shrink-0 text-[#3a4158]" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        item.completed
                          ? "text-[#cbd5e1] line-through"
                          : item.active
                            ? "font-medium text-white"
                            : "text-[#5a6276]"
                      )}
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            {/* Provider Tips */}
            <GlassCard className="p-5">
              <button
                onClick={() => setProviderOpen((o) => !o)}
                className="flex w-full items-center justify-between"
              >
                <h3 className="text-sm font-semibold text-white">Provider Tips</h3>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-[#a7b0c3] transition-transform duration-200",
                    providerOpen && "rotate-180"
                  )}
                />
              </button>

              <div className="mt-3">
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
                  <Globe className="h-4 w-4 text-[#4f8cff]" />
                  <span className="text-sm font-medium text-white">Cloudflare</span>
                </div>
              </div>

              {providerOpen && (
                <ol className="mt-3 space-y-2.5">
                  {cloudflareSteps.map((stepText, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-[#a7b0c3]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-medium text-[#5a6276]">
                        {i + 1}
                      </span>
                      <span>{stepText}</span>
                    </li>
                  ))}
                </ol>
              )}

              <button className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#4f8cff] transition-colors hover:text-[#8b5cf6]">
                View detailed guide
                <ExternalLink className="h-3 w-3" />
              </button>
            </GlassCard>

            {/* Need Help */}
            <GlassCard className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700/20">
                  <Headphones className="h-4.5 w-4.5 text-[#8b5cf6]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Need Help?</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#a7b0c3]">
                    Our DNS experts are here to help you every step of the way.
                  </p>
                  <AppButton variant="secondary" className="mt-3 h-9 gap-1.5 rounded-xl px-4 text-xs">
                    Contact Support
                    <ArrowRight className="h-3.5 w-3.5" />
                  </AppButton>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Bottom Banner */}
        <GlassCard className="p-5">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-700/20">
                <Shield className="h-5 w-5 text-[#8b5cf6]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Why these records matter</h3>
                <p className="mt-1 max-w-2xl text-sm text-[#a7b0c3]">
                  Proper DNS records ensure your emails reach the inbox, not the spam folder. They also protect your
                  domain from spoofing and phishing attacks, preserving your sender reputation and deliverability.
                </p>
              </div>
            </div>
            <AppButton variant="secondary" className="shrink-0 gap-2">
              Learn more
              <ArrowRight className="h-4 w-4" />
            </AppButton>
          </div>
        </GlassCard>
      </div>
    </AdminShell>
  )
}
