"use client"

import { useEffect, useState } from "react"
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

type Errors = Partial<
  Record<"name" | "username" | "email" | "phone" | "password", string>
>

export function UserEditDialog<Role extends string, Status extends string>({
  open,
  onOpenChange,
  roles,
  statuses,
  mode = "edit",
  initial,
  existing = [],
  onSave,
}: {
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
}) {
  const creating = mode === "create"
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<Role>(roles[0])
  const [status, setStatus] = useState<Status>(statuses[0])
  const [errors, setErrors] = useState<Errors>({})

  // fresh form every time the dialog opens
  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? "")
    setUsername(initial?.username ?? "")
    setEmail(initial?.email ?? "")
    setPhone(initial?.phone ?? "")
    setPassword("")
    setShowPassword(false)
    // new users start with the least-privileged role (last in the list)
    setRole(initial?.role ?? roles[roles.length - 1])
    setStatus(initial?.status ?? statuses[0])
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id])

  function clear(field: keyof Errors) {
    setErrors((c) => ({ ...c, [field]: undefined }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const found: Errors = {}
    const others = existing.filter((u) => u.id !== initial?.id)

    if (!name.trim()) found.name = "Please enter a name."

    const uname = username.trim()
    if (!uname) found.username = "Please enter a username."
    else if (!/^[a-zA-Z0-9._-]{3,}$/.test(uname))
      found.username = "Use 3+ letters, numbers, dot, dash or underscore."
    else if (others.some((u) => u.username.toLowerCase() === uname.toLowerCase()))
      found.username = "This username is already taken."

    const mail = email.trim()
    // email and phone are optional: only check them when filled in
    if (mail && !/^\S+@\S+\.\S+$/.test(mail)) found.email = "Enter a valid email."
    else if (mail && others.some((u) => u.email.toLowerCase() === mail.toLowerCase()))
      found.email = "This email is already used."

    if (phone.trim() && !/^\+?[\d\s-]{7,}$/.test(phone.trim()))
      found.phone = "Enter a valid phone number."

    // required for a new user; when editing, blank keeps the current password
    if (creating && !password) found.password = "Please enter a password."
    else if (password && password.length < 8)
      found.password = "Use at least 8 characters."

    setErrors(found)
    if (Object.keys(found).length) return

    onSave({
      name: name.trim(),
      username: uname,
      email: mail,
      phone: phone.trim(),
      password,
      role,
      status,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-border bg-white! font-(family-name:--font-geist-sans) sm:max-w-md">
        <form onSubmit={submit} noValidate autoComplete="off" className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-serif) text-xl font-normal">
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
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                clear("name")
              }}
              autoFocus
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="user-username" required>Username</Label>
              <Input
                id="user-username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  clear("username")
                }}
                autoCapitalize="none"
                aria-invalid={Boolean(errors.username)}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="user-phone">Phone</Label>
              <Input
                id="user-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  clear("phone")
                }}
                placeholder="012 345 678"
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clear("email")
              }}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="user-password" required={creating}>Password</Label>
            <div className="relative">
              <Input
                id="user-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clear("password")
                }}
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
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
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
            </div>

            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
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
      </DialogContent>
    </Dialog>
  )
}
