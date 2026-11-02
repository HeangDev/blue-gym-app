"use client"

import { useSyncExternalStore } from "react"

export type PromotionStatus = "Active" | "Draft" | "Expired" | "Scheduled"

export type Promotion = {
    id: string
    name: string
    code: string
    type: string // e.g. "10% off order"
    status: PromotionStatus
    usage: number // times redeemed
    limit?: number // max redemptions; omitted = unlimited
    method?: "Code" | "Automatic" // how shoppers get it; omitted = Code
    minSubtotal?: number // minimum order subtotal; omitted = no minimum
    startDate: string // ISO yyyy-mm-dd
    endDate: string | null // null = no end
}

export type NewPromotion = Omit<Promotion, "id" | "usage">

export const promotionStatuses: PromotionStatus[] = ["Active", "Draft", "Expired", "Scheduled"]

const initial: Promotion[] = [
    { id: "PR-001", name: "Welcome Offer", code: "WELCOME10", type: "10% off order", status: "Active", usage: 1204, startDate: "2026-01-01", endDate: null },
    { id: "PR-002", name: "Summer Sale", code: "SUMMER25", type: "25% off order", status: "Expired", usage: 689, limit: 1000, startDate: "2026-06-01", endDate: "2026-08-10" },
    { id: "PR-003", name: "Free Shipping", code: "SHIPFREE", type: "Free shipping", status: "Active", usage: 2890, startDate: "2026-09-01", endDate: null },
    { id: "PR-004", name: "Khmer New Year", code: "KNY26", type: "20% off order", status: "Expired", usage: 342, limit: 1000, startDate: "2026-04-10", endDate: "2026-04-20" },
    { id: "PR-005", name: "Pchum Ben Special", code: "PCHUM5", type: "$5 off order", status: "Expired", usage: 187, limit: 200, startDate: "2026-10-01", endDate: "2026-10-15" },
    { id: "PR-006", name: "Water Festival", code: "WATER15", type: "15% off order", status: "Scheduled", usage: 0, startDate: "2026-11-22", endDate: "2026-11-25" },
    { id: "PR-007", name: "Black Friday", code: "BF30", type: "30% off order", status: "Scheduled", usage: 0, startDate: "2026-11-27", endDate: "2026-11-30" },
    { id: "PR-008", name: "Loyalty Reward", code: "LOYAL8", type: "$8 off order", status: "Active", usage: 456, limit: 500, startDate: "2026-06-01", endDate: null },
    { id: "PR-009", name: "Student Discount", code: "STUDENT12", type: "12% off order", status: "Active", usage: 233, startDate: "2026-02-01", endDate: "2026-12-31" },
    { id: "PR-010", name: "Christmas Gift", code: "XMAS20", type: "20% off order", status: "Draft", usage: 0, limit: 5000, startDate: "2026-12-20", endDate: "2026-12-26" },
    { id: "PR-011", name: "Buy One Get One", code: "BOGO", type: "Buy 1 get 1 free", status: "Draft", usage: 0, startDate: "2027-01-05", endDate: null },
]

// A tiny shared store, so the list page and the create page see the same
// promotions while you move between them. Replace it with your API later.
let promotions = initial
const listeners = new Set<() => void>()

function set(next: Promotion[]) {
    promotions = next
    listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export function addPromotion(promotion: NewPromotion) {
    // next id: highest existing PR-number + 1
    const next = Math.max(0, ...promotions.map((p) => Number(p.id.slice(3)))) + 1
    const id = `PR-${String(next).padStart(3, "0")}`
    set([{ id, usage: 0, ...promotion }, ...promotions])
}

export function updatePromotion(id: string, changes: Partial<NewPromotion>) {
    set(promotions.map((p) => (p.id === id ? { ...p, ...changes } : p)))
}

export function removePromotions(ids: string[]) {
    const gone = new Set(ids)
    set(promotions.filter((p) => !gone.has(p.id)))
}

export function usePromotions() {
    return useSyncExternalStore(subscribe, () => promotions, () => initial)
}
