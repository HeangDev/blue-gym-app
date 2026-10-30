"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Command as CommandPrimitive } from "cmdk"
import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"
import { SearchIcon } from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { navGroups, settingsItem } from "@/lib/nav"

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  const groups = [
    ...navGroups,
    { label: "System", items: [settingsItem] },
  ]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-(family-name:--font-geist-sans) text-muted-foreground/80 transition-colors outline-none hover:border-gold/50 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25 md:flex"
      >
        <SearchIcon className="size-4" />
        <span className="whitespace-nowrap">Search...</span>
        <kbd className="ml-auto whitespace-nowrap rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Quick navigation"
        description="Search for a page and jump to it."
        className="top-[16%] max-w-[calc(100%-2rem)] border border-gold/30 bg-ivory shadow-none! ring-0! sm:max-w-sm"
      >
        <Command className="rounded-none bg-transparent">
          <div className="flex items-center gap-2.5 border-b border-gold/25 px-3.5 py-2.5">
            <SearchIcon className="size-4 shrink-0 text-gold-dark" />
            <CommandPrimitive.Input
              autoComplete="off"
              autoFocus
              placeholder="Go to..."
              className="w-full bg-transparent font-(family-name:--font-geist-sans) text-sm outline-hidden placeholder:text-muted-foreground/80"
            />
            <kbd className="shrink-0 rounded-md border border-gold/30 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Esc
            </kbd>
          </div>

          <SimpleBar style={{ maxHeight: 240 }}>
          <CommandList className="max-h-none overflow-visible p-1">
            <CommandEmpty>No pages found.</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup
                key={group.label}
                heading={group.label}
                className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:uppercase"
              >
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${group.label} ${item.title}`}
                    onSelect={() => go(item.href)}
                    className="group/item gap-2.5 rounded-md px-2.5 py-1.5 data-selected:bg-linear-to-r data-selected:from-gold-light data-selected:to-gold data-selected:text-white data-selected:*:[svg]:text-white"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded border border-gold/30 bg-background text-gold-dark">
                      <item.icon className="size-3.5" />
                    </span>
                    <span className="text-[13px] font-medium">{item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
          </SimpleBar>

          <div className="flex items-center gap-3 border-t border-gold/25 px-3.5 py-1.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1">↑</kbd>
              <kbd className="rounded border bg-background px-1">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border bg-background px-1">↵</kbd>
              open
            </span>
          </div>
        </Command>
      </CommandDialog>
    </>
  )
}
