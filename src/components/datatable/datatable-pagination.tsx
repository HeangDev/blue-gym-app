"use client"

// Pagination: result count, rows-per-page, page x of y, first/prev/next/last.
import { type Table } from "@tanstack/react-table"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DataTablePagination<TData>({
  table,
  pageSizes,
  showSelection = false,
}: {
  table: Table<TData>
  pageSizes: number[]
  showSelection?: boolean
}) {
  const { pageIndex, pageSize } = table.getState().pagination
  const total = table.getFilteredRowModel().rows.length
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)

  return (
    <div className="flex flex-col items-start gap-2 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-muted-foreground" aria-live="polite">
        {total === 0 ? "0 results" : `Showing ${from}–${to} of ${total}`}
        {showSelection && (
          <span className="ml-2 inline-block min-w-24 text-foreground tabular-nums">
            · {table.getSelectedRowModel().flatRows.length} selected
          </span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger
              size="sm"
              aria-label="Rows per page"
              className="w-16"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-muted-foreground">
          Page {total === 0 ? 0 : pageIndex + 1} of {table.getPageCount()}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden size-8! rounded-lg! border-border! bg-white! hover:border-gold/50! sm:inline-flex"
            aria-label="First page"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="size-8! rounded-lg! border-border! bg-white! hover:border-gold/50!"
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="size-8! rounded-lg! border-border! bg-white! hover:border-gold/50!"
            aria-label="Next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden size-8! rounded-lg! border-border! bg-white! hover:border-gold/50! sm:inline-flex"
            aria-label="Last page"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
