"use client"

import { useEffect, useState } from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type Theme = "light" | "dark" | "system"

const options = [
    { value: "light", icon: SunIcon, label: "Light" },
    { value: "dark", icon: MoonIcon, label: "Dark" },
    { value: "system", icon: MonitorIcon, label: "System" },
] as const

export function applyTheme(theme: Theme) {
    const dark =
        theme === "dark" ||
        (theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.classList.toggle("dark", dark)
}

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>("system")

    useEffect(() => {
        try {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTheme((localStorage.getItem("theme") as Theme) || "system")
        } catch {}
    }, [])

    function choose(value: Theme) {
        setTheme(value)
        try {
            localStorage.setItem("theme", value)
        } catch {}
        applyTheme(value)
    }

    return (
        <div className="flex items-center gap-0.5 rounded-full bg-muted p-0.5">
            {options.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    aria-label={label}
                    aria-pressed={theme === value}
                    onClick={(e) => {
                        e.stopPropagation()
                        choose(value)
                    }}
                    className={cn(
                        "grid size-5 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground",
                        theme === value && "bg-background text-foreground shadow-sm"
                    )}
                >
                    <Icon className="size-3" />
                </button>
            ))}
        </div>
    )
}
