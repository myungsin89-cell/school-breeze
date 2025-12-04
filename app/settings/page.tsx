"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Github, Check, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { GeminiGuide } from '@/components/deploy/GeminiGuide';
import { GitHubGuide } from '@/components/deploy/GitHubGuide';
import Link from 'next/link';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState({
        hasVercelToken: false,
        hasGeminiKey: false,
        hasSupabaseUrl: false,
        hasSupabaseKey: false,
    });

    const [showForms, setShowForms] = useState({
        github: false,
        gemini: false
    });

    const [formData, setFormData] = useState({
        geminiKey: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchProfile();

        // URL 파라미터에서 성공/에러 메시지 확인
        const params = new URLSearchParams(window.location.search);
        const success = params.get('success');
        const error = params.get('error');

        if (success === 'vercel') {
            setMessage({ type: 'success', text: 'Vercel이 성공적으로 연결되었습니다!' });
            window.history.replaceState({}, '', '/settings');
        } else if (error) {
            setMessage({ type: 'error', text: 'Vercel 연결에 실패했습니다. 다시 시도해주세요.' });
            window.history.replaceState({}, '', '/settings');
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/api/user/profile');
            setProfile(response.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveKeys = async (type: 'gemini') => {
        setIsSaving(true);
        setMessage(null);

        try {
            const payload: any = {};

            if (type === 'gemini') {
                payload.geminiApiKey = formData.geminiKey;
            }

            await axios.post('/api/user/profile', payload);
            await fetchProfile();

            setShowForms(prev => ({ ...prev, [type]: false }));
            setFormData({
                geminiKey: ''
            });

            setMessage({
                type: 'success',
                text: 'API 키가 성공적으로 저장되었습니다!'
            });

            // Navbar 업데이트를 위한 이벤트 발생
            window.dispatchEvent(new Event('profileUpdated'));
        } catch (error: any) {
            console.error('Failed to save token:', error);
            const errorMessage = error.response?.data?.error || '저장에 실패했습니다.';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDisconnect = async (type: 'vercel' | 'gemini') => {
        const serviceName = type === 'vercel' ? 'Vercel' : 'Gemini AI';

        if (!confirm(`${serviceName} 연결을 해지하시겠습니까?\n저장된 ${type === 'vercel' ? '액세스 토큰' : 'API 키'}이 삭제됩니다.`)) {
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            await axios.delete(`/api/user/profile?type=${type}`);
            await fetchProfile();

            setMessage({
                type: 'success',
                text: `${serviceName} 연결이 해지되었습니다.`
            });

            // Navbar 업데이트를 위한 이벤트 발생
            window.dispatchEvent(new Event('profileUpdated'));
        } catch (error) {
            console.error('Failed to disconnect:', error);
            setMessage({ type: 'error', text: '연결 해지에 실패했습니다.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleGitHubDisconnect = async () => {
        if (!confirm('GitHub 연결을 해지하시겠습니까?\n로그아웃되며 모든 저장된 설정이 초기화됩니다.')) {
            return;
        }

        await signOut({ callbackUrl: '/' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group">
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-medium">홈으로 돌아가기</span>
                            </Link>
                            <Link href="/" className="text-xl font-bold text-primary hover:text-primary-600 transition-colors">
                                🏫 School Breeze
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">설정</h1>
                        <p className="text-gray-600 mt-2">API 키를 저장하면 템플릿 배포 시 자동으로 사용됩니다.</p>
                    </div>

                    <div className="p-8 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">내 프로필</h2>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <img
                                    src={session?.user?.image || "https://github.com/github.png"}
                                    alt="Profile"
                                    className="w-14 h-14 rounded-full border-2 border-gray-200"
                                />
                                <div>
                                    <div className="font-bold text-gray-900 text-lg">{session?.user?.name}</div>
                                    <div className="text-sm text-gray-500">{session?.user?.email}</div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">API 키 관리</h2>
                            <p className="text-sm text-gray-600 mb-6">
                                API 키를 저장하면 템플릿 배포 시 매번 입력할 필요가 없습니다.
                            </p>

                            <div className="space-y-4">
                                {/* GitHub */}
                                <div className={cn("border rounded-xl", session ? "border-green-200 bg-green-50" : "border-gray-200 bg-white")}>
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <Github className="w-7 h-7" />
                                            <div>
                                                <div className="font-bold text-gray-900">GitHub</div>
                                                <div className="text-sm text-gray-600">소스코드 저장소</div>
                                            </div>
                                        </div>
                                        {session ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                                                    <Check className="w-5 h-5" /> 연결됨
                                                </div>
                                                <button
                                                    onClick={handleGitHubDisconnect}
                                                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 border border-red-200 transition-colors"
                                                >
                                                    연결 해지
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setShowForms(prev => ({ ...prev, github: !prev.github }))} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                                                가이드 보기
                                            </button>
                                        )}
                                    </div>
                                    {showForms.github && (
                                        <div className="p-4">
                                            <GitHubGuide onComplete={() => setShowForms(prev => ({ ...prev, github: false }))} onCancel={() => setShowForms(prev => ({ ...prev, github: false }))} />
                                        </div>
                                    )}
                                </div>

                                {/* Vercel */}
                                <div className={cn("border rounded-xl", profile.hasVercelToken ? "border-green-200 bg-green-50" : "border-gray-200 bg-white")}>
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 bg-black text-white flex items-center justify-center rounded-full text-sm font-bold">V</div>
                                            <div>
                                                <div className="font-bold text-gray-900">Vercel</div>
                                                <div className="text-sm text-gray-600">자동 배포 서비스</div>
                                            </div>
                                        </div>
                                        {profile.hasVercelToken ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                                                    <Check className="w-5 h-5" /> 연결됨
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => window.location.href = '/api/connect/vercel'} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 border border-gray-300 transition-colors">
                                                        재연결
                                                    </button>
                                                    <button onClick={() => handleDisconnect('vercel')} disabled={isSaving} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors">
                                                        해지
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => window.location.href = '/api/connect/vercel'} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                                                Vercel로 연결하기
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Gemini */}
                                <div className={cn("border rounded-xl", profile.hasGeminiKey ? "border-green-200 bg-green-50" : "border-gray-200 bg-white")}>
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center rounded-full text-sm font-bold">G</div>
                                            <div>
                                                <div className="font-bold text-gray-900">Gemini AI</div>
                                                <div className="text-sm text-gray-600">Google AI 서비스</div>
                                            </div>
                                        </div>
                                        {profile.hasGeminiKey ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                                                    <Check className="w-5 h-5" /> 연결됨
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setShowForms(prev => ({ ...prev, gemini: !prev.gemini }))} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 border border-gray-300 transition-colors">
                                                        변경
                                                    </button>
                                                    <button onClick={() => handleDisconnect('gemini')} disabled={isSaving} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors">
                                                        해지
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => setShowForms(prev => ({ ...prev, gemini: !prev.gemini }))} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700">
                                                연결하기
                                            </button>
                                        )}
                                    </div>
                                    {showForms.gemini && (
                                        <div className="p-4">
                                            <GeminiGuide onConnect={(apiKey) => { setFormData(prev => ({ ...prev, geminiKey: apiKey })); handleSaveKeys('gemini'); }} onCancel={() => setShowForms(prev => ({ ...prev, gemini: false }))} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {message && (
                            <div className={cn("p-4 rounded-lg flex items-center gap-2 text-sm font-medium", message.type === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                                {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                {message.text}
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">
                                <strong>보안 안내:</strong> API 키는 암호화되어 안전하게 저장되며, 배포 시에만 사용됩니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
