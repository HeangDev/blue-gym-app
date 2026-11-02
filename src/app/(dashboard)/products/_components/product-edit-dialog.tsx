"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProductForm } from "./product-form"
import { type NewProduct, type Product } from "../_lib/products-store"

// Popup for editing a product. Creating a product has its own page.
export function ProductEditDialog({
  product,
  onClose,
  categories,
  existingNames,
  onSave,
}: {
  /** The product being edited; the popup is open while this is set. */
  product: Product | null
  onClose: () => void
  categories: string[]
  existingNames: string[]
  onSave: (changes: NewProduct) => void
}) {
  return (
    <Dialog open={product !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-border bg-white! font-(family-name:--font-geist-sans) sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-(family-name:--font-serif) text-xl font-normal">
            Edit product
          </DialogTitle>
          <DialogDescription>Change the details of this product.</DialogDescription>
        </DialogHeader>
        {/* keyed by id, so the form starts fresh for each product */}
        {product && (
          <ProductForm
            key={product.id}
            categories={categories}
            existingNames={existingNames}
            initial={product}
            submitLabel="Save"
            onSubmit={(changes) => {
              onSave(changes)
              onClose()
            }}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
