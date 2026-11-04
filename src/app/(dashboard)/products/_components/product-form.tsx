"use client"

import { useRef, useState, type ReactNode } from "react"
import { CopyIcon, MoreHorizontalIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  type ProductVariant,
} from "../_lib/products-store"

// borderless cell input: looks like plain text until focused
const cellInput =
  "h-8 border-transparent bg-transparent px-2 shadow-none hover:border-border focus-visible:border-ring"

type Errors = {
  name?: string
  category?: string
  image?: string
}

const MAX_IMAGE_MB = 2
const MAX_DESCRIPTION = 500

// hides the browser's up/down arrows on number inputs
const noSpinner =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

const statusHint: Record<ProductStatus, string> = {
  Active: "Visible and available to buy.",
  Draft: "Saved but hidden from shoppers.",
  "Out of stock": "Visible, but can't be bought.",
}

const statusDot: Record<ProductStatus, string> = {
  Active: "bg-emerald-500",
  Draft: "bg-amber-500",
  "Out of stock": "bg-red-500",
}

// Price cell: shows "$0.00" when idle, a plain number while typing.
function PriceCell({
  value,
  onChange,
}: {
  value: number
  onChange: (price: number) => void
}) {
  const [text, setText] = useState<string | null>(null)
  return (
    <Input
      aria-label="Variant price"
      inputMode="decimal"
      className={`${cellInput} text-right`}
      value={text ?? `$${value.toFixed(2)}`}
      onFocus={() => setText(String(value))}
      onChange={(e) => {
        setText(e.target.value)
        const n = Number(e.target.value)
        if (Number.isFinite(n) && n >= 0) onChange(n)
      }}
      onBlur={() => setText(null)}
    />
  )
}

