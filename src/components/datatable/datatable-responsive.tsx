"use client"

// Responsive: hide low-priority columns on small screens and show their
// values in the row's expandable detail panel instead.
import { useSyncExternalStore } from "react"
import { flexRender, type ColumnDef, type Row } from "@tanstack/react-table"

import "./types"

export type Breakpoint = "sm" | "md" | "lg"

// Same widths as Tailwind's sm / md / lg.
const BREAKPOINT_PX: Record<Breakpoint, number> = { sm: 640, md: 768, lg: 1024 }

function useMinWidth(px: number) {
  const query = `(min-width: ${px}px)`
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", notify)
      return () => mql.removeEventListener("change", notify)
    },
    () => window.matchMedia(query).matches,
    // render the full (desktop) table on the server
    () => true
  )
}

/**
 * Column visibility for the current viewport: a column with
 * `meta.hideBelow = "md"` is hidden while the viewport is narrower than md.
 */
export function useResponsiveVisibility<TData>(
  columns: ColumnDef<TData, any>[] // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  const matches: Record<Breakpoint, boolean> = {
    sm: useMinWidth(BREAKPOINT_PX.sm),
    md: useMinWidth(BREAKPOINT_PX.md),
    lg: useMinWidth(BREAKPOINT_PX.lg),
  }

  const visibility: Record<string, boolean> = {}
  let hasHideable = false

  for (const col of columns) {
    const bp = col.meta?.hideBelow
    const id =
      col.id ?? ("accessorKey" in col ? String(col.accessorKey) : undefined)
    if (!bp || !id) continue
    hasHideable = true
    visibility[id] = matches[bp]
  }

  return { visibility, hasHideable }
}

/** Values of the columns hidden on this screen size, as label/value pairs. */
export function ResponsiveDetails<TData>({ row }: { row: Row<TData> }) {
  const hidden = row.getAllCells().filter((cell) => !cell.column.getIsVisible())
  if (hidden.length === 0) return null

  return (
    <dl className="flex flex-col divide-y divide-border/60 text-[13px]">
      {hidden.map((cell) => {
        const header = cell.column.columnDef.header
        return (
          <div
            key={cell.id}
            className="flex items-center justify-between gap-4 py-1.5 first:pt-0 last:pb-0"
          >
            <dt className="shrink-0 text-muted-foreground">
              {typeof header === "string" ? header : cell.column.id}
            </dt>
            <dd className="min-w-0 text-right">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
