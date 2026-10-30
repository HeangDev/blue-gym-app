"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import {
    LogOutIcon,
    SettingsIcon,
} from "lucide-react"

import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

import { BranchSwitcher } from "@/components/branch-switcher"
import { LogoutDialog } from "@/components/logout-dialog"
import { navGroups } from "@/lib/nav"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"


const activeClass = "rounded-lg text-sidebar-foreground/80 transition-all hover:translate-x-0.5 data-active:bg-linear-to-r data-active:from-gold-light data-active:to-gold data-active:font-medium data-active:text-white data-active:shadow-md data-active:shadow-gold/20 data-active:hover:text-white"

export function AppSidebar() {
    const pathname = usePathname()
    const [logoutOpen, setLogoutOpen] = useState(false)

    return (
        <>
        <Sidebar collapsible="icon" className="border-r-0 text-sidebar-foreground [--sidebar:oklch(0.17_0.015_255)] [--sidebar-foreground:oklch(0.9_0.01_85)] [--sidebar-accent:oklch(0.25_0.02_255)] [--sidebar-accent-foreground:oklch(0.98_0_0)] [--sidebar-border:oklch(0.27_0.02_255)]">
        <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-4 group-data-[collapsible=icon]:px-2">
            <BranchSwitcher />
        </SidebarHeader>
        <SidebarContent className="gap-0 overflow-hidden px-0">
            <SimpleBar className="h-full min-h-0 flex-1 px-2 group-data-[collapsible=icon]:px-0">
                {navGroups.map((group) => (
                    <SidebarGroup key={group.label} className="group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:not-first:border-t group-data-[collapsible=icon]:border-sidebar-border">
                        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-[11px] tracking-wider text-sidebar-foreground/50 uppercase">{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.href}
                                            className={activeClass}
                                            tooltip={item.title}
                                        >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                        </SidebarMenuButton>
                                        {"badge" in item && (
                                            <SidebarMenuBadge className="bg-gold/20 text-amber-100">
                                                {item.badge}
                                            </SidebarMenuBadge>
                                        )}
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SimpleBar>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border p-2">
            <SidebarMenu className="gap-1">
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === "/settings"}
                        className={activeClass}
                        tooltip="Settings"
                    >
                        <Link href="/settings">
                            <SettingsIcon />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        className="rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200"
                        tooltip="Logout"
                        onClick={() => setLogoutOpen(true)}
                    >
                        <LogOutIcon />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
        </Sidebar>
        <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
        </>
    )
}
