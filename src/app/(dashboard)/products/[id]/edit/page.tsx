"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { ProductForm } from "../../_components/product-form"
import {
    productCategories,
    updateProduct,
    useProducts,
} from "../../_lib/products-store"

export default function EditProductPage() {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const rows = useProducts()
    const product = rows.find((p) => p.id === id)

    return (
        <>
            <div>
                <Link
                    href="/products"
                    className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeftIcon className="size-3.5" />
                    Back to products
                </Link>
                <h2 className="font-serif text-3xl tracking-tight">
                    Edit product
                </h2>
                <p className="text-sm text-muted-foreground">
                    {product ? `Change the details of ${product.id}.` : "This product could not be found."}
                </p>
            </div>

            {product && (
                <ProductForm
                    initial={product}
                    categories={productCategories}
                    existingNames={rows.filter((r) => r.id !== product.id).map((r) => r.name)}
                    submitLabel="Save changes"
                    onSubmit={(changes) => {
                        updateProduct(product.id, changes)
                        router.push("/products")
                    }}
                    onCancel={() => router.push("/products")}
                />
            )}
        </>
    )
}
