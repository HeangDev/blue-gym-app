"use client"

import { useMemo, useState } from "react"
import { PencilIcon, PlusIcon, ToggleRightIcon, Trash2Icon } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"

import {
    CategoryCreateDialog,
    type NewCategory,
    type ParentOption,
} from "@/components/category-create-dialog"
import { DataTable, StatusBadge, type RowAction } from "@/components/datatable"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

type Category = {
    id: string
    name: string
    products: number
    status: "Active" | "Draft"
    subRows?: Category[]
}

const categories: Category[] = [
    {
        id: "electronics",
        name: "Electronics",
        products: 128,
        status: "Active",
        subRows: [
            { id: "phones", name: "Phones", products: 54, status: "Active" },
            { id: "laptops", name: "Laptops", products: 38, status: "Active" },
            {
                id: "audio",
                name: "Audio",
                products: 36,
                status: "Active",
                subRows: [
                    { id: "headphones", name: "Headphones", products: 22, status: "Active" },
                    { id: "speakers", name: "Speakers", products: 14, status: "Draft" },
                ],
            },
        ],
    },
    {
        id: "home",
        name: "Home & Living",
        products: 96,
        status: "Active",
        subRows: [
            { id: "furniture", name: "Furniture", products: 41, status: "Active" },
            { id: "kitchen", name: "Kitchen", products: 55, status: "Active" },
        ],
    },
    {
        id: "fashion",
        name: "Fashion",
        products: 210,
        status: "Active",
        subRows: [
            { id: "men", name: "Men", products: 90, status: "Active" },
            { id: "women", name: "Women", products: 120, status: "Draft" },
        ],
    },
    { id: "books", name: "Books", products: 74, status: "Draft" },
    { id: "sports", name: "Sports & Outdoors", products: 112, status: "Active" },
    { id: "toys", name: "Toys & Games", products: 168, status: "Active" },
    { id: "beauty", name: "Beauty & Care", products: 143, status: "Active" },
    { id: "health", name: "Health & Wellness", products: 87, status: "Active" },
    { id: "automotive", name: "Automotive", products: 59, status: "Draft" },
    { id: "garden", name: "Garden & Patio", products: 66, status: "Active" },
    { id: "pets", name: "Pet Supplies", products: 94, status: "Active" },
    { id: "office", name: "Office Supplies", products: 121, status: "Active" },
    { id: "music", name: "Music & Instruments", products: 48, status: "Draft" },
    { id: "jewelry", name: "Jewelry & Watches", products: 73, status: "Active" },
    { id: "groceries", name: "Groceries", products: 205, status: "Active" },
]

const columns: ColumnDef<Category>[] = [
    { accessorKey: "name", header: "Name" },
    {
        accessorKey: "products",
        header: "Products",
        meta: { align: "right", hideBelow: "sm" },
    },
    {
        accessorKey: "status",
        header: "Status",
        filterFn: "equalsString",
        meta: {
            filter: { type: "select", label: "Status", options: ["Active", "Draft"] },
        },
        cell: ({ getValue }) => {
            const status = getValue<Category["status"]>()
            return (
                <StatusBadge tone={status === "Active" ? "success" : "neutral"}>
                {status}
                </StatusBadge>
            )
        },
    },
]

// remove categories (and everything under them) by id
function removeCategories(list: Category[], ids: Set<string>): Category[] {
    return list
        .filter((c) => !ids.has(c.id))
        .map((c) =>
            c.subRows ? { ...c, subRows: removeCategories(c.subRows, ids) } : c
        )
}

// add a category at the top level, or under a parent (at any depth)
function addCategory(
    list: Category[],
    parentId: string | null,
    category: Category
): Category[] {
    if (!parentId) return [...list, category]
    return list.map((c) =>
        c.id === parentId
        ? { ...c, subRows: [...(c.subRows ?? []), category] }
        : c.subRows
            ? { ...c, subRows: addCategory(c.subRows, parentId, category) }
            : c
    )
}

// change one category (at any depth)
function updateCategory(
    list: Category[],
    id: string,
    change: (c: Category) => Category
): Category[] {
    return list.map((c) =>
        c.id === id
        ? change(c)
        : c.subRows
            ? { ...c, subRows: updateCategory(c.subRows, id, change) }
            : c
    )
}

