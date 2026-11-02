"use client"

import { useMemo } from "react"
import { CopyIcon } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

type Action = "Login" | "Create" | "Update" | "Delete" | "Export"

type AuditLog = {
    id: string
    time: string // ISO date-time
    user: string
    role: string
    action: Action
    resource: string
    detail: string
    ip: string
    device: string
}

const logs: AuditLog[] = [
    { id: "L-1042", time: "2026-11-02T09:41:12", user: "Sim Kimheang", role: "Admin", action: "Update", resource: "Settings", detail: "Turned on the Telegram report; closing time set to 21:00.", ip: "103.45.12.8", device: "Chrome on Windows" },
    { id: "L-1041", time: "2026-11-02T09:15:03", user: "Sokunthea Pov", role: "Manager", action: "Create", resource: "Member M-013", detail: "Added member Sreyneat Kong on the Pro plan.", ip: "103.45.12.20", device: "Safari on iPhone" },
    { id: "L-1040", time: "2026-11-02T08:58:47", user: "Vannak Hout", role: "Staff", action: "Login", resource: "Account", detail: "Signed in successfully.", ip: "103.45.12.31", device: "Edge on Windows" },
    { id: "L-1039", time: "2026-11-02T08:30:21", user: "Piseth Lim", role: "Admin", action: "Delete", resource: "Product P-1008", detail: "Deleted Bluetooth Speaker from the catalog.", ip: "103.45.12.8", device: "Chrome on macOS" },
    { id: "L-1038", time: "2026-11-01T18:22:09", user: "Rotha Sam", role: "Manager", action: "Export", resource: "Members", detail: "Exported 12 members to CSV.", ip: "175.100.8.44", device: "Chrome on Android" },
    { id: "L-1037", time: "2026-11-01T17:05:56", user: "Sokunthea Pov", role: "Manager", action: "Update", resource: "Plan PL-03", detail: "Changed the Pro yearly price from $110 to $120.", ip: "103.45.12.20", device: "Safari on iPhone" },
    { id: "L-1036", time: "2026-11-01T16:47:30", user: "Makara Tan", role: "Manager", action: "Create", resource: "Category Boxing", detail: "Created category Boxing under Classes.", ip: "175.100.8.51", device: "Firefox on Windows" },
    { id: "L-1035", time: "2026-11-01T14:12:18", user: "Unknown", role: "-", action: "Login", resource: "Account", detail: "Failed sign-in for username \"admin\" (wrong password).", ip: "45.133.1.77", device: "Unknown" },
    { id: "L-1034", time: "2026-11-01T11:36:02", user: "Sim Kimheang", role: "Admin", action: "Update", resource: "User U-004", detail: "Suspended Linda Chea.", ip: "103.45.12.8", device: "Chrome on Windows" },
    { id: "L-1033", time: "2026-10-31T19:20:44", user: "Chenda Nov", role: "Staff", action: "Delete", resource: "Check-in C-2399", detail: "Removed a duplicate check-in for Dara Vann.", ip: "103.45.12.33", device: "Chrome on Windows" },
    { id: "L-1032", time: "2026-10-31T10:08:15", user: "Piseth Lim", role: "Admin", action: "Create", resource: "User U-012", detail: "Invited Bunthoeun Ek as Staff.", ip: "103.45.12.8", device: "Chrome on macOS" },
    { id: "L-1031", time: "2026-10-30T08:01:50", user: "Vannak Hout", role: "Staff", action: "Login", resource: "Account", detail: "Signed in successfully.", ip: "103.45.12.31", device: "Edge on Windows" },
]

const actionTone = {
    Login: "neutral",
    Create: "success",
    Update: "warning",
    Delete: "danger",
    Export: "neutral",
} as const

const dateTime = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
})

const columns: ColumnDef<AuditLog>[] = [
    {
        accessorKey: "time",
        header: "Time",
        meta: { exportValue: (v: string) => dateTime.format(new Date(v)) },
        cell: ({ getValue }) => (
            <span className="whitespace-nowrap text-muted-foreground">
                {dateTime.format(new Date(getValue<string>()))}
            </span>
        ),
    },
    {
        accessorKey: "user",
        header: "User",
        cell: ({ getValue }) => (
            <span className="font-medium">{getValue<string>()}</span>
        ),
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ getValue }) => {
            const action = getValue<Action>()
            return <StatusBadge tone={actionTone[action]}>{action}</StatusBadge>
        },
    },
    {
        accessorKey: "resource",
        header: "Resource",
        meta: { hideBelow: "sm" },
    },
    {
        accessorKey: "ip",
        header: "IP address",
        meta: { hideBelow: "md" },
        cell: ({ getValue }) => (
            <span className="font-mono text-xs">{getValue<string>()}</span>
        ),
    },
]

function LogDetails({ log }: { log: AuditLog }) {
    return (
        <div className="grid gap-3 py-0.5 text-xs sm:grid-cols-3">
            <div className="sm:col-span-2">
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    What happened
                </p>
                <p className="mt-0.5 text-[13px]">{log.detail}</p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
                <dt className="text-muted-foreground">Log ID</dt>
                <dd className="font-mono">{log.id}</dd>
                <dt className="text-muted-foreground">Role</dt>
                <dd>{log.role}</dd>
                <dt className="text-muted-foreground">Device</dt>
                <dd>{log.device}</dd>
                <dt className="text-muted-foreground">IP</dt>
                <dd className="font-mono">{log.ip}</dd>
            </dl>
        </div>
    )
}

export default function AuditLogsPage() {
    // audit logs are a record: read-only, so no delete or edit actions
    const rowActions = useMemo<RowAction<AuditLog>[]>(
        () => [
            {
                label: "Copy log ID",
                icon: CopyIcon,
                onSelect: (l) => navigator.clipboard.writeText(l.id),
            },
        ],
        []
    )

    return (
        <>
            <div>
                <h2 className="font-(family-name:--font-serif) text-3xl tracking-tight">
                    Audit logs
                </h2>
                <p className="text-sm text-muted-foreground">
                    A read-only record of who did what, and when.
                </p>
            </div>

            <Card size="sm" className="ring-gold/25">
                <CardHeader>
                    <CardTitle className="font-(family-name:--font-serif) text-base font-normal">
                        Activity
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Expand a row for the details, or search by user, action or resource.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={logs}
                        exports={["csv", "excel", "pdf", "print"]}
                        exportFileName="audit-logs"
                        exportTitle="Audit logs"
                        getRowId={(l) => l.id}
                        rowActions={rowActions}
                        renderSubComponent={(row) => <LogDetails log={row.original} />}
                        pageSizes={[10, 20, 50]}
                    />
                </CardContent>
            </Card>
        </>
    )
}
