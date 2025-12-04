import { Hero } from "@/components/landing/Hero";
import { TemplateSection } from "@/components/landing/TemplateSection";
import { supabase } from "@/lib/supabase";

// Mock Data Fallback (in case Supabase is not connected yet)
const MOCK_TEMPLATES = [
    {
        id: 1,
        title: "단어 퀴즈 마스터",
        description: "학생들이 재미있게 영단어를 학습할 수 있는 퀴즈 앱입니다. 엑셀로 문제만 올리면 끝!",
        tags: ["영어", "퀴즈", "초/중/고"],
        image_url: "https://placehold.co/600x400/e8f5e9/4caf50?text=Word+Quiz"
    },
    {
        id: 2,
        title: "우리 반 자리바꾸기",
        description: "공정하고 빠른 자리 배치 프로그램. 남녀 성비, 시력 보호석 설정 가능.",
        tags: ["학급운영", "유틸리티"],
        image_url: "https://placehold.co/600x400/e3f2fd/2196f3?text=Seat+Change"
    },
    {
        id: 3,
        title: "급식 투표 게시판",
        description: "오늘의 급식 메뉴를 확인하고 맛있는 메뉴에 투표하는 소통 공간입니다.",
        tags: ["급식", "소통", "자치활동"],
        image_url: "https://placehold.co/600x400/fff3e0/ff9800?text=Lunch+Vote"
    },
    {
        id: 4,
        title: "독서 마라톤 기록장",
        description: "학생들의 독서 활동을 기록하고 통계를 보여주는 디지털 독서록.",
        tags: ["국어", "독서", "포트폴리오"],
        image_url: "https://placehold.co/600x400/f3e5f5/9c27b0?text=Reading+Log"
    }
];

export const revalidate = 0; // Disable caching for demo purposes

export default async function LandingPage() {
    // Try to fetch from Supabase
    let templates = [];
    try {
        if (!supabase) throw new Error("Supabase client not initialized");

        const { data, error } = await supabase.from('templates').select('*').order('id');
        if (error || !data || data.length === 0) {
            console.warn("Supabase fetch failed or empty, using mock data:", error);
            templates = MOCK_TEMPLATES;
        } else {
            templates = data;
        }
    } catch (e) {
        console.warn("Supabase connection error, using mock data:", e);
        templates = MOCK_TEMPLATES;
    }

    return (
        <main className="min-h-screen bg-white">
            <Hero />
            <TemplateSection templates={templates} />
        </main>
    );
}
