"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ProductForm } from "../_components/product-form"
import {
    addProduct,
    productCategories,
    useProducts,
} from "../_lib/products-store"

export default function CreateProductPage() {
    const router = useRouter()
    const rows = useProducts()

    return (
        <>
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="font-serif text-xl tracking-tight">
                        Create product
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Add a new product to your catalog.
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
                    <Button
                        type="submit"
                        form="product-form"
                        className="bg-ink! text-white! hover:bg-ink/90!"
                    >
                        Create product
                    </Button>
                </div>
            </div>

            <ProductForm
                categories={productCategories}
                existingNames={rows.map((r) => r.name)}
                onSubmit={(product) => {
                    addProduct(product)
                    router.push("/products")
                }}
            />
        </>
    )
}
