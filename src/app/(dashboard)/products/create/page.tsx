"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { ProductForm } from "../_components/product-form"
import { Card, CardContent } from "@/components/ui/card"
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
            <div>
                <Link
                    href="/products"
                    className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeftIcon className="size-3.5" />
                    Back to products
                </Link>
                <h2 className="font-(family-name:--font-serif) text-3xl tracking-tight">
                    Create product
                </h2>
                <p className="text-sm text-muted-foreground">
                    Add a new product to your catalog.
                </p>
            </div>

            <Card size="sm" className="max-w-xl ring-gold/25">
                <CardContent>
                    <ProductForm
                        categories={productCategories}
                        existingNames={rows.map((r) => r.name)}
                        submitLabel="Create product"
                        onSubmit={(product) => {
                            addProduct(product)
                            router.push("/products")
                        }}
                        onCancel={() => router.push("/products")}
                    />
                </CardContent>
            </Card>
        </>
    )
}
