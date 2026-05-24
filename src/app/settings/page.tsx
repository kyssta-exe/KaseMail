"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/layout/admin-shell"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { StatusChip } from "@/components/ui/status-chip"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { api } from "@/lib/api-service"
import {
  User,
  Shield,
  Globe2,
  Mail,
  Palette,
  Camera,
  Clock,
  Save,
  Plus,
  Monitor,
  Smartphone,
  Laptop,
  Trash2,
  Moon,
  Sun,
  Loader2,
} from "lucide-react"

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "domains", label: "Connected Domains", icon: Globe2 },
  { id: "mail", label: "Mail Preferences", icon: Mail },
  { id: "appearance", label: "Appearance", icon: Palette },
] as const

type TabId = (typeof tabs)[number]["id"]

const timezones = [
  "UTC (Coordinated Universal Time)",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
]

const fontSizes = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile")
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [timezone, setTimezone] = useState("UTC (Coordinated Universal Time)")

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [signature, setSignature] = useState("")
  const [vacationEnabled, setVacationEnabled] = useState(false)
  const [vacationMessage, setVacationMessage] = useState("")
  const [defaultSender, setDefaultSender] = useState("")

  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [compact, setCompact] = useState(false)
  const [fontSize, setFontSize] = useState("md")

  const [connectedDomains, setConnectedDomains] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const [profile, mailPrefs, appearance, security, domains] = await Promise.all([
          api.getProfile(),
          api.getMailPreferences(),
          api.getAppearance(),
          api.getSecuritySettings(),
          api.getDomains(),
        ])
        setFullName(profile.user.displayName || "")
        setEmail(profile.user.email || "")
        if (profile.settings?.timezone) setTimezone(profile.settings.timezone)
        setSignature(mailPrefs.signature || "")
        setVacationEnabled(mailPrefs.vacationEnabled || false)
        setVacationMessage(mailPrefs.vacationMessage || "")
        setDefaultSender(mailPrefs.defaultSender || "")
        setTheme(appearance.theme || "dark")
        setCompact(appearance.compact || false)
        setFontSize(appearance.fontSize || "md")
        setTwoFactorEnabled(security.twoFactorEnabled || false)
        setSessions(security.sessions || [])
        setConnectedDomains(domains || [])
      } catch {
        toast.error("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSaveProfile() {
    try {
      await api.updateProfile({ displayName: fullName, email, timezone })
      toast.success("Profile saved")
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile")
    }
  }

  async function handleSaveMailPrefs() {
    try {
      await api.updateMailPreferences({ signature, vacationEnabled, vacationMessage, defaultSender })
      toast.success("Mail preferences saved")
    } catch (e: any) {
      toast.error(e.message || "Failed to save mail preferences")
    }
  }

  function applyTheme(t: "dark" | "light") {
    document.documentElement.classList.toggle("dark", t === "dark")
    localStorage.setItem("kasemail-theme", t)
  }

  async function handleSaveAppearance() {
    applyTheme(theme)
    try {
      await api.updateAppearance({ theme, compact, fontSize })
      toast.success("Appearance saved")
    } catch (e: any) {
      toast.error(e.message || "Failed to save appearance")
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    try {
      await api.changePassword(currentPassword, newPassword)
      toast.success("Password updated")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (e: any) {
      toast.error(e.message || "Failed to change password")
    }
  }

  async function handleToggle2FA(val: boolean) {
    setTwoFactorEnabled(val)
    try {
      await api.updateSecuritySettings({ twoFactorEnabled: val })
      toast.success(val ? "2FA enabled" : "2FA disabled")
    } catch (e: any) {
      setTwoFactorEnabled(!val)
      toast.error(e.message || "Failed to update 2FA")
    }
  }

  async function handleDeleteSession(sessionId: string) {
    try {
      await api.deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      toast.success("Session revoked")
    } catch (e: any) {
      toast.error(e.message || "Failed to revoke session")
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#a7b0c3]" />
        </div>
      </AdminShell>
    )
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Avatar</h3>
        <div className="flex items-center gap-6">
          <div className="relative h-20 w-20 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-400 text-2xl font-bold text-white">
              {(fullName || email || "S")[0].toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[rgba(15,23,48,0.9)] text-[#a7b0c3] hover:text-[#f8fafc] transition-colors">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="text-sm text-[#d0d5e0]">Upload a photo</p>
            <p className="text-xs text-[#717b91] mt-0.5">PNG, JPG or WebP. Max 2MB.</p>
            <button className="mt-2 text-xs text-[#4f8cff] hover:text-[#6ba3ff] transition-colors">
              Remove avatar
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Personal Information</h3>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#d0d5e0] mb-1.5">Full Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full max-w-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#d0d5e0] mb-1.5">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full max-w-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#d0d5e0] mb-1.5">Timezone</label>
            <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      <Clock className="h-3.5 w-3.5 text-[#a7b0c3]" />
                      {tz}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-2">
            <AppButton onClick={handleSaveProfile} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </AppButton>
          </div>
        </div>
      </GlassCard>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#f8fafc]">Two-Factor Authentication</h3>
            <p className="text-sm text-[#a7b0c3] mt-1">Enhance your account security</p>
          </div>
          <Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Change Password</h3>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#d0d5e0] mb-1.5">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full max-w-md"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#d0d5e0] mb-1.5">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full max-w-md"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#d0d5e0] mb-1.5">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full max-w-md"
              placeholder="Confirm new password"
            />
          </div>
          <div className="pt-2">
            <AppButton onClick={handleChangePassword} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Update Password
            </AppButton>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Active Sessions</h3>
        <div className="space-y-3">
          {sessions.length === 0 && (
            <p className="text-sm text-[#717b91]">No active sessions</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(79,140,255,0.10)]">
                  <Laptop className="h-4 w-4 text-[#4f8cff]" />
                </div>
                <div>
                  <p className="text-sm text-[#f8fafc]">{s.userAgent || "Unknown device"}</p>
                  <p className="text-xs text-[#717b91]">
                    {s.ipAddress || "Unknown IP"} &middot; {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteSession(s.id)}
                className="text-[#717b91] hover:text-[#f87171] transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )

  const renderDomainsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#a7b0c3]">{connectedDomains.length} domains connected</p>
        <AppButton className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Connect Domain
        </AppButton>
      </div>

      <GlassCard className="p-6">
        <div className="space-y-3">
          {connectedDomains.length === 0 && (
            <p className="text-sm text-[#717b91]">No domains connected</p>
          )}
          {connectedDomains.map((d: any) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(148,163,184,0.05)]">
                  <Globe2 className="h-4 w-4 text-[#8b5cf6]" />
                </div>
                <div>
                  <p className="text-sm text-[#f8fafc]">{d.name}</p>
                  {d.status !== "ACTIVE" && (
                    <p className="text-xs text-[#fbbf24] mt-0.5">DNS verification pending</p>
                  )}
                </div>
              </div>
              <StatusChip status={d.status === "ACTIVE" ? "success" : d.status === "SUSPENDED" ? "danger" : "warning"}>
                {d.status}
              </StatusChip>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )

  const renderMailTab = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Email Signature</h3>
        <Textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          className="w-full min-h-[120px]"
          placeholder="Enter your email signature (HTML supported)"
        />
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-[#f8fafc]">Vacation Responder</h3>
            <p className="text-sm text-[#a7b0c3] mt-1">Auto-reply when you're away</p>
          </div>
          <Switch checked={vacationEnabled} onCheckedChange={setVacationEnabled} />
        </div>
        {vacationEnabled && (
          <div>
            <label className="block text-sm font-medium text-[#d0d5e0] mb-1.5">Auto-reply Message</label>
            <Textarea
              value={vacationMessage}
              onChange={(e) => setVacationMessage(e.target.value)}
              className="w-full min-h-[100px]"
              placeholder="I'm currently out of the office..."
            />
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Default Settings</h3>
        <div>
          <label className="block text-sm font-medium text-[#d0d5e0] mb-1.5">Default Sender Name</label>
          <Input
            value={defaultSender}
            onChange={(e) => setDefaultSender(e.target.value)}
            className="w-full max-w-md"
            placeholder="Your display name"
          />
        </div>
      </GlassCard>

      <AppButton onClick={handleSaveMailPrefs} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Save Preferences
      </AppButton>
    </div>
  )

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Theme</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all",
              theme === "dark"
                ? "border-[#8b5cf6]/50 bg-[rgba(148,163,184,0.05)] text-[#f8fafc]"
                : "border-white/[0.06] bg-white/[0.02] text-[#a7b0c3] hover:border-white/20"
            )}
          >
            <Moon className="h-4 w-4" />
            Dark
          </button>
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all",
              theme === "light"
                ? "border-[#8b5cf6]/50 bg-[rgba(148,163,184,0.05)] text-[#f8fafc]"
                : "border-white/[0.06] bg-white/[0.02] text-[#a7b0c3] hover:border-white/20"
            )}
          >
            <Sun className="h-4 w-4" />
            Light
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">View</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setCompact(false)}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all",
              !compact
                ? "border-[#8b5cf6]/50 bg-[rgba(148,163,184,0.05)] text-[#f8fafc]"
                : "border-white/[0.06] bg-white/[0.02] text-[#a7b0c3] hover:border-white/20"
            )}
          >
            Comfortable
          </button>
          <button
            onClick={() => setCompact(true)}
            className={cn(
              "flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all",
              compact
                ? "border-[#8b5cf6]/50 bg-[rgba(148,163,184,0.05)] text-[#f8fafc]"
                : "border-white/[0.06] bg-white/[0.02] text-[#a7b0c3] hover:border-white/20"
            )}
          >
            Compact
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#f8fafc] mb-4">Font Size</h3>
        <Select value={fontSize} onValueChange={(v) => v && setFontSize(v)}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {fontSizes.map((fs) => (
                <SelectItem key={fs.value} value={fs.value}>
                  {fs.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </GlassCard>

      <AppButton onClick={handleSaveAppearance} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        Save Appearance
      </AppButton>
    </div>
  )

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f8fafc] tracking-tight">Settings</h1>
        <p className="text-sm text-[#a7b0c3] mt-0.5">Manage your account and preferences.</p>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all",
                isActive
                  ? "bg-[rgba(148,163,184,0.06)] text-[#f8fafc] shadow-[inset_0_0_0_1px_rgba(139,92,246,0.55)]"
                  : "text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.04]"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "text-[#8b5cf6]")} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "profile" && renderProfileTab()}
      {activeTab === "security" && renderSecurityTab()}
      {activeTab === "domains" && renderDomainsTab()}
      {activeTab === "mail" && renderMailTab()}
      {activeTab === "appearance" && renderAppearanceTab()}
    </AdminShell>
  )
}
