"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, ExternalLink, Check, Key } from 'lucide-react';

interface VercelGuideProps {
    onConnect: (token: string) => void;
    onCancel: () => void;
}

export function VercelGuide({ onConnect, onCancel }: VercelGuideProps) {
    const [step, setStep] = useState(1);
    const [token, setToken] = useState('');

    const steps = [
        {
            title: "Vercel이 무엇인가요?",
            description: "웹사이트를 전 세계에 무료로 배포할 수 있는 클라우드 플랫폼입니다. GitHub와 연동하면 자동으로 배포되어 매우 편리해요!",
            icon: "🚀",
            action: (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg text-sm text-gray-700">
                    <p>개인 프로젝트는 완전 무료로 사용할 수 있어요!</p>
                </div>
            )
        },
        {
            title: "1. Vercel 대시보드 접속",
            description: "새 탭을 열고 Vercel에 접속해주세요. GitHub 계정으로 로그인하면 돼요!",
            icon: "1️⃣",
            action: (
                <a
                    href="https://vercel.com/account/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors shadow-md"
                >
                    Vercel Tokens 페이지 열기 <ExternalLink className="w-4 h-4" />
                </a>
            )
        },
        {
            title: "2. 토큰 생성하기",
            description: "로그인 후 'Create Token' 버튼을 클릭하세요. 토큰 이름은 'School Breeze' 같이 알아보기 쉽게 지으면 돼요.",
            icon: "2️⃣",
            action: (
                <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                    <div className="text-xs text-blue-600 mb-2">💡 팁</div>
                    <ul className="space-y-1 text-xs text-blue-800">
                        <li>• Scope는 'Full Account'로 선택하세요</li>
                        <li>• 만료 기한은 원하는 대로 설정하면 됩니다</li>
                    </ul>
                </div>
            )
        },
        {
            title: "3. 토큰 복사하기",
            description: "생성된 토큰(긴 문자열)을 복사하세요. 한 번만 보여지니 꼭 복사해두세요!",
            icon: "3️⃣",
            action: (
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="text-xs text-gray-400 mb-1">예시 Token</div>
                    <div className="bg-gray-100 border border-gray-200 rounded px-3 py-2 text-xs font-mono">
                        vercel_...XyZ (실제 토큰으로 바뀝니다)
                    </div>
                </div>
            )
        },
        {
            title: "4. 토큰 입력하기",
            description: "복사한 토큰을 아래에 붙여넣고 '연결하기' 버튼을 눌러주세요!",
            icon: "🔑",
            action: (
                <div className="space-y-3">
                    <div className="relative">
                        <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="vercel_로 시작하는 토큰을 붙여넣으세요"
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => onConnect(token)}
                        disabled={!token}
                        className="w-full bg-black text-white p-3 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check className="w-4 h-4" />
                        연결하기
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col h-[450px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">🚀</span> Vercel 연결 가이드
                </h3>
                <div className="text-sm text-gray-500 font-medium">
                    {step} / {steps.length}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
                        style={{ width: `${(step / steps.length) * 100}%` }}
                    />
                </div>

                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-3xl mb-6 animate-bounce-slow">
                    {steps[step - 1].icon}
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-3 transition-all">
                    {steps[step - 1].title}
                </h4>

                <p className="text-gray-600 mb-8 max-w-sm leading-relaxed">
                    {steps[step - 1].description}
                </p>

                <div className="w-full max-w-xs animate-fade-in-up">
                    {steps[step - 1].action}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                {step > 1 ? (
                    <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" /> 이전
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 px-4 py-2"
                    >
                        취소
                    </button>
                )}

                {step < steps.length && (
                    <button
                        type="button"
                        onClick={() => setStep(step + 1)}
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1 shadow-sm"
                    >
                        다음 <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
