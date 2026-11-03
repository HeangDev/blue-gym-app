"use client"

import { useMemo, type ReactNode } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group"
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
    promotionMethodHints,
    promotionMethods,
    promotionTargetHints,
    promotionTargets,
    promotionValueTypeHints,
    promotionValueTypes,
    type NewPromotionFormValues,
} from "@/schemas/promotion.schema"
import { type NewPromotion, type Promotion } from "../_lib/promotions-store"

// "20% off order", "$5 off shipping"
function describe(v: Pick<NewPromotionFormValues, "appliesTo" | "valueType" | "value">) {
    const n = Number(v.value)
    const amount = Number.isFinite(n) ? n : 0
    const off = v.valueType === "Percentage" ? `${amount}%` : `$${amount}`
    return `${off} off ${v.appliesTo.toLowerCase()}`
}

// Reverse of describe(): "20% off order" -> Percentage / 20. Types that don't
// follow that pattern (e.g. "Free shipping") leave the value blank to fill in.
function parseType(
    type: string
): Pick<NewPromotionFormValues, "appliesTo" | "valueType" | "value"> {
    const m = /^(\$)?(\d+(?:\.\d+)?)(%)? off (.+)$/i.exec(type.trim())
    const appliesTo =
        promotionTargets.find((t) => t.toLowerCase() === m?.[4]?.toLowerCase()) ??
        "Membership Plan"
    if (!m) return { appliesTo, valueType: "Percentage", value: "" }
    return {
        appliesTo,
        valueType: m[3] ? "Percentage" : "Fixed amount",
        value: m[2],
    }
}

// A section card: a title, then a bordered box of label / control rows.
function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <Card size="sm" className="bg-muted/40 ring-border">
            <CardHeader>
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}

function Row({
    label,
    hint,
    htmlFor,
    info,
    error,
    children,
}: {
    label: string
    hint: string
    htmlFor?: string
    info?: string
    error?: string
    children: ReactNode
}) {
    return (
        <div className="grid items-center gap-3 px-5 py-4 sm:grid-cols-[1fr_2.3fr] sm:gap-8">
            <div>
                <Label htmlFor={htmlFor} className="gap-1.5 text-sm font-semibold">
                    {label}
                </Label>
                <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
            </div>
            <div className="grid content-center gap-1.5">
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
    hints,
}: {
    value: T
    onChange: (v: T) => void
    options: readonly T[]
    label: string
    hints?: Partial<Record<T, string>>
}) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as T)}>
            <SelectTrigger className="w-full" aria-label={label}>
                <SelectValue>{value}</SelectValue>
            </SelectTrigger>
            <SelectContent maxHeight={hints ? 144 : undefined}>
                {options.map((o) => (
                    <SelectItem key={o} value={o}>
                        {hints?.[o] ? (
                            <span className="grid text-left">
                                <span>{o}</span>
                                <span className="text-xs text-muted-foreground">
                                    {hints[o]}
                                </span>
                            </span>
                        ) : (
                            o
                        )}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

type PromotionStatus = "Active" | "Draft" | "Expired" | "Scheduled"

const statusOptions: { value: PromotionStatus; hint: string }[] = [
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
            <SelectContent maxHeight={144}>
                {statusOptions.map((o) => (
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

// The create promotion form: Details, Discount, Schedule and Limits sections,
// with Status in a side card.
export function PromotionForm({
    existingCodes,
    initial,
    onSubmit,
}: {
    /** Codes that are already taken. */
    existingCodes: string[]
    /** Fill the form with this promotion (edit mode). */
    initial?: Promotion
    onSubmit: (promotion: NewPromotion) => void
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
            name: initial?.name ?? "",
            code: initial?.code ?? "",
            method: initial?.method ?? "Code",
            ...(initial
                ? parseType(initial.type)
                : {
                      appliesTo: "Membership Plan" as const,
                      valueType: "Percentage" as const,
                      value: "",
                  }),
            startDate: initial?.startDate ?? "",
            endDate: initial?.endDate ?? "",
            limit: initial?.limit === undefined ? "" : String(initial.limit),
            minSubtotal:
                initial?.minSubtotal === undefined ? "" : String(initial.minSubtotal),
            status: initial?.status ?? "Draft",
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
            id="promotion-form"
            onSubmit={submit}
            noValidate
            autoComplete="off"
            className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]"
        >
            <div className="grid gap-4">
                <Section title="Details">
                    <Row
                        label="Name"
                        hint="Internal label for this promotion."
                        htmlFor="promo-name"
                        error={errors.name?.message}
                    >
                        <Input
                            id="promo-name"
                            {...register("name")}
                            autoFocus={!initial}
                            placeholder="e.g. Summer sale"
                            aria-invalid={Boolean(errors.name)}
                        />
                    </Row>
                    {method === "Code" && (
                        <Row
                            label="Promo code"
                            hint="What shoppers type at checkout."
                            htmlFor="promo-code"
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
                                    hints={promotionMethodHints}
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
                                    hints={promotionTargetHints}
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
                                    hints={promotionValueTypeHints}
                                />
                            )}
                        />
                    </Row>
                    <Row
                        label="Value"
                        hint={percent ? "Percentage taken off." : "Amount taken off."}
                        htmlFor="promo-value"
                        error={errors.value?.message}
                    >
                        <InputGroup>
                            {!percent && (
                                <InputGroupAddon>
                                    <InputGroupText>$</InputGroupText>
                                </InputGroupAddon>
                            )}
                            <InputGroupInput
                                id="promo-value"
                                inputMode="decimal"
                                {...register("value")}
                                placeholder={percent ? "20" : "5"}
                                aria-invalid={Boolean(errors.value)}
                            />
                            {percent && (
                                <InputGroupAddon align="inline-end">
                                    <InputGroupText>%</InputGroupText>
                                </InputGroupAddon>
                            )}
                        </InputGroup>
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
                        error={errors.startDate?.message}
                    >
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
                    </Row>
                    <Row
                        label="Ends"
                        hint="Leave empty to run with no end date."
                        htmlFor="promo-end"
                        error={errors.endDate?.message}
                    >
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
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>$</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="promo-min"
                                inputMode="decimal"
                                {...register("minSubtotal")}
                                placeholder="No minimum"
                                aria-invalid={Boolean(errors.minSubtotal)}
                            />
                        </InputGroup>
                    </Row>
                </Section>
            </div>

            <Card size="sm" className="ring-gold/25 lg:sticky lg:top-4">
                <CardHeader>
                    <CardTitle className="text-sm font-semibold">Status</CardTitle>
                </CardHeader>
                <CardContent className="divide-y-0 p-4">
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
