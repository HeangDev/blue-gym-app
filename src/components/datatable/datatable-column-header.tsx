"use client"

// Sorting: a header cell that toggles sorting for its column.
import { flexRender, type Header } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"

import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function DataTableColumnHeader<TData, TValue>({
  header,
}: {
  header: Header<TData, TValue>
}) {
  const { column } = header
  const canSort = column.getCanSort()
  const sorted = column.getIsSorted()
  const right = column.columnDef.meta?.align === "right"

  const title = header.isPlaceholder
    ? null
    : flexRender(column.columnDef.header, header.getContext())

  return (
    <TableHead
      className={cn(
        "h-9 px-3! font-(family-name:--font-serif) text-xs font-medium tracking-wide text-foreground",
        right && "text-right",
        column.id.startsWith("__") && column.id !== "__actions" && "w-10 pr-0!",
        column.id === "__actions" && "w-12"
      )}
      aria-sort={
        sorted === "asc"
          ? "ascending"
          : sorted === "desc"
            ? "descending"
            : "none"
      }
    >
      {canSort ? (
        <button
          type="button"
          onClick={column.getToggleSortingHandler()}
          className={cn(
            "-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors outline-none hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold/40",
            sorted && "text-gold-dark"
          )}
        >
          {title}
          {sorted === "asc" ? (
            <ArrowUpIcon className="size-3" />
          ) : sorted === "desc" ? (
            <ArrowDownIcon className="size-3" />
          ) : (
            <ArrowUpDownIcon className="size-3 opacity-40" />
          )}
        </button>
      ) : (
        title
      )}
    </TableHead>
  )
}
