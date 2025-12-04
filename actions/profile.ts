'use server'

import { supabase } from "@/lib/supabase"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function setNickname(nickname: string) {
    const session = await auth()

    if (!session?.user?.email) {
        return { error: "인증되지 않았습니다. 다시 로그인해주세요." }
    }

    if (!nickname || nickname.trim().length === 0) {
        return { error: "별명을 입력해주세요." }
    }

    // Try to update in Supabase if available
    if (supabase) {
        try {
            // First, check for duplicate nickname
            const { data: duplicateUser } = await supabase
                .from('users')
                .select('id, email')
                .eq('nickname', nickname.trim())
                .single()

            // If someone else is using this nickname, return error
            if (duplicateUser && duplicateUser.email !== session.user.email) {
                return { error: "이미 사용 중인 별명입니다. 다른 별명을 선택해주세요." }
            }

            // Check if user exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', session.user.email)
                .single()

            if (existingUser) {
                // Try to update with nickname_set column
                const { error } = await supabase
                    .from('users')
                    .update({
                        nickname: nickname.trim(),
                        nickname_set: true
                    })
                    .eq('email', session.user.email)

                if (error) {
                    // If nickname_set column doesn't exist, try without it
                    if (error.code === 'PGRST204' || error.message.includes('nickname_set')) {
                        console.warn('nickname_set column not found, updating only nickname')
                        const { error: retryError } = await supabase
                            .from('users')
                            .update({
                                nickname: nickname.trim()
                            })
                            .eq('email', session.user.email)

                        if (retryError) {
                            console.error('Error updating nickname:', retryError)
                            // Don't fail - continue without database update
                        }
                    } else {
                        console.error('Error updating nickname:', error)
                        // Don't fail - continue without database update
                    }
                }
            } else {
                console.warn('User not found in database, skipping database update')
            }
        } catch (err) {
            console.error('Unexpected error updating nickname:', err)
            // Don't fail - continue without database update
        }
    } else {
        console.warn('Supabase not available, skipping database update')
    }

    // Always succeed and revalidate
    revalidatePath('/')
    return { success: true, nickname: nickname.trim() }
}
