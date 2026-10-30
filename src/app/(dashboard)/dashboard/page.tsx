import { DashboardCharts } from "@/components/dashboard-charts"
import { Reveal } from "@/components/motion"
import { OrdersTable } from "@/components/orders-table"
import { SummaryCards } from "@/components/summary-cards"

export default function DashboardPage() {
  return (
    <>
      <div>
        <h2 className="font-(family-name:--font-serif) text-3xl tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your business at a glance.
        </p>
      </div>

      <SummaryCards />

      <DashboardCharts />

      <Reveal>
        <OrdersTable />
      </Reveal>
    </>
  )
}
