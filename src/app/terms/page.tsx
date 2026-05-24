import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { KaseLogo } from "@/components/ui/kase-logo"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-[#d1d5db]">
      <div className="mx-auto max-w-3xl">
        <Link href="/login" className="mb-8 inline-flex"><KaseLogo /></Link>
        <GlassCard className="p-8 sm:p-10">
          <p className="text-sm text-[#717b91]">Effective May 24, 2026</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Terms of Service</h1>
          <div className="mt-8 space-y-6 text-sm leading-7">
            <section><h2 className="text-lg font-semibold text-white">Self-Hosted Software</h2><p className="mt-2">KaseMail is intended for self-hosted mail administration. You are responsible for your server, DNS, TLS, mail reputation, users, and compliance obligations.</p></section>
            <section><h2 className="text-lg font-semibold text-white">Acceptable Use</h2><p className="mt-2">Do not use KaseMail for spam, phishing, malware distribution, abuse, credential theft, or illegal activity.</p></section>
            <section><h2 className="text-lg font-semibold text-white">No Warranty</h2><p className="mt-2">The software is provided as-is. Always test upgrades, keep backups, and monitor delivery/security logs.</p></section>
            <section><h2 className="text-lg font-semibold text-white">Administration</h2><p className="mt-2">Administrators are responsible for account access, password resets, mailbox lifecycle management, and incident response.</p></section>
          </div>
        </GlassCard>
      </div>
    </main>
  )
}
