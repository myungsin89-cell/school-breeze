'use server'

import { supabase } from "@/lib/supabase"
import { hash } from "bcryptjs"
import { redirect } from "next/navigation"

export async function register(formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const nickname = formData.get('nickname') as string

    if (!username || !password || !nickname) {
        return { error: "All fields are required" }
    }

    if (!supabase) {
        return { error: "Database connection failed" }
    }

    // Check if user exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

    if (existingUser) {
        return { error: "User already exists" }
    }

    const passwordHash = await hash(password, 10)

    const { error } = await supabase
        .from('users')
        .insert({
            username,
            nickname,
            password_hash: passwordHash
        })

    if (error) {
        return { error: error.message }
    }

    redirect('/login')
}
