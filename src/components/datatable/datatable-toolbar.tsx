"use client"

// Global filter (search all columns) + per-column filters + reset.
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
  exports,
  exportFileName = "export",
  exportTitle = "Export",
  onDeleteSelected,
}: {
  table: Table<TData>
  searchPlaceholder?: string
  exports?: ExportType[]
  exportFileName?: string
  exportTitle?: string
  onDeleteSelected?: (rows: TData[]) => void
}) {
  const globalFilter = (table.getState().globalFilter as string) ?? ""
  const columnFilters = table.getState().columnFilters
  const filterable = table
    .getAllLeafColumns()
    .filter((c) => c.columnDef.meta?.filter)
  const hasFilters = columnFilters.length > 0 || globalFilter !== ""

  return (
    <div className="flex flex-wrap items-center gap-1.5">
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
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
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
