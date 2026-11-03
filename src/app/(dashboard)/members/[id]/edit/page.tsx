"use client"

import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { members, updateMember } from "@/lib/members"
import { MemberForm } from "../../_components/member-form"

export default function EditMemberPage() {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const member = members.find((m) => m.id === id)

    return (
        <>
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="font-serif text-xl tracking-tight">
                        Edit member
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {member ? `Change the details of ${member.id}.` : "This member could not be found."}
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
                    {member && (
                        <Button
                            type="submit"
                            form="member-form"
                            className="bg-ink! text-white! hover:bg-ink/90!"
                        >
                            Save changes
                        </Button>
                    )}
                </div>
            </div>

            {member && (
                <MemberForm
                    initial={{
                        name: member.name,
                        gender: member.gender,
                        avatar: member.avatar ?? null,
                        notes: member.notes ?? "",
                        paymentMethod: member.paymentMethod ?? "Card",
                        billingCycle: member.billingCycle ?? "Monthly",
                        billingEmail: member.billingEmail ?? "",
                        phone: member.phone ?? "",
                        plan: member.plan,
                        active: member.status === "Active",
                    }}
                    onSubmit={(v) => {
                        updateMember(id, {
                            name: v.name,
                            gender: v.gender,
                            avatar: v.avatar,
                            notes: v.notes,
                            paymentMethod: v.paymentMethod,
                            billingCycle: v.billingCycle,
                            billingEmail: v.billingEmail,
                            phone: v.phone,
                            plan: v.plan,
                            status: v.active ? "Active" : "Inactive",
                        })
                        router.push("/members")
                    }}
                />
            )}
        </>
    )
}
