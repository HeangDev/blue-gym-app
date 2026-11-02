"use client"

import { useMemo, type ReactNode } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    createNewPromotionSchema,
    promotionMethods,
    promotionTargets,
    promotionValueTypes,
    type NewPromotionFormValues,
} from "@/schemas/promotion.schema"
import { PromotionStatusSelect } from "@/components/promotion-status-select"
import { type NewPromotion } from "../_lib/promotions-store"

// "20% off order", "$5 off shipping"
function describe(v: Pick<NewPromotionFormValues, "appliesTo" | "valueType" | "value">) {
    const n = Number(v.value)
    const amount = Number.isFinite(n) ? n : 0
    const off = v.valueType === "Percentage" ? `${amount}%` : `$${amount}`
    return `${off} off ${v.appliesTo.toLowerCase()}`
}

// A section card: a title, then a bordered box of label / control rows.
function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <Card size="sm" className="bg-muted/40 ring-border">
            <CardHeader>
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-dashed divide-border/80 rounded-xl border border-border bg-white">
                    {children}
                </div>
            </CardContent>
        </Card>
    )
}

function Row({
    label,
    hint,
    htmlFor,
    required,
    info,
    error,
    children,
}: {
    label: string
    hint: string
    htmlFor?: string
    required?: boolean
    info?: string
    error?: string
    children: ReactNode
}) {
    return (
        <div className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_2.3fr] sm:gap-8">
            <div>
                <Label htmlFor={htmlFor} required={required} className="gap-1.5 text-sm font-semibold">
                    {label}
                    {info && (
                        <InfoIcon
                            className="size-3.5 text-muted-foreground"
                            aria-label={info}
                        >
                            <title>{info}</title>
                        </InfoIcon>
                    )}
                </Label>
                <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
            </div>
            <div className="grid content-start gap-1.5 [&_[data-slot=select-trigger]]:rounded-xl">
                {children}
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
        </div>
    )
}

