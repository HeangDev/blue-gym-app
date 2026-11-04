"use client"

import { useRef, useState, type ReactNode } from "react"
import { PlusIcon, UserIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type MemberPlan = "Free" | "Pro" | "Business"

export type Gender = "Male" | "Female" | "Other"

export type PaymentMethod = "Card" | "Bank transfer" | "KHQR" | "Cash"

export type BillingCycle = "Monthly" | "Yearly"

export type MemberValues = {
  name: string
  gender: Gender | ""
  avatar: string | null
  notes: string
  phone: string
  plan: MemberPlan
  active: boolean
  paymentMethod: PaymentMethod
  billingCycle: BillingCycle
  billingEmail: string
  /** null = no discount for this member */
  discount: { type: DiscountType; value: number } | null
}

export type DiscountType = "Percent" | "Fixed"

const GENDERS: Gender[] = ["Male", "Female", "Other"]

const PLANS: { id: MemberPlan; hint: string }[] = [
  { id: "Free", hint: "Basic access for individuals getting started" },
  { id: "Pro", hint: "Advanced features with priority support" },
  { id: "Business", hint: "Team accounts on volume pricing" },
]

const PAYMENT_METHODS: PaymentMethod[] = ["Card", "Bank transfer", "KHQR", "Cash"]

const PAYMENT_HINTS: Record<PaymentMethod, string> = {
  Card: "Charged automatically to a credit or debit card.",
  "Bank transfer": "Member transfers the amount from their bank.",
  KHQR: "Pay by scanning a KHQR code in a banking app.",
  Cash: "Paid in person and recorded manually.",
}

const BILLING_CYCLES: BillingCycle[] = ["Monthly", "Yearly"]

const BILLING_HINTS: Record<BillingCycle, string> = {
  Monthly: "Charged once every month.",
  Yearly: "Charged once a year, paid up front.",
}

const MAX_IMAGE_MB = 2

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
        checked ? "bg-gold" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-4",
        )}
      />
    </button>
  )
}

// A section card: a gray title bar, then a white box of rows.
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card size="sm" className="bg-muted/40 ring-border">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// A label + hint on the left, the control on the right, dashed line between rows.
function Row({
  label,
  hint,
  htmlFor,
  error,
  children,
}: {
  label: string
  hint: string
  htmlFor?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-3 border-b border-dashed border-border px-6 py-4 last:border-b-0 sm:grid-cols-[1fr_2.3fr] sm:gap-8">
      <div>
        <Label htmlFor={htmlFor} className="text-sm font-semibold">
          {label}
        </Label>
        <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
      </div>
      <div className="grid content-start gap-1.5">
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  )
}

