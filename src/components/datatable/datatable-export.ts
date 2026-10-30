// Export helpers: copy, CSV, Excel, PDF and print. The heavy libraries
// (exceljs, jspdf) are loaded only when their button is clicked.
import { type Row, type Table } from "@tanstack/react-table"

import "./types"

export type ExportType = "copy" | "csv" | "excel" | "pdf" | "print"

type Cell = string | number | boolean | Date | null

export type ExportData = {
  headers: string[]
  /** display text, used by copy / CSV / PDF / print */
  text: string[][]
  /** raw values, used by Excel so numbers stay numbers */
  raw: Cell[][]
}

function flatten<TData>(rows: Row<TData>[]): Row<TData>[] {
  return rows.flatMap((r) => [r, ...flatten(r.subRows)])
}

/**
 * Collects what to export: the selected rows if any are selected, otherwise
 * every row that matches the current filters, in the current sort order
 * (all pages, not just the visible one). Only data columns are exported,
 * including ones hidden on small screens.
 */
export function getExportData<TData>(table: Table<TData>): ExportData {
  const columns = table
    .getAllLeafColumns()
    .filter((c) => !c.id.startsWith("__") && c.accessorFn)

  const selected = table.getSelectedRowModel().flatRows
  const rows = selected.length
    ? selected
    : flatten(table.getSortedRowModel().rows)

  const headers = columns.map((c) =>
    typeof c.columnDef.header === "string" ? c.columnDef.header : c.id
  )

  const text: string[][] = []
  const raw: Cell[][] = []

  for (const row of rows) {
    const textRow: string[] = []
    const rawRow: Cell[] = []
    for (const col of columns) {
      const value = row.getValue(col.id) as Cell | undefined
      const format = col.columnDef.meta?.exportValue
      rawRow.push(value ?? null)
      textRow.push(
        format ? format(value, row.original) : value == null ? "" : String(value)
      )
    }
    text.push(textRow)
    raw.push(rawRow)
  }

  return { headers, text, raw }
}

// ---- copy -------------------------------------------------------------

export async function copyToClipboard({ headers, text }: ExportData) {
  // tab separated: pastes straight into Excel / Sheets
  const body = [headers, ...text].map((r) => r.join("\t")).join("\n")
  await navigator.clipboard.writeText(body)
}

// ---- download helper --------------------------------------------------

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ---- CSV --------------------------------------------------------------

function csvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function exportCsv({ headers, text }: ExportData, fileName: string) {
  const body = [headers, ...text]
    .map((r) => r.map(csvCell).join(","))
    .join("\r\n")
  // BOM so Excel opens UTF-8 (e.g. Khmer) correctly
  download(
    new Blob(["﻿", body], { type: "text/csv;charset=utf-8" }),
    `${fileName}.csv`
  )
}

// ---- Excel ------------------------------------------------------------

export async function exportExcel(
  { headers, raw }: ExportData,
  fileName: string,
  title: string
) {
  const ExcelJS = (await import("exceljs")).default
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(title.slice(0, 31) || "Sheet1")

  sheet.addRow(headers)
  raw.forEach((r) => sheet.addRow(r))

  const head = sheet.getRow(1)
  head.font = { bold: true, color: { argb: "FFFFFFFF" } }
  head.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFB8975A" },
  }
  sheet.columns.forEach((col, i) => {
    const longest = Math.max(
      headers[i]?.length ?? 0,
      ...raw.map((r) => String(r[i] ?? "").length)
    )
    col.width = Math.min(Math.max(longest + 2, 10), 50)
  })

  const buffer = await workbook.xlsx.writeBuffer()
  download(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${fileName}.xlsx`
  )
}

// ---- PDF --------------------------------------------------------------

export async function exportPdf(
  { headers, text }: ExportData,
  fileName: string,
  title: string
) {
  const { jsPDF } = await import("jspdf")
  const autoTableModule = await import("jspdf-autotable")
  const autoTable = autoTableModule.autoTable ?? autoTableModule.default

  const doc = new jsPDF({
    orientation: headers.length > 6 ? "landscape" : "portrait",
  })
  doc.setFontSize(14)
  doc.text(title, 14, 16)
  autoTable(doc, {
    head: [headers],
    body: text,
    startY: 22,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [184, 151, 90] },
  })
  doc.save(`${fileName}.pdf`)
}

// ---- print ------------------------------------------------------------

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function printTable({ headers, text }: ExportData, title: string) {
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")
  const body = text
    .map(
      (r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`
    )
    .join("")

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(
    title
  )}</title><style>
    body{font-family:system-ui,sans-serif;margin:24px;color:#111}
    h1{font-size:18px;margin:0 0 12px}
    table{border-collapse:collapse;width:100%;font-size:12px}
    th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
    th{background:#b8975a;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    tr:nth-child(even) td{background:#faf8f4;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  </style></head><body><h1>${escapeHtml(title)}</h1><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`

  // print from a hidden frame so the page itself isn't touched
  const frame = document.createElement("iframe")
  frame.setAttribute("aria-hidden", "true")
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden"
  frame.srcdoc = html
  frame.onload = () => {
    const win = frame.contentWindow
    if (!win) return frame.remove()
    win.addEventListener("afterprint", () => frame.remove())
    win.focus()
    win.print()
    // fallback if afterprint never fires
    setTimeout(() => frame.remove(), 60_000)
  }
  document.body.appendChild(frame)
}
