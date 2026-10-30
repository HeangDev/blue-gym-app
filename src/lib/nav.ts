import {
    Layers,
    UserGroup,
    LayoutDashboardIcon,
    PackageIcon,
    SettingsIcon,
    ShoppingCartIcon,
    UsersIcon,
    Bell,
    ClipboardClock,
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
            { title: "Categories", href: "/categories", icon: ShoppingCartIcon },
            { title: "Products", href: "/products", icon: PackageIcon },
        ],
    },
    {
        label: "Other",
        items: [
            { title: "Plans", href: "/plans", icon: Layers },
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
