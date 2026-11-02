"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ParentPicker, TOP_LEVEL, type ParentOption } from "@/components/parent-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type { ParentOption }

export type NewCategory = {
  name: string
  parentId: string | null
  status: "Active" | "Draft"
}

export function CategoryCreateDialog({
  open,
  onOpenChange,
  parents,
  existingNames,
  mode = "create",
  initial,
  onCreate,
  onAddParent,
  parentsLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  parents: ParentOption[]
  /** Creates a new top-level (parent) category and returns its id. */
  onAddParent?: (name: string) => string
  /** Parent options are still loading. */
  parentsLoading?: boolean
  /** Names that are already taken (leave out the edited category's own name). */
  existingNames: string[]
  /** "edit" changes an existing category's name and status. */
  mode?: "create" | "edit"
  initial?: { name: string; status: NewCategory["status"] }
  onCreate: (category: NewCategory) => void
}) {
  const editing = mode === "edit"
  const [name, setName] = useState("")
  const [parent, setParent] = useState(TOP_LEVEL)
  const [status, setStatus] = useState<NewCategory["status"]>("Active")
  const [error, setError] = useState("")

  // fresh form every time the dialog opens (reset while rendering)
  const openKey = open ? `${initial?.name ?? ""}|${initial?.status ?? ""}` : null
  const [seenKey, setSeenKey] = useState<string | null>(null)
  if (openKey !== seenKey) {
    setSeenKey(openKey)
    if (openKey !== null) {
      setName(initial?.name ?? "")
      setParent(TOP_LEVEL)
      setStatus(initial?.status ?? "Active")
      setError("")
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError("Please enter a category name.")
    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      return setError("A category with this name already exists.")
    }
    onCreate({
      name: trimmed,
      parentId: parent === TOP_LEVEL ? null : parent,
      status,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-white! font-(family-name:--font-geist-sans) sm:max-w-sm">
        <form onSubmit={submit} autoComplete="off" className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-normal">
              {editing ? "Edit category" : "Create category"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Change the name or status of this category."
                : "Add a new top-level category or a sub-category."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Label htmlFor="category-name" required>Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              placeholder="e.g. Accessories"
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

          {!editing && (
            <div className="grid gap-1.5">
              <Label>Parent category</Label>
              <ParentPicker
                value={parent}
                onChange={setParent}
                options={parents}
                loading={parentsLoading}
                existingNames={existingNames}
                onAddParent={(name) => onAddParent?.(name) ?? TOP_LEVEL}
              />
            </div>
          )}

          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as NewCategory["status"])}
            >
              <SelectTrigger className="w-full" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-ink! text-white! hover:bg-ink/90!">
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
