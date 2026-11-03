"use client"

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type Row,
  type RowSelectionState,
  type Table as TanstackTable,
  type SortingState,
} from "@tanstack/react-table"

import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

import { DataTableColumnHeader } from "./datatable-column-header"
import { ExpandButton, getExpanderColumn } from "./datatable-expander"
import { DataTablePagination } from "./datatable-pagination"
import { ResponsiveDetails, useResponsiveVisibility } from "./datatable-responsive"
import {
  getActionsColumn,
  RowActionConfirm,
  type PendingAction,
  type RowAction,
} from "./datatable-row-actions"
import { getSelectColumn } from "./datatable-selection"
import { type ExportType } from "./datatable-export"
import { DataTableToolbar } from "./datatable-toolbar"
import "./types"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[] // eslint-disable-line @typescript-eslint/no-explicit-any
  data: TData[]
  searchPlaceholder?: string
  pageSizes?: number[]
  /** Adds a multi-row checkbox column, with select-all in the header. */
  selection?: boolean
  onSelectionChange?: (rows: TData[]) => void
  /** Tree view: return the child rows of a row. */
  getSubRows?: (row: TData) => TData[] | undefined
  /** Expandable panel: content shown under an expanded row. */
  renderSubComponent?: (row: Row<TData>) => ReactNode
  /** Stable row ids (keeps selection when sorting/filtering). */
  getRowId?: (row: TData) => string
  /** Show a filter control for each column that sets `meta.filter`. */
  showColumnFilters?: boolean
  /** Export buttons to show: copy, csv, excel, pdf, print. */
  exports?: ExportType[]
  exportFileName?: string
  exportTitle?: string
  /** Shows a Delete button when rows are selected; called after confirming. */
  onDeleteSelected?: (rows: TData[]) => void
  /** A "..." menu on every row; each action runs your handler. */
  rowActions?: RowAction<TData>[]
  /** Called when a row is clicked (not its checkbox, buttons or menu). */
  onRowClick?: (row: TData) => void
  /** Shows placeholder rows (built from this table's own columns) while data loads. */
  loading?: boolean
}

