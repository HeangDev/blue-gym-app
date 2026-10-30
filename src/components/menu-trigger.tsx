"use client"

import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

// Header button that toggles the sidebar, shown as a "menu" icon.
export function MenuTrigger({ className }: { className?: string }) {
    const { toggleSidebar } = useSidebar()

    return (
        <Button
            data-sidebar="trigger"
            variant="ghost"
            size="icon-sm"
            className={className}
            onClick={toggleSidebar}
        >
        <Menu />
            <span className="sr-only">Toggle menu</span>
        </Button>
    )
}
