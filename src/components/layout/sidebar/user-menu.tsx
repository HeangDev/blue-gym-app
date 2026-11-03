"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import {
    ChevronsUpDownIcon,
    LanguagesIcon,
    LogOutIcon,
    PaletteIcon,
    SettingsIcon,
    ShieldCheckIcon,
    UserIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { LogoutDialog } from "@/components/logout-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/layout/sidebar/theme-toggle"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

const languages = [
    { code: "en", short: "EN" },
    { code: "kh", short: "ខ្មែរ" },
]

function UserAvatar() {
    return (
        <Avatar className="size-8 ring-2 ring-gold/30">
            <AvatarFallback className="bg-linear-to-br from-gold to-gold-dark text-xs font-medium text-white">
                AD
            </AvatarFallback>
        </Avatar>
    )
}

function UserInfo() {
    return (
        <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-[13px] font-semibold">Admin</span>
            <span className="truncate text-[11px] text-muted-foreground">
                admin@example.com
            </span>
        </div>
    )
}

export function SidebarUserMenu() {
    const locale = useLocale()
    const t = useTranslations("ProfileMenu")
    const router = useRouter()
    const { isMobile } = useSidebar()
    const [logoutOpen, setLogoutOpen] = useState(false)

    function changeLanguage(code: string) {
        // eslint-disable-next-line react-hooks/immutability
        document.cookie = `locale=${code}; path=/; max-age=31536000; samesite=lax`
        router.refresh()
    }

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                tooltip="Admin"
                                className="rounded-lg data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <UserAvatar />
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="truncate text-sm font-medium">Admin</span>
                                    <span className="truncate text-xs text-sidebar-foreground/60">
                                        admin@example.com
                                    </span>
                                </div>
                                <ChevronsUpDownIcon className="ml-auto size-4 text-sidebar-foreground/60" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side={isMobile ? "top" : "right"}
                            align="end"
                            sideOffset={8}
                            className="w-60 rounded-xl p-1.5 shadow-lg"
                        >
                            <div className="flex items-center gap-2 px-2 py-1.5">
                                <UserAvatar />
                                <UserInfo />
                            </div>
                            <DropdownMenuSeparator className="-mx-1.5 my-1" />
                            <DropdownMenuItem asChild className="h-7 gap-2 rounded-md px-2 py-0 text-[13px]">
                                <Link href="/settings?tab=general">
                                    <UserIcon />
                                    {t("profile")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="h-7 gap-2 rounded-md px-2 py-0 text-[13px]">
                                <Link href="/settings?tab=preferences">
                                    <SettingsIcon />
                                    {t("preferences")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="h-7 gap-2 rounded-md px-2 py-0 text-[13px]">
                                <Link href="/settings?tab=security">
                                    <ShieldCheckIcon />
                                    {t("security")}
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="-mx-1.5 my-1" />

                            <div className="flex h-8 items-center gap-2 px-2 text-[13px] whitespace-nowrap">
                                <PaletteIcon className="size-4 text-muted-foreground" />
                                <span className="flex-1">{t("theme")}</span>
                                <ThemeToggle />
                            </div>
                            <div className="flex h-8 items-center gap-2 px-2 text-[13px] whitespace-nowrap">
                                <LanguagesIcon className="size-4 text-muted-foreground" />
                                <span className="flex-1">{t("language")}</span>
                                <div className="flex items-center gap-0.5 rounded-full bg-muted p-0.5">
                                    {languages.map((l) => (
                                        <button
                                            key={l.code}
                                            type="button"
                                            aria-pressed={locale === l.code}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                changeLanguage(l.code)
                                            }}
                                            className={cn(
                                                "h-5 rounded-full px-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground",
                                                locale === l.code && "bg-background text-foreground shadow-sm"
                                            )}
                                        >
                                            {l.short}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <DropdownMenuSeparator className="-mx-1.5 my-1" />
                            <DropdownMenuItem
                                variant="destructive"
                                className="h-7 gap-2 rounded-md px-2 py-0 text-[13px]"
                                onSelect={() => setLogoutOpen(true)}
                            >
                                <LogOutIcon />
                                {t("logout")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
        </>
    )
}