function flatten(list: Category[], depth = 0): ParentOption[] {
    return list.flatMap((c) => [
        { id: c.id, name: c.name, depth, children: c.subRows?.length ?? 0 },
        ...flatten(c.subRows ?? [], depth + 1),
    ])
}

export default function CategoriesPage() {
    const [rows, setRows] = useState(categories)
    const [selected, setSelected] = useState<Category[]>([])
    const [createOpen, setCreateOpen] = useState(false)
    // the category being edited (opens the edit popup)
    const [editing, setEditing] = useState<Category | null>(null)

    // custom row actions: each handler gets the category of the clicked row
    const rowActions = useMemo<RowAction<Category>[]>(
        () => [
            {
                label: "Edit",
                icon: PencilIcon,
                onSelect: (c) => setEditing(c),
            },
            {
                label: (c) => (c.status === "Active" ? "Set as draft" : "Set as active"),
                icon: ToggleRightIcon,
                onSelect: (c) =>
                setRows((cur) =>
                    updateCategory(cur, c.id, (x) => ({
                    ...x,
                    status: x.status === "Active" ? "Draft" : "Active",
                    }))
                ),
            },
            {
                label: "Delete",
                icon: Trash2Icon,
                variant: "destructive",
                confirm: {
                    title: (c) => `Delete "${c.name}"?`,
                    description: (c) =>
                        c.subRows?.length
                        ? `This also deletes its ${c.subRows.length} sub-categor${c.subRows.length === 1 ? "y" : "ies"} and can't be undone.`
                        : "This can't be undone.",
                    confirmLabel: "Delete",
                },
                onSelect: (c) =>
                setRows((cur) => removeCategories(cur, new Set([c.id]))),
            },
        ],
        []
    )

    const options = flatten(rows)

    // adds a top-level category from the "Add new parent" button and returns its id
    function handleAddParent(name: string) {
        const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`
        setRows((current) => [
            ...current,
            { id, name, products: 0, status: "Active" },
        ])
        return id
    }

    function handleCreate({ name, parentId, status }: NewCategory) {
        const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`
        setRows((current) =>
            addCategory(current, parentId, { id, name, products: 0, status })
        )
    }

    return (
        <>
            {/* page title with the create button on the same line */}
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="font-(family-name:--font-serif) text-3xl tracking-tight">
                        Categories
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Browse the category tree and pick a category.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="h-9 gap-1.5 rounded-lg bg-ink! px-4 text-[13px] text-white! hover:bg-ink/90!">
                    <PlusIcon className="size-4" />
                    Create category
                </Button>
            </div>

            <CategoryCreateDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                parents={options}
                existingNames={options.map((o) => o.name)}
                onAddParent={handleAddParent}
                onCreate={handleCreate}
            />

            {/* edit popup: name + status of the chosen category */}
            <CategoryCreateDialog
                mode="edit"
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
                parents={options}
                existingNames={options
                .filter((o) => o.id !== editing?.id)
                .map((o) => o.name)}
                initial={
                    editing ? { name: editing.name, status: editing.status } : undefined
                }
                onCreate={({ name, status }) => {
                    if (!editing) return
                    setRows((cur) =>
                        updateCategory(cur, editing.id, (c) => ({ ...c, name, status }))
                    )
                }}
            />

            <Card size="sm" className="ring-gold/25">
                <CardHeader>
                    <CardTitle className="font-(family-name:--font-serif) text-base font-normal">
                        Category tree
                    </CardTitle>
                    <CardDescription className="block truncate text-xs">
                        {selected.length
                        ? `${selected.length} selected: ${selected.map((c) => c.name).join(", ")}`
                        : "Tick a parent to select all of its sub-categories."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={rows}
                        selection
                        exportFileName="categories"
                        exportTitle="Categories"
                        getSubRows={(c) => c.subRows}
                        getRowId={(c) => c.id}
                        rowActions={rowActions}
                        onDeleteSelected={(deleted) => {
                            const ids = new Set(deleted.map((c) => c.id))
                            setRows((current) => removeCategories(current, ids))
                            setSelected([])
                        }}
                        onSelectionChange={setSelected}
                        pageSizes={[10, 20, 50]}
                    />
                </CardContent>
            </Card>
        </>
    )
}
