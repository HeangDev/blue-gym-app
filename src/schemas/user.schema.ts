import { z } from "zod"

const passwordRules = z
    .string()
    .trim()
    .min(8, "Be at least 8 characters long")
    .regex(/[a-zA-Z]/, "Contain at least one letter.")
    .regex(/[0-9]/, "Contain at least one number.")
    .regex(/[^a-zA-Z0-9]/, "Contain at least one special character.")

const phoneRule = z
    .string()
    .trim()
    // spaces and dashes are allowed for readability: "012 345 678"
    .refine(
        (v) =>
            /^(?:\+855|855|0)(?:10|11|12|15|16|17|18|60|61|66|67|68|69|70|76|77|78|81|85|86|87|89|90|92|93|95|96|97|98|99)\d{6,7}$/.test(
                v.replace(/[\s-]/g, "")
            ),
        "Invalid Cambodia phone number"
    )

type Existing = { id: string; username: string; email: string }

/**
 * Schema for the create / edit user form.
 * - `creating`: the password is required; when editing, blank keeps the current one.
 * - `others`: the other users, to block a duplicate username or email.
 */
export function createUserSchema({
    creating,
    others = [],
}: {
    creating: boolean
    others?: Omit<Existing, "id">[]
}) {
    return z.object({
        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name cannot exceed 100 characters"),
        username: z
            .string()
            .trim()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username cannot exceed 30 characters")
            .regex(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dot, dash or underscore.")
            .refine(
                (v) => !others.some((u) => u.username.toLowerCase() === v.toLowerCase()),
                "This username is already taken."
            ),
        email: z
            .string()
            .trim()
            .min(1, "Email is required")
            .email("Invalid email address")
            .refine(
                (v) => !others.some((u) => u.email.toLowerCase() === v.toLowerCase()),
                "This email is already used."
            ),
        phone: phoneRule,
        password: creating
            ? passwordRules
            : z.union([z.literal(""), passwordRules]),
        role: z.string().min(1),
        status: z.string().min(1),
    })
}

export type UserFormValues = z.infer<ReturnType<typeof createUserSchema>>
