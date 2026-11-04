"use client"

import { useRef, useState } from "react"
import { ImageIcon } from "lucide-react"
import { cn } from "cn"

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

const TOP_LEVEL = "__top__"

export type ParentOption = {
  id: string
  name: string
  depth: number
  children: number
}

export type CategoryValues = {
  name: string
  description: string
  image: string | null
  parentId: string | null
  active: boolean
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
        checked ? "bg-gold" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-4"
        )}
      />
    </button>
  )
}

export function CategoryDrawer({
  open,
  onOpenChange,
  parents,
  existingNames,
  mode = "create",
  initial,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  parents: ParentOption[]
  /** Names that are already taken (leave out the edited category's own name). */
  existingNames: string[]
  mode?: "create" | "edit"
  initial?: Partial<CategoryValues>
  onSubmit: (values: CategoryValues) => void
}) {
  const editing = mode === "edit"
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [parent, setParent] = useState(TOP_LEVEL)
  const [active, setActive] = useState(true)
  const [error, setError] = useState("")

  // fresh form every time the drawer opens (reset while rendering)
  const openKey = open ? `${initial?.name ?? ""}|${initial?.active ?? ""}` : null
  const [seenKey, setSeenKey] = useState<string | null>(null)
  if (openKey !== seenKey) {
    setSeenKey(openKey)
    if (openKey !== null) {
      setName(initial?.name ?? "")
      setDescription(initial?.description ?? "")
      setImage(initial?.image ?? null)
      setParent(TOP_LEVEL)
      setActive(initial?.active ?? true)
      setError("")
    }
  }

  function pickImage(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError("Please enter a category name.")
    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      return setError("A category with this name already exists.")
    }
    onSubmit({
      name: trimmed,
      description: description.trim(),
      image,
      parentId: parent === TOP_LEVEL ? null : parent,
      active,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="gap-0 overflow-hidden rounded-2xl border border-border bg-white! font-(family-name:--font-geist-sans) data-[side=right]:inset-y-3 data-[side=right]:right-3 data-[side=right]:h-auto data-[side=right]:w-[calc(100%-1.5rem)] data-[side=right]:sm:max-w-md"
      >
        <form onSubmit={submit} autoComplete="off" className="flex h-full min-h-0 flex-col">
          <SheetHeader className="border-b border-border px-6 py-5">
            <SheetTitle className="text-lg">
              {editing ? "Edit category" : "New category"}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? "Update this category."
                : "Add a category to your catalog tree."}
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 content-start gap-6 overflow-y-auto px-6 py-5">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError("")
                }}
                placeholder="e.g. Outerwear"
                autoFocus
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "category-name-error" : undefined}
              />
              {error && (
                <p id="category-name-error" className="text-xs text-destructive">
                  {error}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description for the category."
                className="min-h-20"
              />
            </div>

            <div className="grid gap-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-5" />
                  )}
                </div>
                <div className="grid justify-items-start gap-2 text-sm text-muted-foreground">
                  <span>
                    Drop an image here, or browse. Without art, a product photo is used.
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                    >
                      {image ? "Change image" : "Add image"}
                    </Button>
                    {image && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setImage(null)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    pickImage(e.target.files?.[0])
                    e.target.value = ""
                  }}
                />
              </div>
            </div>

            {!editing && (
              <div className="grid gap-2">
                <Label>Parent category</Label>
                <Select value={parent} onValueChange={setParent}>
                  <SelectTrigger className="w-full" aria-label="Parent category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent maxHeight={320}>
                    <SelectItem value={TOP_LEVEL}>None (top level)</SelectItem>
                    {parents.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span style={{ paddingLeft: p.depth * 12 }}>{p.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-sm text-muted-foreground">Visible in the storefront.</p>
              </div>
              <Switch checked={active} onChange={setActive} label="Active" />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Draft</p>
                <p className="text-sm text-muted-foreground">
                  Not published, hidden from the storefront.
                </p>
              </div>
              <Switch checked={!active} onChange={(v) => setActive(!v)} label="Draft" />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-ink! text-white! hover:bg-ink/90!">
              {editing ? "Save changes" : "Create category"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
