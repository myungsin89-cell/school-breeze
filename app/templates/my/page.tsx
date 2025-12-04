"use client";

import React, { useState, useEffect } from 'react';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';

interface Template {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    repo_url: string;
    category: string;
    author_name: string;
    downloads: number;
    created_at: string;
}

export default function MyAppsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [deployments, setDeployments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (session?.user?.id) {
            fetchDeployments();
        }
    }, [session, status]);

    const fetchDeployments = async () => {
        try {
            const response = await fetch('/api/user/deployments');
            const data = await response.json();
            if (data.deployments) {
                setDeployments(data.deployments);
            }
        } catch (error) {
            console.error('Error fetching deployments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 이 배포 기록을 삭제하시겠습니까?\n(실제 Vercel/GitHub 프로젝트는 삭제되지 않습니다)')) {
            return;
        }

        try {
            const response = await fetch(`/api/user/deployments?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setDeployments(prev => prev.filter(d => d.id !== id));
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error deleting deployment:', error);
            alert('오류가 발생했습니다.');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">나만의 도구함</h1>
                            <p className="text-gray-600 mt-2">
                                템플릿으로 만든 나만의 도구들을 관리하세요.
                            </p>
                        </div>
                        <Link
                            href="/templates"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            새 앱 만들기
                        </Link>
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : deployments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {deployments.map(app => (
                                <div key={app.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                    {/* 썸네일 영역 */}
                                    <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 relative">
                                        {app.templates?.thumbnail_url ? (
                                            <img
                                                src={app.templates.thumbnail_url}
                                                alt={app.repo_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-blue-200">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className="px-2 py-1 bg-white/90 backdrop-blur text-xs font-medium text-green-600 rounded-full border border-green-100 shadow-sm">
                                                배포됨
                                            </span>
                                        </div>
                                    </div>

                                    {/* 컨텐츠 영역 */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-gray-900 mb-1 truncate" title={app.repo_name}>
                                            {app.repo_name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                                            {app.templates?.title ? `${app.templates.title} 기반` : '템플릿 기반'}
                                        </p>

                                        <div className="mt-auto space-y-2">
                                            <a
                                                href={app.deployment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                앱 열기
                                            </a>

                                            <div className="flex gap-2">
                                                <a
                                                    href={app.repo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                                    </svg>
                                                    코드
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(app.id)}
                                                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="목록에서 삭제"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Rocket className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">아직 배포한 앱이 없습니다</h3>
                            <p className="text-gray-500 mb-6">
                                템플릿을 사용하여 나만의 첫 번째 앱을 만들어보세요!
                            </p>
                            <Link href="/templates" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
                                <Plus className="w-5 h-5" />
                                템플릿 둘러보기
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
