"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {useTranslations} from 'next-intl';

export default function LoginPage() {
    const t = useTranslations('LoginPage');
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        // TODO: call your auth API here
        console.log({ username, password })
        setLoading(false)
    }

    return (
        <main className="flex min-h-svh items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Enter your username and password to sign in.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">{t('username')}</Label>
                            <Input
                                id="username"
                                name="username"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('password')}</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="mt-4 flex flex-col gap-3">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Login"}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            No account?{" "}
                            <Link href="/register" className="underline underline-offset-4">
                                Register
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </main>
    )
}
