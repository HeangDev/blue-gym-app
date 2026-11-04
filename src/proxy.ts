import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { SESSION_COOKIE } from "@/lib/auth"

const LOGIN_PATH = "/login"
const HOME_PATH = "/dashboard"

// Optimistic auth check: signed-out visitors go to /login (and come back after
// signing in), signed-in visitors skip the login page.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const signedIn = request.cookies.has(SESSION_COOKIE)

  if (pathname === LOGIN_PATH) {
    return signedIn
      ? NextResponse.redirect(new URL(HOME_PATH, request.url))
      : NextResponse.next()
  }

  if (!signedIn) {
    const url = new URL(LOGIN_PATH, request.url)
    if (pathname !== "/") url.searchParams.set("next", pathname + search)
    return NextResponse.redirect(url)
  }

  if (pathname === "/") return NextResponse.redirect(new URL(HOME_PATH, request.url))

  return NextResponse.next()
}

export const config = {
  // every page except API routes, Next internals and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\..*).*)"],
}
