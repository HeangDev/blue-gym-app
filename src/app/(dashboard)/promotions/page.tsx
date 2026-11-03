"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CopyIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    promotionStatuses as statuses,
    removePromotions,
    usePromotions,
    type Promotion,
    type PromotionStatus as Status,
} from "./_lib/promotions-store"

const statusTone = {
    Active: "success",
    Draft: "neutral",
    Expired: "danger",
    Scheduled: "warning",
} as const

const dateFormat = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
})
const fmt = (iso: string) => dateFormat.format(new Date(iso))

const num = (n: number) => n.toLocaleString("en-US")

// two lines: "1,204" / "Unlimited", or "56 / 200" / "used"
const usageLines = (p: Pick<Promotion, "usage" | "limit">) =>
    p.limit === undefined
        ? [num(p.usage), "Unlimited"]
        : [`${num(p.usage)} / ${num(p.limit)}`, "used"]

// two lines: "Jan 1, 2026" / "No end", or "Jun 1, 2026" / "to Aug 10, 2026"
const scheduleLines = (p: Pick<Promotion, "startDate" | "endDate">) => [
    fmt(p.startDate),
    p.endDate ? `to ${fmt(p.endDate)}` : "No end",
]

function TwoLine({ lines }: { lines: string[] }) {
    return (
        <div className="flex flex-col">
            <span className="font-medium">{lines[0]}</span>
            <span className="text-xs text-muted-foreground">{lines[1]}</span>
        </div>
    )
}

const columns: ColumnDef<Promotion>[] = [
    {
        id: "code",
        header: "Code",
        // searchable by both the promotion name and its code
        accessorFn: (p) => `${p.name} ${p.code}`.trim(),
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                    {row.original.code || "Automatic"}
                </span>
            </div>
        ),
        meta: {
            filter: { type: "text", label: "Code" },
            exportValue: (_v: string, p: Promotion) => `${p.name} (${p.code || "Automatic"})`,
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        meta: { hideBelow: "sm" },
    },
    {
        accessorKey: "status",
        header: "Status",
        filterFn: "equalsString",
        meta: {
            filter: { type: "select", label: "Status", options: statuses },
        },
        cell: ({ getValue }) => {
            const status = getValue<Status>()
            return <StatusBadge tone={statusTone[status]}>{status}</StatusBadge>
        },
    },
    {
        accessorKey: "usage",
        header: "Usage",
        meta: {
            hideBelow: "md",
            exportValue: (_v: number, p: Promotion) => usageLines(p).join(" "),
        },
        cell: ({ row }) => <TwoLine lines={usageLines(row.original)} />,
    },
    {
        id: "schedule",
        header: "Schedule",
        accessorFn: (p) => p.startDate,
        meta: {
            hideBelow: "lg",
            exportValue: (_v: string, p: Promotion) => scheduleLines(p).join(" "),
        },
        cell: ({ row }) => <TwoLine lines={scheduleLines(row.original)} />,
    },
]

export default function PromotionsPage() {
    const rows = usePromotions()
    const router = useRouter()
    // sample data loads instantly, so fake a short load to show the skeleton;
    // with a real API, use its loading flag instead
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    const rowActions = useMemo<RowAction<Promotion>[]>(
        () => [
            {
                label: "Edit",
                icon: PencilIcon,
                onSelect: (p) => router.push(`/promotions/${p.id}/edit`),
            },
            {
                label: "Copy code",
                icon: CopyIcon,
                hidden: (p) => !p.code,
                onSelect: (p) => {
                    navigator.clipboard?.writeText(p.code).catch(() => {})
                },
            },
            {
                label: "Delete",
                icon: Trash2Icon,
                variant: "destructive",
                confirm: {
                    title: (p) => `Delete "${p.name}"?`,
                    description: "This removes the promotion and can't be undone.",
                    confirmLabel: "Delete",
                },
                onSelect: (p) => removePromotions([p.id]),
            },
        ],
        [router]
    )

    return (
        <>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="font-serif text-3xl tracking-tight">Promotions</h2>
                    <p className="text-sm text-muted-foreground">
                        Search, filter and manage your discount campaigns.
                    </p>
                </div>
                <Button
                    asChild
                    className="h-9 gap-1.5 rounded-lg bg-ink! px-4 text-[13px] text-white! hover:bg-ink/90!"
                >
                    <Link href="/promotions/create">
                        <PlusIcon className="size-4" />
                        Create promotion
                    </Link>
                </Button>
            </div>

            <Card size="sm" className="ring-gold/25">
                <CardContent className="rounded-none border-t-0">
                    <DataTable
                        columns={columns}
                        data={rows}
                        loading={loading}
                        selection
                        getRowId={(p) => p.id}
                        rowActions={rowActions}
                        onDeleteSelected={(deleted) => {
                            removePromotions(deleted.map((p) => p.id))
                        }}
                        pageSizes={[10, 20, 50]}
                    />
                </CardContent>
            </Card>
        </>
    )
}
