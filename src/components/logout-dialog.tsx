"use client"

import { useRouter } from "next/navigation"
import { TriangleAlertIcon, XIcon } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function LogoutDialog({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const router = useRouter()

    function logout() {
        // TODO: end the session here once auth exists.
        router.push("/login")
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="gap-0 rounded-3xl border-0 bg-ivory! px-7 pt-8 pb-6 shadow-[0_0_60px_-8px_rgb(184_151_90/0.55),0_20px_50px_-20px_rgb(0_0_0/0.35)] ring-1 ring-gold/30 sm:max-w-[21rem]!">
                <button
                    type="button"
                    aria-label="Close"
                    onClick={() => onOpenChange(false)}
                    className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-lg border border-gold/30 bg-white text-foreground shadow-xs transition-colors outline-none hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold/50"
                >
                    <XIcon className="size-3.5" />
                </button>

                <AlertDialogHeader className="flex flex-col items-center gap-0 text-center sm:text-center">
                    <TriangleAlertIcon
                        aria-hidden
                        className="mx-auto size-8 fill-gold/20 text-gold-dark"
                        strokeWidth={1.75}
                    />
                    <AlertDialogTitle className="mt-4 w-full text-center font-serif text-lg leading-snug font-medium tracking-tight whitespace-nowrap">
                        Do you really want to log out?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="mt-1.5 w-full text-center font-serif text-sm text-muted-foreground whitespace-nowrap">
                        You will need to sign in again.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="mx-0! mt-6 mb-0! grid grid-cols-2 gap-3 border-0 bg-transparent p-0 sm:grid-cols-2">
                    <AlertDialogAction
                        className="h-9 rounded-lg bg-ink! font-serif text-sm font-medium tracking-wide text-white! shadow-md hover:bg-ink/90!"
                        onClick={logout}>
                        Yes
                    </AlertDialogAction>
                    <AlertDialogCancel className="h-9 rounded-lg border-0 bg-gold/20! font-serif text-sm font-medium tracking-wide text-gold-dark! shadow-none hover:bg-gold/30!">
                        No
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
