import type { BillingCycle, DiscountType, Gender, PaymentMethod } from "@/app/(dashboard)/members/_components/member-form"

export type Status = "Active" | "Inactive" | "Pending"
export type Plan = "Free" | "Pro" | "Business"

export type Member = {
    id: string
    name: string
    gender: Gender | ""
    phone?: string
    avatar?: string | null
    notes?: string
    paymentMethod?: PaymentMethod
    billingCycle?: BillingCycle
    billingEmail?: string
    discount?: { type: DiscountType; value: number } | null
    totalSpent?: number
    avgOrder?: number
    subscriptions?: number
    plan: Plan
    joined: string // ISO yyyy-mm-dd
    status: Status
}

export const members: Member[] = [
    { id: "M-001", name: "Sokha Chan", gender: "Female", phone: "+855 12 345 037", plan: "Pro", joined: "2026-01-12", totalSpent: 0, avgOrder: 0, subscriptions: 3, status: "Active" },
    { id: "M-002", name: "Dara Vann", gender: "Male", phone: "+855 12 345 074", plan: "Free", joined: "2026-02-03", totalSpent: 610.88, avgOrder: 610.88, subscriptions: 1, status: "Active" },
    { id: "M-003", name: "Srey Neang", gender: "Female", phone: "+855 12 345 111", plan: "Business", joined: "2026-02-18", totalSpent: 1240, avgOrder: 310, subscriptions: 5, status: "Active" },
    { id: "M-004", name: "Vibol Sok", gender: "Male", phone: "+855 12 345 148", plan: "Pro", joined: "2026-03-07", totalSpent: 89.5, avgOrder: 89.5, subscriptions: 3, status: "Inactive" },
    { id: "M-005", name: "Chantha Ly", gender: "Female", phone: "+855 12 345 185", plan: "Free", joined: "2026-03-21", totalSpent: 0, avgOrder: 0, subscriptions: 1, status: "Pending" },
    { id: "M-006", name: "Rithy Keo", gender: "Male", phone: "+855 12 345 222", plan: "Pro", joined: "2026-04-02", totalSpent: 3480.25, avgOrder: 870.06, subscriptions: 3, status: "Active" },
    { id: "M-007", name: "Bopha Mao", gender: "Female", phone: "+855 12 345 259", plan: "Business", joined: "2026-04-15", totalSpent: 15200, avgOrder: 2533.33, subscriptions: 5, status: "Active" },
    { id: "M-008", name: "Sophea Heng", gender: "Female", phone: "+855 12 345 296", plan: "Free", joined: "2026-05-09", totalSpent: 0, avgOrder: 0, subscriptions: 1, status: "Inactive" },
    { id: "M-009", name: "Pisey Tep", gender: "Male", phone: "+855 12 345 333", plan: "Pro", joined: "2026-05-27", totalSpent: 420.1, avgOrder: 210.05, subscriptions: 3, status: "Pending" },
    { id: "M-010", name: "Kosal Ouk", gender: "Male", phone: "+855 12 345 370", plan: "Free", joined: "2026-06-11", totalSpent: 275, avgOrder: 137.5, subscriptions: 1, status: "Active" },
    { id: "M-011", name: "Malis Pich", gender: "Female", phone: "+855 12 345 407", plan: "Business", joined: "2026-07-04", totalSpent: 8900.75, avgOrder: 2225.19, subscriptions: 5, status: "Active" },
    { id: "M-012", name: "Sambath Roth", gender: "Male", phone: "+855 12 345 444", plan: "Pro", joined: "2026-08-19", totalSpent: 1630, avgOrder: 543.33, subscriptions: 3, status: "Inactive" },
]

export function addMember(m: Omit<Member, "id" | "joined">): Member {
    const next = members.reduce((max, r) => Math.max(max, Number(r.id.slice(2)) || 0), 0) + 1
    const member: Member = {
        ...m,
        id: `M-${String(next).padStart(3, "0")}`,
        joined: new Date().toISOString().slice(0, 10),
    }
    members.unshift(member)
    return member
}

export function updateMember(id: string, patch: Partial<Member>) {
    const i = members.findIndex((m) => m.id === id)
    if (i >= 0) members[i] = { ...members[i], ...patch }
}
