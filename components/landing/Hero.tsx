import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-white pt-20 pb-32">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 right-0 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-50/50 rounded-full blur-3xl -z-10" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 animate-fade-in-up">
                    <Sparkles className="w-4 h-4" />
                    <span>선생님을 위한 가장 쉬운 앱 만들기</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                    코딩 없이 1분 만에 만드는<br />
                    <span className="text-primary">나만의 학교 앱</span>
                </h1>

                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    복잡한 개발 용어는 잊으세요. <br className="hidden md:block" />
                    검증된 교육용 자료를 클릭 한 번으로 내 것으로 만드세요.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/templates"
                        className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-full hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        자료나눔터
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/guide"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 text-lg font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
                    >
                        사용법 알아보기
                    </Link>
                </div>
            </div>
        </section>
    );
}
