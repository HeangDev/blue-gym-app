"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    BellIcon,
    BuildingIcon,
    CheckIcon,
    UploadIcon,
    XIcon,
    ShieldCheckIcon,
    type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { applyTheme } from "@/components/layout/sidebar/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type TabId = "general" | "preferences" | "security"

const tabs: { id: TabId; labelKey: "tabGeneral" | "tabNotifications" | "tabSecurity"; icon: LucideIcon }[] = [
    { id: "general", labelKey: "tabGeneral", icon: BuildingIcon },
    { id: "preferences", labelKey: "tabNotifications", icon: BellIcon },
    { id: "security", labelKey: "tabSecurity", icon: ShieldCheckIcon },
]

const cardTitle = "font-serif text-base font-normal"

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
    const initial = {
        name: "Admin",
        email: "admin@example.com",
        phone: "+855 12 345 678",
        username: "admin",
        bio: "Runs day-to-day operations, memberships, and billing across the gym.",
    }
    const [name, setName] = useState(initial.name)
    const [email, setEmail] = useState(initial.email)
    const [phone, setPhone] = useState(initial.phone)
    const [username, setUsername] = useState(initial.username)
    const [bio, setBio] = useState(initial.bio)
    const [photo, setPhoto] = useState(true)
    const [nameError, setNameError] = useState("")

    function cancel() {
        setName(initial.name)
        setEmail(initial.email)
        setPhone(initial.phone)
        setUsername(initial.username)
        setBio(initial.bio)
        setPhoto(true)
        setNameError("")
    }

    function submit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return setNameError(t("nameRequired"))
        setNameError("")
        // TODO: save to your API
        flash()
    }

    // each row: label + note on the left, the control on the right
    const row = "grid gap-2 px-4 py-4 sm:grid-cols-[1fr_2fr] sm:gap-8"
    const rowTitle = "flex flex-wrap items-center gap-2 text-[13px] font-medium"
    const rowDesc = "text-xs text-muted-foreground"
    const control = "w-full max-w-xl"

    return (
        <form onSubmit={submit} noValidate className="grid gap-4">
            <Card size="sm" className="bg-muted/50 ring-gold/25">
                <CardHeader className="py-3">
                    <CardTitle className={cardTitle}>{t("profileTitle")}</CardTitle>
                    <CardDescription className="text-xs">
                        {t("profileDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={row}>
                        <div>
                            <p className={rowTitle}>{t("profilePhoto")}</p>
                            <p className={rowDesc}>{t("profilePhotoDesc")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Avatar className="size-10 ring-2 ring-gold/30">
                                <AvatarFallback
                                    className={cn(
                                        "text-xs font-medium",
                                        photo && "bg-linear-to-br from-gold to-gold-dark text-white"
                                    )}
                                >
                                    {photo ? "AD" : "–"}
                                </AvatarFallback>
                            </Avatar>
                            <Button type="button" variant="outline" className="h-8 gap-1.5 rounded-lg px-3 text-[13px]" onClick={() => setPhoto(true)}>
                                <UploadIcon className="size-3.5" />
                                {t("change")}
                            </Button>
                            <Button type="button" variant="outline" className="h-8 gap-1.5 rounded-lg px-3 text-[13px]" onClick={() => setPhoto(false)}>
                                <XIcon className="size-3.5" />
                                {t("remove")}
                            </Button>
                        </div>
                    </div>

                    <div className={row}>
                        <div>
                            <Label htmlFor="pf-name" className={rowTitle}>{t("fullName")}</Label>
                            <p className={rowDesc}>{t("fullNameDesc")}</p>
                        </div>
                        <div className={control}>
                            <Input
                                id="pf-name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    setNameError("")
                                }}
                                aria-invalid={Boolean(nameError)}
                            />
                            {nameError && <p className="mt-1.5 text-xs text-destructive">{nameError}</p>}
                        </div>
                    </div>

                    <div className={row}>
                        <div>
                            <Label htmlFor="pf-email" className={rowTitle}>
                                {t("emailAddress")}
                                <Badge className="bg-emerald-500/10 text-emerald-700">{t("verified")}</Badge>
                            </Label>
                            <p className={rowDesc}>{t("emailDesc")}</p>
                        </div>
                        <div className={control}>
                            <Input id="pf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div className={row}>
                        <div>
                            <Label htmlFor="pf-phone" className={rowTitle}>{t("phoneNumber")}</Label>
                            <p className={rowDesc}>{t("phoneDesc")}</p>
                        </div>
                        <div className={control}>
                            <Input id="pf-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    </div>

                    <div className={row}>
                        <div>
                            <Label htmlFor="pf-username" className={rowTitle}>{t("username")}</Label>
                            <p className={rowDesc}>{t("usernameDesc")}</p>
                        </div>
                        <div className={control}>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>@</InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput id="pf-username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </InputGroup>
                        </div>
                    </div>

                    <div className={row}>
                        <div>
                            <Label htmlFor="pf-bio" className={rowTitle}>{t("bio")}</Label>
                            <p className={rowDesc}>{t("bioDesc")}</p>
                        </div>
                        <Textarea id="pf-bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={cancel}
                    className="h-9 rounded-lg px-4 text-[13px]"
                >
                    {t("cancel")}
                </Button>
                <SaveButton saved={saved} />
            </div>
        </form>
    )
}

