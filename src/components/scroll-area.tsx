"use client"

import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

// SimpleBar needs the client; this lets server layouts use it.
export function ScrollArea({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    return <SimpleBar className={className}>{children}</SimpleBar>
}
