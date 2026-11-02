import { DashboardCharts } from "@/components/dashboard-charts"
import { SummaryCards } from "@/components/summary-cards"

export default function DashboardPage() {
    return (
        <>
            <div>
                <h2 className="font-serif text-3xl tracking-tight">Dashboard</h2>
                <p className="text-sm text-muted-foreground">
                    Overview of your gym at a glance.
                </p>
            </div>

            <SummaryCards />
            <DashboardCharts />
        </>
    )
}
