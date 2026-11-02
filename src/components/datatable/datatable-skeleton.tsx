import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type DataTableSkeletonProps = {
  /** Number of placeholder columns. */
  columns?: number
  /** Number of placeholder rows (use the table's page size). */
  rows?: number
  /** Leading checkbox-sized column, to match tables with `selection`. */
  selection?: boolean
  /** Trailing small column, to match tables with `rowActions`. */
  actions?: boolean
  className?: string
}

// Placeholder table to show while data loads. Cell padding matches
// DataTable, so the real table replaces it without the page jumping.
export function DataTableSkeleton({
  columns = 4,
  rows = 5,
  selection,
  actions,
  className,
}: DataTableSkeletonProps) {
  const cols = Array.from({ length: columns })

  return (
    <div
      className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}
      aria-busy="true"
      aria-label="Loading data"
    >
      <Table className="text-[13px]">
        <TableHeader className="bg-ivory [&_tr]:border-gold/30">
          <TableRow>
            {selection && (
              <TableCell className="w-10 px-3! py-2! pr-0!">
                <Skeleton className="size-4" />
              </TableCell>
            )}
            {cols.map((_, i) => (
              <TableCell key={i} className="px-3! py-2!">
                <Skeleton className="h-4 w-20" />
              </TableCell>
            ))}
            {actions && <TableCell className="w-12 px-3! py-2!" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r} className="border-border/70 hover:bg-transparent">
              {selection && (
                <TableCell className="w-10 px-3! py-2! pr-0!">
                  <Skeleton className="size-4" />
                </TableCell>
              )}
              {cols.map((_, c) => (
                <TableCell key={c} className="px-3! py-2!">
                  {/* vary widths a little so it reads as content, not a grid */}
                  <Skeleton
                    className="h-5"
                    style={{ width: `${55 + ((r * 7 + c * 13) % 40)}%` }}
                  />
                </TableCell>
              ))}
              {actions && (
                <TableCell className="w-12 px-3! py-2!">
                  <Skeleton className="ml-auto size-5" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
