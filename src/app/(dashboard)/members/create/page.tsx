"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { addMember } from "@/lib/members"
import { MemberForm } from "../_components/member-form"

export default function CreateMemberPage() {
    const router = useRouter()

    return (
        <>
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="font-serif text-xl tracking-tight">
                        Create member
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Add a member. They are assigned an ID automatically.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-border"
                        onClick={() => router.push("/members")}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="member-form"
                        className="bg-ink! text-white! hover:bg-ink/90!"
                    >
                        Create member
                    </Button>
                </div>
            </div>

            <MemberForm
                onSubmit={(v) => {
                    addMember({
                        name: v.name,
                        gender: v.gender,
                        phone: v.phone,
                        avatar: v.avatar,
                        notes: v.notes,
                        paymentMethod: v.paymentMethod,
                        billingCycle: v.billingCycle,
                        billingEmail: v.billingEmail,
                        discount: v.discount,
                        plan: v.plan,
                        status: v.active ? "Active" : "Inactive",
                    })
                    router.push("/members")
                }}
            />
        </>
    )
}
