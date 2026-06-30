import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard"]
const authRoutes = ["/login", "/register"]
const publicApiRoutes = ["/api/register", "/api/login", "/api/appointments"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get("session")?.value

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname === route)
  const isApiRoute = pathname.startsWith("/api")
  const isPublicApi = publicApiRoutes.some((route) => pathname.startsWith(route))

  if (isApiRoute && !isPublicApi && !session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
