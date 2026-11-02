"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
    BellIcon,
    BuildingIcon,
    CheckIcon,
    ShieldCheckIcon,
    type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type TabId = "general" | "notifications" | "security"

const tabs: { id: TabId; labelKey: "tabGeneral" | "tabNotifications" | "tabSecurity"; icon: LucideIcon }[] = [
    { id: "general", labelKey: "tabGeneral", icon: BuildingIcon },
    { id: "notifications", labelKey: "tabNotifications", icon: BellIcon },
    { id: "security", labelKey: "tabSecurity", icon: ShieldCheckIcon },
]

const cardTitle = "font-(family-name:--font-serif) text-base font-normal"

// Switch built from a button, so it is keyboard and screen-reader friendly.
function Toggle({
    checked,
    onChange,
    label,
}: {
    checked: boolean
    onChange: (next: boolean) => void
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

// Shows "Saved" for a moment after a save button is pressed.
function useSaved() {
    const [saved, setSaved] = useState(false)
    return {
        saved,
        flash() {
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        },
    }
}

function SaveButton({ saved }: { saved: boolean }) {
    const t = useTranslations("SettingsPage")
    return (
        <Button
            type="submit"
            className="h-9 gap-1.5 rounded-lg bg-ink! px-4 text-[13px] text-white! hover:bg-ink/90!"
        >
            {saved && <CheckIcon className="size-4" />}
            {saved ? t("saved") : t("save")}
        </Button>
    )
}

function GeneralSettings() {
    const t = useTranslations("SettingsPage")
    const { saved, flash } = useSaved()
    const [name, setName] = useState("Blue Gym")
    const [nameError, setNameError] = useState("")

    function submit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return setNameError(t("gymNameRequired"))
        setNameError("")
        // TODO: save to your API
        flash()
    }

    return (
        <form onSubmit={submit} noValidate>
            <Card size="sm" className="ring-gold/25">
                <CardHeader>
                    <CardTitle className={cardTitle}>{t("profileTitle")}</CardTitle>
                    <CardDescription className="text-xs">
                        {t("profileDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5 sm:col-span-2">
                        <Label htmlFor="gym-name" required>{t("gymName")}</Label>
                        <Input
                            id="gym-name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                setNameError("")
                            }}
                            aria-invalid={Boolean(nameError)}
                        />
                        {nameError && (
                            <p className="text-xs text-destructive">{nameError}</p>
                        )}
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="gym-email">{t("contactEmail")}</Label>
                        <Input id="gym-email" type="email" defaultValue="hello@bluegym.com" />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="gym-phone">{t("phone")}</Label>
                        <Input id="gym-phone" type="tel" defaultValue="+855 12 345 678" />
                    </div>
                    <div className="grid gap-1.5 sm:col-span-2">
                        <Label htmlFor="gym-address">{t("address")}</Label>
                        <Textarea
                            id="gym-address"
                            rows={2}
                            defaultValue="No. 12, Street 310, Phnom Penh"
                        />
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <SaveButton saved={saved} />
                </CardFooter>
            </Card>
        </form>
    )
}

const notificationIds = ["checkins", "renewals", "payments", "failed", "stock"] as const

function NotificationSettings() {
    const t = useTranslations("SettingsPage")
    const { saved, flash } = useSaved()
    const [on, setOn] = useState<Record<string, boolean>>({
        checkins: true,
        renewals: true,
        payments: false,
        failed: true,
        stock: false,
    })

    // Telegram: a report is sent to this chat when the gym closes
    const [tgOn, setTgOn] = useState(false)
    const [botToken, setBotToken] = useState("")
    const [chatId, setChatId] = useState("")
    const [closeTime, setCloseTime] = useState("21:00")
    const [tgErrors, setTgErrors] = useState<{ botToken?: string; chatId?: string }>({})

    function submit(e: React.FormEvent) {
        e.preventDefault()
        const found: typeof tgErrors = {}
        if (tgOn) {
            if (!botToken.trim()) found.botToken = t("botTokenRequired")
            if (!chatId.trim()) found.chatId = t("chatIdRequired")
        }
        setTgErrors(found)
        if (Object.keys(found).length) return
        // TODO: save to your API (keep the bot token on the server, never in the browser)
        flash()
    }

    return (
        <form onSubmit={submit} noValidate className="grid gap-4">
            <Card size="sm" className="ring-gold/25">
                <CardHeader>
                    <CardTitle className={cardTitle}>{t("appNotifTitle")}</CardTitle>
                    <CardDescription className="text-xs">
                        {t("appNotifDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-border/70">
                    {notificationIds.map((id) => (
                        <div key={id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                            <div className="min-w-0">
                                <p className="text-sm font-medium">{t(`notif.${id}.title`)}</p>
                                <p className="text-xs text-muted-foreground">{t(`notif.${id}.note`)}</p>
                            </div>
                            <Toggle
                                label={t(`notif.${id}.title`)}
                                checked={on[id]}
                                onChange={(v) => setOn((cur) => ({ ...cur, [id]: v }))}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card size="sm" className="ring-gold/25">
                <CardHeader>
                    <CardTitle className={cardTitle}>{t("tgTitle")}</CardTitle>
                    <CardDescription className="text-xs">
                        {t("tgDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-sm font-medium">{t("tgToggle")}</p>
                            <p className="text-xs text-muted-foreground">
                                {t("tgToggleNote")}
                            </p>
                        </div>
                        <Toggle
                            label={t("tgToggleAria")}
                            checked={tgOn}
                            onChange={(v) => {
                                setTgOn(v)
                                setTgErrors({})
                            }}
                        />
                    </div>

                    {tgOn && (
                        <div className="grid gap-4 border-t border-border/70 pt-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="tg-token" required>{t("botToken")}</Label>
                                <Input
                                    id="tg-token"
                                    type="password"
                                    autoComplete="off"
                                    placeholder="123456:ABC-DEF..."
                                    value={botToken}
                                    onChange={(e) => {
                                        setBotToken(e.target.value)
                                        setTgErrors((c) => ({ ...c, botToken: undefined }))
                                    }}
                                    aria-invalid={Boolean(tgErrors.botToken)}
                                />
                                {tgErrors.botToken && (
                                    <p className="text-xs text-destructive">{tgErrors.botToken}</p>
                                )}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="tg-chat" required>{t("chatId")}</Label>
                                <Input
                                    id="tg-chat"
                                    autoComplete="off"
                                    placeholder="-1001234567890"
                                    value={chatId}
                                    onChange={(e) => {
                                        setChatId(e.target.value)
                                        setTgErrors((c) => ({ ...c, chatId: undefined }))
                                    }}
                                    aria-invalid={Boolean(tgErrors.chatId)}
                                />
                                {tgErrors.chatId && (
                                    <p className="text-xs text-destructive">{tgErrors.chatId}</p>
                                )}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="tg-close">{t("closingTime")}</Label>
                                <Input
                                    id="tg-close"
                                    type="time"
                                    value={closeTime}
                                    onChange={(e) => setCloseTime(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t("closingNote")}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-end">
                    <SaveButton saved={saved} />
                </CardFooter>
            </Card>
        </form>
    )
}

function SecuritySettings() {
    const t = useTranslations("SettingsPage")
    const { saved, flash } = useSaved()
    const [current, setCurrent] = useState("")
    const [next, setNext] = useState("")
    const [confirm, setConfirm] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})

    function submit(e: React.FormEvent) {
        e.preventDefault()
        const found: Record<string, string> = {}
        if (!current) found.current = t("currentRequired")
        if (next.length < 8) found.next = t("minLength")
        if (confirm !== next) found.confirm = t("mismatch")
        setErrors(found)
        if (Object.keys(found).length) return
        // TODO: call your API
        setCurrent("")
        setNext("")
        setConfirm("")
        flash()
    }

    const field = (
        id: "current" | "next" | "confirm",
        label: string,
        value: string,
        set: (v: string) => void,
        autoComplete: string
    ) => (
        <div className="grid gap-1.5">
            <Label htmlFor={`pw-${id}`} required>{label}</Label>
            <Input
                id={`pw-${id}`}
                type="password"
                autoComplete={autoComplete}
                value={value}
                onChange={(e) => {
                    set(e.target.value)
                    setErrors((cur) => ({ ...cur, [id]: "" }))
                }}
                aria-invalid={Boolean(errors[id])}
            />
            {errors[id] && <p className="text-xs text-destructive">{errors[id]}</p>}
        </div>
    )

    return (
        <div className="grid gap-4">
            <form onSubmit={submit} noValidate>
                <Card size="sm" className="ring-gold/25">
                    <CardHeader>
                        <CardTitle className={cardTitle}>{t("passwordTitle")}</CardTitle>
                        <CardDescription className="text-xs">
                            {t("passwordDesc")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid max-w-md gap-4">
                        {field("current", t("currentPassword"), current, setCurrent, "current-password")}
                        {field("next", t("newPassword"), next, setNext, "new-password")}
                        {field("confirm", t("confirmPassword"), confirm, setConfirm, "new-password")}
                    </CardContent>
                    <CardFooter className="justify-end">
                        <SaveButton saved={saved} />
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}

export default function SettingsPage() {
    const t = useTranslations("SettingsPage")
    const [tab, setTab] = useState<TabId>("general")

    return (
        <>
            <div>
                <h2 className="font-(family-name:--font-serif) text-3xl tracking-tight">
                    {t("title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[13rem_1fr] md:gap-6">
                {/* section menu: a row on phones, a column on larger screens */}
                <nav
                    aria-label={t("sections")}
                    className="flex gap-1 overflow-x-auto md:flex-col md:self-start"
                >
                    {tabs.map(({ id, labelKey, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            aria-current={tab === id ? "page" : undefined}
                            onClick={() => setTab(id)}
                            className={cn(
                                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                                tab === id
                                    ? "bg-gold/15 font-medium text-gold-dark"
                                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                            )}
                        >
                            <Icon className="size-4" />
                            {t(labelKey)}
                        </button>
                    ))}
                </nav>

                <div className="min-w-0">
                    {tab === "general" && <GeneralSettings />}
                    {tab === "notifications" && <NotificationSettings />}
                    {tab === "security" && <SecuritySettings />}
                </div>
            </div>
        </>
    )
}
