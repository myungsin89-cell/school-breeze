'use client'

import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * API 키 입력 모달 컴포넌트
 * 
 * 템플릿 배포 시 필요한 API 키를 사용자로부터 입력받습니다.
 * Gemini AI, Supabase 등 템플릿에 필요한 API를 동적으로 표시합니다.
 */

interface ApiKeyModalProps {
    /** 필요한 API 목록 (예: ['gemini', 'supabase']) */
    requiredApis: string[];
    /** 모달이 열려있는지 여부 */
    isOpen: boolean;
    /** 모달 닫기 함수 */
    onClose: () => void;
    /** API 키 제출 함수 */
    onSubmit: (apiKeys: Record<string, string>) => void;
    /** 제출 중 로딩 상태 */
    isLoading?: boolean;
}

// API 이름과 설명 매핑
const API_INFO: Record<string, { name: string; description: string; placeholder: string; link: string }> = {
    gemini: {
        name: 'Gemini AI API Key',
        description: 'Google Gemini AI를 사용하기 위한 API 키입니다.',
        placeholder: 'AIza...',
        link: 'https://aistudio.google.com/app/apikey'
    },
    supabase: {
        name: 'Supabase',
        description: '데이터베이스 연결을 위한 Supabase 정보입니다.',
        placeholder: 'URL과 Anon Key를 입력하세요',
        link: 'https://supabase.com/dashboard'
    },
    vercel: {
        name: 'Vercel Token',
        description: '자동 배포를 위한 Vercel 토큰입니다.',
        placeholder: 'vercel_...',
        link: 'https://vercel.com/account/tokens'
    }
};

export function ApiKeyModal({ requiredApis, isOpen, onClose, onSubmit, isLoading = false }: ApiKeyModalProps) {
    // 각 API의 입력 값을 관리하는 state
    const [apiKeys, setApiKeys] = useState<Record<string, any>>({
        gemini: '',
        supabase: { url: '', anonKey: '' },
        vercel: ''
    });

    // 모달이 닫혀있으면 렌더링하지 않음
    if (!isOpen) return null;

    // 입력 값 변경 핸들러
    const handleInputChange = (api: string, value: string | object) => {
        setApiKeys(prev => ({
            ...prev,
            [api]: value
        }));
    };

    // 제출 핸들러
    const handleSubmit = () => {
        // Supabase의 경우 URL과 Key를 하나의 객체로 전달
        const formattedKeys: Record<string, string> = {};

        if (requiredApis.includes('gemini') && apiKeys.gemini) {
            formattedKeys.geminiApiKey = apiKeys.gemini;
        }

        if (requiredApis.includes('supabase')) {
            formattedKeys.supabaseUrl = apiKeys.supabase.url;
            formattedKeys.supabaseKey = apiKeys.supabase.anonKey;
        }

        if (requiredApis.includes('vercel') && apiKeys.vercel) {
            formattedKeys.vercelToken = apiKeys.vercel;
        }

        onSubmit(formattedKeys);
    };

    return (
        // 배경 오버레이
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {/* 모달 박스 */}
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* 헤더 */}
                <div className="border-b border-gray-200 p-6 flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            🔑 API 키 설정
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            템플릿 배포를 위해 필요한 API 키를 입력해주세요
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* 본문 */}
                <div className="p-6 space-y-6">
                    {/* Gemini AI API */}
                    {requiredApis.includes('gemini') && (
                        <div className="space-y-2">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-900">
                                    {API_INFO.gemini.name}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                    {API_INFO.gemini.description}{' '}
                                    <a
                                        href={API_INFO.gemini.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        발급받기 →
                                    </a>
                                </p>
                            </label>
                            <input
                                type="password"
                                value={apiKeys.gemini}
                                onChange={(e) => handleInputChange('gemini', e.target.value)}
                                placeholder={API_INFO.gemini.placeholder}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Supabase */}
                    {requiredApis.includes('supabase') && (
                        <div className="space-y-2">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-900">
                                    {API_INFO.supabase.name}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                    {API_INFO.supabase.description}{' '}
                                    <a
                                        href={API_INFO.supabase.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        대시보드 →
                                    </a>
                                </p>
                            </label>
                            <input
                                type="text"
                                value={apiKeys.supabase.url}
                                onChange={(e) => handleInputChange('supabase', { ...apiKeys.supabase, url: e.target.value })}
                                placeholder="Supabase Project URL"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                            />
                            <input
                                type="password"
                                value={apiKeys.supabase.anonKey}
                                onChange={(e) => handleInputChange('supabase', { ...apiKeys.supabase, anonKey: e.target.value })}
                                placeholder="Supabase Anon Key"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Vercel Token */}
                    {requiredApis.includes('vercel') && (
                        <div className="space-y-2">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-900">
                                    {API_INFO.vercel.name}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                    {API_INFO.vercel.description}{' '}
                                    <a
                                        href={API_INFO.vercel.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        발급받기 →
                                    </a>
                                </p>
                            </label>
                            <input
                                type="password"
                                value={apiKeys.vercel}
                                onChange={(e) => handleInputChange('vercel', e.target.value)}
                                placeholder={API_INFO.vercel.placeholder}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* 안내 메시지 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>💡 보안 안내:</strong><br />
                            입력하신 API 키는 저장되지 않으며, 배포 시 환경 변수로만 사용됩니다.
                        </p>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                배포 중...
                            </>
                        ) : (
                            '배포 시작하기'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
