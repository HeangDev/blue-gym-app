import {
    Layers,
    UserGroup,
    LayoutDashboardIcon,
    Tag,
    SettingsIcon,
    FolderTree,
    UsersIcon,
    Bell,
    ClipboardClock,
    TicketPercent,
} from "lucide-react"

export const navGroups = [
    {
        label: "Overview",
        items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
        ],
    },
    {
        label: "Management",
        items: [
            { title: "Users", href: "/users", icon: UsersIcon, badge: "8" },
            { title: "Members", href: "/members", icon: UserGroup },
            { title: "Categories", href: "/categories", icon: FolderTree },
            { title: "Products", href: "/products", icon: Tag },
        ],
    },
    {
        label: "Other",
        items: [
            { title: "Plans", href: "/plans", icon: Layers },
            { title: "Promotions", href: "/promotions", icon: TicketPercent },
            { title: "Notifications", href: "/notifications", icon: Bell },
            { title: "Audit Logs", href: "/audit_logs", icon: ClipboardClock },
        ],
    },
]

export const settingsItem = {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
}
