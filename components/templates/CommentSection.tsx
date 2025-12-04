"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle, Trash2, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Comment {
    id: string;
    user_id: string;
    user_name: string;
    content: string;
    created_at: string;
}

interface CommentSectionProps {
    templateId: string;
}

export function CommentSection({ templateId }: CommentSectionProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [templateId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/templates/${templateId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
                router.push('/login');
            }
            return;
        }

        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post(`/api/templates/${templateId}/comments`, {
                content: newComment
            });
            setComments([response.data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to post comment:', error);
            alert('댓글 작성에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;

        try {
            await axios.delete(`/api/templates/${templateId}/comments/${commentId}`);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('댓글 삭제에 실패했습니다.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-900">
                    댓글 {comments.length}개
                </h3>
            </div>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleSubmitComment} className="mb-6">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={session ? "댓글을 작성해주세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
                    disabled={!session || isSubmitting}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none disabled:bg-gray-50"
                />
                <div className="mt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={!session || isSubmitting || !newComment.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                작성 중...
                            </>
                        ) : (
                            '댓글 작성'
                        )}
                    </button>
                </div>
            </form>

            {/* 댓글 목록 */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    첫 댓글을 작성해보세요!
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <span className="font-medium text-gray-900">{comment.user_name}</span>
                                    <span className="text-sm text-gray-500 ml-2">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {session?.user?.id === comment.user_id && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
