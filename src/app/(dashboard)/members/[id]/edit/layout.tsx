import type { Metadata } from "next"

// nested under /members, which has a plain title, so the root template does not reach here
export const metadata: Metadata = { title: { absolute: "Blue Gym - Edit member" } }

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
