"use client"

import * as React from "react"
import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

// A SimpleBar scroll area styled for popovers (select, dropdown menu).
// `maxHeight` is any CSS length; the list scrolls once it grows past it.
function SimpleScroll({
    maxHeight,
    className,
    children,
}: {
    maxHeight: string
    className?: string
    children: React.ReactNode
}) {
    return (
        <SimpleBar
            autoHide={false}
            data-slot="simple-scroll"
            className={className}
            style={{ maxHeight }}
        >
            {children}
        </SimpleBar>
    )
}

export { SimpleScroll }
