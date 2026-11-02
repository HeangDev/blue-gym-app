"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { navGroups, settingsItem } from "@/lib/nav"

const titles = new Map<string, string>(
    [...navGroups.flatMap((g) => g.items), settingsItem].map((i) => [i.href, i.title])
)

// "audit_logs" -> "Audit Logs", for pages that are not in the sidebar
const humanize = (segment: string) =>
    segment.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

// Home > Page name (> Sub page, e.g. Products > Create), taken from the route.
export function PageBreadcrumb() {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)
    const segment = segments[0]
    // the last segment names the sub page: /products/P-1001/edit -> Edit
    const sub = segments.length > 1 ? segments[segments.length - 1] : undefined
    const title = segment
        ? (titles.get(`/${segment}`) ?? humanize(segment))
        : "Dashboard"

    return (
        <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    {sub ? (
                        <BreadcrumbLink asChild>
                            <Link href={`/${segment}`}>{title}</Link>
                        </BreadcrumbLink>
                    ) : (
                        <BreadcrumbPage>{title}</BreadcrumbPage>
                    )}
                </BreadcrumbItem>
                {sub && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{humanize(sub)}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
