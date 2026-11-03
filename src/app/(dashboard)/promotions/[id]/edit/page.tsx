"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { PromotionForm } from "../../_components/promotion-form"
import { updatePromotion, usePromotions } from "../../_lib/promotions-store"

export default function EditPromotionPage() {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const rows = usePromotions()
    const promotion = rows.find((p) => p.id === id)
    // other promotions' codes, so this one can keep its own
    const existingCodes = useMemo(
        () => rows.filter((p) => p.id !== id).map((p) => p.code),
        [rows, id]
    )

    if (!promotion) {
        return (
            <div className="grid gap-3">
                <p className="text-sm text-muted-foreground">Promotion not found.</p>
                <Button
                    type="button"
                    variant="outline"
                    className="w-fit border-border"
                    onClick={() => router.push("/promotions")}
                >
                    Back to promotions
                </Button>
            </div>
        )
    }

    return (
        <>
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="font-serif text-xl tracking-tight">
                        Edit promotion
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Change the details of {promotion.name}.
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
                        Save changes
                    </Button>
                </div>
            </div>

            <PromotionForm
                initial={promotion}
                existingCodes={existingCodes}
                onSubmit={(changes) => {
                    updatePromotion(promotion.id, changes)
                    router.push("/promotions")
                }}
            />
        </>
    )
}
