"use client"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { GlassCard } from "@/components/ui/glass-card"
import { AppButton } from "@/components/ui/app-button"
import { Button } from "@/components/ui/button"
import {
  Minus,
  Expand,
  X,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Image,
  Table,
  MoreHorizontal,
  Paperclip,
  Smile,
  Code,
  Type,
  FileText,
  Send,
  ChevronDown,
  Check,
} from "lucide-react"

type ComposeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ComposeModal({ open, onOpenChange }: ComposeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[1110px] sm:!max-w-[1110px] w-[calc(100%-2rem)] gap-0 rounded-[28px] bg-transparent p-0 !ring-0 !shadow-none border-0"
      >
        <GlassCard glow className="flex flex-row w-full overflow-hidden rounded-[28px]">
          {/* Editor panel */}
          <div className="flex flex-col w-[calc(100%-300px)] min-w-0 border-r border-white/[0.06]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-[#f8fafc]">New message</h2>
              <div className="flex items-center gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded-md text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-md text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
                  <Expand className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* To row */}
            <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/[0.06]">
              <span className="text-sm font-medium text-[#a7b0c3] w-8">To</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8b5cf6]/20 px-3 py-1 text-sm text-[#f8fafc]">
                  <span>Sarah Mitchell</span>
                  <span className="text-[#a7b0c3]">&lt;sarah@acme.com&gt;</span>
                  <button className="text-[#a7b0c3] hover:text-[#f8fafc] transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button className="text-xs font-medium text-[#4f8cff] hover:underline">Cc</button>
                <button className="text-xs font-medium text-[#4f8cff] hover:underline">Bcc</button>
              </div>
            </div>

            {/* Subject row */}
            <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/[0.06]">
              <span className="text-sm font-medium text-[#a7b0c3] w-8">Subject</span>
              <input
                type="text"
                defaultValue="Project update & next steps"
                className="flex-1 bg-transparent text-sm text-[#f8fafc] outline-none placeholder:text-[#717b91]"
              />
            </div>

            {/* Formatting toolbar */}
            <div className="flex items-center gap-0.5 px-4 py-2 border-b border-white/[0.06]">
              <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
                Paragraph
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="mx-1 h-5 w-px bg-white/[0.06]" />
              <ToolbarButton icon={Bold} />
              <ToolbarButton icon={Italic} />
              <ToolbarButton icon={Underline} />
              <ToolbarButton icon={Strikethrough} />
              <div className="mx-1 h-5 w-px bg-white/[0.06]" />
              <ToolbarButton icon={List} />
              <ToolbarButton icon={ListOrdered} />
              <div className="mx-1 h-5 w-px bg-white/[0.06]" />
              <ToolbarButton icon={Link} />
              <ToolbarButton icon={Image} />
              <ToolbarButton icon={Table} />
              <div className="mx-1 h-5 w-px bg-white/[0.06]" />
              <ToolbarButton icon={MoreHorizontal} />
            </div>

            {/* Editor body */}
            <textarea
              defaultValue="Hi Sarah,

I wanted to follow up on our discussion about the project update. I've attached the latest progress report which outlines the key milestones for the next phase of development.

Please take a look and let me know if you have any questions or feedback.

Best regards,
Alex"
              className="flex-1 bg-transparent px-5 py-3 text-sm text-[#d1d5db] outline-none resize-none placeholder:text-[#717b91] leading-relaxed"
            />

            {/* Attachment chip */}
            <div className="flex items-center gap-3 mx-5 mb-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5">
              <FileText className="h-5 w-5 text-[#4f8cff]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#f8fafc] truncate">project-update-may.pdf</p>
              </div>
              <span className="text-xs text-[#717b91] shrink-0">1.2 MB</span>
              <button className="flex h-6 w-6 items-center justify-center rounded-md text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-1">
                <FooterButton icon={Paperclip} />
                <FooterButton icon={Image} />
                <FooterButton icon={Smile} />
                <FooterButton icon={Code} />
                <FooterButton icon={Type} />
              </div>
              <div className="flex items-center gap-2">
                <AppButton variant="secondary" className="h-10 rounded-xl px-4 text-sm">
                  Save draft
                </AppButton>
                <AppButton className="flex items-center gap-2 h-10 rounded-xl px-4">
                  <Send className="h-4 w-4" />
                  Send
                  <ChevronDown className="h-3.5 w-3.5" />
                </AppButton>
              </div>
            </div>
          </div>

          {/* AI side panel */}
          <div className="w-[300px] shrink-0 flex flex-col">
            {/* AI header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#8b5cf6]" />
                <span className="text-sm font-medium text-[#f8fafc]">Kase AI</span>
                <span className="rounded-full bg-[#8b5cf6]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#8b5cf6]">Beta</span>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* AI content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              <h3 className="text-sm font-medium text-[#d1d5db]">Here are a few ways to improve your email.</h3>

              {/* Suggestion 1 */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-medium text-[#f8fafc]">Enhance subject</h4>
                <p className="text-xs text-[#717b91]">Make your subject clearer and more actionable.</p>
                <div className="rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-2 text-sm text-[#c4b5fd]">
                  Project Update: Phase 1 Progress & Next Steps
                </div>
                <button className="text-xs font-medium text-[#4f8cff] hover:underline transition-colors">Apply</button>
              </div>

              {/* Suggestion 2 */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-medium text-[#f8fafc]">Improve clarity</h4>
                <p className="text-xs text-[#717b91]">Your email is clear and well-structured.</p>
                <div className="space-y-1.5">
                  <CheckItem checked>Clear greeting</CheckItem>
                  <CheckItem checked>Key details included</CheckItem>
                  <CheckItem checked>Actionable closing</CheckItem>
                </div>
              </div>

              {/* See more suggestions */}
              <button className="w-full rounded-lg border border-white/[0.08] py-2 text-sm text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.04] transition-colors">
                See more suggestions
              </button>

              {/* Privacy note */}
              <p className="text-xs text-[#717b91] text-center">AI suggestions are private and never stored.</p>
            </div>
          </div>
        </GlassCard>
      </DialogContent>
    </Dialog>
  )
}

function ToolbarButton({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <button className="flex h-7 w-7 items-center justify-center rounded-md text-[#a7b0c3] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}

function FooterButton({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <button className="flex h-7 w-7 items-center justify-center rounded-md text-[#717b91] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors">
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}

function CheckItem({ checked, children }: { checked?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#a7b0c3]">
      <div
        className={cn(
          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border",
          checked ? "border-[#8b5cf6] bg-[#8b5cf6]" : "border-white/20"
        )}
      >
        {checked && <Check className="h-2.5 w-2.5 text-white" />}
      </div>
      {children}
    </div>
  )
}
