"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, Trash2Icon } from "lucide-react"

import { StatusBadge } from "@/components/datatable"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InvoiceDrawer } from "@/components/invoice-drawer"
import { members } from "@/lib/members"

const tone = {
  Active: "success",
  Inactive: "danger",
  Pending: "warning",
} as const


const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })


const planPrice = { Free: 0, Pro: 19, Business: 49 } as const

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

function Section({
  title,
  children,
  flush,
}: {
  title: string
  children: React.ReactNode
  flush?: boolean
}) {
  return (
    <Card size="sm" className="gap-0 py-0 ring-gold/25">
      <div className="bg-muted/40 px-4 py-2.5 text-sm font-medium">
        {title}
      </div>
      <CardContent className={flush ? "p-0" : "p-4"}>{children}</CardContent>
    </Card>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value || "—"}</span>
    </div>
  )
}

export default function MemberDetailsPage() {
  const router = useRouter()
  const [openInvoice, setOpenInvoice] = useState<string | null>(null)
  const { id } = useParams<{ id: string }>()
  const member = members.find((m) => m.id === id)

  if (!member) {
    return (
      <div className="grid gap-3">
        <Link href="/members" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="size-4" /> Members
        </Link>
        <p className="text-sm text-muted-foreground">Member not found.</p>
      </div>
    )
  }

  const base = new Date(member.joined)
  const invoices = [0, 1].map((i) => {
    const subtotal = planPrice[member.plan]
    const discountAmount = Math.round(subtotal * 0.05 * 100) / 100
    const taxAmount = Math.round((subtotal - discountAmount) * 0.1 * 100) / 100
    const total = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100
    const paid = i === 0 || member.status === "Active"
    return {
      no: `${1000 + Number(member.id.slice(2)) * 2 + i}`,
      date: new Date(base.getTime() + i * 30 * 86400000),
      paid,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      paidAmount: paid ? total : 0,
      plan: member.plan,
      customer: member.name,
      memberId: member.id,
      memberStatus: member.status,
      memberSince: member.joined,
      avatar: member.avatar,
      phone: member.phone,
    }
  })

  const initials = member.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Link href="/members" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="size-4" /> Members
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive">
              <Trash2Icon className="size-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{member.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the member and can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  const i = members.findIndex((m) => m.id === member.id)
                  if (i >= 0) members.splice(i, 1)
                  router.push("/members")
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <Section title="Overview">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                {member.avatar && <AvatarImage src={member.avatar} alt="" />}
                <AvatarFallback className="text-base">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="font-medium">{member.name}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <StatusBadge tone={tone[member.status]}>{member.status}</StatusBadge>
                  <span>Member since {dateFormat.format(new Date(member.joined))}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
              <Field label="Total invoice" value={String(member.subscriptions ?? 0)} />
              <Field label="Total spent" value={money.format(member.totalSpent ?? 0)} />
              <Field label="Avg. order" value={money.format(member.avgOrder ?? 0)} />
              <Field label="Joined" value={dateFormat.format(new Date(member.joined))} />
            </div>
          </Section>

          <Section title={`Invoice (${invoices.length})`} flush>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-normal">Invoice</th>
                  <th className="px-4 py-2.5 text-left font-normal">Date</th>
                  <th className="px-4 py-2.5 text-left font-normal">Payment</th>
                  <th className="px-4 py-2.5 text-left font-normal">Status</th>
                  <th className="px-4 py-2.5 text-right font-normal">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.no}
                    onClick={() => setOpenInvoice(inv.no)}
                    className="cursor-pointer border-t border-border hover:bg-ivory"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs">#{inv.no}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {dateFormat.format(inv.date)}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge tone={inv.paid ? "success" : "warning"}>
                        {inv.paid ? "Paid" : "Pending"}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge tone="neutral">Issued</StatusBadge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold">
                      {money.format(inv.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="grid gap-4">
          <Section title="Contact">
            <div className="grid gap-4">
              <Field label="Phone" value={member.phone} />
              <Field label="Gender" value={member.gender} />
            </div>
          </Section>

          <Section title="Plans">
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                {member.plan}
              </span>
            </div>
          </Section>
        </div>
      </div>
      <InvoiceDrawer
        invoice={invoices.find((i) => i.no === openInvoice) ?? null}
        onOpenChange={(o) => !o && setOpenInvoice(null)}
      />
    </>
  )
}
