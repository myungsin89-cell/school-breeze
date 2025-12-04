import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        githubClientIdExists: !!process.env.AUTH_GITHUB_ID,
        githubClientSecretExists: !!process.env.AUTH_GITHUB_SECRET,
        vercelClientIdExists: !!process.env.AUTH_VERCEL_ID,
        vercelClientSecretExists: !!process.env.AUTH_VERCEL_SECRET,
        authSecretExists: !!process.env.AUTH_SECRET,
        authSecretLength: process.env.AUTH_SECRET?.length || 0,
        githubClientIdLength: process.env.AUTH_GITHUB_ID?.length || 0,
        githubClientSecretLength: process.env.AUTH_GITHUB_SECRET?.length || 0,
    })
}
