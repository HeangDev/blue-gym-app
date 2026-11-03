"use client"

import { useState } from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export type NewPlan = {
  name: string
  billing: "Monthly" | "Yearly"
  price: number
  status: "Active" | "Archived"
}

type Errors = { name?: string; price?: string }

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
        checked ? "bg-gold" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-4"
        )}
      />
    </button>
  )
}

export function PlanDrawer({
  open,
  onOpenChange,
  existing,
  mode = "create",
  initial,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Plans that already exist, to block the same name with the same billing. */
  existing: { id?: string; name: string; billing: NewPlan["billing"] }[]
  /** "edit" changes an existing plan: pass it as `initial`. */
  mode?: "create" | "edit"
  initial?: NewPlan & { id: string }
  onSubmit: (plan: NewPlan) => void
}) {
  const [name, setName] = useState("")
  const [billing, setBilling] = useState<NewPlan["billing"]>("Monthly")
  const [price, setPrice] = useState("")
  const [status, setStatus] = useState<NewPlan["status"]>("Active")
  const [errors, setErrors] = useState<Errors>({})
  const editing = mode === "edit"

  // fresh form every time the drawer opens (reset while rendering)
  const openKey = open ? (initial?.id ?? "new") : null
  const [seenKey, setSeenKey] = useState<string | null>(null)
  if (openKey !== seenKey) {
    setSeenKey(openKey)
    if (openKey !== null) {
      setName(initial?.name ?? "")
      setBilling(initial?.billing ?? "Monthly")
      setPrice(initial ? String(initial.price) : "")
      setStatus(initial?.status ?? "Active")
      setErrors({})
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    const amount = Number(price)
    const found: Errors = {}

    if (!trimmed) found.name = "Please enter a plan name."
    else if (
      existing.some(
        (p) =>
          p.id !== initial?.id &&
          p.name.toLowerCase() === trimmed.toLowerCase() &&
          p.billing === billing
      )
    ) {
      found.name = `A ${billing.toLowerCase()} plan with this name already exists.`
    }

    if (price.trim() === "") found.price = "Please enter a price."
    else if (!Number.isFinite(amount) || amount < 0) found.price = "Enter a valid price."

    setErrors(found)
    if (Object.keys(found).length) return

    onSubmit({ name: trimmed, billing, price: amount, status })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-hidden rounded-2xl border border-border bg-white! font-(family-name:--font-geist-sans) data-[side=right]:inset-y-3 data-[side=right]:right-3 data-[side=right]:h-auto data-[side=right]:sm:max-w-md">
        <form
          onSubmit={submit}
          noValidate
          autoComplete="off"
          className="flex h-full min-h-0 flex-col"
        >
          <SheetHeader className="border-b border-border px-6 py-5">
            <SheetTitle className="text-lg">
              {editing ? "Edit plan" : "New plan"}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? "Change the name, billing, price or status of this plan."
                : "Add a new subscription plan for your members."}
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 content-start gap-6 overflow-y-auto px-6 py-5">
            <div className="grid gap-2">
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setErrors((c) => ({ ...c, name: undefined }))
                }}
                placeholder="e.g. Pro"
                autoFocus
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Billing</Label>
              <Select
                value={billing}
                onValueChange={(v) => {
                  setBilling(v as NewPlan["billing"])
                  setErrors((c) => ({ ...c, name: undefined }))
                }}
              >
                <SelectTrigger className="w-full" aria-label="Billing">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="plan-price">Price (USD)</Label>
              <Input
                id="plan-price"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value)
                  setErrors((c) => ({ ...c, price: undefined }))
                }}
                placeholder="0.00"
                aria-invalid={Boolean(errors.price)}
                // hide the browser's up/down spinner arrows
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-sm text-muted-foreground">Available for members to join.</p>
              </div>
              <Switch
                checked={status === "Active"}
                onChange={(v) => setStatus(v ? "Active" : "Archived")}
                label="Active"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Archived</p>
                <p className="text-sm text-muted-foreground">
                  Closed to new members, hidden from sign-up.
                </p>
              </div>
              <Switch
                checked={status === "Archived"}
                onChange={(v) => setStatus(v ? "Archived" : "Active")}
                label="Archived"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-ink! text-white! hover:bg-ink/90!">
              {editing ? "Save changes" : "Create plan"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
