"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Github, ExternalLink, Rocket, User, Calendar, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { ApiKeyModal } from '@/components/deploy/ApiKeyModal';
import { useSession } from 'next-auth/react';
import { LikeButton } from '@/components/templates/LikeButton';
import { CommentSection } from '@/components/templates/CommentSection';

interface Template {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    repo_url: string;
    demo_url: string;
    category: string;
    author_name: string;
    author_id: string;
    created_at: string;
    likes_count: number;
    template_type: string;
    required_apis: string[];
}

export default function TemplateDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [template, setTemplate] = useState<Template | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Deployment state
    const [showModal, setShowModal] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployResult, setDeployResult] = useState<{ success: boolean; message: string; urls?: any } | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchTemplate(params.id as string);
        }
    }, [params.id]);

    const fetchTemplate = async (id: string) => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('templates')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setTemplate(data);
        } catch (error) {
            console.error('Failed to fetch template:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeployClick = () => {
        if (!session) {
            if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
                router.push('/login');
            }
            return;
        }
        setShowModal(true);
    };

    const handleApiKeysSubmit = async (apiKeys: Record<string, string>) => {
        if (!template) return;

        setIsDeploying(true);
        try {
            const response = await fetch('/api/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateRepo: template.repo_url.replace('https://github.com/', ''),
                    repoName: `${template.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
                    ...apiKeys,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setDeployResult({
                    success: true,
                    message: data.message,
                    urls: { repo: data.repoUrl, deployment: data.deploymentUrl }
                });
            } else {
                setDeployResult({
                    success: false,
                    message: data.error || '배포에 실패했습니다.'
                });
            }
        } catch (error) {
            console.error('Deploy error:', error);
            setDeployResult({ success: false, message: '배포 중 오류가 발생했습니다.' });
        } finally {
            setIsDeploying(false);
            setShowModal(false);
        }
    };

    const handleDelete = async () => {
        if (!template) return;
        if (!confirm('정말로 이 자료를 삭제하시겠습니까?')) return;

        try {
            await axios.delete(`/api/templates/${template.id}`);
            alert('자료가 삭제되었습니다.');
            router.push('/templates');
            router.refresh();
        } catch (error: any) {
            console.error('Failed to delete template:', error);
            const errorMessage = error.response?.data?.error || error.message || '알 수 없는 오류';
            alert(`삭제에 실패했습니다: ${errorMessage}`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!template) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">자료를 찾을 수 없습니다.</h1>
                <Link href="/templates" className="text-primary hover:underline">
                    목록으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/templates" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    목록으로 돌아가기
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Thumbnail */}
                        {template.thumbnail_url && (
                            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50">
                                <img
                                    src={template.thumbnail_url}
                                    alt={template.title}
                                    className="w-full h-auto object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">자료 소개</h2>
                            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {template.description}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="mb-6">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium inline-block mb-3">
                                    {template.category}
                                </span>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{template.title}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <User className="w-4 h-4" />
                                    <span>{template.author_name || 'Unknown'}</span>
                                    <span className="mx-1">•</span>
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(template.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>



                            {session?.user?.id === template.author_id && (
                                <div className="flex gap-2 mb-6">
                                    <Link
                                        href={`/templates/${template.id}/edit`}
                                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        수정
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        삭제
                                    </button>
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={handleDeployClick}
                                    disabled={isDeploying}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                                >
                                    <Rocket className="w-5 h-5" />
                                    {isDeploying ? '배포 중...' : '내 것으로 만들기'}
                                </button>

                                <a
                                    href={template.repo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <Github className="w-5 h-5" />
                                    GitHub 저장소
                                </a>

                                {template.demo_url && (
                                    <a
                                        href={template.demo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        데모 보기
                                    </a>
                                )}
                            </div>

                            {/* Likes Count */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">좋아요</span>
                                    </div>
                                    <span className="text-2xl font-bold text-pink-600">{template.likes_count || 0}</span>
                                </div>
                            </div>

                            {/* Required APIs */}
                            {template.required_apis && template.required_apis.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">필요한 API</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {template.required_apis.map((api) => (
                                            <span
                                                key={api}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-200"
                                            >
                                                {api === 'github' && '🐙 GitHub'}
                                                {api === 'vercel' && '▲ Vercel'}
                                                {api === 'gemini' && '✨ Gemini API'}
                                                {!['github', 'vercel', 'gemini'].includes(api) && api}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        이 자료를 사용하기 위해 위 API 연동이 필요합니다.
                                    </p>
                                </div>
                            )}


                            {/* Deploy Result */}
                            {deployResult && (
                                <div className={`p-4 rounded-xl border ${deployResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <p className={`text-sm font-medium ${deployResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                        {deployResult.message}
                                    </p>
                                    {deployResult.success && deployResult.urls && (
                                        <div className="mt-3 space-y-2">
                                            <a
                                                href={deployResult.urls.repo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                            >
                                                새로 생성된 저장소 <ExternalLink className="w-3 h-3" />
                                            </a>
                                            <a
                                                href={deployResult.urls.deployment}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                            >
                                                배포된 사이트 <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comment Section */}
                    <div className="mt-8">
                        <CommentSection templateId={template.id} />
                    </div>
                </div>

                <ApiKeyModal
                    requiredApis={[]} // TODO: Add required_apis to DB
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleApiKeysSubmit}
                    isLoading={isDeploying}
                />

            </div>
        </div>
    );
}
