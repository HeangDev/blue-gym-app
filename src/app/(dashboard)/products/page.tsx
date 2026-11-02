"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { PencilIcon, PlusIcon, ToggleRightIcon, Trash2Icon } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import { ProductEditDialog } from "./_components/product-edit-dialog"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    productCategories,
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
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }) => (
            <span className="font-medium">{getValue<string>()}</span>
        ),
    },
    {
        accessorKey: "name",
        header: "Product",
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
    // the product being edited (opens the edit popup)
    const [editing, setEditing] = useState<Product | null>(null)

    // custom row actions: each handler gets the product of the clicked row
    const rowActions = useMemo<RowAction<Product>[]>(
        () => [
            {
                label: "Edit",
                icon: PencilIcon,
                onSelect: (p) => setEditing(p),
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
        []
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

            {/* edit popup: all details of the chosen product */}
            <ProductEditDialog
                product={editing}
                onClose={() => setEditing(null)}
                categories={productCategories}
                existingNames={rows.filter((r) => r.id !== editing?.id).map((r) => r.name)}
                onSave={(changes) => editing && updateProduct(editing.id, changes)}
            />

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
