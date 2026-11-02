"use client"

import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUserSchema, type UserFormValues } from "@/schemas/user.schema"

export type UserFields<Role extends string, Status extends string> = {
  name: string
  username: string
  email: string
  phone: string
  /** Empty when editing and the password was left unchanged. */
  password: string
  role: Role
  status: Status
}

type Props<Role extends string, Status extends string> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: readonly Role[]
  statuses: readonly Status[]
  /** "create" opens an empty form; "edit" fills it from `initial`. */
  mode?: "create" | "edit"
  initial?: Omit<UserFields<Role, Status>, "password"> & { id: string }
  /** Other users, to block a duplicate username or email. */
  existing?: { id: string; username: string; email: string }[]
  onSave: (fields: UserFields<Role, Status>) => void
}

export function UserEditDialog<Role extends string, Status extends string>(
  props: Props<Role, Status>
) {
  const { open, onOpenChange, mode = "edit" } = props
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-border bg-white! font-(family-name:--font-geist-sans) sm:max-w-md">
        {/* mounted only while open, so the form starts fresh every time */}
        <UserForm {...props} mode={mode} />
      </DialogContent>
    </Dialog>
  )
}

function UserForm<Role extends string, Status extends string>({
  onOpenChange,
  roles,
  statuses,
  mode = "edit",
  initial,
  existing = [],
  onSave,
}: Props<Role, Status>) {
  const creating = mode === "create"
  const [showPassword, setShowPassword] = useState(false)

  const schema = useMemo(
    () =>
      createUserSchema({
        creating,
        others: existing.filter((u) => u.id !== initial?.id),
      }),
    [creating, existing, initial?.id]
  )

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      username: initial?.username ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      password: "",
      // new users start with the least-privileged role (last in the list)
      role: initial?.role ?? roles[roles.length - 1],
      status: initial?.status ?? statuses[0],
    },
  })

  const submit = handleSubmit((values) => {
    onSave({
      ...values,
      role: values.role as Role,
      status: values.status as Status,
    })
    onOpenChange(false)
  })

  return (
    <form onSubmit={submit} noValidate autoComplete="off" className="grid gap-4">
      <DialogHeader>
        <DialogTitle className="font-serif text-xl font-normal">
          {creating ? "Create user" : "Edit user"}
        </DialogTitle>
        <DialogDescription>
          {creating
            ? "Add a new user who can sign in."
            : "Change this user's details. Leave the password blank to keep it."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-1.5">
        <Label htmlFor="user-name" required>Name</Label>
        <Input
          id="user-name"
          {...register("name")}
          autoFocus
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="user-username" required>Username</Label>
          <Input
            id="user-username"
            {...register("username")}
            autoCapitalize="none"
            aria-invalid={Boolean(errors.username)}
          />
          {errors.username && (
            <p className="text-xs text-destructive">{errors.username.message}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="user-phone" required>Phone</Label>
          <Input
            id="user-phone"
            type="tel"
            inputMode="tel"
            {...register("phone")}
            placeholder="012 345 678"
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="user-email" required>Email</Label>
        <Input
          id="user-email"
          type="email"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="user-password" required={creating}>Password</Label>
        <div className="relative">
          <Input
            id="user-password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            autoComplete="new-password"
            placeholder={creating ? "At least 8 characters" : "Leave blank to keep"}
            aria-invalid={Boolean(errors.password)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Role</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-label="Role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="border-border"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-ink! text-white! hover:bg-ink/90!">
          {creating ? "Create" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  )
}
