"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Github, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function UploadTemplatePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: '' });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        repo_url: '',
        demo_url: '',
        thumbnail_url: '',
        category: '업무',
        template_type: 'deployed' as 'github' | 'deployed' | 'gemini' | 'other',
        required_apis: [] as string[]
    });

    const categories = ['업무', '수업자료', '학급운영', '기타'];
    const templateTypes = [
        { value: 'deployed', label: '배포된 웹사이트', desc: '이미 배포된 웹사이트 링크를 공유합니다' },
        { value: 'github', label: 'GitHub 저장소', desc: '코드를 GitHub에 올려 공유합니다 (배포 필요)' },
        { value: 'gemini', label: 'Gemini Canvas', desc: 'Gemini Canvas로 만든 프로젝트를 공유합니다' },
        { value: 'other', label: '기타', desc: '기타 방식으로 공유합니다' }
    ];
    const apiOptions = [
        { value: 'github', label: 'GitHub', desc: 'GitHub 계정 연동 필요' },
        { value: 'vercel', label: 'Vercel', desc: 'Vercel 배포 필요' },
        { value: 'gemini', label: 'Gemini API', desc: 'Gemini API 키 필요' }
    ];

    const toggleApi = (api: string) => {
        setFormData(prev => ({
            ...prev,
            required_apis: prev.required_apis.includes(api)
                ? prev.required_apis.filter(a => a !== api)
                : [...prev.required_apis, api]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage({ type: null, text: '' });

        try {
            const response = await axios.post('/api/templates', formData);
            setStatusMessage({ type: 'success', text: '자료 등록이 완료되었습니다! 목록으로 이동합니다...' });

            setTimeout(() => {
                router.push('/templates');
                router.refresh();
            }, 1000);
        } catch (error: any) {
            console.error('Failed to upload template:', error);
            const errorMessage = error.response?.data?.error || error.message || '자료 등록에 실패했습니다.';
            setStatusMessage({ type: 'error', text: `오류 발생: ${errorMessage}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/templates" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    목록으로 돌아가기
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <h1 className="text-2xl font-bold text-gray-900">자료 등록하기</h1>
                        <p className="text-gray-600 mt-2">
                            멋진 자료를 공유하고 다른 사용자들이 사용할 수 있게 해주세요.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {statusMessage.text && (
                            <div className={`p-4 rounded-lg ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {statusMessage.text}
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                자료 이름 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="예: 학급 시간표 관리자"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                설명 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                placeholder="자료에 대한 설명을 입력해주세요."
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                카테고리 <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Template Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                공유 방식 <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {templateTypes.map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, template_type: type.value as any }))}
                                        className={`p-3 rounded-lg border-2 transition-all text-left ${formData.template_type === type.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="font-medium text-gray-900">{type.label}</div>
                                        <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Required APIs */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                필요한 API (선택사항)
                            </label>
                            <div className="space-y-2">
                                {apiOptions.map(api => (
                                    <label key={api.value} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.required_apis.includes(api.value)}
                                            onChange={() => toggleApi(api.value)}
                                            className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{api.label}</div>
                                            <div className="text-sm text-gray-500">{api.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                사용자가 이 자료를 사용하기 위해 필요한 API를 체크하세요.
                            </p>
                        </div>

                        {/* GitHub Repo URL (conditional) */}
                        {formData.template_type === 'github' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    GitHub 저장소 URL <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="url"
                                        required={formData.template_type === 'github'}
                                        value={formData.repo_url}
                                        onChange={e => setFormData(prev => ({ ...prev, repo_url: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="https://github.com/username/repo"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    * 공개 저장소(Public Repository)여야 합니다.
                                </p>
                            </div>
                        )}

                        {/* Demo URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {formData.template_type === 'deployed' ? '웹사이트 URL' : '데모 사이트 URL'} {formData.template_type === 'deployed' && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="url"
                                    required={formData.template_type === 'deployed'}
                                    value={formData.demo_url}
                                    onChange={e => setFormData(prev => ({ ...prev, demo_url: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="https://my-template-demo.vercel.app"
                                />
                            </div>
                        </div>

                        {/* Thumbnail URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                썸네일 이미지 URL (선택)
                            </label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="url"
                                    value={formData.thumbnail_url}
                                    onChange={e => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="https://example.com/image.png"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        등록 중...
                                    </>
                                ) : (
                                    '자료 등록하기'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
