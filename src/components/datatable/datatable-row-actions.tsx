"use client"

// Row actions: a "..." menu on every row that runs your own handlers.
import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, type LucideIcon } from "lucide-react"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Text<TData> = string | ((row: TData) => string)

export type RowAction<TData> = {
  label: Text<TData>
  icon?: LucideIcon
  /** Your handler: receives the row's data. */
  onSelect: (row: TData) => void
  variant?: "default" | "destructive"
  /** Don't show this action for some rows. */
  hidden?: (row: TData) => boolean
  disabled?: (row: TData) => boolean
  /** Ask before running (e.g. for deletes). */
  confirm?: {
    title: Text<TData>
    description?: Text<TData>
    confirmLabel?: string
  }
}

export type PendingAction<TData> = { action: RowAction<TData>; row: TData }

const text = <TData,>(value: Text<TData>, row: TData) =>
  typeof value === "function" ? value(row) : value

export function getActionsColumn<TData>(
  actions: RowAction<TData>[],
  run: (action: RowAction<TData>, row: TData) => void
): ColumnDef<TData> {
  return {
    id: "__actions",
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    size: 48,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const visible = actions.filter((a) => !a.hidden?.(row.original))
      if (visible.length === 0) return null

      const normal = visible.filter((a) => a.variant !== "destructive")
      const destructive = visible.filter((a) => a.variant === "destructive")

      const item = (a: RowAction<TData>, i: number) => (
        <DropdownMenuItem
          key={`${i}-${text(a.label, row.original)}`}
          variant={a.variant}
          disabled={a.disabled?.(row.original)}
          onSelect={() => run(a, row.original)}
          className="cursor-pointer rounded-md px-2 py-1.5"
        >
          {a.icon && <a.icon />}
          {text(a.label, row.original)}
        </DropdownMenuItem>
      )

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Row actions"
              className="size-7 text-muted-foreground hover:bg-gold/10 hover:text-foreground data-[state=open]:bg-gold/10"
            >
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-44 rounded-xl border-border p-1.5 font-(family-name:--font-geist-sans)"
          >
            {normal.map(item)}
            {normal.length > 0 && destructive.length > 0 && (
              <DropdownMenuSeparator className="mx-0 my-1" />
            )}
            {destructive.map(item)}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
}

// Asks for confirmation before running an action that has `confirm`.
export function RowActionConfirm<TData>({
  pending,
  onCancel,
  onConfirm,
}: {
  pending: PendingAction<TData> | null
  onCancel: () => void
  onConfirm: () => void
}) {
  const { action, row } = pending ?? {}
  const confirm = action?.confirm
  const destructive = action?.variant === "destructive"

  return (
    <AlertDialog open={Boolean(pending)} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="border-gold/25 bg-ivory! sm:max-w-sm">
        <AlertDialogHeader className="text-left sm:text-left">
          <AlertDialogTitle className="font-serif text-xl font-normal">
            {confirm && row ? text(confirm.title, row) : ""}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {confirm?.description && row ? text(confirm.description, row) : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gold/30">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={
              destructive
                ? "bg-rose-600! text-white! hover:bg-rose-600/90!"
                : "bg-ink! text-white! hover:bg-ink/90!"
            }
            onClick={onConfirm}
          >
            {confirm?.confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
