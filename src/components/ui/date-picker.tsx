"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "cn"

// Values are "YYYY-MM-DD" strings (same as <input type="date">), in local time.
function parse(value: string): Date | undefined {
    const [y, m, d] = value.split("-").map(Number)
    return y && m && d ? new Date(y, m - 1, d) : undefined
}

function format(date: Date): string {
    const p = (n: number) => String(n).padStart(2, "0")
    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

function DatePicker({
    id,
    value,
    onChange,
    placeholder = "Pick a date",
    clearable,
    invalid,
    className,
}: {
    id?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    /** Show a button that clears the date. */
    clearable?: boolean
    invalid?: boolean
    className?: string
}) {
    const [open, setOpen] = React.useState(false)
    const selected = parse(value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    aria-invalid={invalid}
                    className={cn(
                        "w-full justify-start font-normal aria-invalid:border-destructive",
                        !selected && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="size-4" />
                    {selected
                        ? selected.toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                          })
                        : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto items-center">
                <DayPicker
                    mode="single"
                    selected={selected}
                    defaultMonth={selected}
                    onSelect={(date) => {
                        onChange(date ? format(date) : "")
                        setOpen(false)
                    }}
                    showOutsideDays
                    classNames={{
                        root: "p-1",
                        months: "relative flex flex-col",
                        month: "flex flex-col gap-3",
                        month_caption: "flex h-8 items-center justify-center",
                        caption_label: "text-sm font-medium",
                        nav: "absolute inset-x-0 top-0 flex h-8 items-center justify-between",
                        button_previous:
                            "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground",
                        button_next:
                            "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground",
                        month_grid: "border-separate border-spacing-y-1",
                        weekday: "size-9 text-xs font-normal text-muted-foreground",
                        day: "size-9 p-0 text-center text-sm",
                        day_button:
                            "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
                        today: "[&>button]:font-semibold [&>button]:text-primary",
                        outside: "text-muted-foreground/40",
                        disabled: "opacity-40",
                        hidden: "invisible",
                    }}
                    components={{
                        Chevron: ({ orientation, className }) =>
                            orientation === "left" ? (
                                <ChevronLeftIcon className={cn("size-4", className)} />
                            ) : (
                                <ChevronRightIcon className={cn("size-4", className)} />
                            ),
                    }}
                />
                {clearable && value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onChange("")
                            setOpen(false)
                        }}
                    >
                        Clear
                    </Button>
                )}
            </PopoverContent>
        </Popover>
    )
}

export { DatePicker }
