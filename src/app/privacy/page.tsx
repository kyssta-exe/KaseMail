import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { KaseLogo } from "@/components/ui/kase-logo"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-[#d1d5db]">
      <div className="mx-auto max-w-3xl">
        <Link href="/login" className="mb-8 inline-flex"><KaseLogo /></Link>
        <GlassCard className="p-8 sm:p-10">
          <p className="text-sm text-[#717b91]">Effective May 24, 2026</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Privacy Policy</h1>
          <div className="mt-8 space-y-6 text-sm leading-7">
            <section><h2 className="text-lg font-semibold text-white">Data We Store</h2><p className="mt-2">KaseMail stores account, workspace, domain, mailbox, alias, session, settings, audit log, and quarantine metadata needed to operate the mail panel.</p></section>
            <section><h2 className="text-lg font-semibold text-white">Email Content</h2><p className="mt-2">Webmail requests are proxied to your configured mail server. Mailbox credentials are submitted for the active session request and are not intentionally persisted by the panel database.</p></section>
            <section><h2 className="text-lg font-semibold text-white">Security</h2><p className="mt-2">Sessions use HTTP-only cookies. Production deployments should use HTTPS, strong secrets, firewall rules, and regular backups.</p></section>
            <section><h2 className="text-lg font-semibold text-white">Your Control</h2><p className="mt-2">You control your self-hosted deployment, database, DNS records, mail server, backups, and retention policies.</p></section>
          </div>
        </GlassCard>
      </div>
    </main>
  )
}
