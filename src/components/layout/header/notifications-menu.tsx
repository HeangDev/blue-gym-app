"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertTriangleIcon,
  BellIcon,
  CheckCheckIcon,
  ShoppingCartIcon,
  UserPlusIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Notification = {
  id: number
  title: string
  body: string
  time: string
  icon: LucideIcon
  read: boolean
}

const initial: Notification[] = [
  {
    id: 1,
    title: "New order #1006",
    body: "Alice Johnson placed an order of $250.00",
    time: "2 min ago",
    icon: ShoppingCartIcon,
    read: false,
  },
  {
    id: 2,
    title: "New user registered",
    body: "Sophea Chan joined Head Office",
    time: "1 hr ago",
    icon: UserPlusIcon,
    read: false,
  },
  {
    id: 3,
    title: "Low stock warning",
    body: "Product SKU-204 has only 4 items left",
    time: "Yesterday",
    icon: AlertTriangleIcon,
    read: true,
  },
]

export function NotificationsMenu() {
  const [items, setItems] = useState(initial)
  const unread = items.filter((n) => !n.read).length

  function markAllRead() {
    setItems((list) => list.map((n) => ({ ...n, read: true })))
  }

  function markRead(id: number) {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative rounded-full"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        >
          <BellIcon />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-rose-500 ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2.5">
          <span className="font-serif text-base font-normal">
            Notifications
            {unread > 0 && (
              <span className="ml-2 rounded-full bg-gold/15 px-1.5 py-0.5 font-sans text-[10px] font-medium text-gold-dark">
                {unread} new
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unread === 0}
            className="flex items-center gap-1 text-[11px] font-normal text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <CheckCheckIcon className="size-3.5" />
            Mark all read
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />
        <ul className="max-h-72 overflow-y-auto py-1">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted",
                  !n.read && "bg-gold/5"
                )}
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-background text-gold-dark">
                  <n.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="size-1.5 shrink-0 rounded-full bg-rose-500" />
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {n.body}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                    {n.time}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <DropdownMenuSeparator className="my-0" />
        <Link
          href="/notifications"
          className="block w-full px-3 py-2 text-center text-xs font-medium text-gold-dark transition-colors hover:bg-muted"
        >
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
