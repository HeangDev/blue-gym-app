"use client"

import { useEffect, useMemo, useState } from "react"
import { PencilIcon, PlusIcon, ToggleRightIcon, Trash2Icon } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserEditDialog, type UserFields } from "@/components/user-edit-dialog"

type Role = "Admin" | "Manager" | "Staff"
type Status = "Active" | "Suspended" | "Invited"

type User = {
    id: string
    name: string
    username: string
    email: string
    phone: string
    role: Role
    lastLogin: string // ISO yyyy-mm-dd
    status: Status
}

const roles: Role[] = ["Admin", "Manager", "Staff"]
const statuses: Status[] = ["Active", "Suspended", "Invited"]

const seedUsers: Omit<User, "username" | "phone">[] = [
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

// sample data: derive a username and phone number for each seed user
const users: User[] = seedUsers.map((u, i) => ({
    ...u,
    username: u.email.split("@")[0].replace(/[^a-z0-9]+/gi, "_").toLowerCase(),
    phone: `012 ${345 + i} ${String(100 + i * 7).padStart(3, "0")}`,
}))

// the saved row keeps everything except the password
const profile = ({ name, username, email, phone, role, status }: UserFields<Role, Status>) => ({
    name, username, email, phone, role, status,
})

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
        accessorKey: "username",
        header: "Username",
        meta: { hideBelow: "md" },
    },
    {
        accessorKey: "email",
        header: "Email",
        meta: { hideBelow: "md" },
    },
    {
        accessorKey: "phone",
        header: "Phone",
        meta: { hideBelow: "lg" },
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
    // the user being edited (opens the edit popup)
    const [editing, setEditing] = useState<User | null>(null)
    const [createOpen, setCreateOpen] = useState(false)
    // sample data loads instantly, so fake a short load to show the skeleton;
    // with a real API, use its loading flag instead
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    // custom row actions: each handler gets the user of the clicked row
    const rowActions = useMemo<RowAction<User>[]>(
        () => [
            {
                label: "Edit",
                icon: PencilIcon,
                onSelect: (u) => setEditing(u),
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
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="font-serif text-3xl tracking-tight">
                        Users
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Search, filter and manage who can sign in.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="h-9 gap-1.5 rounded-lg bg-ink! px-4 text-[13px] text-white! hover:bg-ink/90!">
                    <PlusIcon className="size-4" />
                    Create user
                </Button>
            </div>

            <Card size="sm" className="ring-gold/25">
                <CardHeader>
                    <CardTitle className="font-serif text-base font-normal">
                        All users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        loading={loading}
                        columns={columns}
                        data={rows}
                        selection
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

            <UserEditDialog
                mode="create"
                open={createOpen}
                onOpenChange={setCreateOpen}
                roles={roles}
                statuses={statuses}
                existing={rows}
                // the password would be sent to the server here; the table never keeps it
                onSave={(f) =>
                    setRows((cur) => {
                        const next = Math.max(0, ...cur.map((r) => Number(r.id.slice(2)))) + 1
                        const id = `U-${String(next).padStart(3, "0")}`
                        const today = new Date().toISOString().slice(0, 10)
                        return [{ id, lastLogin: today, ...profile(f) }, ...cur]
                    })
                }
            />

            <UserEditDialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
                roles={roles}
                statuses={statuses}
                initial={editing ?? undefined}
                existing={rows}
                onSave={(f) => {
                    if (!editing) return
                    setRows((cur) =>
                        cur.map((r) => (r.id === editing.id ? { ...r, ...profile(f) } : r))
                    )
                }}
            />
        </>
    )
}
