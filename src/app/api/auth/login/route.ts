import { NextResponse } from "next/server"

import { SESSION_COOKIE } from "@/lib/auth"

export async function POST(request: Request) {
  const { username, password } = await request.json().catch(() => ({}))
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }

  // TODO: verify the credentials against your auth API and use the token it
  // returns as the cookie value. Until then, any non-empty login is accepted.
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  })
  return response
}
