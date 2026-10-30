import { cn } from "@/lib/utils"

type Tone = "success" | "warning" | "danger" | "neutral"

const TONES: Record<Tone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  neutral: "border-border bg-muted/60 text-muted-foreground",
}

// Soft, bordered pill with a status dot, for status columns.
export function StatusBadge({
  tone = "neutral",
  children,
}: {
  tone?: Tone
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-px text-[11px] font-medium",
        TONES[tone]
      )}
    >
      <span aria-hidden className="size-1 rounded-full bg-current" />
      {children}
    </span>
  )
}
