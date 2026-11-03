"use client"

import { useEffect, useMemo, useState } from "react"
import { PencilIcon, PlusIcon, ToggleRightIcon, Trash2Icon } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import { PlanDrawer, type NewPlan } from "@/components/plan-drawer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Status = "Active" | "Archived"
type Billing = "Monthly" | "Yearly"

type Plan = {
    id: string
    name: string
    billing: Billing
    price: number
    members: number
    status: Status
}

const statuses: Status[] = ["Active", "Archived"]

const plans: Plan[] = [
    { id: "PL-01", name: "Free", billing: "Monthly", price: 0, members: 412, status: "Active" },
    { id: "PL-02", name: "Pro", billing: "Monthly", price: 12, members: 186, status: "Active" },
    { id: "PL-03", name: "Pro", billing: "Yearly", price: 120, members: 94, status: "Active" },
    { id: "PL-04", name: "Business", billing: "Monthly", price: 49, members: 58, status: "Active" },
    { id: "PL-05", name: "Business", billing: "Yearly", price: 490, members: 31, status: "Active" },
    { id: "PL-06", name: "Enterprise", billing: "Yearly", price: 1500, members: 7, status: "Active" },
    { id: "PL-07", name: "Starter", billing: "Monthly", price: 5, members: 23, status: "Archived" },
    { id: "PL-08", name: "Starter", billing: "Yearly", price: 50, members: 11, status: "Archived" },
]

const statusTone = {
    Active: "success",
    Archived: "warning",
} as const

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
})

const columns: ColumnDef<Plan>[] = [
    {
        accessorKey: "name",
        header: "Plan",
        cell: ({ getValue }) => (
            <span className="font-medium">{getValue<string>()}</span>
        ),
    },
    {
        accessorKey: "billing",
        header: "Billing",
        meta: { hideBelow: "sm" },
    },
    {
        accessorKey: "status",
        header: "Status",
        filterFn: "equalsString",
        meta: {
            hideBelow: "sm",
            filter: { type: "select", label: "Status", options: statuses },
        },
        cell: ({ getValue }) => {
            const status = getValue<Status>()
            return <StatusBadge tone={statusTone[status]}>{status}</StatusBadge>
        },
    },
    {
        accessorKey: "price",
        header: "Price",
        meta: {
            align: "right",
            exportValue: (v: number) => currency.format(v),
        },
        cell: ({ getValue }) => currency.format(getValue<number>()),
    },
]

export default function PlansPage() {
    // sample data loads instantly, so fake a short load to show the skeleton;
    // with a real API, use its loading flag instead
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    const [rows, setRows] = useState(plans)
    const [createOpen, setCreateOpen] = useState(false)
    // the plan being edited (opens the edit drawer)
    const [editing, setEditing] = useState<Plan | null>(null)

    function handleCreate(plan: NewPlan) {
        // next id: highest existing PL-number + 1
        const next = Math.max(0, ...rows.map((r) => Number(r.id.slice(3)))) + 1
        const id = `PL-${String(next).padStart(2, "0")}`
        setRows((cur) => [...cur, { id, members: 0, ...plan }])
    }

    // custom row actions: each handler gets the plan of the clicked row
    const rowActions = useMemo<RowAction<Plan>[]>(
        () => [
            {
                label: "Edit",
                icon: PencilIcon,
                onSelect: (p) => setEditing(p),
            },
            {
                label: (p) => (p.status === "Active" ? "Archive" : "Restore"),
                icon: ToggleRightIcon,
                onSelect: (p) =>
                    setRows((cur) =>
                        cur.map((r) =>
                            r.id === p.id
                                ? { ...r, status: r.status === "Active" ? "Archived" : "Active" }
                                : r
                        )
                    ),
            },
            {
                label: "Delete",
                icon: Trash2Icon,
                variant: "destructive",
                confirm: {
                    title: (p) => `Delete the ${p.name} ${p.billing.toLowerCase()} plan?`,
                    description: (p) =>
                        p.members > 0
                            ? `${p.members} members are on this plan. This can't be undone.`
                            : "This can't be undone.",
                    confirmLabel: "Delete",
                },
                onSelect: (p) => setRows((cur) => cur.filter((r) => r.id !== p.id)),
            },
        ],
        []
    )

    return (
        <>
            {/* page title with the create button on the same line */}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="font-serif text-3xl tracking-tight">
                        Plans
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Search, filter and manage your subscription plans.
                    </p>
                </div>
                <Button
                    onClick={() => setCreateOpen(true)}
                    className="h-9 gap-1.5 rounded-lg bg-ink! px-4 text-[13px] text-white! hover:bg-ink/90!"
                >
                    <PlusIcon className="size-4" />
                    Create plan
                </Button>
            </div>

            <PlanDrawer
                open={createOpen}
                onOpenChange={setCreateOpen}
                existing={rows}
                onSubmit={handleCreate}
            />

            {/* edit drawer: name, billing, price and status of the chosen plan */}
            <PlanDrawer
                mode="edit"
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
                existing={rows}
                initial={editing ?? undefined}
                onSubmit={(plan) => {
                    if (!editing) return
                    setRows((cur) =>
                        cur.map((r) => (r.id === editing.id ? { ...r, ...plan } : r))
                    )
                }}
            />

            <Card size="sm" className="ring-gold/25">
                <CardContent>
                    <DataTable

                        loading={loading}
                        columns={columns}
                        data={rows}
                        selection
                        showColumnFilters
                        getRowId={(p) => p.id}
                        rowActions={rowActions}
                        onDeleteSelected={(deleted) => {
                            const ids = new Set(deleted.map((p) => p.id))
                            setRows((current) => current.filter((p) => !ids.has(p.id)))
                        }}
                        pageSizes={[10, 20, 50]}
                    />
                </CardContent>
            </Card>
        </>
    )
}
