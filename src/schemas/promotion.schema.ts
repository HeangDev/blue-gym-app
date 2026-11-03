import { z } from "zod"

export const promotionStatuses = ["Active", "Draft", "Expired", "Scheduled"] as const

/**
 * Schema for the edit promotion form.
 * `others` are the codes of the other promotions, to block duplicates.
 */
export function createPromotionSchema({ others = [] }: { others?: string[] } = {}) {
    return z
        .object({
            name: z
                .string()
                .trim()
                .min(2, "Name must be at least 2 characters")
                .max(100, "Name cannot exceed 100 characters"),
            code: z
                .string()
                .trim()
                .min(3, "Code must be at least 3 characters")
                .max(30, "Code cannot exceed 30 characters")
                .regex(/^[a-zA-Z0-9_-]+$/, "Use letters, numbers, dash or underscore.")
                .refine(
                    (v) => !others.some((c) => c.toLowerCase() === v.toLowerCase()),
                    "This code is already used."
                ),
            type: z.string().trim().min(1, "Type is required, e.g. 10% off order"),
            status: z.enum(promotionStatuses),
            // blank = unlimited
            limit: z
                .string()
                .trim()
                .refine((v) => v === "" || /^[1-9]\d*$/.test(v), "Enter a whole number, or leave blank for unlimited."),
            startDate: z.string().min(1, "Start date is required"),
            // blank = no end
            endDate: z.string(),
        })
        .refine((v) => !v.endDate || v.endDate >= v.startDate, {
            path: ["endDate"],
            message: "End date can't be before the start date.",
        })
}

export type PromotionFormValues = z.infer<ReturnType<typeof createPromotionSchema>>

export const promotionMethods = ["Code", "Automatic"] as const

export const promotionMethodHints: Record<(typeof promotionMethods)[number], string> = {
    Code: "Shoppers enter a promo code at checkout",
    Automatic: "Applied automatically when eligible",
}
export const promotionTargets = [
    "Membership Plan",
    "Registration Fee",
    "Membership Renewal",
    "Products",
    "Specific Product",
    "Specific Member",
] as const

export const promotionTargetHints: Record<(typeof promotionTargets)[number], string> = {
    "Membership Plan": "Membership registration or renewal",
    "Registration Fee": "New member registration fee",
    "Membership Renewal": "Existing member renewal",
    Products: "Gym shop products",
    "Specific Product": "Selected products",
    "Specific Member": "Selected gym members",
}
export const promotionValueTypes = ["Percentage", "Fixed amount"] as const

export const promotionValueTypeHints: Record<(typeof promotionValueTypes)[number], string> = {
    Percentage: "Take a percent off, e.g. 20%",
    "Fixed amount": "Take a flat amount off, e.g. $5",
}

const money = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/

/** Schema for the create promotion page. `others` are the codes already in use. */
export function createNewPromotionSchema({ others = [] }: { others?: string[] } = {}) {
    return z
        .object({
            name: z
                .string()
                .trim()
                .min(2, "Name must be at least 2 characters")
                .max(100, "Name cannot exceed 100 characters"),
            code: z.string().trim(),
            method: z.enum(promotionMethods),
            appliesTo: z.enum(promotionTargets),
            valueType: z.enum(promotionValueTypes),
            value: z.string().trim(),
            startDate: z.string().min(1, "Start date is required"),
            // blank = no end
            endDate: z.string(),
            // blank = unlimited
            limit: z
                .string()
                .trim()
                .refine((v) => v === "" || /^[1-9]\d*$/.test(v), "Enter a whole number, or leave blank for unlimited."),
            // blank = no minimum
            minSubtotal: z
                .string()
                .trim()
                .refine((v) => v === "" || (money.test(v) && Number(v) > 0), "Enter an amount like 25 or 25.50."),
            status: z.enum(promotionStatuses),
        })
        .superRefine((v, ctx) => {
            if (v.method === "Code") {
                if (v.code.length < 3)
                    ctx.addIssue({ code: "custom", path: ["code"], message: "Code must be at least 3 characters" })
                else if (!/^[a-zA-Z0-9_-]+$/.test(v.code))
                    ctx.addIssue({ code: "custom", path: ["code"], message: "Use letters, numbers, dash or underscore." })
                else if (v.code.length > 30)
                    ctx.addIssue({ code: "custom", path: ["code"], message: "Code cannot exceed 30 characters" })
                else if (others.some((c) => c.toLowerCase() === v.code.toLowerCase()))
                    ctx.addIssue({ code: "custom", path: ["code"], message: "This code is already used." })
            }

            const n = Number(v.value)
            if (v.value === "" || !money.test(v.value) || n <= 0)
                ctx.addIssue({ code: "custom", path: ["value"], message: "Enter a value greater than 0." })
            else if (v.valueType === "Percentage" && n > 100)
                ctx.addIssue({ code: "custom", path: ["value"], message: "A percentage can't be more than 100." })

            if (v.endDate && v.endDate < v.startDate)
                ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date can't be before the start date." })
        })
}

export type NewPromotionFormValues = z.infer<ReturnType<typeof createNewPromotionSchema>>