// A section card: a gray title bar, then a white box of rows.
function Section({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <Card size="sm" className={`bg-muted/40 ring-border ${className ?? ""}`}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// A label + hint on the left, the control on the right, dashed line between rows.
function Row({
  label,
  hint,
  htmlFor,
  error,
  children,
}: {
  label: string
  hint: string
  htmlFor?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-3 border-b border-dashed border-border px-6 py-4 last:border-b-0 sm:grid-cols-[1fr_2.3fr] sm:gap-8">
      <div>
        <Label htmlFor={htmlFor} className="text-sm font-semibold">
          {label}
        </Label>
        <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
      </div>
      <div className="grid content-start gap-1.5">
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  )
}

// A stacked label + control, for the narrow side cards.
function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid content-start gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// The product fields with validation: General, Media and Variants on the left,
// Status and Organization on the right. Used by the create and edit pages.
export function ProductForm({
  categories,
  existingNames,
  initial,
  onSubmit,
}: {
  /** Categories to pick from. */
  categories: string[]
  /** Product names that are already taken (leave out the edited product). */
  existingNames: string[]
  initial?: NewProduct
  onSubmit: (product: NewProduct) => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [category, setCategory] = useState(initial?.category ?? "")
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? "Draft")
  const [image, setImage] = useState(initial?.image)
  const [description, setDescription] = useState(initial?.description ?? "")
  const [errors, setErrors] = useState<Errors>({})
  const [variants, setVariants] = useState<ProductVariant[]>(initial?.variants ?? [])
  const [dragging, setDragging] = useState(false)

  function addVariant() {
    setVariants((v) => [
      ...v,
      { id: crypto.randomUUID(), color: "", size: "", sku: "", price: 0, inventory: 0 },
    ])
  }
  function duplicateVariant(id: string) {
    setVariants((all) => {
      const i = all.findIndex((x) => x.id === id)
      if (i < 0) return all
      const copy = { ...all[i], id: crypto.randomUUID() }
      return [...all.slice(0, i + 1), copy, ...all.slice(i + 1)]
    })
  }
  function patchVariant(id: string, changes: Partial<ProductVariant>) {
    setVariants((v) => v.map((x) => (x.id === id ? { ...x, ...changes } : x)))
  }
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
    const found: Errors = {}

    if (!trimmed) found.name = "Please enter a product name."
    else if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      found.name = "A product with this name already exists."
    }

    if (!category) found.category = "Please choose a category."

    setErrors(found)
    if (Object.keys(found).length) return

    // price and stock come from the variants (lowest price, total inventory);
    // with no variants the product keeps its previous values
    const priceNum = variants.length
      ? Math.min(...variants.map((v) => v.price))
      : (initial?.price ?? 0)
    const stockNum = variants.length
      ? variants.reduce((sum, v) => sum + v.inventory, 0)
      : (initial?.stock ?? 0)

    onSubmit({
      name: trimmed,
      category,
      price: priceNum,
      stock: stockNum,
      status,
      image,
      description: description.trim() || undefined,
      variants: variants.length ? variants : undefined,
    })
  }

  return (
    <form
      id="product-form"
      onSubmit={submit}
      noValidate
      autoComplete="off"
      className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="grid gap-4">
        <Section title="General">
          <Row
            label="Name"
            hint="Product display name."
            htmlFor="product-name"
            error={errors.name}
          >
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
          </Row>
          <Row
            label="Description"
            hint={`Shown on the product page (${description.length}/${MAX_DESCRIPTION}).`}
            htmlFor="product-description"
          >
            <Textarea
              id="product-description"
              rows={5}
              maxLength={MAX_DESCRIPTION}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this product"
            />
          </Row>
        </Section>

        <Section title="Media">
          <div className="p-4">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                pickImage(e.dataTransfer.files?.[0])
              }}
              className={`flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-4 transition-colors ${
                dragging ? "border-gold bg-gold/5" : "border-border"
              }`}
            >
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt="Product preview"
                  className="size-16 rounded-md border border-border object-cover"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border"
                onClick={() => fileInput.current?.click()}
              >
                <PlusIcon />
                {image ? "Change file" : "Add file"}
              </Button>
              <span className="text-sm text-muted-foreground">
                Drop a product photo here or click to browse. PNG or JPG, up to{" "}
                {MAX_IMAGE_MB} MB.
              </span>
              {image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
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
            {errors.image && (
              <p className="mt-2 text-xs text-destructive">{errors.image}</p>
            )}
          </div>
        </Section>

        <Section title="Variants">
          <div className="p-4">
            <div className="mb-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border"
                onClick={addVariant}
              >
                <PlusIcon />
                Add variant
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-3 py-2 font-normal">Color</th>
                    <th className="px-3 py-2 font-normal">Size</th>
                    <th className="px-3 py-2 font-normal">SKU</th>
                    <th className="px-3 py-2 text-right font-normal">Price</th>
                    <th className="px-3 py-2 text-right font-normal">Inventory</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {variants.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No variants yet. Add one to get started.
                      </td>
                    </tr>
                  )}
                  {variants.map((v) => (
                    <tr key={v.id} className="border-b border-border last:border-b-0">
                      <td className="px-1 py-1.5">
                        <Input
                          aria-label="Color"
                          className={cellInput}
                          placeholder="Add color"
                          value={v.color}
                          onChange={(e) => patchVariant(v.id, { color: e.target.value })}
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <Input
                          aria-label="Size"
                          className={cellInput}
                          placeholder="Add size"
                          value={v.size}
                          onChange={(e) => patchVariant(v.id, { size: e.target.value })}
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <Input
                          aria-label="SKU"
                          className={cellInput}
                          placeholder="Add SKU"
                          value={v.sku}
                          onChange={(e) => patchVariant(v.id, { sku: e.target.value })}
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <PriceCell
                          value={v.price}
                          onChange={(price) => patchVariant(v.id, { price })}
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <Input
                          aria-label="Inventory"
                          type="number"
                          min={0}
                          step={1}
                          className={`${cellInput} text-right ${noSpinner}`}
                          value={v.inventory}
                          onChange={(e) =>
                            patchVariant(v.id, {
                              inventory: Math.max(0, Math.trunc(Number(e.target.value))),
                            })
                          }
                        />
                      </td>
                      <td className="px-1 py-1.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Variant actions"
                            >
                              <MoreHorizontalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => duplicateVariant(v.id)}>
                              <CopyIcon />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                setVariants((all) => all.filter((x) => x.id !== v.id))
                              }
                            >
                              <Trash2Icon />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>
      </div>

      <div className="grid gap-4 lg:sticky lg:top-4">
        <Section title="Status">
          <div className="p-4">
            <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
              <SelectTrigger className="w-full" aria-label="Status">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span className={`size-1.5 rounded-full ${statusDot[status]}`} />
                    {status}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {productStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="flex items-start gap-2">
                      <span
                        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${statusDot[s]}`}
                      />
                      <span className="grid text-left">
                        <span className="font-medium">{s}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {statusHint[s]}
                        </span>
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Section>

        <Section title="Organization">
          <div className="grid gap-4 p-4">
            <Field label="Category" error={errors.category}>
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
            </Field>
          </div>
        </Section>
      </div>
    </form>
  )
}
