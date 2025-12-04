"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface LikeButtonProps {
    templateId: string;
    initialLikesCount?: number;
    initialIsLiked?: boolean;
}

export function LikeButton({ templateId, initialLikesCount = 0, initialIsLiked = false }: LikeButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = async () => {
        if (!session) {
            if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
                router.push('/login');
            }
            return;
        }

        setIsLoading(true);
        try {
            if (isLiked) {
                // 좋아요 취소
                const response = await axios.delete(`/api/templates/${templateId}/like`);
                setLikesCount(response.data.likes_count);
                setIsLiked(false);
            } else {
                // 좋아요 추가
                const response = await axios.post(`/api/templates/${templateId}/like`);
                setLikesCount(response.data.likes_count);
                setIsLiked(true);
            }
        } catch (error: any) {
            console.error('Like toggle error:', error);
            if (error.response?.status === 401) {
                alert('로그인이 필요합니다.');
                router.push('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isLiked
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50`}
        >
            <Heart
                className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
            />
            <span className="font-medium">{likesCount}</span>
        </button>
    );
}
