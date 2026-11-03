"use client"

import { PackageIcon } from "lucide-react"
import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

import { StatusBadge } from "@/components/datatable"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "cn"

export type Invoice = {
  no: string
  date: Date
  paid: boolean
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  paidAmount: number
  plan: string
  customer: string
  memberId: string
  memberStatus: "Active" | "Inactive" | "Pending"
  memberSince: string
  avatar?: string | null
  phone?: string
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})


function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl bg-muted/40 ring-1 ring-border">
      <h3 className="px-3 py-2 text-sm font-medium">{title}</h3>
      <div className="rounded-xl border-t border-border bg-white">{children}</div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

function PriceRow({
  label,
  value,
  strong,
}: {
  label: string
  value: number
  strong?: boolean
}) {
  return (
    <div
      className={cn(
        "flex justify-between text-sm",
        strong ? "font-semibold" : "text-muted-foreground"
      )}
    >
      <span className={strong ? "text-foreground" : undefined}>{label}</span>
      <span className={strong ? undefined : "text-foreground"}>
        {money.format(value)}
      </span>
    </div>
  )
}

export function InvoiceDrawer({
  invoice,
  onOpenChange,
}: {
  invoice: Invoice | null
  onOpenChange: (open: boolean) => void
}) {

  return (
    <Sheet open={invoice !== null} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-hidden rounded-2xl border border-border bg-white! p-0 font-(family-name:--font-geist-sans) data-[side=right]:inset-y-3 data-[side=right]:right-3 data-[side=right]:h-auto data-[side=right]:w-[calc(100%-1.5rem)] data-[side=right]:sm:max-w-4xl">
        {invoice && (
          <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-border px-6 py-5">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg font-medium">
                  Invoice #{invoice.no}
                </SheetTitle>
                <StatusBadge tone={invoice.paid ? "success" : "warning"}>
                  {invoice.paid ? "Paid" : "Pending"}
                </StatusBadge>
              </div>
              <SheetDescription className="mt-1">
                Created{" "}
                <span className="text-foreground">{dateFormat.format(invoice.date)}</span>
                <span className="mx-1.5">•</span>
                Customer:{" "}
                <span className="font-medium text-foreground">{invoice.customer}</span>
              </SheetDescription>
            </div>

            <SimpleBar autoHide={false} className="min-h-0 flex-1">
              <div className="grid md:grid-cols-[1fr_300px]">
                <div className="grid content-start gap-4 p-6">
                  <Panel title="Invoice Data">
                    <div className="grid grid-cols-2 gap-4 p-3 sm:grid-cols-4">
                      <Stat label="Items" value="1 Item" />
                      <Stat label="Total Price" value={money.format(invoice.total)} />
                      <Stat label="Billing Cycle" value="Monthly" />
                      <Stat label="Payment Method" value="Card" />
                    </div>
                  </Panel>

                  <Panel title="Items">
                    <div className="flex items-center gap-3 p-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <PackageIcon className="size-5" />
                      </div>
                      <div className="grid flex-1 gap-0.5">
                        <span className="text-sm font-medium">{invoice.plan} plan</span>
                        <span className="text-xs text-muted-foreground">
                          Billing<span className="mx-1.5">•</span>1 month
                          <span className="mx-1.5">•</span>Qty 1
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {money.format(invoice.total)}
                      </span>
                    </div>
                  </Panel>

                  <Panel title="Member">
                    <div className="flex items-center gap-3 p-3">
                      <Avatar className="size-11">
                        {invoice.avatar && <AvatarImage src={invoice.avatar} alt="" />}
                        <AvatarFallback>
                          {invoice.customer
                            .split(/\s+/)
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 gap-0.5">
                        <span className="text-sm font-medium">{invoice.customer}</span>
                        <span className="text-xs text-muted-foreground">
                          {invoice.memberId}
                          <span className="mx-1.5">•</span>
                          {invoice.phone || "No phone on file"}
                        </span>
                      </div>
                      <StatusBadge
                        tone={
                          invoice.memberStatus === "Active"
                            ? "success"
                            : invoice.memberStatus === "Pending"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {invoice.memberStatus}
                      </StatusBadge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-border p-3">
                      <Stat label="Plan" value={invoice.plan} />
                      <Stat label="Member since" value={dateFormat.format(new Date(invoice.memberSince))} />
                      <Stat label="Paid by member" value={money.format(invoice.paidAmount)} />
                    </div>
                  </Panel>
                </div>

                <div className="border-t border-border p-6 md:border-t-0 md:border-l">
                  <Panel title="Summary">
                    <div className="grid gap-4 p-3">
                      <div className="grid gap-0.5">
                        <p className="text-sm font-medium">Billed to {invoice.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.phone || "No phone on file"}
                        </p>
                      </div>
                      <div className="grid gap-2 border-t border-border pt-4">
                        <p className="text-sm font-medium">Price Details</p>
                        <PriceRow label="Subtotal" value={invoice.subtotal} />
                        <PriceRow label="Discount amount" value={-invoice.discountAmount} />
                        <PriceRow label="Tax amount" value={invoice.taxAmount} />
                      </div>
                      <div className="grid gap-2 border-t border-border pt-4">
                        <PriceRow label="Total amount" value={invoice.total} strong />
                        <PriceRow label="Paid amount" value={invoice.paidAmount} />
                      </div>
                    </div>
                  </Panel>
                </div>
              </div>
            </SimpleBar>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  className="bg-ink! text-white! hover:bg-ink/90!"
                  onClick={() => window.print()}
                >
                  Print Invoice
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
