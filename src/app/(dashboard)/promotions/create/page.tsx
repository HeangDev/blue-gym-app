"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { PromotionForm } from "../_components/promotion-form"
import { addPromotion, usePromotions } from "../_lib/promotions-store"

export default function CreatePromotionPage() {
    const router = useRouter()
    const rows = usePromotions()
    const existingCodes = useMemo(() => rows.map((r) => r.code), [rows])

    return (
        <>
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="font-serif text-xl tracking-tight">
                        Create promotion
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Add a new discount campaign.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-border"
                        onClick={() => router.push("/promotions")}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="promotion-form"
                        className="bg-ink! text-white! hover:bg-ink/90!"
                    >
                        Create promotion
                    </Button>
                </div>
            </div>

            <PromotionForm
                existingCodes={existingCodes}
                onSubmit={(promotion) => {
                    addPromotion(promotion)
                    router.push("/promotions")
                }}
            />
        </>
    )
}
