import { AppSidebar } from "@/components/app-sidebar"
import { MenuTrigger } from "@/components/menu-trigger"
import { MotionProvider } from "@/components/motion"
import { NotificationsMenu } from "@/components/notifications-menu"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { ProfileMenu } from "@/components/profile-menu"
import { ScrollArea } from "@/components/scroll-area"
import { SearchCommand } from "@/components/search-command"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <MotionProvider>
            <TooltipProvider>
                <SidebarProvider defaultOpen={false} className="font-[family-name:var(--font-geist-sans)]">
                    <AppSidebar />
                    <SidebarInset className="h-svh overflow-hidden bg-ivory">
                        <header className="z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-3 md:px-6">
                            <MenuTrigger className="rounded-full" />
                            <PageBreadcrumb />

                            <div className="ml-auto flex items-center gap-2">
                                <SearchCommand />

                                <NotificationsMenu />

                                <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

                                <ProfileMenu />
                            </div>
                        </header>
                        <ScrollArea className="min-h-0 flex-1">
                            <div className="flex min-h-[calc(100svh-3.5rem)] flex-col">
                                <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 p-3 md:gap-6 md:p-6">{children}</main>
                            </div>
                        </ScrollArea>
                    </SidebarInset>
                </SidebarProvider>
            </TooltipProvider>
        </MotionProvider>
    )
}
