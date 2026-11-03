"use client"

import { useEffect, useMemo, useState } from "react"
import {
    AlertTriangleIcon,
    CheckCheckIcon,
    CheckIcon,
    CreditCardIcon,
    ShoppingCartIcon,
    Trash2Icon,
    UserPlusIcon,
    type LucideIcon,
} from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Kind = "order" | "user" | "stock" | "billing"

type Notification = {
    id: number
    kind: Kind
    title: string
    body: string
    time: string
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

const initial: Notification[] = [
    { id: 1, kind: "order", title: "New order #1006", body: "Alice Johnson placed an order of $250.00.", time: "2 min ago", read: false },
    { id: 2, kind: "user", title: "New user registered", body: "Sophea Chan joined Head Office.", time: "1 hr ago", read: false },
    { id: 3, kind: "billing", title: "Payment received", body: "Invoice INV-2041 for the Business plan was paid.", time: "3 hr ago", read: false },
    { id: 4, kind: "stock", title: "Low stock warning", body: "Product SKU-204 has only 4 items left.", time: "Yesterday, 4:12 PM", read: true },
    { id: 5, kind: "order", title: "Order #1004 cancelled", body: "David Brown cancelled an order of $310.00.", time: "Yesterday, 11:40 AM", read: true },
    { id: 6, kind: "billing", title: "Payment failed", body: "The card for Pro plan member Dara Vann was declined.", time: "Oct 30", read: true },
    { id: 7, kind: "user", title: "User suspended", body: "Linda Chea was suspended by an admin.", time: "Oct 28", read: true },
    { id: 8, kind: "stock", title: "Out of stock", body: "USB-C Hub (P-1004) is now out of stock.", time: "Oct 27", read: true },
]

type Tab = "all" | "unread"

export default function NotificationsPage() {
    // sample data loads instantly, so fake a short load to show the skeleton;
    // with a real API, use its loading flag instead
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    const [items, setItems] = useState(initial)
    const [tab, setTab] = useState<Tab>("all")

    const unread = items.filter((n) => !n.read).length
    const data = tab === "all" ? items : items.filter((n) => !n.read)

    const columns = useMemo<ColumnDef<Notification>[]>(
        () => [
            {
                id: "title",
                accessorFn: (n) => `${n.title} ${n.body}`,
                header: "Notification",
                meta: { exportValue: (_v: string, n: Notification) => n.title },
                cell: ({ row }) => {
                    const n = row.original
                    const { icon: Icon, tone } = KINDS[n.kind]
                    return (
                        <div className="flex items-start gap-3 py-0.5">
                            <span
                                className={cn(
                                    "flex size-8 shrink-0 items-center justify-center rounded-full border",
                                    tone
                                )}
                            >
                                <Icon className="size-4" />
                            </span>
                            <div className="min-w-0 whitespace-normal">
                                <p className={n.read ? "" : "font-medium"}>{n.title}</p>
                                <p className="text-xs text-muted-foreground">{n.body}</p>
                            </div>
                        </div>
                    )
                },
            },
            {
                id: "type",
                accessorFn: (n) => KINDS[n.kind].label,
                header: "Type",
                meta: {
                    hideBelow: "sm",
                    filter: {
                        type: "select",
                        label: "Type",
                        options: Object.values(KINDS).map((k) => k.label),
                    },
                },
            },
            {
                accessorKey: "time",
                header: "Time",
                enableSorting: false,
                meta: { hideBelow: "md" },
                cell: ({ getValue }) => (
                    <span className="whitespace-nowrap text-muted-foreground">
                        {getValue<string>()}
                    </span>
                ),
            },
            {
                id: "status",
                accessorFn: (n) => (n.read ? "Read" : "Unread"),
                header: "Status",
                meta: {
                    filter: {
                        type: "select",
                        label: "Status",
                        options: ["Unread", "Read"],
                    },
                },
                cell: ({ getValue }) => {
                    const v = getValue<string>()
                    return (
                        <StatusBadge tone={v === "Unread" ? "danger" : "neutral"}>
                            {v}
                        </StatusBadge>
                    )
                },
            },
        ],
        []
    )

    const rowActions = useMemo<RowAction<Notification>[]>(
        () => [
            {
                label: (n) => (n.read ? "Mark as unread" : "Mark as read"),
                icon: CheckIcon,
                onSelect: (n) =>
                    setItems((cur) =>
                        cur.map((x) => (x.id === n.id ? { ...x, read: !x.read } : x))
                    ),
            },
            {
                label: "Delete",
                icon: Trash2Icon,
                variant: "destructive",
                onSelect: (n) => setItems((cur) => cur.filter((x) => x.id !== n.id)),
                confirm: {
                    title: "Delete notification?",
                    description: (n) => `"${n.title}" will be removed.`,
                    confirmLabel: "Delete",
                },
            },
        ],
        []
    )

    return (
        <>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="font-serif text-3xl tracking-tight">
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

            <div
                role="tablist"
                className="inline-flex w-fit rounded-lg border border-border bg-muted/50 p-0.5"
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

            <Card size="sm" className="ring-gold/25">
                <CardContent>
                    {/* key resets search, sort and page when switching tabs */}
                    <DataTable

                        loading={loading}
                        key={tab}
                        columns={columns}
                        data={data}
                        getRowId={(n) => String(n.id)}
                        rowActions={rowActions}
                        showColumnFilters
                        searchPlaceholder="Search notifications..."
                        pageSizes={[10, 20, 50]}
                    />
                </CardContent>
            </Card>
        </>
    )
}
