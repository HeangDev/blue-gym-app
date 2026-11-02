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

type Role = "Admin" | "Manager" | "Staff"
type Status = "Active" | "Suspended" | "Invited"

type User = {
    id: string
    name: string
    email: string
    role: Role
    lastLogin: string // ISO yyyy-mm-dd
    status: Status
}

const roles: Role[] = ["Admin", "Manager", "Staff"]
const statuses: Status[] = ["Active", "Suspended", "Invited"]

const users: User[] = [
    { id: "U-001", name: "Sim Kimheang", email: "simkimheang4@gmail.com", role: "Admin", lastLogin: "2026-11-02", status: "Active" },
    { id: "U-002", name: "Sokunthea Pov", email: "sokunthea.pov@example.com", role: "Manager", lastLogin: "2026-11-01", status: "Active" },
    { id: "U-003", name: "Vannak Hout", email: "vannak.hout@example.com", role: "Staff", lastLogin: "2026-10-30", status: "Active" },
    { id: "U-004", name: "Linda Chea", email: "linda.chea@example.com", role: "Staff", lastLogin: "2026-10-12", status: "Suspended" },
    { id: "U-005", name: "Rotha Sam", email: "rotha.sam@example.com", role: "Manager", lastLogin: "2026-10-28", status: "Active" },
    { id: "U-006", name: "Nary Khun", email: "nary.khun@example.com", role: "Staff", lastLogin: "2026-09-21", status: "Invited" },
    { id: "U-007", name: "Piseth Lim", email: "piseth.lim@example.com", role: "Admin", lastLogin: "2026-10-31", status: "Active" },
    { id: "U-008", name: "Sreymom Yin", email: "sreymom.yin@example.com", role: "Staff", lastLogin: "2026-08-14", status: "Suspended" },
    { id: "U-009", name: "Chenda Nov", email: "chenda.nov@example.com", role: "Staff", lastLogin: "2026-10-25", status: "Active" },
    { id: "U-010", name: "Makara Tan", email: "makara.tan@example.com", role: "Manager", lastLogin: "2026-10-29", status: "Active" },
    { id: "U-011", name: "Theary Seng", email: "theary.seng@example.com", role: "Staff", lastLogin: "2026-10-05", status: "Invited" },
    { id: "U-012", name: "Bunthoeun Ek", email: "bunthoeun.ek@example.com", role: "Staff", lastLogin: "2026-10-27", status: "Active" },
]

const statusTone = {
    Active: "success",
    Suspended: "danger",
    Invited: "warning",
} as const

const dateFormat = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
})

const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "User",
        cell: ({ getValue }) => (
            <span className="font-medium">{getValue<string>()}</span>
        ),
        meta: { filter: { type: "text", label: "User" } },
    },
    {
        accessorKey: "email",
        header: "Email",
        meta: { hideBelow: "md" },
    },
    {
        accessorKey: "role",
        header: "Role",
        filterFn: "equalsString",
        meta: {
            hideBelow: "sm",
            filter: { type: "select", label: "Role", options: roles },
        },
    },
    {
        accessorKey: "lastLogin",
        header: "Last login",
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

export default function UsersPage() {
    const [rows, setRows] = useState(users)

    // custom row actions: each handler gets the user of the clicked row
    const rowActions = useMemo<RowAction<User>[]>(
        () => [
            {
                label: "Copy email",
                icon: CopyIcon,
                onSelect: (u) => navigator.clipboard.writeText(u.email),
            },
            {
                label: (u) => (u.status === "Suspended" ? "Reactivate" : "Suspend"),
                icon: ToggleRightIcon,
                hidden: (u) => u.status === "Invited",
                onSelect: (u) =>
                    setRows((cur) =>
                        cur.map((r) =>
                            r.id === u.id
                                ? { ...r, status: r.status === "Suspended" ? "Active" : "Suspended" }
                                : r
                        )
                    ),
            },
            {
                label: "Delete",
                icon: Trash2Icon,
                variant: "destructive",
                confirm: {
                    title: (u) => `Delete "${u.name}"?`,
                    description: "This removes the user and can't be undone.",
                    confirmLabel: "Delete",
                },
                onSelect: (u) => setRows((cur) => cur.filter((r) => r.id !== u.id)),
            },
        ],
        []
    )

    return (
        <>
            <div>
                <h2 className="font-(family-name:--font-serif) text-3xl tracking-tight">
                    Users
                </h2>
                <p className="text-sm text-muted-foreground">
                    Search, filter and manage who can sign in.
                </p>
            </div>

            <Card size="sm" className="ring-gold/25">
                <CardHeader>
                    <CardTitle className="font-(family-name:--font-serif) text-base font-normal">
                        All users
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {rows.length} users.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={rows}
                        selection
                        exports={["copy", "csv", "excel", "pdf", "print"]}
                        exportFileName="users"
                        exportTitle="Users"
                        getRowId={(u) => u.id}
                        rowActions={rowActions}
                        onDeleteSelected={(deleted) => {
                            const ids = new Set(deleted.map((u) => u.id))
                            setRows((current) => current.filter((u) => !ids.has(u.id)))
                        }}
                        pageSizes={[10, 20, 50]}
                    />
                </CardContent>
            </Card>
        </>
    )
}
