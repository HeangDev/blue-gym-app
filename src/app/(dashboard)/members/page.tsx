"use client"

import { useMemo, useState } from "react"
import { CopyIcon, ToggleRightIcon, Trash2Icon } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

type Status = "Active" | "Inactive" | "Pending"
type Plan = "Free" | "Pro" | "Business"

type Member = {
    id: string
    name: string
    email: string
    plan: Plan
    joined: string // ISO yyyy-mm-dd
    status: Status
}

const statuses: Status[] = ["Active", "Inactive", "Pending"]
const plans: Plan[] = ["Free", "Pro", "Business"]

const members: Member[] = [
    { id: "M-001", name: "Sokha Chan", email: "sokha.chan@example.com", plan: "Pro", joined: "2026-01-12", status: "Active" },
    { id: "M-002", name: "Dara Vann", email: "dara.vann@example.com", plan: "Free", joined: "2026-02-03", status: "Active" },
    { id: "M-003", name: "Srey Neang", email: "srey.neang@example.com", plan: "Business", joined: "2026-02-18", status: "Active" },
    { id: "M-004", name: "Vibol Sok", email: "vibol.sok@example.com", plan: "Pro", joined: "2026-03-07", status: "Inactive" },
    { id: "M-005", name: "Chantha Ly", email: "chantha.ly@example.com", plan: "Free", joined: "2026-03-21", status: "Pending" },
    { id: "M-006", name: "Rithy Keo", email: "rithy.keo@example.com", plan: "Pro", joined: "2026-04-02", status: "Active" },
    { id: "M-007", name: "Bopha Mao", email: "bopha.mao@example.com", plan: "Business", joined: "2026-04-15", status: "Active" },
    { id: "M-008", name: "Sophea Heng", email: "sophea.heng@example.com", plan: "Free", joined: "2026-05-09", status: "Inactive" },
    { id: "M-009", name: "Pisey Tep", email: "pisey.tep@example.com", plan: "Pro", joined: "2026-05-27", status: "Pending" },
    { id: "M-010", name: "Kosal Ouk", email: "kosal.ouk@example.com", plan: "Free", joined: "2026-06-11", status: "Active" },
    { id: "M-011", name: "Malis Pich", email: "malis.pich@example.com", plan: "Business", joined: "2026-07-04", status: "Active" },
    { id: "M-012", name: "Sambath Roth", email: "sambath.roth@example.com", plan: "Pro", joined: "2026-08-19", status: "Inactive" },
]

const statusTone = {
    Active: "success",
    Inactive: "danger",
    Pending: "warning",
} as const

const dateFormat = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
})

const columns: ColumnDef<Member>[] = [
    {
        accessorKey: "name",
        header: "Member",
        cell: ({ getValue }) => (
            <span className="font-medium">{getValue<string>()}</span>
        ),
        meta: { filter: { type: "text", label: "Member" } },
    },
    {
        accessorKey: "email",
        header: "Email",
        meta: { hideBelow: "md" },
    },
    {
        accessorKey: "plan",
        header: "Plan",
        filterFn: "equalsString",
        meta: {
            hideBelow: "sm",
            filter: { type: "select", label: "Plan", options: plans },
        },
    },
    {
        accessorKey: "joined",
        header: "Joined",
        meta: {
            hideBelow: "md",
            exportValue: (v: string) => dateFormat.format(new Date(v)),
        },
        cell: ({ getValue }) => dateFormat.format(new Date(getValue<string>())),
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
]

export default function MembersPage() {
    const [rows, setRows] = useState(members)

    // custom row actions: each handler gets the member of the clicked row
    const rowActions = useMemo<RowAction<Member>[]>(
        () => [
            {
                label: "Copy email",
                icon: CopyIcon,
                onSelect: (m) => navigator.clipboard.writeText(m.email),
            },
            {
                label: (m) => (m.status === "Active" ? "Deactivate" : "Activate"),
                icon: ToggleRightIcon,
                onSelect: (m) =>
                    setRows((cur) =>
                        cur.map((r) =>
                            r.id === m.id
                                ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" }
                                : r
                        )
                    ),
            },
            {
                label: "Delete",
                icon: Trash2Icon,
                variant: "destructive",
                confirm: {
                    title: (m) => `Delete "${m.name}"?`,
                    description: "This removes the member and can't be undone.",
                    confirmLabel: "Delete",
                },
                onSelect: (m) => setRows((cur) => cur.filter((r) => r.id !== m.id)),
            },
        ],
        []
    )

    return (
        <>
            <div>
                <h2 className="font-(family-name:--font-serif) text-3xl tracking-tight">
                    Members
                </h2>
                <p className="text-sm text-muted-foreground">
                    Search, filter and manage the people on your plans.
                </p>
            </div>

            <Card size="sm" className="ring-gold/25">
                <CardHeader>
                    <CardTitle className="font-(family-name:--font-serif) text-base font-normal">
                        All members
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {rows.length} members.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={rows}
                        selection
                        exports={["copy", "csv", "excel", "pdf", "print"]}
                        exportFileName="members"
                        exportTitle="Members"
                        getRowId={(m) => m.id}
                        rowActions={rowActions}
                        onDeleteSelected={(deleted) => {
                            const ids = new Set(deleted.map((m) => m.id))
                            setRows((current) => current.filter((m) => !ids.has(m.id)))
                        }}
                        pageSizes={[10, 20, 50]}
                    />
                </CardContent>
            </Card>
        </>
    )
}
