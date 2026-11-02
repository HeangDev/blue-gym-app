"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { PromotionForm } from "../_components/promotion-form"
import { addPromotion, usePromotions } from "../_lib/promotions-store"

export default function CreatePromotionPage() {
    const router = useRouter()
    const rows = usePromotions()
    const existingCodes = useMemo(() => rows.map((r) => r.code), [rows])

    return (
        <>
            <div>
                <Link
                    href="/promotions"
                    className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeftIcon className="size-3.5" />
                    Back to promotions
                </Link>
                <h2 className="font-serif text-3xl tracking-tight">
                    Create promotion
                </h2>
                <p className="text-sm text-muted-foreground">
                    Add a new discount campaign.
                </p>
            </div>

            <PromotionForm
                existingCodes={existingCodes}
                submitLabel="Create promotion"
                onSubmit={(promotion) => {
                    addPromotion(promotion)
                    router.push("/promotions")
                }}
                onCancel={() => router.push("/promotions")}
            />
        </>
    )
}
