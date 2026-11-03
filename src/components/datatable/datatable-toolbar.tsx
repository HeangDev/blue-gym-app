"use client"

// Global search (all columns) + optional per-column filters + reset.
import { type Table } from "@tanstack/react-table"
import { SearchIcon, XIcon } from "lucide-react"

import { DataTableButtons } from "./datatable-buttons"
import { DataTableDelete } from "./datatable-delete"
import { type ExportType } from "./datatable-export"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALL = "__all__"

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search all columns...",
  columnFilters: showColumnFilters,
  exports,
  exportFileName = "export",
  exportTitle = "Export",
  onDeleteSelected,
}: {
  table: Table<TData>
  searchPlaceholder?: string
  /** Show the filter controls of columns that set `meta.filter`. */
  columnFilters?: boolean
  exports?: ExportType[]
  exportFileName?: string
  exportTitle?: string
  onDeleteSelected?: (rows: TData[]) => void
}) {
  const globalFilter = (table.getState().globalFilter as string) ?? ""
  const filterable = showColumnFilters
    ? table.getAllLeafColumns().filter((c) => c.columnDef.meta?.filter)
    : []
  const hasFilters =
    globalFilter !== "" ||
    (showColumnFilters && table.getState().columnFilters.length > 0)

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2">
      <div className="relative w-full sm:w-auto sm:min-w-48 sm:flex-1 sm:max-w-xs">
        <SearchIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search all columns"
          className="h-8 pl-8"
        />
      </div>

      {filterable.map((column) => {
        const filter = column.columnDef.meta!.filter!
        const value = (column.getFilterValue() as string | undefined) ?? ""

        if (filter.type === "select") {
          return (
            <Select
              key={column.id}
              value={value || ALL}
              onValueChange={(v) =>
                column.setFilterValue(v === ALL ? undefined : v)
              }
            >
              <SelectTrigger
                size="sm"
                aria-label={`Filter ${filter.label}`}
                className="min-w-0 flex-1 sm:w-36 sm:flex-none"
              >
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All {filter.label}</SelectItem>
                {filter.options.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }

        return (
          <Input
            key={column.id}
            value={value}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            placeholder={`Filter ${filter.label.toLowerCase()}...`}
            aria-label={`Filter ${filter.label}`}
            className="h-8 min-w-0 flex-1 sm:w-40 sm:flex-none"
          />
        )
      })}

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-[13px]"
          onClick={() => {
            table.setGlobalFilter("")
            table.resetColumnFilters()
          }}
        >
          Reset
          <XIcon />
        </Button>
      )}

      {/* actions: delete (when rows are selected) + export buttons */}
      <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
        {onDeleteSelected && (
          <DataTableDelete table={table} onDelete={onDeleteSelected} />
        )}
        {exports && exports.length > 0 && (
          <DataTableButtons
            table={table}
            types={exports}
            fileName={exportFileName}
            title={exportTitle}
          />
        )}
      </div>
    </div>
  )
}
