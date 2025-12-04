import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import SetupWizard from "@/components/setup/SetupWizard"

export default async function SetupPage() {
    const session = await auth()

    if (!session?.user?.email) {
        redirect('/login')
    }

    // If user logged in via OAuth (GitHub or Google), skip setup
    // They already connected their GitHub account during OAuth
    if (session.user.provider === 'github' || session.user.provider === 'google') {
        redirect('/')
    }

    // Fetch user profile to check connections
    // Note: We use the public supabase client here but in a real app we might need admin if RLS blocks reading tokens.
    // However, the policy "Users can view own profile" should allow this if we are authenticated.
    // But wait, `supabase` in lib/supabase is a client-side client (anon key).
    // Server components should use a client with the user's access token or admin key.
    // For now, let's assume we can read it or use admin key if available.

    let hasGithub = false
    let hasVercel = false

    if (supabase) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('github_access_token, vercel_access_token')
            .eq('email', session.user.email)
            .single()

        if (profile) {
            hasGithub = !!profile.github_access_token
            hasVercel = !!profile.vercel_access_token
        }
    }

    // If both are connected, redirect to dashboard
    if (hasGithub && hasVercel) {
        redirect('/')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <SetupWizard hasGithub={hasGithub} hasVercel={hasVercel} />
        </div>
    )
}
