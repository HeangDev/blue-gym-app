import {
    ArrowDownRightIcon,
    ArrowUpRightIcon,
    BanknoteIcon,
    RefreshCwIcon,
    DoorOpenIcon,
    UsersIcon,
    type LucideIcon,
} from "lucide-react"

import { CountUp, Stagger, StaggerItem } from "@/components/motion"
import { cn } from "@/lib/utils"

type Summary = {
    title: string
    value: number
    prefix?: string
    suffix?: string
    decimals?: number
    change: number
    note: string
    icon: LucideIcon
    spark: number[]
}

const summaries: Summary[] = [
    {
        title: "Check-ins Today",
        value: 312,
        change: 12.5,
        note: "member visits today",
        icon: DoorOpenIcon,
        spark: [40, 55, 45, 60, 52, 70, 85],
    },
    {
        title: "Active Members",
        value: 2350,
        change: 8.2,
        note: "with a valid membership",
        icon: UsersIcon,
        spark: [50, 48, 60, 58, 66, 72, 78],
    },
    {
        title: "Monthly Revenue",
        value: 45231,
        prefix: "$",
        change: 20.1,
        note: "vs. last month",
        icon: BanknoteIcon,
        spark: [30, 42, 40, 58, 65, 80, 92],
    },
    {
        title: "Renewal Rate",
        value: 86.4,
        suffix: "%",
        decimals: 1,
        change: -1.2,
        note: "memberships renewed on time",
        icon: RefreshCwIcon,
        spark: [80, 74, 78, 70, 72, 66, 64],
    },
]

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
    const w = 64
    const h = 24
    const step = w / (data.length - 1)
    const points = data
        .map((v, i) => `${(i * step).toFixed(1)},${(h - (v / 100) * h).toFixed(1)}`)
        .join(" ")

    return (
        <svg
            aria-hidden
            viewBox={`0 0 ${w} ${h}`}
            className={cn(
                "h-6 w-16 shrink-0 overflow-visible",
                positive ? "text-emerald-600" : "text-rose-600"
            )}
        >
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function SummaryCards() {
    return (
        <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaries.map((s) => {
                const positive = s.change >= 0
                const TrendIcon = positive ? ArrowUpRightIcon : ArrowDownRightIcon

                return (
                    <StaggerItem
                        key={s.title}
                        whileHover={{ y: -2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className={cn(
                            "flex items-center justify-between gap-3 rounded-lg border border-l-[3px] bg-card px-3.5 py-2.5 shadow-xs transition-shadow hover:shadow-md",
                            positive ? "border-l-emerald-600" : "border-l-rose-600"
                        )}
                    >
                        <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                                <s.icon className="size-3 text-gold-dark" />
                                <span className="truncate">{s.title}</span>
                            </p>
                            <div className="font-serif text-xl leading-tight tracking-tight">
                                <CountUp
                                    to={s.value}
                                    prefix={s.prefix}
                                    suffix={s.suffix}
                                    decimals={s.decimals}
                                />
                            </div>
                            <p
                                title={s.note}
                                className={cn(
                                    "flex items-center gap-0.5 text-[11px] font-medium",
                                    positive ? "text-emerald-700" : "text-rose-700"
                                )}
                            >
                                <TrendIcon className="size-3" />
                                {Math.abs(s.change)}%
                                <span className="ml-1 font-normal text-muted-foreground">
                                    vs last month
                                </span>
                            </p>
                        </div>
                        <Sparkline data={s.spark} positive={positive} />
                    </StaggerItem>
                )
            })}
        </Stagger>
    )
}
