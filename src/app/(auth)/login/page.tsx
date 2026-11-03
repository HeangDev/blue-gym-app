"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { z } from "zod"
import {
    EyeIcon,
    EyeOffIcon,
    DumbbellIcon,
    LoaderCircleIcon,
    LockIcon,
    UserIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createLoginSchema } from "@/schemas/login.schema"

const REMEMBER_KEY = "login:remembered-username"

export default function LoginPage() {
    const t = useTranslations("LoginPage")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [remember, setRemember] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({})

    // restore the remembered username (never the password: it must not sit in plain text)
    useEffect(() => {
        try {
            const saved = localStorage.getItem(REMEMBER_KEY)
            if (saved) {
                /* eslint-disable react-hooks/set-state-in-effect -- localStorage only exists in the browser, so this can't be a state initializer (hydration mismatch) */
                setUsername(saved)
                setRemember(true)
                /* eslint-enable react-hooks/set-state-in-effect */
            }
        } catch {
            // storage blocked: just skip remembering
        }
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")

        const result = createLoginSchema(t).safeParse({ username, password, remember })
        if (!result.success) {
            const errors = z.flattenError(result.error).fieldErrors
            setFieldErrors({ username: errors.username?.[0], password: errors.password?.[0] })
            return
        }
        setFieldErrors({})
        setLoading(true)
        try {
            if (remember) localStorage.setItem(REMEMBER_KEY, username)
            else localStorage.removeItem(REMEMBER_KEY)
        } catch {
            // storage blocked: sign in anyway
        }
        try {
            // TODO: call your auth API here, and setError(t("errorMessage")) on failure
            console.log({ username, password })
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="[font-family:var(--font-geist-sans),var(--font-khmer),sans-serif] flex min-h-svh items-center justify-center bg-ivory p-6 sm:p-10">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-ink text-gold-light">
                        <DumbbellIcon className="size-5" />
                    </span>
                    <span className="[font-family:var(--font-serif),var(--font-khmer),serif] text-xl">
                        Gym Admin
                    </span>
                </div>

                <h2 className="[font-family:var(--font-serif),var(--font-khmer),serif] text-3xl leading-snug font-medium">
                    {t("welcome")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t("subtitle")}
                </p>

                <form onSubmit={handleSubmit} autoComplete="off" noValidate className="mt-8 grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="username">{t("username")}</Label>
                        <div className="relative">
                            <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="username"
                                name="username"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value)
                                    setFieldErrors((f) => ({ ...f, username: undefined }))
                                }}
                                aria-invalid={Boolean(fieldErrors.username || error)}
                                aria-describedby={fieldErrors.username ? "username-error" : undefined}
                                className="h-10 bg-white pl-9"
                            />
                        </div>
                        {fieldErrors.username && (
                            <p id="username-error" className="text-xs text-destructive">
                                {fieldErrors.username}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">{t("password")}</Label>
                        </div>
                        <div className="relative">
                            <LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setFieldErrors((f) => ({ ...f, password: undefined }))
                                }}
                                aria-invalid={Boolean(fieldErrors.password || error)}
                                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                                className="h-10 bg-white px-9"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {showPassword ? (
                                    <EyeOffIcon className="size-4" />
                                ) : (
                                    <EyeIcon className="size-4" />
                                )}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <p id="password-error" className="text-xs text-destructive">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            checked={remember}
                            onCheckedChange={(v) => setRemember(v === true)}
                        />
                        <Label htmlFor="remember" className="cursor-pointer font-normal">
                            {t("rememberMe")}
                        </Label>
                    </div>

                    {error && (
                        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-10 w-full gap-2 rounded-lg bg-ink! text-white! hover:bg-ink/90!"
                    >
                        {loading && <LoaderCircleIcon className="size-4 animate-spin" />}
                        {loading ? t("signingIn") : t("loginButton")}
                    </Button>
                </form>
            </div>
        </main>
    )
}
