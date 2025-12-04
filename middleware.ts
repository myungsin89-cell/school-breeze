import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth?.user
    const nicknameSet = req.auth?.user?.nicknameSet ?? true

    // Paths that don't require nickname
    const publicPaths = ['/login', '/register', '/setup-nickname', '/setup', '/api', '/_next']
    const isPublicPath = publicPaths.some(path => nextUrl.pathname.startsWith(path))

    // If logged in but nickname not set, redirect to setup page
    if (isLoggedIn && !nicknameSet && !isPublicPath) {
        return NextResponse.redirect(new URL('/setup-nickname', nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
