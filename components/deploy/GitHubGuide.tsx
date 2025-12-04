"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, ExternalLink, Github as GithubIcon } from 'lucide-react';

interface GitHubGuideProps {
    onComplete: () => void;
    onCancel: () => void;
}

export function GitHubGuide({ onComplete, onCancel }: GitHubGuideProps) {
    const [step, setStep] = useState(1);

    const steps = [
        {
            title: "GitHub가 무엇인가요?",
            description: "전 세계 개발자들이 코드를 저장하고 공유하는 플랫폼입니다. 무료로 사용할 수 있어요!",
            icon: "📚",
            action: (
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                    <p>School Breeze에서는 GitHub를 통해 템플릿을 복사하고 관리합니다.</p>
                </div>
            )
        },
        {
            title: "1. GitHub 계정이 있나요?",
            description: "이미 GitHub 계정이 있다면 '로그인'을, 없다면 '회원가입'을 선택하세요.",
            icon: "1️⃣",
            action: (
                <div className="space-y-2">
                    <a
                        href="https://github.com/signup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <GithubIcon className="w-4 h-4" />
                        GitHub 회원가입
                    </a>
                    <a
                        href="https://github.com/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors"
                    >
                        <GithubIcon className="w-4 h-4" />
                        GitHub 로그인 (계정이 있는 경우)
                    </a>
                </div>
            )
        },
        {
            title: "2. 회원가입 하기 (처음인 경우)",
            description: "이메일, 비밀번호, 사용자명을 입력하고 인증 절차를 완료하세요. 무료 플랜으로 충분해요!",
            icon: "2️⃣",
            action: (
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="text-xs text-gray-400 mb-2">💡 회원가입 팁</div>
                    <ul className="space-y-1 text-xs text-gray-700">
                        <li>• 학교 이메일이나 개인 이메일 모두 가능</li>
                        <li>• 사용자명은 영문, 숫자, 하이픈(-)만 가능</li>
                        <li>• 무료 플랜으로 시작하세요</li>
                    </ul>
                </div>
            )
        },
        {
            title: "3. School Breeze에서 연결하기",
            description: "GitHub 계정을 만들었다면, School Breeze 로그인 페이지에서 'GitHub로 로그인' 버튼을 클릭하세요!",
            icon: "3️⃣",
            action: (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="text-sm text-blue-800 mb-3">
                        <strong>다음 단계:</strong>
                    </div>
                    <ol className="space-y-2 text-xs text-blue-700">
                        <li>1. School Breeze 로그인 페이지로 이동</li>
                        <li>2. "GitHub로 로그인" 버튼 클릭</li>
                        <li>3. GitHub에서 권한 승인</li>
                        <li>4. 완료! 🎉</li>
                    </ol>
                </div>
            )
        },
        {
            title: "4. 준비 완료!",
            description: "이제 GitHub 계정이 연결되었습니다. 설정 페이지로 돌아가볼까요?",
            icon: "✅",
            action: (
                <button
                    onClick={onComplete}
                    className="w-full bg-gray-900 text-white p-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                    설정으로 돌아가기
                </button>
            )
        }
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col h-[450px]">
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                    <span className="text-xl">
                        <GithubIcon className="w-6 h-6" />
                    </span>
                    GitHub 연결 가이드
                </h3>
                <div className="text-sm font-medium opacity-80">
                    {step} / {steps.length}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                    <div
                        className="h-full bg-gray-900 transition-all duration-500 ease-out"
                        style={{ width: `${(step / steps.length) * 100}%` }}
                    />
                </div>

                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-6 animate-bounce-slow">
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
                        className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1 shadow-sm"
                    >
                        다음 <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
