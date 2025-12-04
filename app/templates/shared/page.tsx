"use client";

import React, { useState, useEffect } from 'react';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Share2 } from 'lucide-react';
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
    required_apis?: string[];
    likes_count?: number;
}

export default function SharedTemplatesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (session?.user?.id) {
            fetchMyTemplates();
        }
    }, [session, status]);

    const fetchMyTemplates = async () => {
        if (!supabase || !session?.user?.id) return;
        try {
            const { data, error } = await supabase
                .from('templates')
                .select('*')
                .eq('author_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Error fetching my templates:', error);
        } finally {
            setIsLoading(false);
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
                            <h1 className="text-3xl font-bold text-gray-900">공유한 자료 관리</h1>
                            <p className="text-gray-600 mt-2">
                                다른 선생님들을 위해 공유한 자료들을 확인하고 관리할 수 있습니다.
                            </p>
                        </div>
                        <Link
                            href="/templates/upload"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            새 자료 공유하기
                        </Link>
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : templates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map(template => (
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
                            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Share2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">공유한 자료가 없습니다</h3>
                            <p className="text-gray-500 mb-6">
                                선생님만의 노하우가 담긴 자료를 공유해보세요!
                            </p>
                            <Link href="/templates/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
                                <Plus className="w-5 h-5" />
                                첫 자료 공유하기
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
