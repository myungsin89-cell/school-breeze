'use client'

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
    isLoggedIn: boolean
    hasTokens: boolean
    provider: string | null
}

export function AuthGuard({ isLoggedIn, hasTokens, provider }: AuthGuardProps) {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // If not logged in, do nothing (middleware or page protection handles it)
        if (!isLoggedIn) return

        // OAuth users (GitHub/Google) already have GitHub connected, so skip setup
        if (provider === 'github' || provider === 'google') {
            return
        }

        // If tokens are missing
        if (!hasTokens) {
            // Allow access to setup page, api routes, and static assets
            if (
                pathname === '/setup' ||
                pathname.startsWith('/api') ||
                pathname.startsWith('/_next') ||
                pathname.startsWith('/static') ||
                pathname === '/login' || // Should not happen if logged in, but safe to allow
                pathname === '/register' // Should not happen if logged in, but safe to allow
            ) {
                return
            }

            // Redirect to setup page
            router.push('/setup')
        }
    }, [isLoggedIn, hasTokens, provider, pathname, router])

    return null
}
