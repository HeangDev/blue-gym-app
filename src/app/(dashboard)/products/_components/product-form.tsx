"use client"

import { useRef, useState } from "react"
import { ImageIcon, UploadIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

type Errors = {
  name?: string
  category?: string
  price?: string
  stock?: string
  image?: string
}

const MAX_IMAGE_MB = 2
const MAX_DESCRIPTION = 500

// hides the browser's up/down arrows on number inputs
const noSpinner =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

// The product fields with validation, as a full-width two-column layout.
// Used by the create and edit pages.
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
  const [image, setImage] = useState(initial?.image)
  const [description, setDescription] = useState(initial?.description ?? "")
  const [errors, setErrors] = useState<Errors>({})
  const fileInput = useRef<HTMLInputElement>(null)

  // read the chosen picture into a data URL, so it can be previewed and saved
  function pickImage(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      return setErrors((c) => ({ ...c, image: "Choose an image file." }))
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      return setErrors((c) => ({ ...c, image: `The image must be under ${MAX_IMAGE_MB} MB.` }))
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImage(String(reader.result))
      setErrors((c) => ({ ...c, image: undefined }))
    }
    reader.readAsDataURL(file)
  }

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

    onSubmit({
      name: trimmed,
      category,
      price: priceNum,
      stock: stockNum,
      status,
      image,
      description: description.trim() || undefined,
    })
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      autoComplete="off"
      className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-start"
    >
      <Card size="sm" className="ring-gold/25">
        <CardHeader>
          <CardTitle className="font-(family-name:--font-serif) text-base font-normal">
            Product details
          </CardTitle>
          <CardDescription className="text-xs">
            Name, category, price, stock and a description.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid content-start gap-1.5 sm:col-span-2">
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

          <div className="grid content-start gap-1.5">
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

          <div className="grid content-start gap-1.5">
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

          <div className="grid content-start gap-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="product-description">Description</Label>
              <span className="text-xs text-muted-foreground">
                {description.length}/{MAX_DESCRIPTION}
              </span>
            </div>
            <Textarea
              id="product-description"
              rows={5}
              maxLength={MAX_DESCRIPTION}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this product"
              className="placeholder:text-xs"
            />
          </div>
        </CardContent>
      </Card>

      <Card size="sm" className="ring-gold/25">
        <CardHeader>
          <CardTitle className="font-(family-name:--font-serif) text-base font-normal">
            Product image
          </CardTitle>
          <CardDescription className="text-xs">
            PNG or JPG, up to {MAX_IMAGE_MB} MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            aria-label={image ? "Change image" : "Upload image"}
            className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors outline-none hover:border-gold/60 hover:bg-gold/5 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25"
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Product preview" className="size-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm">
                <ImageIcon className="size-8" />
                Click to upload an image
              </span>
            )}
          </button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border"
              onClick={() => fileInput.current?.click()}
            >
              <UploadIcon />
              {image ? "Change" : "Upload"}
            </Button>
            {image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImage(undefined)
                  if (fileInput.current) fileInput.current.value = ""
                }}
              >
                <XIcon />
                Remove
              </Button>
            )}
          </div>
          <input
            ref={fileInput}
            id="product-image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => pickImage(e.target.files?.[0])}
          />
          {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 lg:col-span-2">
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
