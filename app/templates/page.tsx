"use client";

import React, { useState, useEffect } from 'react';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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
    likes_count: number;
    required_apis: string[];
}

export default function TemplatesPage() {
    const { data: session } = useSession();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

    const categories = ['전체', '업무', '수업자료', '학급운영', '기타'];

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '전체' || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // 정렬 적용
    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        if (sortBy === 'popular') {
            // 인기순: 좋아요 많은 순
            if (b.downloads !== a.downloads) {
                return b.downloads - a.downloads;
            }
            // 좋아요가 같으면 최신순
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else {
            // 최신순
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
    });

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">자료 나눔터</h1>
                            <p className="text-gray-600 mt-2">
                                선생님들이 공유한 학급 앱을 클릭 한 번으로 내 것으로 만들어보세요.
                            </p>
                        </div>
                        {session && (
                            <Link
                                href="/templates/upload"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                자료 등록하기
                            </Link>
                        )}
                    </div>

                    {/* Search & Filter */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="자료 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSortBy('latest')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${sortBy === 'latest'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                최신순
                            </button>
                            <button
                                onClick={() => setSortBy('popular')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${sortBy === 'popular'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                인기순
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : sortedTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedTemplates.map(template => (
                                <TemplateCard
                                    key={template.id}
                                    id={template.id}
                                    title={template.title}
                                    description={template.description}
                                    imageUrl={template.thumbnail_url}
                                    tags={[template.category]}
                                    githubRepo={template.repo_url}
                                    requiredApis={template.required_apis || []}
                                    likesCount={template.likes_count || 0}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                            <p className="text-gray-500">등록된 자료가 없습니다.</p>
                            {session && (
                                <Link href="/templates/upload" className="text-primary hover:underline mt-2 inline-block">
                                    첫 번째 자료를 등록해보세요!
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
