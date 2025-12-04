'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setNickname } from '@/actions/profile'
import { useSession } from 'next-auth/react'

export default function SetupNicknamePage() {
    const router = useRouter()
    const { data: session, update } = useSession()
    const [nickname, setNicknameValue] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const result = await setNickname(nickname)

            if (result.error) {
                setError(result.error)
            } else {
                // Update session to reflect nickname change
                await update({
                    nickname: result.nickname,
                    nicknameSet: true
                })

                // Wait a bit for session to update
                await new Promise(resolve => setTimeout(resolve, 100))

                router.push('/setup')
                router.refresh()
            }
        } catch (err) {
            setError('별명 설정 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        환영합니다! 🎉
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        활동할 때 사용할 별명을 설정해주세요
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            별명 (활동명)
                        </label>
                        <input
                            id="nickname"
                            name="nickname"
                            type="text"
                            required
                            value={nickname}
                            onChange={(e) => setNicknameValue(e.target.value)}
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="예: 홍길동 선생님"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? '설정 중...' : '시작하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
