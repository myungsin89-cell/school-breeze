"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, ExternalLink, Check, Key } from 'lucide-react';

interface GeminiGuideProps {
    onConnect: (apiKey: string) => void;
    onCancel: () => void;
}

export function GeminiGuide({ onConnect, onCancel }: GeminiGuideProps) {
    const [step, setStep] = useState(1);
    const [apiKey, setApiKey] = useState('');

    const steps = [
        {
            title: "Gemini AI가 무엇인가요?",
            description: "Google의 최신 인공지능 모델입니다. 챗봇, 글쓰기 도우미, 퀴즈 자동 생성 등 다양한 AI 기능을 템플릿에 추가할 수 있어요!",
            icon: "🤖",
            action: (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg text-sm text-gray-700">
                    <p>무료로 사용할 수 있으니 걱정 마세요!</p>
                </div>
            )
        },
        {
            title: "1. Google AI Studio 접속",
            description: "새 탭을 열고 Google AI Studio에 접속해주세요. Google 계정으로 로그인하면 돼요!",
            icon: "1️⃣",
            action: (
                <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md"
                >
                    Google AI Studio 열기 <ExternalLink className="w-4 h-4" />
                </a>
            )
        },
        {
            title: "2. API Key 생성하기",
            description: "로그인 후 'Create API key' 버튼을 클릭하세요. 프로젝트를 선택하라고 나오면 기본 프로젝트를 선택하면 돼요.",
            icon: "2️⃣",
            action: (
                <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                    <div className="text-xs text-blue-600 mb-2">💡 팁</div>
                    <ul className="space-y-1 text-xs text-blue-800">
                        <li>• API 키는 무료로 생성됩니다</li>
                        <li>• 하루 사용량 제한이 있지만 충분해요</li>
                    </ul>
                </div>
            )
        },
        {
            title: "3. API Key 복사하기",
            description: "생성된 API 키(AIza로 시작하는 긴 문자열)를 복사하세요. 한 번만 보여지니 꼭 복사해두세요!",
            icon: "3️⃣",
            action: (
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="text-xs text-gray-400 mb-1">예시 API Key</div>
                    <div className="bg-gray-100 border border-gray-200 rounded px-3 py-2 text-xs font-mono">
                        AIzaSy...XyZ (실제 키로 바뀝니다)
                    </div>
                </div>
            )
        },
        {
            title: "4. API Key 입력하기",
            description: "복사한 API 키를 아래에 붙여넣고 '연결하기' 버튼을 눌러주세요!",
            icon: "🔑",
            action: (
                <div className="space-y-3">
                    <div className="relative">
                        <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy로 시작하는 키를 붙여넣으세요"
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => onConnect(apiKey)}
                        disabled={!apiKey}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">🤖</span> Gemini AI 연결 가이드
                </h3>
                <div className="text-sm text-gray-500 font-medium">
                    {step} / {steps.length}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
                        style={{ width: `${(step / steps.length) * 100}%` }}
                    />
                </div>

                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-3xl mb-6 animate-bounce-slow">
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
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-1 shadow-sm"
                    >
                        다음 <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
