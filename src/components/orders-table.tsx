"use client"

import { useMemo, useState } from "react"
import { BanIcon, CheckCircle2Icon, CopyIcon, Trash2Icon } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Status = "Paid" | "Pending" | "Cancelled"

type Order = {
  id: string
  customer: string
  date: string // ISO yyyy-mm-dd
  status: Status
  amount: number
}

const statuses: Status[] = ["Paid", "Pending", "Cancelled"]

const orders: Order[] = [
  { id: "#1001", customer: "Alice Johnson", date: "2026-10-01", status: "Paid", amount: 250 },
  { id: "#1002", customer: "Bob Smith", date: "2026-10-02", status: "Pending", amount: 120.5 },
  { id: "#1003", customer: "Carol White", date: "2026-10-03", status: "Paid", amount: 89.99 },
  { id: "#1004", customer: "David Brown", date: "2026-10-04", status: "Cancelled", amount: 310 },
  { id: "#1005", customer: "Eve Davis", date: "2026-10-05", status: "Pending", amount: 45 },
  { id: "#1006", customer: "Frank Miller", date: "2026-10-06", status: "Paid", amount: 560.25 },
  { id: "#1007", customer: "Grace Lee", date: "2026-10-07", status: "Paid", amount: 78.4 },
  { id: "#1008", customer: "Henry Clark", date: "2026-10-08", status: "Pending", amount: 199 },
  { id: "#1009", customer: "Ivy Turner", date: "2026-10-09", status: "Cancelled", amount: 42.5 },
  { id: "#1010", customer: "Jack Wilson", date: "2026-10-10", status: "Paid", amount: 415.8 },
  { id: "#1011", customer: "Kara Evans", date: "2026-10-11", status: "Paid", amount: 134 },
  { id: "#1012", customer: "Liam Scott", date: "2026-10-12", status: "Pending", amount: 67.75 },
  { id: "#1013", customer: "Mia Young", date: "2026-10-13", status: "Paid", amount: 289.9 },
  { id: "#1014", customer: "Noah King", date: "2026-10-14", status: "Cancelled", amount: 15 },
  { id: "#1015", customer: "Olivia Hall", date: "2026-10-15", status: "Paid", amount: 642 },
  { id: "#1016", customer: "Paul Adams", date: "2026-10-16", status: "Pending", amount: 98.6 },
  { id: "#1017", customer: "Quinn Baker", date: "2026-10-17", status: "Paid", amount: 223.3 },
  { id: "#1018", customer: "Rose Carter", date: "2026-10-18", status: "Paid", amount: 51.2 },
  { id: "#1019", customer: "Sam Rivera", date: "2026-10-19", status: "Pending", amount: 330 },
  { id: "#1020", customer: "Tina Brooks", date: "2026-10-20", status: "Cancelled", amount: 120 },
  { id: "#1021", customer: "Uma Patel", date: "2026-10-21", status: "Paid", amount: 77.7 },
  { id: "#1022", customer: "Victor Reyes", date: "2026-10-22", status: "Paid", amount: 480.4 },
  { id: "#1023", customer: "Wendy Cruz", date: "2026-10-23", status: "Pending", amount: 61 },
  { id: "#1024", customer: "Xavier Diaz", date: "2026-10-24", status: "Paid", amount: 905.1 },
]

const statusTone = {
  Paid: "success",
  Pending: "warning",
  Cancelled: "danger",
} as const

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    meta: { filter: { type: "text", label: "Customer" } },
  },
  {
    accessorKey: "date",
    meta: {
      hideBelow: "md",
      exportValue: (v: string) => dateFormat.format(new Date(v)),
    },
    header: "Date",
    cell: ({ getValue }) => dateFormat.format(new Date(getValue<string>())),
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
    accessorKey: "amount",
    header: "Amount",
    meta: {
      align: "right",
      exportValue: (v: number) => currency.format(v),
    },
    cell: ({ getValue }) => currency.format(getValue<number>()),
  },
]

export function OrdersTable() {
  const [rows, setRows] = useState(orders)

  // custom row actions: each handler gets the order of the clicked row
  const rowActions = useMemo<RowAction<Order>[]>(
    () => [
      {
        label: "Copy order ID",
        icon: CopyIcon,
        onSelect: (o) => navigator.clipboard.writeText(o.id),
      },
      {
        label: "Mark as paid",
        icon: CheckCircle2Icon,
        hidden: (o) => o.status !== "Pending",
        onSelect: (o) =>
          setRows((cur) =>
            cur.map((r) => (r.id === o.id ? { ...r, status: "Paid" } : r))
          ),
      },
      {
        label: "Cancel order",
        icon: BanIcon,
        hidden: (o) => o.status !== "Pending",
        confirm: {
          title: (o) => `Cancel order ${o.id}?`,
          description: (o) =>
            `${o.customer}'s order will be marked as cancelled.`,
          confirmLabel: "Cancel order",
        },
        onSelect: (o) =>
          setRows((cur) =>
            cur.map((r) => (r.id === o.id ? { ...r, status: "Cancelled" } : r))
          ),
      },
      {
        label: "Delete order",
        icon: Trash2Icon,
        variant: "destructive",
        confirm: {
          title: (o) => `Delete order ${o.id}?`,
          description: "This permanently removes the order and can't be undone.",
          confirmLabel: "Delete",
        },
        onSelect: (o) => setRows((cur) => cur.filter((r) => r.id !== o.id)),
      },
    ],
    []
  )

  return (
    <Card size="sm" className="ring-gold/25">
      <CardHeader>
        <CardTitle className="font-(family-name:--font-serif) text-base font-normal">
          Recent Orders
        </CardTitle>
        <CardDescription className="text-xs">
          Select rows, expand for details, and search, filter, sort or page through transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={rows}
          selection
          exports={["copy", "csv", "excel", "pdf", "print"]}
          exportFileName="orders"
          exportTitle="Recent Orders"
          getRowId={(o) => o.id}
          rowActions={rowActions}
          onDeleteSelected={(deleted) => {
            const ids = new Set(deleted.map((o) => o.id))
            setRows((current) => current.filter((o) => !ids.has(o.id)))
          }}
          renderSubComponent={(row) => <OrderDetails order={row.original} />}
        />
      </CardContent>
    </Card>
  )
}

const cities = ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville"]

function OrderDetails({ order }: { order: Order }) {
  const subtotal = order.amount / 1.1
  const tax = order.amount - subtotal
  const n = Number(order.id.slice(1))

  return (
    <div className="grid gap-3 py-0.5 text-xs sm:grid-cols-3">
      <div>
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
          Customer
        </p>
        <p className="font-medium">{order.customer}</p>
        <p className="text-muted-foreground">
          {order.customer.toLowerCase().replace(" ", ".")}@example.com
        </p>
      </div>
      <div>
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
          Ship to
        </p>
        <p className="font-medium">{cities[n % cities.length]}</p>
        <p className="text-muted-foreground">Cambodia</p>
      </div>
      <div>
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
          Summary
        </p>
        <dl className="grid grid-cols-[1fr_auto] gap-x-6">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-right">{currency.format(subtotal)}</dd>
          <dt className="text-muted-foreground">Tax (10%)</dt>
          <dd className="text-right">{currency.format(tax)}</dd>
          <dt className="font-medium">Total</dt>
          <dd className="text-right font-medium">
            {currency.format(order.amount)}
          </dd>
        </dl>
      </div>
    </div>
  )
}