// The member fields with validation: General on the left, Avatar, Status and
// Plan on the right. Used by the create and edit pages; submit it with a
// button that has form="member-form".
export function MemberForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<MemberValues>
  onSubmit: (values: MemberValues) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [name, setName] = useState(initial?.name ?? "")
  const [gender, setGender] = useState<Gender | "">(initial?.gender ?? "")
  const [avatar, setAvatar] = useState<string | null>(initial?.avatar ?? null)
  const [notes, setNotes] = useState(initial?.notes ?? "")
  const [phone, setPhone] = useState(initial?.phone ?? "")
  const [plan, setPlan] = useState<MemberPlan>(initial?.plan ?? "Free")
  const [active, setActive] = useState(initial?.active ?? true)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initial?.paymentMethod ?? "Card")
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initial?.billingCycle ?? "Monthly")
  const [billingEmail, setBillingEmail] = useState(initial?.billingEmail ?? "")
  const [hasDiscount, setHasDiscount] = useState(Boolean(initial?.discount))
  const [discountType, setDiscountType] = useState<DiscountType>(initial?.discount?.type ?? "Percent")
  const [discountValue, setDiscountValue] = useState(
    initial?.discount ? String(initial.discount.value) : "",
  )
  const [errors, setErrors] = useState<{
    name?: string
    avatar?: string
    billingEmail?: string
    discount?: string
  }>({})

  function pickAvatar(file?: File) {
    if (!file) return
    if (!file.type.startsWith("image/"))
      return setErrors((s) => ({ ...s, avatar: "Please choose an image file." }))
    if (file.size > MAX_IMAGE_MB * 1024 * 1024)
      return setErrors((s) => ({ ...s, avatar: `Image must be under ${MAX_IMAGE_MB} MB.` }))
    setErrors((s) => ({ ...s, avatar: undefined }))
    const reader = new FileReader()
    reader.onload = () => setAvatar(String(reader.result))
    reader.readAsDataURL(file)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (!n) return setErrors({ name: "Please enter a name." })
    const email = billingEmail.trim()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setErrors({ billingEmail: "Please enter a valid email." })

    let discount: MemberValues["discount"] = null
    if (hasDiscount) {
      const value = Number(discountValue)
      if (!discountValue.trim() || !Number.isFinite(value) || value <= 0)
        return setErrors({ discount: "Enter a discount greater than 0." })
      if (discountType === "Percent" && value > 100)
        return setErrors({ discount: "Percent can't be more than 100." })
      discount = { type: discountType, value }
    }

    onSubmit({
      discount,
      name: n,
      gender,
      avatar,
      notes: notes.trim(),
      phone: phone.trim(),
      plan,
      active,
      paymentMethod,
      billingCycle,
      billingEmail: billingEmail.trim(),
    })
  }

  return (
    <form
      id="member-form"
      onSubmit={submit}
      noValidate
      autoComplete="off"
      className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="grid gap-4">
        <Section title="General">
          <Row
            label="Name"
            hint="The full name of the member."
            htmlFor="member-name"
            error={errors.name}
          >
            <Input
              id="member-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors((s) => ({ ...s, name: undefined }))
              }}
              placeholder="e.g. Avery Chen"
              autoFocus
              aria-invalid={Boolean(errors.name)}
            />
          </Row>
          <Row label="Gender" hint="Optional.">
            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
              <SelectTrigger className="w-full" aria-label="Gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row label="Phone" hint="Optional contact number." htmlFor="member-phone">
            <Input
              id="member-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+855 12 345 678"
            />
          </Row>
          <Row
            label="Notes"
            hint="Internal notes about this member."
            htmlFor="member-notes"
          >
            <Textarea
              id="member-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24"
            />
          </Row>
        </Section>

        <Section title="Payment">
          <Row label="Payment method" hint="How this member pays for their plan.">
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            >
              <SelectTrigger className="w-full" aria-label="Payment method">
                <SelectValue>{paymentMethod}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    <span className="grid text-left">
                      <span className="font-medium">{m}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {PAYMENT_HINTS[m]}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row label="Billing cycle" hint="How often the member is charged.">
            <Select
              value={billingCycle}
              onValueChange={(v) => setBillingCycle(v as BillingCycle)}
            >
              <SelectTrigger className="w-full" aria-label="Billing cycle">
                <SelectValue>{billingCycle}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BILLING_CYCLES.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="grid text-left">
                      <span className="font-medium">{c}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {BILLING_HINTS[c]}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row
            label="Discount"
            hint="Give this member a discount on their plan."
            htmlFor="member-discount"
            error={errors.discount}
          >
            <div className="flex items-center gap-3">
              <Switch
                checked={hasDiscount}
                onChange={(v) => {
                  setHasDiscount(v)
                  setErrors((s) => ({ ...s, discount: undefined }))
                }}
                label="Give a discount"
              />
              <span className="text-sm text-muted-foreground">
                {hasDiscount ? "Discount applied" : "No discount"}
              </span>
            </div>
            {hasDiscount && (
              <div className="grid grid-cols-[9rem_1fr] gap-2">
                <Select
                  value={discountType}
                  onValueChange={(v) => setDiscountType(v as DiscountType)}
                >
                  <SelectTrigger className="w-full" aria-label="Discount type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percent">Percent (%)</SelectItem>
                    <SelectItem value="Fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="member-discount"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(e.target.value)
                    setErrors((s) => ({ ...s, discount: undefined }))
                  }}
                  placeholder={discountType === "Percent" ? "e.g. 10" : "e.g. 5.00"}
                  aria-invalid={Boolean(errors.discount)}
                />
              </div>
            )}
          </Row>
          <Row
            label="Billing email"
            hint="Where invoices and receipts are sent."
            htmlFor="member-billing-email"
            error={errors.billingEmail}
          >
            <Input
              id="member-billing-email"
              type="email"
              value={billingEmail}
              onChange={(e) => {
                setBillingEmail(e.target.value)
                setErrors((s) => ({ ...s, billingEmail: undefined }))
              }}
              placeholder="billing@example.com"
              aria-invalid={Boolean(errors.billingEmail)}
            />
          </Row>
        </Section>
      </div>

      <div className="grid gap-4 lg:sticky lg:top-4">
        <Section title="Avatar">
          <div className="p-4">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                pickAvatar(e.dataTransfer.files?.[0])
              }}
              className={`grid justify-items-center gap-3 rounded-lg border border-dashed p-5 text-center transition-colors ${
                dragging ? "border-gold bg-gold/5" : "border-border"
              }`}
            >
              <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Avatar preview" className="size-full object-cover" />
                ) : (
                  <UserIcon className="size-7" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Drop a photo here or click to browse. PNG or JPG, up to {MAX_IMAGE_MB} MB.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-border"
                  onClick={() => fileRef.current?.click()}
                >
                  <PlusIcon />
                  {avatar ? "Change file" : "Add file"}
                </Button>
                {avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAvatar(null)}
                  >
                    <XIcon />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                pickAvatar(e.target.files?.[0])
                e.target.value = ""
              }}
            />
            {errors.avatar && (
              <p className="mt-2 text-xs text-destructive">{errors.avatar}</p>
            )}
          </div>
        </Section>

        <Section title="Status">
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">Active account</p>
              <p className="text-sm text-muted-foreground">
                Off marks the member as inactive.
              </p>
            </div>
            <Switch checked={active} onChange={setActive} label="Active account" />
          </div>
        </Section>

        <Section title="Plan">
          <div className="grid gap-3 p-4">
            {PLANS.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-start gap-3 text-sm">
                <Checkbox
                  checked={plan === p.id}
                  onCheckedChange={(v) => v === true && setPlan(p.id)}
                  aria-label={p.id}
                  className="mt-0.5 data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-white dark:data-[state=checked]:bg-gold"
                />
                <span className="grid">
                  <span className="font-medium">{p.id}</span>
                  <span className="text-muted-foreground">{p.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </Section>
      </div>
    </form>
  )
}
