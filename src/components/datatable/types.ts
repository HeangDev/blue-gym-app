import "@tanstack/react-table"

// Per-column options read by the toolbar and the table.
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Adds a filter control for this column to the toolbar. */
    filter?:
      | { type: "text"; label: string }
      | { type: "select"; label: string; options: string[] }
    /** Hides the column below this breakpoint; its value moves into the row detail panel. */
    hideBelow?: "sm" | "md" | "lg"
    /** Text used for this column in copy / CSV / PDF / print exports. */
    exportValue?: (value: any, row: TData) => string // eslint-disable-line @typescript-eslint/no-explicit-any
    /** Right-aligns header and cells (numbers). */
    align?: "right"
  }
}
