"use client"

import { useState } from "react"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  MapPinIcon,
  SearchIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const branches = [
  { id: "hq", name: "Head Office", city: "Phnom Penh", staff: 48 },
  { id: "siem-reap", name: "Siem Reap Branch", city: "Siem Reap", staff: 21 },
  { id: "battambang", name: "Battambang Branch", city: "Battambang", staff: 16 },
  { id: "sihanoukville", name: "Sihanoukville Branch", city: "Sihanoukville", staff: 12 },
]

export function BranchSwitcher() {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState(branches[0].id)
  const [pendingId, setPendingId] = useState(activeId)
  const [query, setQuery] = useState("")

  const active = branches.find((b) => b.id === activeId) ?? branches[0]
  const pending = branches.find((b) => b.id === pendingId) ?? active
  const filtered = branches.filter((b) =>
    `${b.name} ${b.city}`.toLowerCase().includes(query.toLowerCase())
  )

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setPendingId(activeId)
      setQuery("")
    }
  }

  function confirm() {
    setActiveId(pendingId)
    setOpen(false)
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            tooltip="Switch branch"
            onClick={() => handleOpenChange(true)}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-gold to-gold-dark text-white shadow-md">
              <StoreIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate text-sm font-semibold">
                {active.name}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/60">
                {active.city}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-sidebar-foreground/60" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 overflow-hidden border-border bg-white! p-0 font-(family-name:--font-geist-sans) sm:max-w-md">
          {/* header: title + search */}
          <DialogHeader className="gap-1 px-5 pt-5 pb-4">
            <DialogTitle className="font-(family-name:--font-serif) text-xl font-normal tracking-tight">
              Switch branch
            </DialogTitle>
            <DialogDescription>
              Choose the branch you want to work in.
            </DialogDescription>
            <div className="relative mt-3">
              <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search branches..."
                aria-label="Search branches"
                className="pl-9"
              />
            </div>
          </DialogHeader>

          {/* branch cards */}
          <ul
            role="radiogroup"
            aria-label="Branches"
            className="flex max-h-[22rem] flex-col gap-2 overflow-y-auto px-5 pb-4"
          >
            {filtered.map((branch) => {
              const selected = branch.id === pendingId
              const current = branch.id === activeId
              return (
                <li key={branch.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPendingId(branch.id)}
                    onDoubleClick={() => {
                      setActiveId(branch.id)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
                      selected
                        ? "border-gold bg-gold/5 ring-1 ring-gold/30"
                        : "border-border hover:border-gold/50 hover:bg-ivory"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                        selected
                          ? "bg-gold text-white"
                          : "bg-gold/15 text-gold-dark"
                      )}
                    >
                      <StoreIcon className="size-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {branch.name}
                        </span>
                        {current && (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-px text-[10px] font-medium text-emerald-700">
                            Current
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="size-3" />
                          {branch.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="size-3" />
                          {branch.staff} staff
                        </span>
                      </span>
                    </span>

                    <span
                      aria-hidden
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        selected
                          ? "border-gold bg-gold text-white"
                          : "border-border bg-white"
                      )}
                    >
                      {selected && <CheckIcon className="size-3" strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">
                No branches found.
              </li>
            )}
          </ul>

          {/* footer: what will happen + actions */}
          <div className="flex items-center justify-between gap-3 border-t border-border bg-ivory px-5 py-3">
            <p className="min-w-0 truncate text-xs text-muted-foreground" aria-live="polite">
              {pendingId === activeId ? (
                "You're working in this branch."
              ) : (
                <>
                  Switch to{" "}
                  <span className="font-medium text-foreground">
                    {pending.name}
                  </span>
                </>
              )}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirm} disabled={pendingId === activeId}>
                Switch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
