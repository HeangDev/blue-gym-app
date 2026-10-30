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
  /** Export buttons to show: copy, csv, excel, pdf, print. */
  exports?: ExportType[]
  exportFileName?: string
  exportTitle?: string
  /** Shows a Delete button when rows are selected; called after confirming. */
  onDeleteSelected?: (rows: TData[]) => void
  /** A "..." menu on every row; each action runs your handler. */
  rowActions?: RowAction<TData>[]
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
  exports,
  exportFileName,
  exportTitle,
  onDeleteSelected,
  rowActions,
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
    // jump back to page 1 whenever filters change
    autoResetPageIndex: true,
  })

  tableRef.current = table
  useEffect(() => {
    onSelectionChange?.(
      table.getSelectedRowModel().flatRows.map((r) => r.original)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  return (
    <div className="flex flex-col gap-2.5">
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        exports={exports}
        exportFileName={exportFileName}
        exportTitle={exportTitle}
        onDeleteSelected={onDeleteSelected}
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table className="text-[13px]">
          <TableHeader className="bg-ivory [&_tr]:border-gold/30">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <DataTableColumnHeader key={header.id} header={header} />
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={cn(
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
                        className="border-l-2 border-gold/60 px-4! py-3!"
                      >
                        <div className="flex flex-col gap-2 py-0.5">
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
        showSelection={Boolean(selection)}
      />
    </div>
  )
}
