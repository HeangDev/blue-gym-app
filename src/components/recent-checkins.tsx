"use client"

import { useMemo, useState } from "react"
import { CopyIcon, Trash2Icon } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Membership = "Active" | "Expiring" | "Expired"

type CheckIn = {
  id: string
  member: string
  plan: "Basic" | "Pro" | "Premium"
  area: string
  time: string // ISO date-time
  membership: Membership
}

const checkIns: CheckIn[] = [
  { id: "C-2401", member: "Sokha Chan", plan: "Pro", area: "Weights", time: "2026-11-02T06:12", membership: "Active" },
  { id: "C-2402", member: "Dara Vann", plan: "Basic", area: "Cardio", time: "2026-11-02T06:25", membership: "Expiring" },
  { id: "C-2403", member: "Srey Neang", plan: "Premium", area: "Yoga studio", time: "2026-11-02T06:40", membership: "Active" },
  { id: "C-2404", member: "Vibol Sok", plan: "Pro", area: "CrossFit", time: "2026-11-02T07:05", membership: "Active" },
  { id: "C-2405", member: "Chantha Ly", plan: "Basic", area: "Cardio", time: "2026-11-02T07:18", membership: "Expired" },
  { id: "C-2406", member: "Rithy Keo", plan: "Premium", area: "Pool", time: "2026-11-02T07:32", membership: "Active" },
  { id: "C-2407", member: "Bopha Mao", plan: "Pro", area: "Weights", time: "2026-11-02T07:50", membership: "Active" },
  { id: "C-2408", member: "Sophea Heng", plan: "Basic", area: "Cardio", time: "2026-11-02T08:03", membership: "Expiring" },
  { id: "C-2409", member: "Pisey Tep", plan: "Premium", area: "Boxing", time: "2026-11-02T08:21", membership: "Active" },
  { id: "C-2410", member: "Kosal Ouk", plan: "Pro", area: "Weights", time: "2026-11-02T08:44", membership: "Active" },
  { id: "C-2411", member: "Malis Pich", plan: "Premium", area: "Yoga studio", time: "2026-11-02T09:10", membership: "Active" },
  { id: "C-2412", member: "Sambath Roth", plan: "Basic", area: "Cardio", time: "2026-11-02T09:27", membership: "Expired" },
]

const membershipTone = {
  Active: "success",
  Expiring: "warning",
  Expired: "danger",
} as const

const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
})

const columns: ColumnDef<CheckIn>[] = [
  {
    accessorKey: "member",
    header: "Member",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    meta: { hideBelow: "sm" },
  },
  {
    accessorKey: "area",
    header: "Area",
    meta: { hideBelow: "md" },
  },
  {
    accessorKey: "time",
    header: "Checked in",
    meta: { exportValue: (v: string) => timeFormat.format(new Date(v)) },
    cell: ({ getValue }) => timeFormat.format(new Date(getValue<string>())),
  },
  {
    accessorKey: "membership",
    header: "Membership",
    meta: { align: "right" },
    cell: ({ getValue }) => {
      const status = getValue<Membership>()
      return <StatusBadge tone={membershipTone[status]}>{status}</StatusBadge>
    },
  },
]

export function RecentCheckIns() {
  const [rows, setRows] = useState(checkIns)

  const rowActions = useMemo<RowAction<CheckIn>[]>(
    () => [
      {
        label: "Copy check-in ID",
        icon: CopyIcon,
        onSelect: (c) => navigator.clipboard.writeText(c.id),
      },
      {
        label: "Delete",
        icon: Trash2Icon,
        variant: "destructive",
        confirm: {
          title: (c) => `Delete check-in ${c.id}?`,
          description: (c) => `${c.member}'s check-in will be removed.`,
          confirmLabel: "Delete",
        },
        onSelect: (c) => setRows((cur) => cur.filter((r) => r.id !== c.id)),
      },
    ],
    []
  )

  return (
    <Card size="sm" className="ring-gold/25">
      <CardHeader>
        <CardTitle className="font-(family-name:--font-serif) text-base font-normal">
          Recent check-ins
        </CardTitle>
        <CardDescription className="text-xs">
          Who walked in today, and whether their membership is still valid.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={rows}
          exports={["csv", "excel", "pdf", "print"]}
          exportFileName="check-ins"
          exportTitle="Recent check-ins"
          getRowId={(c) => c.id}
          rowActions={rowActions}
        />
      </CardContent>
    </Card>
  )
}
