'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { register } from "@/actions/auth"

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.")
            setLoading(false)
            return
        }

        try {
            const result = await register(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                // Redirect handled in server action, but just in case
                router.push('/login')
            }
        } catch (err) {
            setError("회원가입 중 오류가 발생했습니다.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        회원가입
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        새로운 계정을 생성하세요
                    </p>
                </div>

                {/* 사전 안내 가이드 */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                        <span className="mr-2">🔑</span> 잠깐! 시작하기 전에 준비해주세요
                    </h3>
                    <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                        <div className="flex items-start">
                            <span className="mr-2 mt-0.5">1️⃣</span>
                            <div>
                                <span className="font-semibold">나만의 코드 서랍장 (GitHub)</span>
                                <a href="https://github.com/join" target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-200">
                                    가입하기 &rarr;
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <span className="mr-2 mt-0.5">2️⃣</span>
                            <div>
                                <span className="font-semibold">자동 배포 공장 (Vercel)</span>
                                <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-200">
                                    가입하기 &rarr;
                                </a>
                            </div>
                        </div>
                        <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded text-xs border border-blue-100 dark:border-blue-800">
                            💡 <strong>꿀팁:</strong> 두 계정 모두 <strong>Google로 가입</strong>하시면 서비스 연결이 가장 빠르고 간편합니다!
                        </div>
                    </div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">아이디</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="아이디"
                            />
                        </div>
                        <div>
                            <label htmlFor="nickname" className="sr-only">별명 (활동명)</label>
                            <input
                                id="nickname"
                                name="nickname"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="별명 (활동명)"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">비밀번호</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="비밀번호"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">비밀번호 확인</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="비밀번호 확인"
                            />
                        </div>
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
                            {loading ? '가입 중...' : '가입하기'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        이미 계정이 있으신가요?{' '}
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            로그인
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
