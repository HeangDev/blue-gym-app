"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type NewPlan = {
  name: string
  billing: "Monthly" | "Yearly"
  price: number
  status: "Active" | "Archived"
}

type Errors = { name?: string; price?: string }

export function PlanCreateDialog({
  open,
  onOpenChange,
  existing,
  mode = "create",
  initial,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Plans that already exist, to block the same name with the same billing. */
  existing: { id?: string; name: string; billing: NewPlan["billing"] }[]
  /** "edit" changes an existing plan: pass it as `initial`. */
  mode?: "create" | "edit"
  initial?: NewPlan & { id: string }
  onCreate: (plan: NewPlan) => void
}) {
  const [name, setName] = useState("")
  const [billing, setBilling] = useState<NewPlan["billing"]>("Monthly")
  const [price, setPrice] = useState("")
  const [status, setStatus] = useState<NewPlan["status"]>("Active")
  const [errors, setErrors] = useState<Errors>({})
  const editing = mode === "edit"

  // fresh form every time the dialog opens
  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? "")
    setBilling(initial?.billing ?? "Monthly")
    setPrice(initial ? String(initial.price) : "")
    setStatus(initial?.status ?? "Active")
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id])

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

    onCreate({ name: trimmed, billing, price: amount, status })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-white! font-(family-name:--font-geist-sans) sm:max-w-sm">
        <form onSubmit={submit} noValidate autoComplete="off" className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-serif) text-xl font-normal">
              {editing ? "Edit plan" : "Create plan"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Change the name, billing, price or status of this plan."
                : "Add a new subscription plan for your members."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Label htmlFor="plan-name" required>Name</Label>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
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

            <div className="grid gap-1.5">
              <Label htmlFor="plan-price" required>Price (USD)</Label>
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
            </div>
          </div>
          {errors.price && (
            <p className="-mt-2 text-xs text-destructive">{errors.price}</p>
          )}

          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as NewPlan["status"])}
            >
              <SelectTrigger className="w-full" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-ink! text-white! hover:bg-ink/90!">
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
