"use client";

import React, { useState } from 'react';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { DeployWizard } from '@/components/deploy/DeployWizard';

interface Template {
    id: number;
    title: string;
    description: string;
    tags: string[];
    image_url?: string;
    github_repo_url?: string;
}

interface TemplateSectionProps {
    templates: Template[];
}

export function TemplateSection({ templates }: TemplateSectionProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<{ id: string, title: string } | null>(null);

    return (
        <section id="templates" className="py-24 bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        인기있는 학급 앱 템플릿
                    </h2>
                    <p className="text-lg text-gray-600">
                        다른 선생님들이 가장 많이 사용하는 검증된 도구들을 만나보세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            title={template.title}
                            description={template.description}
                            tags={template.tags}
                            imageUrl={template.image_url}
                            githubRepo={template.github_repo_url}
                            requiredApis={['gemini', 'vercel']} // 필요한 API 목록 (추후 DB에서 가져오기)
                        />
                    ))}
                </div>
            </div>

            {selectedTemplate && (
                <div className="fixed inset-0 z-50">
                    <DeployWizard
                        template={selectedTemplate}
                        onClose={() => setSelectedTemplate(null)}
                    />
                </div>
            )}
        </section>
    );
}
