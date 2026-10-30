"use client"

// Expanding: a plus / minus button, used for tree rows (sub rows) and detail panels.
import { type ColumnDef, type Row } from "@tanstack/react-table"
import { MinusIcon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function ExpandButton<TData>({ row }: { row: Row<TData> }) {
  // no children: a quiet minus marker instead of a button
  if (!row.getCanExpand()) {
    return (
      <span
        aria-hidden
        className="flex size-5 items-center justify-center text-muted-foreground/50"
      >
        <MinusIcon className="size-4" strokeWidth={1.5} />
      </span>
    )
  }

  const expanded = row.getIsExpanded()
  const Icon = expanded ? MinusIcon : PlusIcon

  return (
    <button
      type="button"
      onClick={row.getToggleExpandedHandler()}
      aria-label={expanded ? "Collapse row" : "Expand row"}
      aria-expanded={expanded}
      className={cn(
        "flex size-5 items-center justify-center rounded-sm transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/40",
        expanded ? "text-muted-foreground" : "text-gold-dark"
      )}
    >
      <Icon className="size-4" strokeWidth={1.5} />
    </button>
  )
}

// A separate expand column (detail panels, or tree rows when the button
// can't sit inside the first column).
export function getExpanderColumn<TData>(): ColumnDef<TData> {
  return {
    id: "__expander",
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    size: 40,
    header: () => null,
    cell: ({ row }) => <ExpandButton row={row} />,
  }
}
