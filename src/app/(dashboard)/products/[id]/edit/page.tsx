"use client"

import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
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
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="font-serif text-xl tracking-tight">
                        Edit product
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {product ? `Change the details of ${product.id}.` : "This product could not be found."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-border"
                        onClick={() => router.push("/products")}
                    >
                        Cancel
                    </Button>
                    {product && (
                        <Button
                            type="submit"
                            form="product-form"
                            className="bg-ink! text-white! hover:bg-ink/90!"
                        >
                            Save changes
                        </Button>
                    )}
                </div>
            </div>

            {product && (
                <ProductForm
                    initial={product}
                    categories={productCategories}
                    existingNames={rows.filter((r) => r.id !== product.id).map((r) => r.name)}
                    onSubmit={(changes) => {
                        updateProduct(product.id, changes)
                        router.push("/products")
                    }}
                />
            )}
        </>
    )
}
