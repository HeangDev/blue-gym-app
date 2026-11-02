"use client"

// Delete action: appears once rows are selected and asks before deleting.
import { useState } from "react"
import { type Table } from "@tanstack/react-table"
import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DataTableDelete<TData>({
  table,
  onDelete,
}: {
  table: Table<TData>
  onDelete: (rows: TData[]) => void
}) {
  const [open, setOpen] = useState(false)

  const selected = table.getSelectedRowModel().flatRows
  const count = selected.length
  // not rendered at all until a row is ticked (stays while its dialog is open)
  const hidden = count === 0 && !open

  function confirm() {
    onDelete(selected.map((r) => r.original))
    table.resetRowSelection()
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className={cn("h-8 w-full rounded-lg text-[13px] sm:w-auto", hidden && "hidden")}
        disabled={hidden}
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
        onClick={() => setOpen(true)}
        aria-label={`Delete ${count} selected row${count === 1 ? "" : "s"}`}
      >
        <Trash2Icon />
        Delete
        <span className="rounded-full bg-destructive/20 px-1.5 text-[11px] leading-5 tabular-nums">
          {count}
        </span>
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="border-gold/25 bg-ivory! sm:max-w-sm">
          <AlertDialogHeader className="text-left sm:text-left">
            <AlertDialogTitle className="font-serif text-xl font-normal">
              Delete {count} {count === 1 ? "row" : "rows"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected{" "}
              {count === 1 ? "row" : "rows"}. This action can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/30">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600! text-white! hover:bg-rose-600/90!"
              onClick={confirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
