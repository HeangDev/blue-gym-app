"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { ChevronDownIcon, LanguagesIcon, LogOutIcon, SettingsIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogoutDialog } from "@/components/logout-dialog"
import { settingsItem } from "@/lib/nav"

const languages = [
  { code: "en", label: "English" },
  { code: "kh", label: "ភាសាខ្មែរ" },
]

export function ProfileMenu() {
  const locale = useLocale()
  const t = useTranslations("ProfileMenu")
  const router = useRouter()
  const [logoutOpen, setLogoutOpen] = useState(false)

  function changeLanguage(code: string) {
    // request.ts reads this cookie to pick the messages file.
    document.cookie = `locale=${code}; path=/; max-age=31536000; samesite=lax`
    router.refresh()
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-gold/40 data-[state=open]:bg-muted"
        >
          <Avatar className="size-7 ring-2 ring-gold/30">
            <AvatarFallback className="bg-linear-to-br from-gold to-gold-dark text-xs font-medium text-white">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left leading-tight lg:block">
            <p className="text-xs font-medium">Admin</p>
            <p className="text-[11px] text-muted-foreground">Super admin</p>
          </div>
          <ChevronDownIcon className="hidden size-3.5 text-muted-foreground lg:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-52 rounded-xl p-1.5 font-(family-name:--font-serif) shadow-lg"
      >
        <div className="px-2 pt-1.5 pb-2">
          <p className="text-base leading-tight">Admin</p>
          <p className="truncate text-xs text-muted-foreground">
            admin@example.com
          </p>
        </div>
        <DropdownMenuSeparator className="mx-0 my-1" />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-md px-2 py-1.5">
            <LanguagesIcon />
            {t("language")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-40 rounded-xl p-1.5 font-(family-name:--font-serif)">
            <DropdownMenuRadioGroup value={locale} onValueChange={changeLanguage}>
              {languages.map((l) => (
                <DropdownMenuRadioItem key={l.code} value={l.code}>
                  {l.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem asChild className="rounded-md px-2 py-1.5">
          <Link href={settingsItem.href}>
            <SettingsIcon />
            {t("settings")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="mx-0 my-1" />
        <DropdownMenuItem
          variant="destructive"
          className="rounded-md px-2 py-1.5"
          onSelect={() => setLogoutOpen(true)}
        >
          <LogOutIcon />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  )
}
