"use client"

// Export button: one "Export" button that opens a menu with copy, CSV, Excel,
// PDF and print.
import { useState } from "react"
import { type Table } from "@tanstack/react-table"
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  DownloadIcon,
  FileDownIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  Loader2Icon,
  PrinterIcon,
  type LucideIcon,
} from "lucide-react"

import {
  copyToClipboard,
  exportCsv,
  exportExcel,
  exportPdf,
  getExportData,
  printTable,
  type ExportType,
} from "./datatable-export"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const OPTIONS: Record<ExportType, { label: string; icon: LucideIcon }> = {
  copy: { label: "Copy to clipboard", icon: CopyIcon },
  csv: { label: "CSV", icon: FileTextIcon },
  excel: { label: "Excel", icon: FileSpreadsheetIcon },
  pdf: { label: "PDF", icon: FileDownIcon },
  print: { label: "Print", icon: PrinterIcon },
}

type Status = "idle" | "busy" | "done" | "error"

export function DataTableButtons<TData>({
  table,
  types,
  fileName,
  title,
}: {
  table: Table<TData>
  types: ExportType[]
  fileName: string
  title: string
}) {
  const [status, setStatus] = useState<Status>("idle")

  async function run(type: ExportType) {
    const data = getExportData(table)
    setStatus("busy")
    try {
      if (type === "copy") await copyToClipboard(data)
      if (type === "csv") exportCsv(data, fileName)
      if (type === "excel") await exportExcel(data, fileName, title)
      if (type === "pdf") await exportPdf(data, fileName, title)
      if (type === "print") printTable(data, title)
      setStatus("done")
    } catch {
      setStatus("error")
    }
    setTimeout(() => setStatus("idle"), 1500)
  }

  const selected = table.getSelectedRowModel().flatRows.length
  const matching = table.getSortedRowModel().rows.length
  const scope = selected
    ? `${selected} selected row${selected === 1 ? "" : "s"}`
    : `all ${matching} matching row${matching === 1 ? "" : "s"}`

  const label =
    status === "done" ? "Done" : status === "error" ? "Failed" : "Export"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={status === "busy"}
          aria-label="Export"
          className="h-8! rounded-lg! border-border! bg-white! px-3! text-[13px]! hover:border-gold/50! hover:bg-ivory! data-[state=open]:border-gold/50! data-[state=open]:bg-ivory!"
        >
          {status === "busy" ? (
            <Loader2Icon className="animate-spin" />
          ) : status === "done" ? (
            <CheckIcon />
          ) : (
            <DownloadIcon />
          )}
          <span className="hidden sm:inline">{label}</span>
          <ChevronDownIcon className="size-3.5 text-muted-foreground transition-transform duration-200 in-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-48 rounded-xl border-border p-1.5 font-(family-name:--font-geist-sans)"
      >
        <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">
          Export {scope}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-0 my-1" />
        {types.map((type) => {
          const { label: text, icon: Icon } = OPTIONS[type]
          return (
            <DropdownMenuItem
              key={type}
              onSelect={() => run(type)}
              className="cursor-pointer rounded-md px-2 py-1.5"
            >
              <Icon />
              {text}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
