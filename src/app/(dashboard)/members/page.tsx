"use client"

import { useEffect, useMemo, useState } from "react"
import { PencilIcon, PlusIcon, ToggleRightIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import { type Gender } from "./_components/member-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { members, type Member, type Plan, type Status } from "@/lib/members"
import {
    Card,
    CardContent,
} from "@/components/ui/card"



const genders: Gender[] = ["Male", "Female", "Other"]
const statuses: Status[] = ["Active", "Inactive", "Pending"]
const plans: Plan[] = ["Free", "Pro", "Business"]


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
        cell: ({ row }) => {
            const m = row.original
            const initials = m.name
                .split(/\s+/)
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            return (
                <div className="flex items-center gap-3">
                    <Avatar>
                        {m.avatar && <AvatarImage src={m.avatar} alt="" />}
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid leading-tight">
                        <span className="font-medium">{m.name}</span>
                        {m.phone && (
                            <span className="text-xs text-muted-foreground">{m.phone}</span>
                        )}
                    </div>
                </div>
            )
        },
        meta: {
            filter: { type: "text", label: "Member" },
            exportValue: (v: string) => v,
        },
    },
    {
        accessorKey: "gender",
        header: "Gender",
        filterFn: "equalsString",
        cell: ({ getValue }) => getValue<string>() || "—",
        meta: {
            hideBelow: "md",
            filter: { type: "select", label: "Gender", options: genders },
        },
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
    // sample data loads instantly, so fake a short load to show the skeleton;
    // with a real API, use its loading flag instead
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    const router = useRouter()
    const [rows, setRows] = useState(() => [...members])

    // custom row actions: each handler gets the member of the clicked row
    const rowActions = useMemo<RowAction<Member>[]>(
        () => [
            {
                label: "Edit",
                icon: PencilIcon,
                onSelect: (m) => router.push(`/members/${m.id}/edit`),
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
        [router]
    )

    return (
        <>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="font-serif text-3xl tracking-tight">
                        Members
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Search, filter and manage the people on your plans.
                    </p>
                </div>
                <Button onClick={() => router.push("/members/create")} className="h-9 gap-1.5 rounded-lg bg-ink! px-4 text-[13px] text-white! hover:bg-ink/90!">
                    <PlusIcon className="size-4" />
                    Create member
                </Button>
            </div>

            <Card size="sm" className="ring-gold/25">
                <CardContent>
                    <DataTable

                        loading={loading}
                        onRowClick={(m) => router.push(`/members/${m.id}`)}
                        columns={columns}
                        data={rows}
                        selection
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
