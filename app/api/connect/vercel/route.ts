import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { encrypt } from "@/lib/crypto";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(new URL(`/settings?error=${error}`, request.url));
    }

    if (!code) {
        // 인증 시작: Vercel OAuth URL로 리다이렉트
        const clientId = process.env.AUTH_VERCEL_ID;
        const redirectUri = `${request.nextUrl.origin}/api/connect/vercel`;
        const state = Math.random().toString(36).substring(7);

        const authUrl = new URL("https://vercel.com/oauth/authorize");
        authUrl.searchParams.set("client_id", clientId!);
        authUrl.searchParams.set("redirect_uri", redirectUri);
        authUrl.searchParams.set("state", state);
        authUrl.searchParams.set("scope", "user");

        return NextResponse.redirect(authUrl.toString());
    }

    // 콜백 처리: 토큰 교환
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const tokenResponse = await fetch("https://api.vercel.com/v2/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.AUTH_VERCEL_ID!,
                client_secret: process.env.AUTH_VERCEL_SECRET!,
                code: code,
                redirect_uri: `${request.nextUrl.origin}/api/connect/vercel`,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            throw new Error("Failed to get access token");
        }

        // 토큰 암호화하여 저장
        if (supabase) {
            const encryptedToken = encrypt(tokenData.access_token);
            await supabase
                .from("profiles")
                .upsert({
                    email: session.user.email,
                    vercel_access_token: encryptedToken,
                    updated_at: new Date().toISOString(),
                })
                .eq("email", session.user.email);
        }

        return NextResponse.redirect(new URL("/settings?success=vercel", request.url));
    } catch (error) {
        console.error("Error connecting Vercel:", error);
        return NextResponse.redirect(new URL("/settings?error=connection_failed", request.url));
    }
}
