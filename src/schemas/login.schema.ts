import { z } from "zod"

// Takes the translator so error messages follow the active language.
export function createLoginSchema(t: (key: "usernameRequired" | "passwordRequired") => string) {
    return z.object({
        username: z.string().trim().min(1, t("usernameRequired")),
        password: z.string().min(1, t("passwordRequired")),
        remember: z.boolean().optional(),
    })
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>
