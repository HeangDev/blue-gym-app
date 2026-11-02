"use client"

import { useSyncExternalStore } from "react"

export type ProductStatus = "Active" | "Draft" | "Out of stock"

export type Product = {
    id: string
    name: string
    category: string
    price: number
    stock: number
    status: ProductStatus
    /** Picture of the product: an image URL, or a data URL while there is no upload API. */
    image?: string
    description?: string
}

export type NewProduct = Omit<Product, "id">

export const productStatuses: ProductStatus[] = ["Active", "Draft", "Out of stock"]

const initial: Product[] = [
    { id: "P-1001", name: "Wireless Mouse", category: "Accessories", price: 24.99, stock: 120, status: "Active" },
    { id: "P-1002", name: "Mechanical Keyboard", category: "Accessories", price: 89.5, stock: 45, status: "Active" },
    { id: "P-1003", name: "27\" Monitor", category: "Displays", price: 249, stock: 18, status: "Active" },
    { id: "P-1004", name: "USB-C Hub", category: "Accessories", price: 39.9, stock: 0, status: "Out of stock" },
    { id: "P-1005", name: "Laptop Stand", category: "Accessories", price: 29, stock: 76, status: "Active" },
    { id: "P-1006", name: "Webcam HD", category: "Video", price: 59.99, stock: 33, status: "Draft" },
    { id: "P-1007", name: "Noise-Cancelling Headset", category: "Audio", price: 129, stock: 22, status: "Active" },
    { id: "P-1008", name: "Bluetooth Speaker", category: "Audio", price: 49.5, stock: 0, status: "Out of stock" },
    { id: "P-1009", name: "4K Webcam", category: "Video", price: 149, stock: 12, status: "Draft" },
    { id: "P-1010", name: "Portable SSD 1TB", category: "Storage", price: 99.9, stock: 64, status: "Active" },
    { id: "P-1011", name: "Gaming Chair", category: "Furniture", price: 219, stock: 9, status: "Active" },
    { id: "P-1012", name: "Desk Lamp", category: "Furniture", price: 34.25, stock: 51, status: "Active" },
    { id: "P-1013", name: "Curved Monitor 32\"", category: "Displays", price: 389, stock: 0, status: "Out of stock" },
    { id: "P-1014", name: "Microphone USB", category: "Audio", price: 74, stock: 28, status: "Draft" },
    { id: "P-1015", name: "Memory Card 256GB", category: "Storage", price: 27.5, stock: 140, status: "Active" },
]

export const productCategories = [...new Set(initial.map((p) => p.category))].sort()

// A tiny shared store, so the list page and the create page see the same
// products while you move between them. Replace it with your API later.
let products = initial
const listeners = new Set<() => void>()

function set(next: Product[]) {
    products = next
    listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export function addProduct(product: NewProduct) {
    // next id: highest existing P-number + 1
    const next = Math.max(1000, ...products.map((p) => Number(p.id.slice(2)))) + 1
    set([...products, { id: `P-${next}`, ...product }])
}

export function updateProduct(id: string, changes: Partial<NewProduct>) {
    set(products.map((p) => (p.id === id ? { ...p, ...changes } : p)))
}

export function removeProducts(ids: string[]) {
    const gone = new Set(ids)
    set(products.filter((p) => !gone.has(p.id)))
}

export function useProducts() {
    return useSyncExternalStore(subscribe, () => products, () => initial)
}
