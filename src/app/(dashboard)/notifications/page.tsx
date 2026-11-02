"use client"

import { useState } from "react"
import {
    AlertTriangleIcon,
    BellOffIcon,
    CheckCheckIcon,
    CheckIcon,
    CreditCardIcon,
    ShoppingCartIcon,
    Trash2Icon,
    UserPlusIcon,
    type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Kind = "order" | "user" | "stock" | "billing"
type Group = "Today" | "Yesterday" | "Earlier"

type Notification = {
    id: number
    kind: Kind
    title: string
    body: string
    time: string
    group: Group
    read: boolean
}

// icon + soft colour per notification type
const KINDS: Record<Kind, { label: string; icon: LucideIcon; tone: string }> = {
    order: {
        label: "Orders",
        icon: ShoppingCartIcon,
        tone: "border-gold/30 bg-gold/10 text-gold-dark",
    },
    user: {
        label: "Users",
        icon: UserPlusIcon,
        tone: "border-sky-200 bg-sky-50 text-sky-700",
    },
    stock: {
        label: "Stock",
        icon: AlertTriangleIcon,
        tone: "border-amber-200 bg-amber-50 text-amber-700",
    },
    billing: {
        label: "Billing",
        icon: CreditCardIcon,
        tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
}

const GROUPS: Group[] = ["Today", "Yesterday", "Earlier"]

const initial: Notification[] = [
    { id: 1, kind: "order", title: "New order #1006", body: "Alice Johnson placed an order of $250.00.", time: "2 min ago", group: "Today", read: false },
    { id: 2, kind: "user", title: "New user registered", body: "Sophea Chan joined Head Office.", time: "1 hr ago", group: "Today", read: false },
    { id: 3, kind: "billing", title: "Payment received", body: "Invoice INV-2041 for the Business plan was paid.", time: "3 hr ago", group: "Today", read: false },
    { id: 4, kind: "stock", title: "Low stock warning", body: "Product SKU-204 has only 4 items left.", time: "Yesterday, 4:12 PM", group: "Yesterday", read: true },
    { id: 5, kind: "order", title: "Order #1004 cancelled", body: "David Brown cancelled an order of $310.00.", time: "Yesterday, 11:40 AM", group: "Yesterday", read: true },
    { id: 6, kind: "billing", title: "Payment failed", body: "The card for Pro plan member Dara Vann was declined.", time: "Oct 30", group: "Earlier", read: true },
    { id: 7, kind: "user", title: "User suspended", body: "Linda Chea was suspended by an admin.", time: "Oct 28", group: "Earlier", read: true },
    { id: 8, kind: "stock", title: "Out of stock", body: "USB-C Hub (P-1004) is now out of stock.", time: "Oct 27", group: "Earlier", read: true },
]

type Tab = "all" | "unread"

export default function NotificationsPage() {
    const [items, setItems] = useState(initial)
    const [tab, setTab] = useState<Tab>("all")
    const [kind, setKind] = useState<Kind | "all">("all")

    const unread = items.filter((n) => !n.read).length

    const visible = items.filter(
        (n) =>
            (tab === "all" || !n.read) && (kind === "all" || n.kind === kind)
    )

    const setRead = (id: number, read: boolean) =>
        setItems((cur) => cur.map((n) => (n.id === id ? { ...n, read } : n)))

    return (
        <>
            {/* title with the bulk actions on the same line */}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="font-(family-name:--font-serif) text-3xl tracking-tight">
                        Notifications
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {unread
                            ? `You have ${unread} unread notification${unread === 1 ? "" : "s"}.`
                            : "You're all caught up."}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={unread === 0}
                        onClick={() =>
                            setItems((cur) => cur.map((n) => ({ ...n, read: true })))
                        }
                        className="h-9 gap-1.5 rounded-lg text-[13px]"
                    >
                        <CheckCheckIcon className="size-4" />
                        Mark all read
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={items.length === 0}
                        onClick={() => setItems([])}
                        className="h-9 gap-1.5 rounded-lg text-[13px] text-destructive hover:text-destructive"
                    >
                        <Trash2Icon className="size-4" />
                        Clear all
                    </Button>
                </div>
            </div>

            {/* tabs + type filter chips */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div
                    role="tablist"
                    className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5"
                >
                    {(["all", "unread"] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            role="tab"
                            aria-selected={tab === t}
                            onClick={() => setTab(t)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1 text-[13px] capitalize transition-colors",
                                tab === t
                                    ? "bg-white text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {t}
                            {t === "unread" && unread > 0 && (
                                <span className="rounded-full bg-gold/15 px-1.5 text-[10px] font-medium text-gold-dark">
                                    {unread}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {(["all", ...Object.keys(KINDS)] as const).map((k) => (
                        <button
                            key={k}
                            type="button"
                            aria-pressed={kind === k}
                            onClick={() => setKind(k as Kind | "all")}
                            className={cn(
                                "rounded-full border px-3 py-1 text-xs transition-colors",
                                kind === k
                                    ? "border-gold bg-gold/15 text-gold-dark"
                                    : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
                            )}
                        >
                            {k === "all" ? "All types" : KINDS[k as Kind].label}
                        </button>
                    ))}
                </div>
            </div>

            {visible.length === 0 ? (
                <Card size="sm" className="ring-gold/25">
                    <div className="flex flex-col items-center gap-2 py-14 text-center">
                        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <BellOffIcon className="size-5" />
                        </span>
                        <p className="font-(family-name:--font-serif) text-lg">
                            Nothing here
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {items.length === 0
                                ? "New notifications will show up here."
                                : "No notifications match these filters."}
                        </p>
                    </div>
                </Card>
            ) : (
                GROUPS.map((group) => {
                    const list = visible.filter((n) => n.group === group)
                    if (!list.length) return null
                    return (
                        <section key={group} className="grid gap-2">
                            <h3 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                {group}
                            </h3>
                            <Card size="sm" className="gap-0 py-0 ring-gold/25">
                                <ul className="divide-y divide-border/70">
                                    {list.map((n) => {
                                        const { icon: Icon, tone, label } = KINDS[n.kind]
                                        return (
                                            <li
                                                key={n.id}
                                                className={cn(
                                                    "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-ivory",
                                                    !n.read && "bg-gold/5"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border",
                                                        tone
                                                    )}
                                                >
                                                    <Icon className="size-4" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p
                                                            className={cn(
                                                                "truncate text-sm",
                                                                n.read ? "font-normal" : "font-medium"
                                                            )}
                                                        >
                                                            {n.title}
                                                        </p>
                                                        {!n.read && (
                                                            <span
                                                                aria-label="Unread"
                                                                className="size-1.5 shrink-0 rounded-full bg-rose-500"
                                                            />
                                                        )}
                                                    </div>
                                                    <p className="text-[13px] text-muted-foreground">
                                                        {n.body}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                                                        {label} · {n.time}
                                                    </p>
                                                </div>
                                                {/* per-row actions: always visible on touch, on hover for desktop */}
                                                <div className="flex shrink-0 items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label={n.read ? "Mark as unread" : "Mark as read"}
                                                        title={n.read ? "Mark as unread" : "Mark as read"}
                                                        onClick={() => setRead(n.id, !n.read)}
                                                    >
                                                        <CheckIcon />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label="Delete notification"
                                                        title="Delete"
                                                        onClick={() =>
                                                            setItems((cur) => cur.filter((x) => x.id !== n.id))
                                                        }
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2Icon />
                                                    </Button>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </Card>
                        </section>
                    )
                })
            )}
        </>
    )
}
