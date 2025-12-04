import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { encrypt } from "@/lib/crypto"

console.log("GitHub Client ID Loaded:", !!process.env.AUTH_GITHUB_ID)
console.log("GitHub ID:", process.env.AUTH_GITHUB_ID?.substring(0, 5) + "...")
console.log("GitHub Secret:", process.env.AUTH_GITHUB_SECRET?.substring(0, 5) + "...")
console.log("Vercel ID:", process.env.AUTH_VERCEL_ID?.substring(0, 5) + "...")

export const { handlers, signIn, signOut, auth } = NextAuth({
    debug: true, // Enable NextAuth debug mode
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
            authorization: {
                params: {
                    scope: "read:user user:email public_repo",
                },
            },
        }),
        {
            id: "vercel",
            name: "Vercel",
            type: "oauth",
            authorization: {
                url: "https://vercel.com/oauth/authorize",
                params: {
                    scope: "user",
                },
            },
            token: "https://api.vercel.com/v2/oauth/access_token",
            userinfo: {
                url: "https://api.vercel.com/v2/user",
                async request({ tokens }: any) {
                    const response = await fetch("https://api.vercel.com/v2/user", {
                        headers: {
                            Authorization: `Bearer ${tokens.access_token}`,
                        },
                    });
                    const data = await response.json();
                    return {
                        id: data.user.id,
                        name: data.user.name || data.user.username,
                        email: data.user.email,
                        image: data.user.avatar,
                    };
                },
            },
            clientId: process.env.AUTH_VERCEL_ID,
            clientSecret: process.env.AUTH_VERCEL_SECRET,
            profile(profile: any) {
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    image: profile.image,
                };
            },
        } as any,
        Credentials({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!supabase) return null

                const { username, password } = credentials

                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('username', username)
                    .single()

                if (error || !user) return null

                const passwordsMatch = await compare(password as string, user.password_hash)

                if (passwordsMatch) {
                    return {
                        id: user.id,
                        name: user.nickname,
                        email: user.username,
                        nickname: user.nickname,
                        nicknameSet: user.nickname_set ?? true
                    }
                }

                return null
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Temporarily bypass Supabase to test OAuth
            console.log("[DEBUG] signIn callback triggered for provider:", account?.provider)
            return true

            /* TEMPORARILY DISABLED - SUPABASE LOGIC
            if (!supabase) return true

            // Handle OAuth sign in (Google, GitHub)
            if (account?.provider === 'google' || account?.provider === 'github') {
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('oauth_provider', account.provider)
                    .eq('oauth_id', account.providerAccountId)
                    .single()

                if (!existingUser) {
                    // Create new OAuth user
                    const { error } = await supabase
                        .from('users')
                        .insert({
                            email: user.email,
                            nickname: user.name || user.email?.split('@')[0],
                            oauth_provider: account.provider,
                            oauth_id: account.providerAccountId,
                            nickname_set: false
                        })

                    if (error) {
                        console.error('Error creating OAuth user:', error)
                        // Temporarily allow sign in even if user creation fails
                        // TODO: Fix Supabase connection and re-enable this check
                        // return false
                    }
                }
            }

            return true
            */
        },
        async jwt({ token, account, user, trigger, session }) {
            if (account) {
                token.accessToken = account.access_token
                token.provider = account.provider

                // Encrypt and store access token in profiles table
                if (supabase && user?.email && account.access_token) {
                    const encryptedToken = encrypt(account.access_token)
                    const updateData: any = {}

                    if (account.provider === 'github') {
                        updateData.github_access_token = encryptedToken
                    } else if (account.provider === 'vercel') {
                        updateData.vercel_access_token = encryptedToken
                    }

                    if (Object.keys(updateData).length > 0) {
                        await supabase
                            .from('profiles')
                            .update(updateData)
                            .eq('email', user.email)
                    }
                }
            }
            if (user) {
                // For OAuth providers, fetch the UUID from Supabase
                if (account?.provider === 'google' || account?.provider === 'github' || account?.provider === 'vercel') {
                    if (supabase && user.email) {
                        try {
                            const { data: dbUser } = await supabase
                                .from('users')
                                .select('id, nickname, nickname_set')
                                .eq('email', user.email)
                                .single()

                            if (dbUser) {
                                token.id = dbUser.id
                                token.nickname = dbUser.nickname
                                token.nicknameSet = dbUser.nickname_set ?? false
                            } else {
                                token.id = user.id
                                // For new OAuth users, set nicknameSet to false
                                token.nickname = user.name || user.email?.split('@')[0]
                                token.nicknameSet = false
                            }
                        } catch (error) {
                            console.error('Error fetching user from Supabase:', error)
                            // If Supabase fails, set defaults for OAuth users
                            token.id = user.id
                            token.nickname = user.name || user.email?.split('@')[0]
                            token.nicknameSet = false
                        }
                    } else {
                        // If Supabase is not available, set defaults for OAuth users
                        token.id = user.id
                        token.nickname = user.name || user.email?.split('@')[0]
                        token.nicknameSet = false
                    }
                } else {
                    token.id = user.id
                    token.nickname = user.nickname
                    token.nicknameSet = user.nicknameSet
                }
            }

            // Refresh nickname_set status on update
            if (trigger === 'update') {
                // If session data is provided from update() call, use it
                if (session?.nickname !== undefined) {
                    token.nickname = session.nickname
                }
                if (session?.nicknameSet !== undefined) {
                    token.nicknameSet = session.nicknameSet
                }

                // Otherwise, try to fetch from Supabase
                if (!session && supabase && token.email) {
                    try {
                        const { data: userData } = await supabase
                            .from('users')
                            .select('nickname, nickname_set')
                            .or(`email.eq.${token.email},oauth_id.eq.${token.sub}`)
                            .single()

                        if (userData) {
                            token.nickname = userData.nickname
                            token.nicknameSet = userData.nickname_set ?? false
                        }
                    } catch (error) {
                        console.error('Error fetching user data on update:', error)
                        // Continue without updating - keep existing token values
                    }
                }
            }

            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string
            if (token.id) {
                session.user.id = token.id as string
            }
            if (token.nickname) {
                session.user.nickname = token.nickname as string
            }
            session.user.nicknameSet = token.nicknameSet as boolean ?? true
            session.user.provider = token.provider as string
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')

            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            }

            return true
        },
    },
})
