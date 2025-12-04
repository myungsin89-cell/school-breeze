"use client";

import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, Github, Loader2, Rocket, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

// Helper component to trigger deployment with useEffect
function DeployTrigger({ onDeploy, isDeploying }: { onDeploy: () => void, isDeploying: boolean }) {
    useEffect(() => {
        if (!isDeploying) {
            onDeploy();
        }
    }, []); // Run once on mount
    return null;
}

interface DeployWizardProps {
    template: {
        id: string;
        title: string;
        github_repo_url?: string;
    };
    onClose: () => void;
}

type Step = 'preview' | 'configure' | 'deploy' | 'success';

export function DeployWizard({ template, onClose }: DeployWizardProps) {
    const [step, setStep] = useState<Step>('preview');
    const [repoName, setRepoName] = useState('');
    const [isDeploying, setIsDeploying] = useState(false);
    const [result, setResult] = useState<{ deploymentUrl: string; repoUrl: string } | null>(null);

    const handleDeploy = async () => {
        setIsDeploying(true);
        try {
            const response = await axios.post('/api/deploy', {
                templateRepo: template.github_repo_url || 'vercel/next.js', // Fallback for safety
                repoName,
                // vercelToken is now handled by the backend using stored profile tokens
            });

            setResult(response.data);
            setStep('success');
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.error || '배포에 실패했습니다.';
            alert(errorMessage);
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">앱 만들기 마법사</h2>
                        <p className="text-sm text-gray-500 mt-1">선택한 템플릿: <span className="font-medium text-primary">{template.title}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto">

                    {/* Step 1: Preview */}
                    {step === 'preview' && (
                        <div className="space-y-6">
                            <div className="bg-primary-50 p-6 rounded-xl border border-primary-100">
                                <h3 className="font-bold text-primary-900 text-lg mb-2">이 템플릿으로 무엇을 할 수 있나요?</h3>
                                <ul className="space-y-2 text-primary-800">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4" /> 선생님만의 웹사이트 주소가 생깁니다.</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4" /> 내용은 언제든지 엑셀로 수정 가능합니다.</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4" /> 학생들에게 링크만 공유하면 바로 사용 가능!</li>
                                </ul>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setStep('configure')}
                                    className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-600 transition-colors flex items-center gap-2"
                                >
                                    다음 단계로 <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Configure & Deploy */}
                    {step === 'configure' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900">앱 이름 정하기</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">나만의 앱 이름 (영어로 입력해주세요)</label>
                                <input
                                    type="text"
                                    value={repoName}
                                    onChange={(e) => setRepoName(e.target.value)}
                                    placeholder="my-awesome-class-app"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-2">이 이름으로 인터넷 주소가 생성됩니다. (예: https://{repoName || 'app-name'}.vercel.app)</p>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <h4 className="font-bold text-yellow-800 text-sm mb-1">💡 팁</h4>
                                <p className="text-sm text-yellow-700">학교 이름이나 반 이름을 넣으면 학생들이 기억하기 좋아요!</p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setStep('preview')}
                                    className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    이전
                                </button>
                                <button
                                    onClick={() => setStep('deploy')}
                                    disabled={!repoName}
                                    className="bg-primary disabled:bg-gray-300 text-white px-6 py-3 rounded-full font-bold transition-colors flex items-center gap-2"
                                >
                                    앱 만들기 시작 <Rocket className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Deploying */}
                    {step === 'deploy' && (
                        <div className="text-center py-12">
                            <DeployTrigger onDeploy={handleDeploy} isDeploying={isDeploying} />

                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <Rocket className="absolute inset-0 m-auto text-primary w-8 h-8 animate-pulse" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">나만의 앱을 만들고 있어요!</h3>
                            <p className="text-gray-600">GitHub 저장소를 복사하고 Vercel에 배포하는 중입니다.<br />약 1분 정도 소요됩니다. 잠시만 기다려주세요.</p>

                            <div className="mt-8 max-w-sm mx-auto bg-gray-900 rounded-lg p-4 text-left font-mono text-xs text-green-400 shadow-inner">
                                <div className="flex items-center gap-2 mb-2 border-b border-gray-800 pb-2">
                                    <Terminal className="w-3 h-3" />
                                    <span>System Log</span>
                                </div>
                                <div className="space-y-1 opacity-80">
                                    <p>&gt; Initializing project...</p>
                                    <p>&gt; Cloning template: {template.title}...</p>
                                    <p>&gt; Creating repository: {repoName}...</p>
                                    <p className="animate-pulse">&gt; Deploying to Vercel...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && result && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <Check className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">축하합니다! 🎉</h3>
                            <p className="text-gray-600 mb-8 text-lg">선생님만의 앱이 성공적으로 만들어졌습니다.</p>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                <div className="mb-4">
                                    <span className="text-sm text-gray-500 block mb-1">나의 앱 주소</span>
                                    <a href={result.deploymentUrl} target="_blank" rel="noopener noreferrer" className="text-2xl font-bold text-primary hover:underline break-all">
                                        {result.deploymentUrl}
                                    </a>
                                </div>
                                <div className="flex gap-2 justify-center">
                                    <a href={result.repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                                        <Github className="w-4 h-4" /> 저장소 보기
                                    </a>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
