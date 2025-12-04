import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        accessToken?: string
        user: {
            id: string
            nickname: string
            nicknameSet: boolean
            provider?: string
        } & DefaultSession["user"]
    }

    interface User {
        nickname?: string
        nicknameSet?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
        id?: string
        nickname?: string
        nicknameSet?: boolean
        provider?: string
    }
}
