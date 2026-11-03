"use client"

import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PromotionStatusSelect } from "@/app/(dashboard)/promotions/_components/promotion-form"
import {
  createPromotionSchema,
  promotionStatuses,
  type PromotionFormValues,
} from "@/schemas/promotion.schema"

export type PromotionFields = {
  name: string
  code: string
  type: string
  status: (typeof promotionStatuses)[number]
  /** undefined = unlimited */
  limit?: number
  startDate: string
  /** null = no end */
  endDate: string | null
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: PromotionFields & { id: string }
  /** Other promotions, to block a duplicate code. */
  existing?: { id: string; code: string }[]
  onSave: (fields: PromotionFields) => void
}

export function PromotionEditDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-border bg-white! font-(family-name:--font-geist-sans) sm:max-w-md">
        {/* mounted only while open, so the form starts fresh every time */}
        <PromotionForm {...props} />
      </DialogContent>
    </Dialog>
  )
}

function PromotionForm({ onOpenChange, initial, existing = [], onSave }: Props) {
  const schema = useMemo(
    () =>
      createPromotionSchema({
        others: existing.filter((p) => p.id !== initial?.id).map((p) => p.code),
      }),
    [existing, initial?.id]
  )

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      code: initial?.code ?? "",
      type: initial?.type ?? "",
      status: initial?.status ?? "Draft",
      limit: initial?.limit === undefined ? "" : String(initial.limit),
      startDate: initial?.startDate ?? "",
      endDate: initial?.endDate ?? "",
    },
  })

  const submit = handleSubmit((v) => {
    onSave({
      name: v.name,
      code: v.code.toUpperCase(),
      type: v.type,
      status: v.status,
      limit: v.limit === "" ? undefined : Number(v.limit),
      startDate: v.startDate,
      endDate: v.endDate || null,
    })
    onOpenChange(false)
  })

  const error = (msg?: string) =>
    msg && <p className="text-xs text-destructive">{msg}</p>

  return (
    <form onSubmit={submit} noValidate autoComplete="off" className="grid gap-4">
      <DialogHeader>
        <DialogTitle className="font-serif text-xl font-normal">
          Edit promotion
        </DialogTitle>
        <DialogDescription>Change this promotion&apos;s details.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="promo-name">Name</Label>
          <Input
            id="promo-name"
            {...register("name")}
            autoFocus
            aria-invalid={Boolean(errors.name)}
          />
          {error(errors.name?.message)}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="promo-code">Code</Label>
          <Input
            id="promo-code"
            {...register("code")}
            autoCapitalize="characters"
            aria-invalid={Boolean(errors.code)}
            className="font-mono"
          />
          {error(errors.code?.message)}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="promo-type">Type</Label>
          <Input
            id="promo-type"
            {...register("type")}
            placeholder="10% off order"
            aria-invalid={Boolean(errors.type)}
          />
          {error(errors.type?.message)}
        </div>
        <div className="grid gap-1.5">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <PromotionStatusSelect value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="promo-limit">Usage limit</Label>
        <Input
          id="promo-limit"
          inputMode="numeric"
          {...register("limit")}
          placeholder="Leave blank for unlimited"
          aria-invalid={Boolean(errors.limit)}
        />
        {error(errors.limit?.message)}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="promo-start">Start date</Label>
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <DatePicker
                id="promo-start"
                value={field.value}
                onChange={field.onChange}
                placeholder="Pick a start date"
                invalid={Boolean(errors.startDate)}
              />
            )}
          />
          {error(errors.startDate?.message)}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="promo-end">End date</Label>
          <Controller
            control={control}
            name="endDate"
            render={({ field }) => (
              <DatePicker
                id="promo-end"
                value={field.value}
                onChange={field.onChange}
                placeholder="No end date"
                clearable
                invalid={Boolean(errors.endDate)}
              />
            )}
          />
          {error(errors.endDate?.message)}
        </div>
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
          Save
        </Button>
      </DialogFooter>
    </form>
  )
}
