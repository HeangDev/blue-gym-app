"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PromotionStatus = "Active" | "Draft" | "Expired" | "Scheduled"

const options: { value: PromotionStatus; hint: string }[] = [
  { value: "Active", hint: "Live and redeemable right now." },
  { value: "Scheduled", hint: "Starts automatically on its start date." },
  { value: "Expired", hint: "Past its end date, no longer redeemable." },
  { value: "Draft", hint: "Saved but not redeemable." },
]

// Status picker: each option has a short explanation under its name.
export function PromotionStatusSelect({
  value,
  onChange,
}: {
  value: PromotionStatus
  onChange: (value: PromotionStatus) => void
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PromotionStatus)}>
      <SelectTrigger className="w-full" aria-label="Status">
        {/* shown explicitly so the trigger holds only the name, not the hint */}
        <SelectValue>{value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-medium">{o.value}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {o.hint}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
