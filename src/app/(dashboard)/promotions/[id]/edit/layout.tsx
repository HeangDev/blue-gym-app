import type { Metadata } from "next"

// nested under /promotions, which has a plain title, so the root template does not reach here
export const metadata: Metadata = { title: { absolute: "Blue Gym - Edit promotion" } }

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
