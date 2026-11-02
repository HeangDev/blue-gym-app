"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  productStatuses,
  type NewProduct,
  type ProductStatus,
} from "../_lib/products-store"

type Errors = { name?: string; category?: string; price?: string; stock?: string }

// hides the browser's up/down arrows on number inputs
const noSpinner =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

// The product fields with validation. Used by the create page and the edit popup.
export function ProductForm({
  categories,
  existingNames,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  /** Categories to pick from. */
  categories: string[]
  /** Product names that are already taken (leave out the edited product). */
  existingNames: string[]
  initial?: NewProduct
  submitLabel: string
  onSubmit: (product: NewProduct) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [category, setCategory] = useState(initial?.category ?? "")
  const [price, setPrice] = useState(initial ? String(initial.price) : "")
  const [stock, setStock] = useState(initial ? String(initial.stock) : "")
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? "Active")
  const [errors, setErrors] = useState<Errors>({})

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    const priceNum = Number(price)
    const stockNum = Number(stock)
    const found: Errors = {}

    if (!trimmed) found.name = "Please enter a product name."
    else if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      found.name = "A product with this name already exists."
    }

    if (!category) found.category = "Please choose a category."

    if (price.trim() === "") found.price = "Please enter a price."
    else if (!Number.isFinite(priceNum) || priceNum < 0) found.price = "Enter a valid price."

    if (stock.trim() === "") found.stock = "Please enter the stock."
    else if (!Number.isInteger(stockNum) || stockNum < 0) found.stock = "Enter a whole number."

    setErrors(found)
    if (Object.keys(found).length) return

    onSubmit({ name: trimmed, category, price: priceNum, stock: stockNum, status })
  }

  return (
    <form onSubmit={submit} noValidate autoComplete="off" className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="product-name" required>Name</Label>
        <Input
          id="product-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setErrors((c) => ({ ...c, name: undefined }))
          }}
          placeholder="e.g. Wireless Mouse"
          autoFocus
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label required>Category</Label>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v)
            setErrors((c) => ({ ...c, category: undefined }))
          }}
        >
          <SelectTrigger
            className="w-full"
            aria-label="Category"
            aria-invalid={Boolean(errors.category)}
          >
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid content-start gap-1.5">
          <Label htmlFor="product-price" required>Price (USD)</Label>
          <Input
            id="product-price"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value)
              setErrors((c) => ({ ...c, price: undefined }))
            }}
            placeholder="0.00"
            aria-invalid={Boolean(errors.price)}
            className={noSpinner}
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>

        <div className="grid content-start gap-1.5">
          <Label htmlFor="product-stock" required>Stock</Label>
          <Input
            id="product-stock"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={stock}
            onChange={(e) => {
              setStock(e.target.value)
              setErrors((c) => ({ ...c, stock: undefined }))
            }}
            placeholder="0"
            aria-invalid={Boolean(errors.stock)}
            className={noSpinner}
          />
          {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
          <SelectTrigger className="w-full" aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {productStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          className="border-border"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-ink! text-white! hover:bg-ink/90!">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
