import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { AuthGuard } from "@/components/auth/AuthGuard";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "School Breeze",
  description: "Teacher's Assistant Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let hasTokens = false;
  const provider = session?.user?.provider || null;

  if (session?.user?.email && supabase) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('github_access_token, vercel_access_token')
      .eq('email', session.user.email)
      .single();

    if (profile) {
      // For OAuth users (GitHub/Google), GitHub token is already connected via OAuth
      // So we only check for Vercel token
      if (provider === 'github' || provider === 'google') {
        hasTokens = true; // OAuth users don't need manual GitHub setup
      } else {
        hasTokens = !!profile.github_access_token && !!profile.vercel_access_token;
      }
    }
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuthGuard isLoggedIn={!!session} hasTokens={hasTokens} provider={provider} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
