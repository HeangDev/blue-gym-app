"use client"

import { Reveal } from "@/components/motion"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// Categorical slots 1-3 of the validated palette (light / dark steps).
const SERIES = {
  blue: { light: "#2a78d6", dark: "#3987e5" },
  orange: { light: "#eb6834", dark: "#d95926" },
  aqua: { light: "#1baf7a", dark: "#199e70" },
}

const revenueData = [
  { month: "Jan", thisYear: 18.2, lastYear: 14.1 },
  { month: "Feb", thisYear: 21.5, lastYear: 15.8 },
  { month: "Mar", thisYear: 24.9, lastYear: 17.2 },
  { month: "Apr", thisYear: 23.1, lastYear: 19.6 },
  { month: "May", thisYear: 28.4, lastYear: 20.3 },
  { month: "Jun", thisYear: 31.2, lastYear: 22.7 },
  { month: "Jul", thisYear: 34.8, lastYear: 24.1 },
  { month: "Aug", thisYear: 33.6, lastYear: 26.4 },
  { month: "Sep", thisYear: 38.1, lastYear: 27.9 },
  { month: "Oct", thisYear: 45.2, lastYear: 30.2 },
]

const revenueConfig = {
  thisYear: { label: "This year", theme: SERIES.blue },
  lastYear: { label: "Last year", theme: SERIES.orange },
} satisfies ChartConfig

const checkInData = [
  { month: "Jan", checkIns: 7820 },
  { month: "Feb", checkIns: 8110 },
  { month: "Mar", checkIns: 8640 },
  { month: "Apr", checkIns: 8420 },
  { month: "May", checkIns: 9050 },
  { month: "Jun", checkIns: 9330 },
  { month: "Jul", checkIns: 9710 },
  { month: "Aug", checkIns: 9580 },
  { month: "Sep", checkIns: 10240 },
  { month: "Oct", checkIns: 10480 },
]

const checkInConfig = {
  checkIns: { label: "Check-ins", theme: SERIES.blue },
} satisfies ChartConfig

const planData = [
  { plan: "basic", members: 38, fill: "var(--color-basic)" },
  { plan: "pro", members: 41, fill: "var(--color-pro)" },
  { plan: "premium", members: 21, fill: "var(--color-premium)" },
]

const planConfig = {
  members: { label: "Members" },
  basic: { label: "Basic", theme: SERIES.blue },
  pro: { label: "Pro", theme: SERIES.orange },
  premium: { label: "Premium", theme: SERIES.aqua },
} satisfies ChartConfig

export function DashboardCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Reveal className="lg:col-span-2">
      <Card size="sm" className="h-full ring-gold/25">
        <CardHeader>
          <CardTitle className="font-serif text-base font-normal">Membership revenue</CardTitle>
          <CardDescription className="text-xs">
            Monthly membership revenue in $K, this year vs last year.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueConfig} className="h-56 w-full">
            <LineChart
              accessibilityLayer
              data={revenueData}
              margin={{ left: 4, right: 12, top: 4 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) => `$${v}K`}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="lastYear"
                type="monotone"
                stroke="var(--color-lastYear)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
              />
              <Line
                dataKey="thisYear"
                type="monotone"
                stroke="var(--color-thisYear)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      </Reveal>

      <Reveal delay={0.1}>
      <Card size="sm" className="h-full ring-gold/25">
        <CardHeader>
          <CardTitle className="font-serif text-base font-normal">Members by plan</CardTitle>
          <CardDescription className="text-xs">Share of active members per plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={planConfig} className="mx-auto h-56 w-full">
            <PieChart accessibilityLayer>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="plan" hideLabel />}
              />
              <Pie
                data={planData}
                dataKey="members"
                nameKey="plan"
                innerRadius={48}
                outerRadius={74}
                paddingAngle={2}
                stroke="var(--background)"
                strokeWidth={2}
              >
                {planData.map((d) => (
                  <Cell key={d.plan} fill={d.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="plan" />}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
      </Reveal>

      <Reveal className="lg:col-span-3">
      <Card size="sm" className="ring-gold/25">
        <CardHeader>
          <CardTitle className="font-serif text-base font-normal">Check-ins per month</CardTitle>
          <CardDescription className="text-xs">Total member visits, last 10 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={checkInConfig} className="h-40 w-full">
            <BarChart
              accessibilityLayer
              data={checkInData}
              margin={{ left: 4, right: 12, top: 4 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                content={<ChartTooltipContent hideLabel={false} />}
              />
              <Bar
                dataKey="checkIns"
                fill="var(--color-checkIns)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      </Reveal>
    </div>
  )
}
