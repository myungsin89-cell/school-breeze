"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Rocket, ExternalLink, Github, Cloud, Sparkles } from 'lucide-react';
import { ApiKeyModal } from '../deploy/ApiKeyModal';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * 템플릿 카드 컴포넌트
 * 
 * 각 템플릿을 카드 형태로 표시하고, 
 * '내 것으로 만들기' 버튼을 통해 원클릭 배포를 시작합니다.
 */

interface TemplateCardProps {
    id?: string; // 템플릿 ID (상세 페이지 이동용)
    title: string;
    description: string;
    imageUrl?: string;
    tags?: string[];
    githubRepo?: string; // 예: "owner/repo-name"
    requiredApis?: string[]; // 필요한 API 목록
    likesCount?: number; // 좋아요 개수
    onSelect?: () => void;
}

export function TemplateCard({
    id,
    title,
    description,
    imageUrl,
    tags,
    githubRepo,
    requiredApis = [],
    likesCount = 0,
    onSelect
}: TemplateCardProps) {
    const { data: session } = useSession();
    const router = useRouter();

    // 모달 표시 여부
    const [showModal, setShowModal] = useState(false);
    // 배포 진행 중 여부
    const [isDeploying, setIsDeploying] = useState(false);
    // 배포 결과 메시지
    const [deployResult, setDeployResult] = useState<{ success: boolean; message: string; urls?: any } | null>(null);

    /**
     * '내 것으로 만들기' 버튼 클릭 핸들러
     */
    const handleDeploy = (e: React.MouseEvent) => {
        e.preventDefault(); // 링크 이동 방지
        e.stopPropagation();

        // 로그인 확인
        if (!session) {
            alert('GitHub 계정으로 로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        // GitHub 저장소 정보가 있는지 확인
        if (!githubRepo) {
            alert('이 템플릿은 배포할 수 없습니다.');
            return;
        }

        // API 키 입력 모달 표시
        setShowModal(true);
    };

    /**
     * API 키 제출 및 배포 시작
     */
    const handleApiKeysSubmit = async (apiKeys: Record<string, string>) => {
        setIsDeploying(true);

        try {
            // 배포 API 호출
            const response = await fetch('/api/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    templateRepo: githubRepo, // 예: "octocat/Hello-World"
                    repoName: `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`, // 고유한 저장소 이름
                    templateId: id, // 템플릿 ID (DB 저장용)
                    ...apiKeys, // geminiApiKey, supabaseUrl, supabaseKey, vercelToken 등
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // 성공
                setDeployResult({
                    success: true,
                    message: data.message,
                    urls: {
                        repo: data.repoUrl,
                        deployment: data.deploymentUrl
                    }
                });
            } else {
                // 실패
                setDeployResult({
                    success: false,
                    message: data.error || '배포에 실패했습니다.'
                });
            }
        } catch (error) {
            console.error('배포 오류:', error);
            setDeployResult({
                success: false,
                message: '배포 중 오류가 발생했습니다.'
            });
        } finally {
            setIsDeploying(false);
            setShowModal(false);
        }
    };

    const CardContent = (
        <div className={cn("group border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white h-full flex flex-col")}>
            {/* 템플릿 이미지 */}
            <div className="h-36 bg-gray-100 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

            </div>

            {/* 카드 내용 */}
            {/* 카드 내용 */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap gap-1">
                        {tags?.map(tag => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* 좋아요 개수 */}
                    {likesCount !== undefined && (
                        <div className="flex items-center gap-1 text-gray-400">
                            <svg className="w-3.5 h-3.5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium">{likesCount}</span>
                        </div>
                    )}
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{title}</h3>
                <p className="text-gray-500 text-xs line-clamp-2 mb-3 flex-1 leading-relaxed">{description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto gap-2">
                    {/* 필요한 API 표시 */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {requiredApis.length > 0 ? (
                            requiredApis.map(api => {
                                const apiConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
                                    github: {
                                        icon: <Github className="w-3 h-3" />,
                                        label: 'GitHub',
                                        color: 'bg-gray-100 text-gray-700'
                                    },
                                    vercel: {
                                        icon: <Cloud className="w-3 h-3" />,
                                        label: 'Vercel',
                                        color: 'bg-black text-white'
                                    },
                                    gemini: {
                                        icon: <Sparkles className="w-3 h-3" />,
                                        label: 'Gemini',
                                        color: 'bg-blue-50 text-blue-600 border border-blue-100'
                                    }
                                };
                                const config = apiConfig[api] || {
                                    icon: null,
                                    label: api,
                                    color: 'bg-gray-50 text-gray-600'
                                };
                                return (
                                    <div
                                        key={api}
                                        className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 shrink-0 ${config.color}`}
                                    >
                                        {config.icon}
                                        <span className="hidden sm:inline">{config.label}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <span className="text-[10px] text-gray-400">API 불필요</span>
                        )}
                    </div>

                    {/* 배포 버튼 (항상 표시) */}
                    <button
                        onClick={handleDeploy}
                        disabled={isDeploying}
                        className="shrink-0 bg-primary text-white p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-primary-600 transition-colors shadow-sm"
                    >
                        <Rocket className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isDeploying ? '도구 생성 중...' : '도구 만들기'}</span>
                    </button>
                </div>

                {/* 배포 결과 메시지 */}
                {deployResult && (
                    <div className={`mt-3 p-2 rounded text-xs ${deployResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {deployResult.message}
                        {deployResult.success && deployResult.urls && (
                            <div className="mt-1 flex gap-2">
                                <a href={deployResult.urls.deployment} target="_blank" rel="noopener noreferrer" className="underline font-medium">사이트 이동</a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {id ? (
                <Link href={`/templates/${id}`} className="block h-full">
                    {CardContent}
                </Link>
            ) : (
                CardContent
            )}

            {/* API 키 입력 모달 */}
            <ApiKeyModal
                requiredApis={requiredApis}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleApiKeysSubmit}
                isLoading={isDeploying}
            />
        </>
    );
}
