"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ImageIcon, PencilIcon, PlusIcon, ToggleRightIcon, Trash2Icon } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    productStatuses,
    removeProducts,
    updateProduct,
    useProducts,
    type Product,
    type ProductStatus,
} from "./_lib/products-store"

type Status = ProductStatus

const statuses = productStatuses

const statusTone = {
    Active: "success",
    Draft: "warning",
    "Out of stock": "danger",
} as const

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
})

const columns: ColumnDef<Product>[] = [
    {
        // name and ID share one column; the value holds both so search finds either
        id: "name",
        accessorFn: (p) => `${p.name} ${p.id}`,
        header: "Product",
        meta: { exportValue: (_v, p) => `${p.name} (${p.id})` },
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/50 text-muted-foreground">
                    {row.original.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.original.image} alt="" className="size-full object-cover" />
                    ) : (
                        <ImageIcon className="size-4" />
                    )}
                </div>
                <div className="leading-tight">
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-xs text-muted-foreground">{row.original.id}</p>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "category",
        header: "Category",
        meta: { hideBelow: "md" },
    },
    {
        accessorKey: "stock",
        header: "Stock",
        meta: { hideBelow: "sm", align: "right" },
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

export default function ProductsPage() {
    const rows = useProducts()
    const router = useRouter()

    // custom row actions: each handler gets the product of the clicked row
    const rowActions = useMemo<RowAction<Product>[]>(
        () => [
            {
                label: "Edit",
                icon: PencilIcon,
                onSelect: (p) => router.push(`/products/${p.id}/edit`),
            },
            {
                label: (p) => (p.status === "Active" ? "Set as draft" : "Set as active"),
                icon: ToggleRightIcon,
                hidden: (p) => p.status === "Out of stock",
                onSelect: (p) =>
                    updateProduct(p.id, {
                        status: p.status === "Active" ? "Draft" : "Active",
                    }),
            },
            {
                label: "Delete",
                icon: Trash2Icon,
                variant: "destructive",
                confirm: {
                    title: (p) => `Delete "${p.name}"?`,
                    description: "This can't be undone.",
                    confirmLabel: "Delete",
                },
                onSelect: (p) => removeProducts([p.id]),
            },
        ],
        [router]
    )

    return (
        <>
            {/* page title with the create button on the same line */}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="font-(family-name:--font-serif) text-3xl tracking-tight">
                        Products
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Search, filter, sort and manage your product catalog.
                    </p>
                </div>
                <Button
                    asChild
                    className="h-9 gap-1.5 rounded-lg bg-ink! px-4 text-[13px] text-white! hover:bg-ink/90!"
                >
                    <Link href="/products/create">
                        <PlusIcon className="size-4" />
                        Create product
                    </Link>
                </Button>
            </div>

            <Card size="sm" className="ring-gold/25">
                <CardHeader>
                    <CardTitle className="font-(family-name:--font-serif) text-base font-normal">
                        All products
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={rows}
                        selection
                        showColumnFilters
                        exportFileName="products"
                        exportTitle="Products"
                        getRowId={(p) => p.id}
                        rowActions={rowActions}
                        onDeleteSelected={(deleted) => removeProducts(deleted.map((p) => p.id))}
                        pageSizes={[10, 20, 50]}
                    />
                </CardContent>
            </Card>
        </>
    )
}