function Choice<T extends string>({
    value,
    onChange,
    options,
    label,
}: {
    value: T
    onChange: (v: T) => void
    options: readonly T[]
    label: string
}) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as T)}>
            <SelectTrigger className="w-full" aria-label={label}>
                <SelectValue>{value}</SelectValue>
            </SelectTrigger>
            <SelectContent>
                {options.map((o) => (
                    <SelectItem key={o} value={o}>
                        {o}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

// The create promotion form: Details, Discount, Schedule and Limits sections,
// with Status in a side card.
export function PromotionForm({
    existingCodes,
    submitLabel,
    onSubmit,
    onCancel,
}: {
    /** Codes that are already taken. */
    existingCodes: string[]
    submitLabel: string
    onSubmit: (promotion: NewPromotion) => void
    onCancel: () => void
}) {
    const schema = useMemo(
        () => createNewPromotionSchema({ others: existingCodes }),
        [existingCodes]
    )

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<NewPromotionFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            code: "",
            method: "Code",
            appliesTo: "Order",
            valueType: "Percentage",
            value: "",
            startDate: "",
            endDate: "",
            limit: "",
            minSubtotal: "",
            status: "Draft",
        },
    })

    const [method, appliesTo, valueType, value] = useWatch({
        control,
        name: ["method", "appliesTo", "valueType", "value"],
    })
    const percent = valueType === "Percentage"

    const submit = handleSubmit((v) =>
        onSubmit({
            name: v.name,
            code: v.method === "Code" ? v.code.toUpperCase() : "",
            method: v.method,
            type: describe(v),
            status: v.status,
            limit: v.limit === "" ? undefined : Number(v.limit),
            minSubtotal: v.minSubtotal === "" ? undefined : Number(v.minSubtotal),
            startDate: v.startDate,
            endDate: v.endDate || null,
        })
    )

    return (
        <form
            onSubmit={submit}
            noValidate
            autoComplete="off"
            className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]"
        >
            <div className="grid gap-4">
                <Section title="Details">
                    <Row
                        label="Name"
                        hint="Internal label for this promotion."
                        htmlFor="promo-name"
                        required
                        error={errors.name?.message}
                    >
                        <Input
                            id="promo-name"
                            {...register("name")}
                            autoFocus
                            placeholder="e.g. Summer sale"
                            aria-invalid={Boolean(errors.name)}
                        />
                    </Row>
                    {method === "Code" && (
                        <Row
                            label="Promo code"
                            hint="What shoppers type at checkout."
                            htmlFor="promo-code"
                            required
                            error={errors.code?.message}
                        >
                            <Input
                                id="promo-code"
                                {...register("code")}
                                autoCapitalize="characters"
                                placeholder="e.g. SUMMER20"
                                aria-invalid={Boolean(errors.code)}
                                className="font-mono"
                            />
                        </Row>
                    )}
                    <Row
                        label="Method"
                        hint="How shoppers get this discount."
                    >
                        <Controller
                            control={control}
                            name="method"
                            render={({ field }) => (
                                <Choice
                                    label="Method"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={promotionMethods}
                                />
                            )}
                        />
                    </Row>
                </Section>

                <Section title="Discount">
                    <Row
                        label="Applies to"
                        hint="What the discount comes off."
                        info="The part of the cart this discount reduces."
                    >
                        <Controller
                            control={control}
                            name="appliesTo"
                            render={({ field }) => (
                                <Choice
                                    label="Applies to"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={promotionTargets}
                                />
                            )}
                        />
                    </Row>
                    <Row
                        label="Value type"
                        hint="Percentage off, or a flat amount off."
                    >
                        <Controller
                            control={control}
                            name="valueType"
                            render={({ field }) => (
                                <Choice
                                    label="Value type"
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={promotionValueTypes}
                                />
                            )}
                        />
                    </Row>
                    <Row
                        label="Value"
                        hint={percent ? "Percentage taken off." : "Amount taken off."}
                        htmlFor="promo-value"
                        required
                        error={errors.value?.message}
                    >
                        <div className="relative">
                            {!percent && (
                                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                                    $
                                </span>
                            )}
                            <Input
                                id="promo-value"
                                inputMode="decimal"
                                {...register("value")}
                                placeholder={percent ? "20" : "5"}
                                aria-invalid={Boolean(errors.value)}
                                className={percent ? "pr-8" : "pl-7"}
                            />
                            {percent && (
                                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                                    %
                                </span>
                            )}
                        </div>
                    </Row>
                    <Row
                        label="Preview"
                        hint="How this reads on the promotions list."
                    >
                        <p className="text-sm font-medium">
                            {describe({ appliesTo, valueType, value })}
                        </p>
                    </Row>
                </Section>

                <Section title="Schedule">
                    <Row
                        label="Starts"
                        hint="The day this promotion becomes redeemable."
                        htmlFor="promo-start"
                        required
                        error={errors.startDate?.message}
                    >
                        <Input
                            id="promo-start"
                            type="date"
                            {...register("startDate")}
                            aria-invalid={Boolean(errors.startDate)}
                        />
                    </Row>
                    <Row
                        label="Ends"
                        hint="Leave empty to run with no end date."
                        htmlFor="promo-end"
                        error={errors.endDate?.message}
                    >
                        <Input
                            id="promo-end"
                            type="date"
                            {...register("endDate")}
                            aria-invalid={Boolean(errors.endDate)}
                        />
                    </Row>
                </Section>

                <Section title="Limits">
                    <Row
                        label="Usage limit"
                        hint="Leave empty for unlimited redemptions."
                        htmlFor="promo-limit"
                        error={errors.limit?.message}
                    >
                        <Input
                            id="promo-limit"
                            inputMode="numeric"
                            {...register("limit")}
                            placeholder="Unlimited"
                            aria-invalid={Boolean(errors.limit)}
                        />
                    </Row>
                    <Row
                        label="Minimum subtotal"
                        hint="Leave empty to qualify on any order."
                        htmlFor="promo-min"
                        error={errors.minSubtotal?.message}
                    >
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                                $
                            </span>
                            <Input
                                id="promo-min"
                                inputMode="decimal"
                                {...register("minSubtotal")}
                                placeholder="No minimum"
                                aria-invalid={Boolean(errors.minSubtotal)}
                                className="pl-7"
                            />
                        </div>
                    </Row>
                </Section>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-border"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-ink! text-white! hover:bg-ink/90!">
                        {submitLabel}
                    </Button>
                </div>
            </div>

            <Card size="sm" className="ring-gold/25 lg:sticky lg:top-4">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                            <PromotionStatusSelect
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </CardContent>
            </Card>
        </form>
    )
}