const notificationIds = ["checkins", "renewals", "payments", "failed", "stock"] as const

function NotificationSettings() {
    const t = useTranslations("SettingsPage")
    const [on, setOn] = useState<Record<string, boolean>>({
        checkins: true,
        renewals: true,
        payments: false,
        failed: true,
        stock: false,
    })

    // Display
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
    const [position, setPosition] = useState("left")
    const [reduceMotion, setReduceMotion] = useState(false)
    const [tooltips, setTooltips] = useState(true)

    useEffect(() => {
        try {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTheme((localStorage.getItem("theme") as typeof theme) || "system")
        } catch {}
    }, [])

    function changeTheme(value: typeof theme) {
        setTheme(value)
        try {
            localStorage.setItem("theme", value)
        } catch {}
        applyTheme(value)
    }

    const row = "flex items-center justify-between gap-4 px-4 py-3"
    const rowTitle = "flex flex-wrap items-center gap-2 text-[13px] font-medium"
    const rowDesc = "text-xs text-muted-foreground"

    // Telegram: a report is sent to this chat when the gym closes
    const [tgOn, setTgOn] = useState(false)
    const [botToken, setBotToken] = useState("")
    const [chatId, setChatId] = useState("")
    const [closeTime, setCloseTime] = useState("21:00")

    return (
        <div className="grid gap-4">
            <Card size="sm" className="bg-muted/50 ring-gold/25">
                <CardHeader className="py-3">
                    <CardTitle className={cardTitle}>{t("appNotifTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {notificationIds.map((id) => (
                        <div key={id} className="flex items-center justify-between gap-4 px-4 py-3">
                            <div className="min-w-0">
                                <p className="text-[13px] font-medium">{t(`notif.${id}.title`)}</p>
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

            <Card size="sm" className="bg-muted/50 ring-gold/25">
                <CardHeader className="py-3">
                    <CardTitle className={cardTitle}>{t("tgTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                        <div className="min-w-0">
                            <p className="text-[13px] font-medium">{t("tgToggle")}</p>
                            <p className="text-xs text-muted-foreground">
                                {t("tgToggleNote")}
                            </p>
                        </div>
                        <Toggle
                            label={t("tgToggleAria")}
                            checked={tgOn}
                            onChange={(v) => {
                                setTgOn(v)
                            }}
                        />
                    </div>

                    {tgOn && (
                        <div className="grid gap-4 p-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="tg-token">{t("botToken")}</Label>
                                <Input
                                    id="tg-token"
                                    type="password"
                                    autoComplete="off"
                                    placeholder="123456:ABC-DEF..."
                                    value={botToken}
                                    onChange={(e) => {
                                        setBotToken(e.target.value)
                                    }}
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="tg-chat">{t("chatId")}</Label>
                                <Input
                                    id="tg-chat"
                                    autoComplete="off"
                                    placeholder="-1001234567890"
                                    value={chatId}
                                    onChange={(e) => {
                                        setChatId(e.target.value)
                                    }}
                                />
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
            </Card>

            <Card size="sm" className="bg-muted/50 ring-gold/25">
                <CardHeader className="py-3">
                    <CardTitle className={cardTitle}>{t("display")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={row}>
                        <div>
                            <p className={rowTitle}>{t("colorTheme")}</p>
                            <p className={rowDesc}>{t("colorThemeDesc")}</p>
                        </div>
                        <Select value={theme} onValueChange={(v) => changeTheme(v as typeof theme)}>
                            <SelectTrigger className="w-36" aria-label={t("colorTheme")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">{t("themeLight")}</SelectItem>
                                <SelectItem value="dark">{t("themeDark")}</SelectItem>
                                <SelectItem value="system">{t("themeSystem")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className={row}>
                        <div>
                            <p className={rowTitle}>{t("sidebarPosition")}</p>
                            <p className={rowDesc}>{t("sidebarPositionDesc")}</p>
                        </div>
                        <Select value={position} onValueChange={setPosition}>
                            <SelectTrigger className="w-36" aria-label={t("sidebarPosition")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">{t("left")}</SelectItem>
                                <SelectItem value="right">{t("right")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className={row}>
                        <div>
                            <p className={rowTitle}>
                                {t("reduceAnimations")}
                                <Badge className="bg-amber-500/10 text-amber-700">{t("accessibility")}</Badge>
                            </p>
                            <p className={rowDesc}>{t("reduceAnimationsDesc")}</p>
                        </div>
                        <Toggle checked={reduceMotion} onChange={setReduceMotion} label={t("reduceAnimations")} />
                    </div>
                    <div className={row}>
                        <div>
                            <p className={rowTitle}>{t("showTooltips")}</p>
                            <p className={rowDesc}>{t("showTooltipsDesc")}</p>
                        </div>
                        <Toggle checked={tooltips} onChange={setTooltips} label={t("showTooltips")} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function SecuritySettings() {
    const t = useTranslations("SettingsPage")
    const { saved, flash } = useSaved()
    const [current, setCurrent] = useState("")
    const [next, setNext] = useState("")
    const [confirm, setConfirm] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [pwOpen, setPwOpen] = useState(false)

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
        setPwOpen(false)
    }

    const field = (
        id: "current" | "next" | "confirm",
        label: string,
        value: string,
        set: (v: string) => void,
        autoComplete: string
    ) => (
        <div className="grid gap-1.5">
            <Label htmlFor={`pw-${id}`}>{label}</Label>
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

    const [twoFactor, setTwoFactor] = useState(true)
    const [method, setMethod] = useState("app")
    const [passkey, setPasskey] = useState(false)
    const [alerts, setAlerts] = useState(true)

    const row = "flex items-center justify-between gap-4 px-4 py-3"
    const rowTitle = "flex flex-wrap items-center gap-2 text-[13px] font-medium"
    const rowDesc = "text-xs text-muted-foreground"

    return (
        <div className="grid gap-4">
            <Card size="sm" className="bg-muted/50 ring-gold/25">
                <CardHeader className="py-3">
                    <CardTitle className={cardTitle}>{t("signIn")}</CardTitle>
                </CardHeader>
                <CardContent>
                        <div className={row}>
                            <div>
                                <p className={rowTitle}>{t("password")}</p>
                                <p className={rowDesc}>{t("passwordLastChanged")}</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPwOpen(true)}
                                className="h-8 rounded-lg px-3 text-[13px]"
                            >
                                {t("changePassword")}
                            </Button>
                        </div>

                        <div className={row}>
                            <div>
                                <p className={rowTitle}>
                                    {t("twoFactor")}
                                    <Badge className="bg-emerald-500/10 text-emerald-700">{t("recommended")}</Badge>
                                </p>
                                <p className={rowDesc}>{t("twoFactorDesc")}</p>
                            </div>
                            <Toggle checked={twoFactor} onChange={setTwoFactor} label={t("twoFactor")} />
                        </div>

                        <div className={row}>
                            <div>
                                <p className={rowTitle}>{t("secondStep")}</p>
                                <p className={rowDesc}>{t("secondStepDesc")}</p>
                            </div>
                            <Select value={method} onValueChange={setMethod} disabled={!twoFactor}>
                                <SelectTrigger className="w-44" aria-label={t("secondStep")}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="app">{t("authApp")}</SelectItem>
                                    <SelectItem value="sms">{t("smsCode")}</SelectItem>
                                    <SelectItem value="email">{t("emailCode")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className={row}>
                            <div>
                                <p className={rowTitle}>
                                    {t("passkey")}
                                    <Badge variant="outline">{t("passwordless")}</Badge>
                                </p>
                                <p className={rowDesc}>{t("passkeyDesc")}</p>
                            </div>
                            <Toggle checked={passkey} onChange={setPasskey} label={t("passkey")} />
                        </div>
                </CardContent>
            </Card>

            <Card size="sm" className="bg-muted/50 ring-gold/25">
                <CardHeader className="py-3">
                    <CardTitle className={cardTitle}>{t("activity")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={row}>
                        <div>
                            <p className={rowTitle}>{t("signInAlerts")}</p>
                            <p className={rowDesc}>{t("signInAlertsDesc")}</p>
                        </div>
                        <Toggle checked={alerts} onChange={setAlerts} label={t("signInAlerts")} />
                    </div>
                    <div className={row}>
                        <div>
                            <p className={rowTitle}>{t("activeSessions")}</p>
                            <p className={rowDesc}>{t("activeSessionsDesc")}</p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-8 rounded-lg px-3 text-[13px]"
                        >
                            {t("signOutOthers")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={pwOpen} onOpenChange={setPwOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("passwordTitle")}</DialogTitle>
                        <DialogDescription>{t("passwordDesc")}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} noValidate className="grid gap-4">
                        {field("current", t("currentPassword"), current, setCurrent, "current-password")}
                        {field("next", t("newPassword"), next, setNext, "new-password")}
                        {field("confirm", t("confirmPassword"), confirm, setConfirm, "new-password")}
                        <DialogFooter>
                            <SaveButton saved={saved} />
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function SettingsPage() {
    const t = useTranslations("SettingsPage")
    // the active tab lives in the URL (?tab=security) so other pages can link to it
    const router = useRouter()
    const pathname = usePathname()
    const param = useSearchParams().get("tab")
    const tab: TabId = tabs.some((x) => x.id === param) ? (param as TabId) : "general"
    const setTab = (id: TabId) => router.replace(`${pathname}?tab=${id}`, { scroll: false })

    return (
        <>
            <div>
                <h2 className="font-serif text-3xl tracking-tight">
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
                    {tab === "preferences" && <NotificationSettings />}
                    {tab === "security" && <SecuritySettings />}
                </div>
            </div>
        </>
    )
}
