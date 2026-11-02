"use client"

import { useId, useState } from "react"
import { Command as CommandPrimitive } from "cmdk"
import {
  ChevronDownIcon,
  CircleDashedIcon,
  CornerDownRightIcon,
  FolderIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type ParentOption = {
  id: string
  name: string
  depth: number
  /** how many direct sub-categories it has */
  children: number
}

export const TOP_LEVEL = "__top__"

// A searchable parent-category picker with an "Add new parent" button.
export function ParentPicker({
  value,
  onChange,
  options,
  existingNames,
  onAddParent,
  loading,
}: {
  value: string
  onChange: (id: string) => void
  options: ParentOption[]
  existingNames: string[]
  /** Creates a top-level category with this name and returns its id. */
  onAddParent: (name: string) => string
  /** Options are still loading: shows placeholders instead of a flash of "None". */
  loading?: boolean
}) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [error, setError] = useState("")

  const selected = options.find((o) => o.id === value)

  function pick(id: string) {
    onChange(id)
    setOpen(false)
  }

  function addParent() {
    const name = newName.trim()
    if (!name) return setError("Enter a name.")
    if (existingNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
      return setError("This name already exists.")
    }
    const id = onAddParent(name)
    onChange(id)
    setAdding(false)
    setNewName("")
    setError("")
    setOpen(false)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setAdding(false)
      setNewName("")
      setError("")
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-busy={loading}
          aria-label="Parent category"
          className="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 text-sm font-(family-name:--font-geist-sans) transition-colors outline-none hover:border-gold/50 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25 data-[state=open]:border-gold"
        >
          {loading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span className="truncate">
              {selected ? selected.name : "None (top level)"}
            </span>
          )}
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-(--radix-popover-trigger-width)! gap-0 rounded-xl! border border-border bg-white! p-0! font-(family-name:--font-geist-sans) shadow-lg ring-0!"
      >
        <Command className="bg-transparent! p-0!">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <CommandPrimitive.Input
              autoComplete="off"
              placeholder="Search categories..."
              className="h-10 w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground/80"
            />
          </div>

          <CommandList id={listId} className="max-h-56 p-1">
            {loading && (
              <div className="grid gap-1 p-1" aria-label="Loading categories">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2">
                    <Skeleton className="size-6 rounded-md" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            )}
            {!loading && <CommandEmpty>No category found.</CommandEmpty>}

            {!loading && (
              <CommandItem
                value="none top level"
                data-checked={value === TOP_LEVEL}
                onSelect={() => pick(TOP_LEVEL)}
                className="cursor-pointer gap-2.5 rounded-lg py-2 data-selected:bg-gold/15!"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <CircleDashedIcon className="size-3.5" />
                </span>
                <span className="flex-1">None (top level)</span>
              </CommandItem>
            )}

            {(loading ? [] : options).map((o) => (
              <CommandItem
                key={o.id}
                value={`${o.name} ${o.id}`}
                data-checked={value === o.id}
                onSelect={() => pick(o.id)}
                style={{ paddingLeft: 8 + o.depth * 18 }}
                className="cursor-pointer gap-2.5 rounded-lg py-2 pr-2 data-selected:bg-gold/15!"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md",
                    o.depth === 0
                      ? "bg-gold/15 text-gold-dark"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {o.depth === 0 ? (
                    <FolderIcon className="size-3.5" />
                  ) : (
                    <CornerDownRightIcon className="size-3.5" />
                  )}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate",
                    o.depth === 0 ? "font-medium" : "text-foreground/80"
                  )}
                >
                  {o.name}
                </span>
                {o.children > 0 && (
                  <span className="shrink-0 rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">
                    {o.children} sub
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>

        {/* add a new top-level (parent) category without leaving the form */}
        <div className="border-t border-border p-1.5">
          {adding ? (
            <div className="grid gap-1.5 p-1">
              <div className="flex gap-1.5">
                <Input
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    setError("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addParent()
                    }
                    if (e.key === "Escape") {
                      e.stopPropagation()
                      setAdding(false)
                    }
                  }}
                  placeholder="New parent name"
                  aria-label="New parent name"
                  aria-invalid={Boolean(error)}
                  autoFocus
                  className="h-8"
                />
                <Button type="button" size="sm" onClick={addParent}>
                  Add
                </Button>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAdding(true)}
              className="w-full justify-start text-gold-dark"
            >
              <PlusIcon />
              Add new parent category
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
