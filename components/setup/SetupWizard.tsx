'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Github, Check, ChevronRight, ArrowRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { GeminiGuide } from '@/components/deploy/GeminiGuide'

interface SetupWizardProps {
    hasGithub: boolean
    hasVercel: boolean
}

export default function SetupWizard({ hasGithub: initialGithub, hasVercel: initialVercel }: SetupWizardProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [profile, setProfile] = useState({
        hasGithub: initialGithub,
        hasVercel: initialVercel,
        hasGemini: false,
    })
    const [showGeminiForm, setShowGeminiForm] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchProfile()

        // URL 파라미터에서 성공 메시지 확인
        const params = new URLSearchParams(window.location.search)
        const success = params.get('success')

        if (success === 'vercel') {
            setCurrentStep(3)
            window.history.replaceState({}, '', '/setup')
        }
    }, [])

    useEffect(() => {
        // 현재 단계 자동 설정
        if (profile.hasGemini) {
            setCurrentStep(4)
        } else if (profile.hasVercel) {
            setCurrentStep(3)
        } else if (profile.hasGithub) {
            setCurrentStep(2)
        }
    }, [profile])

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/api/user/profile')
            setProfile({
                hasGithub: initialGithub || response.data.hasGithubToken,
                hasVercel: response.data.hasVercelToken,
                hasGemini: response.data.hasGeminiKey,
            })
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        }
    }

    const handleGeminiConnect = async (apiKey: string) => {
        setIsSaving(true)
        try {
            await axios.post('/api/user/profile', { geminiApiKey: apiKey })
            await fetchProfile()
            setShowGeminiForm(false)
            setCurrentStep(4)
        } catch (error) {
            console.error('Failed to save Gemini key:', error)
            alert('Gemini API 키 저장에 실패했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSkip = () => {
        if (currentStep === 3) {
            setCurrentStep(4)
        } else {
            router.push('/')
        }
    }

    const handleFinish = () => {
        router.push('/')
        router.refresh()
    }

    return (
        <div className="max-w-3xl w-full">
            {/* 헤더 */}
            <div className="text-center mb-8">
                <div className="text-5xl mb-4">🏫</div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    School Breeze 시작하기
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    템플릿을 자동으로 배포하려면 먼저 서비스를 연동해주세요
                </p>
            </div>

            {/* 진행 상태 */}
            <div className="flex items-center justify-center mb-12">
                <StepIndicator step={1} currentStep={currentStep} label="GitHub" />
                <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 mx-2">
                    <div className={cn("h-full bg-indigo-600 transition-all", currentStep >= 2 ? "w-full" : "w-0")} />
                </div>
                <StepIndicator step={2} currentStep={currentStep} label="Vercel" />
                <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 mx-2">
                    <div className={cn("h-full bg-indigo-600 transition-all", currentStep >= 3 ? "w-full" : "w-0")} />
                </div>
                <StepIndicator step={3} currentStep={currentStep} label="Gemini" />
            </div>

            {/* 단계별 카드 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Step 1: GitHub */}
                {currentStep === 1 && (
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Github className="w-8 h-8 text-gray-900 dark:text-white" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">GitHub 연동</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">소스코드를 저장할 저장소</p>
                            </div>
                        </div>

                        {profile.hasGithub ? (
                            <>
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
                                    <div className="flex items-center gap-3 text-green-700 dark:text-green-400 mb-2">
                                        <Check className="w-6 h-6" />
                                        <span className="font-bold text-lg">이미 연결되었습니다!</span>
                                    </div>
                                    <p className="text-sm text-green-600 dark:text-green-500">
                                        GitHub에 로그인되어 있습니다.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    다음 단계 <ArrowRight className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">GitHub이란?</h3>
                                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                            <span>코드를 저장하고 관리하는 플랫폼</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                            <span>템플릿을 복사하여 내 저장소에 저장</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                            <span>무료로 사용 가능</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                        <strong>안내:</strong> 이미 구글 로그인을 하셨다면 GitHub 계정도 별도로 연동해야 합니다.
                                    </p>
                                </div>

                                <button
                                    onClick={() => window.location.href = '/api/auth/signin?callbackUrl=/setup'}
                                    className="w-full py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Github className="w-5 h-5" />
                                    GitHub으로 연결하기
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Step 2: Vercel */}
                {currentStep === 2 && (
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-full text-lg font-bold">V</div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vercel 연동</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">자동 배포를 위한 플랫폼</p>
                            </div>
                        </div>

                        {profile.hasVercel ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
                                <div className="flex items-center gap-3 text-green-700 dark:text-green-400 mb-2">
                                    <Check className="w-6 h-6" />
                                    <span className="font-bold text-lg">연결 완료!</span>
                                </div>
                                <p className="text-sm text-green-600 dark:text-green-500">
                                    Vercel이 성공적으로 연결되었습니다.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Vercel이란?</h3>
                                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                            <span>웹사이트를 자동으로 배포하고 호스팅하는 플랫폼</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                            <span>GitHub 저장소와 연동하여 코드 변경 시 자동 배포</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                            <span>무료 플랜으로도 충분히 사용 가능</span>
                                        </li>
                                    </ul>
                                </div>

                                <button
                                    onClick={() => window.location.href = '/api/connect/vercel'}
                                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors mb-3"
                                >
                                    Vercel로 연결하기
                                </button>
                            </>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                이전
                            </button>
                            {profile.hasVercel && (
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    다음 단계 <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                            {!profile.hasVercel && (
                                <button
                                    onClick={handleSkip}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    나중에 하기
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Gemini */}
                {currentStep === 3 && (
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center rounded-full text-lg font-bold">G</div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gemini AI 연동</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">AI 기능 사용을 위한 API 키 (선택사항)</p>
                            </div>
                        </div>

                        {profile.hasGemini ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
                                <div className="flex items-center gap-3 text-green-700 dark:text-green-400 mb-2">
                                    <Check className="w-6 h-6" />
                                    <span className="font-bold text-lg">연결 완료!</span>
                                </div>
                                <p className="text-sm text-green-600 dark:text-green-500">
                                    Gemini API 키가 저장되었습니다.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Gemini AI란?</h3>
                                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                            <span>Google의 최신 AI 모델</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                            <span>일부 템플릿에서 AI 기능을 사용하기 위해 필요</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                            <span>선택사항으로, 나중에 설정할 수 있습니다</span>
                                        </li>
                                    </ul>
                                </div>

                                {showGeminiForm ? (
                                    <div className="mb-4">
                                        <GeminiGuide
                                            onConnect={handleGeminiConnect}
                                            onCancel={() => setShowGeminiForm(false)}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowGeminiForm(true)}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors mb-3"
                                    >
                                        Gemini API 키 입력하기
                                    </button>
                                )}
                            </>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                disabled={isSaving}
                            >
                                이전
                            </button>
                            <button
                                onClick={handleSkip}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                                disabled={isSaving}
                            >
                                {profile.hasGemini ? '완료' : '나중에 하기'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: 완료 */}
                {currentStep === 4 && (
                    <div className="p-8 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            모든 설정이 완료되었습니다!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            이제 School Breeze의 모든 기능을 사용할 수 있습니다.
                        </p>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 mb-8">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">다음 단계</h3>
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 text-left">
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                    <span>템플릿 갤러리에서 마음에 드는 템플릿 찾기</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                    <span>원클릭으로 GitHub에 복사하고 Vercel에 배포하기</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                                    <span>배포된 웹사이트를 자유롭게 커스터마이징하기</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                            템플릿 둘러보기 <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* 푸터 안내 */}
            <div className="text-center mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    설정은 언제든지{' '}
                    <a href="/settings" className="text-indigo-600 hover:underline">
                        설정 페이지
                    </a>
                    에서 변경할 수 있습니다.
                </p>
            </div>
        </div>
    )
}

// 단계 인디케이터 컴포넌트
function StepIndicator({ step, currentStep, label }: { step: number; currentStep: number; label: string }) {
    const isCompleted = currentStep > step
    const isCurrent = currentStep === step

    return (
        <div className="flex flex-col items-center">
            <div
                className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all',
                    isCompleted && 'bg-indigo-600 text-white',
                    isCurrent && 'bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-900',
                    !isCompleted && !isCurrent && 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}
            >
                {isCompleted ? <Check className="w-6 h-6" /> : step}
            </div>
            <span className={cn('text-xs mt-2 font-medium', isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400')}>
                {label}
            </span>
        </div>
    )
}
