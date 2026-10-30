"use client"

// Row selection: a multi-row checkbox column with select-all in the header.
// In tree tables it cascades: ticking a parent ticks its children, and a
// parent with only some children ticked shows a dash.
import { type ColumnDef } from "@tanstack/react-table"
import { MinusIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

// gold checked state
const CHECKBOX_CLASS =
  "data-checked:border-gold data-checked:bg-gold data-checked:text-white dark:data-checked:bg-gold"

const INDETERMINATE_CLASS =
  "data-[state=indeterminate]:border-gold data-[state=indeterminate]:bg-gold data-[state=indeterminate]:text-white data-[state=indeterminate]:[&_svg]:hidden"

function SelectCheckbox({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean | "indeterminate"
  onChange: (value: boolean) => void
  disabled?: boolean
  label: string
}) {
  return (
    <span className="relative flex size-4 items-center justify-center">
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange(v === true)}
        aria-label={label}
        className={cn(CHECKBOX_CLASS, INDETERMINATE_CLASS)}
      />
      {checked === "indeterminate" && (
        <MinusIcon className="pointer-events-none absolute inset-0 m-auto size-3 text-white" />
      )}
    </span>
  )
}

export function getSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "__select",
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    size: 40,
    header: ({ table }) => {
      const all = table.getIsAllPageRowsSelected()
      const some = table.getIsSomePageRowsSelected()

      return (
        <SelectCheckbox
          checked={all ? true : some ? "indeterminate" : false}
          onChange={(v) => table.toggleAllPageRowsSelected(v)}
          label="Select all rows on this page"
        />
      )
    },
    cell: ({ row }) => {
      const selected = row.getIsSelected()
      // a parent with some (not all) children selected
      const partial = !selected && row.getIsSomeSelected()

      return (
        <SelectCheckbox
          checked={selected ? true : partial ? "indeterminate" : false}
          disabled={!row.getCanSelect()}
          onChange={(v) => row.toggleSelected(v)}
          label={`Select row ${row.id}`}
        />
      )
    },
  }
}