// Wires up the table state (sorting, filtering, pagination, selection,
// expanding) and composes the toolbar, header and pagination pieces.
export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder,
  pageSizes = [5, 10, 20, 50],
  selection,
  onSelectionChange,
  getSubRows,
  renderSubComponent,
  getRowId,
  showColumnFilters,
  exports,
  exportFileName,
  exportTitle,
  onDeleteSelected,
  rowActions,
  onRowClick,
  loading,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})

  // responsive: columns hidden on this screen size move into the detail panel
  const { visibility } = useResponsiveVisibility(columns)
  const hasHiddenColumns = Object.values(visibility).some((v) => !v)

  // Tree view: the first data column shows the hierarchy (indent + connector,
  // bold main rows) and holds the chevron itself. When detail panels or hidden
  // columns also need a chevron, it lives in its own column instead.
  const treeMode = Boolean(getSubRows)
  const needsExpanderColumn = Boolean(renderSubComponent || hasHiddenColumns)
  const inlineChevron = treeMode && !needsExpanderColumn

  // row actions: run the handler now, or ask first when the action has `confirm`
  const [pendingAction, setPendingAction] =
    useState<PendingAction<TData> | null>(null)

  const allColumns = useMemo(() => {
    const extra: ColumnDef<TData, any>[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
    if (selection) extra.push(getSelectColumn<TData>())
    if (needsExpanderColumn) extra.push(getExpanderColumn<TData>())
    const actionsColumn: ColumnDef<TData, any>[] = rowActions?.length // eslint-disable-line @typescript-eslint/no-explicit-any
      ? [
          getActionsColumn<TData>(rowActions, (action, row) =>
            action.confirm
              ? setPendingAction({ action, row })
              : action.onSelect(row)
          ),
        ]
      : []
    return [...extra, ...columns, ...actionsColumn]
  }, [columns, selection, needsExpanderColumn, rowActions])

  const firstDataColumnId = (() => {
    const first = columns[0]
    if (!first) return undefined
    return first.id ?? ("accessorKey" in first ? String(first.accessorKey) : undefined)
  })()

  const tableRef = useRef<TanstackTable<TData> | null>(null)

  // Tree views: ticking a parent ticks its children (done by TanStack), and
  // a parent is ticked only while ALL of its children are ticked.
  function normalizeTreeSelection(state: RowSelectionState) {
    if (!selection || !getSubRows) return state
    const next = { ...state }
    const visit = (row: Row<TData>): boolean => {
      if (row.subRows.length === 0) return Boolean(next[row.id])
      const allSelected = row.subRows.map(visit).every(Boolean)
      if (allSelected) next[row.id] = true
      else delete next[row.id]
      return allSelected
    }
    tableRef.current?.getCoreRowModel().rows.forEach(visit)
    return next
  }

  // TanStack Table returns functions the React Compiler can't memoize; the
  // table is not passed to memoized children, so this is safe
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      expanded,
      columnVisibility: visibility,
    },
    initialState: { pagination: { pageSize: pageSizes[0] } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: (updater) =>
      setRowSelection((old) =>
        normalizeTreeSelection(
          typeof updater === "function" ? updater(old) : updater
        )
      ),
    onExpandedChange: setExpanded,
    enableRowSelection: Boolean(selection),
    // ticking a parent ticks its children (tree views)
    enableSubRowSelection: true,
    getRowId,
    getSubRows,
    getRowCanExpand: (row) =>
      Boolean(renderSubComponent) ||
      hasHiddenColumns ||
      (row.subRows?.length ?? 0) > 0,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // TanStack's own auto-reset queues a state update during render, which
    // React warns about ("hasn't mounted yet"); we reset the page in an effect
    autoResetPageIndex: false,
  })

  tableRef.current = table

  // jump back to page 1 whenever the search, filters or sorting change
  useEffect(() => {
    table.setPageIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter, columnFilters, sorting])

  // after deleting rows, don't stay on a page that no longer exists
  const pageCount = table.getPageCount()
  const pageIndex = table.getState().pagination.pageIndex
  useEffect(() => {
    if (pageCount > 0 && pageIndex >= pageCount) table.setPageIndex(pageCount - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount, pageIndex])
  useEffect(() => {
    onSelectionChange?.(
      table.getSelectedRowModel().flatRows.map((r) => r.original)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  return (
    <div className="flex flex-col">
      {/* while loading, the controls are visible but can't be used */}
      <div
        inert={loading || undefined}
        className={cn("transition-opacity", loading && "opacity-60")}
      >
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        columnFilters={showColumnFilters}
        exports={exports}
        exportFileName={exportFileName}
        exportTitle={exportTitle}
        onDeleteSelected={onDeleteSelected}
      />
      </div>

      <div className="overflow-hidden border-t border-border bg-card">
        {/* on small screens the table scrolls sideways inside SimpleBar; the
            table container normally scrolls by itself, so switch that off */}
        <SimpleBar
          // SimpleBar has no height until it has measured itself, so while
          // loading reserve the skeleton's height (header + rows) up front
          style={
            loading
              ? { minHeight: 36 + table.getState().pagination.pageSize * 37 }
              : undefined
          }
          autoHide={false}
          className={cn(
            "datatable-scroll [&_.simplebar-content]:pb-3 **:data-[slot=table-container]:overflow-visible",
            // no scrollbars on the skeleton
            loading && "[&_.simplebar-track]:hidden [&_.simplebar-content]:pb-0"
          )}
        >
          {/* when columns collapse into the detail panel the table fits the
              screen, so only force a minimum width if nothing was hidden */}
          <Table
            className={cn(
              "text-[13px]",
              !hasHiddenColumns && "min-w-xl"
            )}
          >
            <TableHeader
              inert={loading || undefined}
              className="bg-ivory [&_tr]:border-gold/30"
            >
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <DataTableColumnHeader key={header.id} header={header} />
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody
              aria-busy={loading || undefined}
              className="[&_tr:last-child]:border-b-0"
            >
              {loading ? (
                // placeholder rows follow the real columns on this screen size
                // and the current page size, so nothing jumps when data arrives
                Array.from({ length: table.getState().pagination.pageSize }).map(
                  (_, r) => (
                    <TableRow key={r} className="border-border/70 hover:bg-transparent">
                      {table.getVisibleLeafColumns().map((column, c) => (
                        <TableCell
                          key={column.id}
                          className={cn(
                            "px-3! py-2!",
                            column.id.startsWith("__") && column.id !== "__actions" && "w-10 pr-0!",
                            column.id === "__actions" && "w-12"
                          )}
                        >
                          {column.id === "__select" || column.id === "__expander" ? (
                            <Skeleton className="size-4" />
                          ) : column.id === "__actions" ? (
                            <Skeleton className="ml-auto size-5" />
                          ) : (
                            <Skeleton
                              className={cn(
                                "h-5",
                                column.columnDef.meta?.align === "right" && "ml-auto"
                              )}
                              style={{ width: `${55 + ((r * 7 + c * 13) % 40)}%` }}
                            />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                )
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow
                      data-state={row.getIsSelected() ? "selected" : undefined}
                      onClick={
                        onRowClick
                          ? (e) => {
                              const t = e.target as HTMLElement
                              // ignore portaled menus and interactive controls
                              if (!e.currentTarget.contains(t)) return
                              if (t.closest("button, a, input, label, [role='checkbox'], [role='menuitem']")) return
                              onRowClick(row.original)
                            }
                          : undefined
                      }
                      className={cn(
                        onRowClick && "cursor-pointer",
                        "animate-in fade-in duration-300",
                        "border-border/70 hover:bg-ivory data-[state=selected]:bg-gold/10",
                        // sub rows sit on a faint tint so main rows stand out
                        row.depth > 0 && "bg-ivory/60"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-3! py-2!",
                            cell.column.id.startsWith("__") && cell.column.id !== "__actions" && "w-10 pr-0!",
                            cell.column.id === "__actions" && "w-12 text-right",
                            cell.column.columnDef.meta?.align === "right" &&
                              "text-right"
                          )}
                        >
                          {treeMode && cell.column.id === firstDataColumnId ? (
                            <div
                              className="flex items-center gap-1.5"
                              style={{ paddingLeft: row.depth * 24 }}
                            >
                              {inlineChevron && <ExpandButton row={row} />}
                              <span
                                className={cn(
                                  "font-normal",
                                  // main rows: full colour, sub rows: softer
                                  row.depth > 0
                                    ? "text-foreground/70"
                                    : "text-foreground"
                                )}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </span>
                            </div>
                          ) : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {(renderSubComponent || hasHiddenColumns) && row.getIsExpanded() && (
                      <TableRow className="border-border/70 bg-ivory hover:bg-ivory">
                        <TableCell
                          colSpan={row.getVisibleCells().length}
                          className="border-l-2 border-gold/60 px-3! py-3! sm:px-4!"
                        >
                          <div className="flex min-w-0 flex-col gap-2 py-0.5 whitespace-normal">
                            <ResponsiveDetails row={row} />
                            {renderSubComponent?.(row)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={allColumns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </SimpleBar>
      </div>

      <RowActionConfirm
        pending={pendingAction}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          if (pendingAction) pendingAction.action.onSelect(pendingAction.row)
          setPendingAction(null)
        }}
      />

      <DataTablePagination
        table={table}
        pageSizes={pageSizes}
      />

    </div>
  )
}
