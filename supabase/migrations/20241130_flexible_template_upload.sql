-- 템플릿 업로드 유연성 개선: 다양한 공유 방식 지원

-- 1. repo_url을 선택사항으로 변경 (GitHub 없이도 공유 가능)
ALTER TABLE templates ALTER COLUMN repo_url DROP NOT NULL;

-- 2. 템플릿 타입 컬럼 추가
ALTER TABLE templates ADD COLUMN template_type text DEFAULT 'github';
-- 가능한 값: 'github' (GitHub 저장소), 'deployed' (배포된 웹사이트), 'gemini' (Gemini Canvas 프로젝트), 'other' (기타)

-- 3. 필요한 API 목록 컬럼 추가 (JSON 배열)
ALTER TABLE templates ADD COLUMN required_apis jsonb DEFAULT '[]'::jsonb;
-- 예시: '["github", "vercel", "gemini"]' 또는 '[]' (필요 없음)

-- 템플릿 타입에 대한 설명:
-- - 'github': GitHub 저장소를 배포해야 하는 템플릿 (repo_url 필수)
-- - 'deployed': 이미 배포된 웹사이트 링크만 제공 (demo_url 필수)
-- - 'gemini': Gemini Canvas로 만든 프로젝트
-- - 'other': 기타

-- required_apis 예시:
-- - [] : API 필요 없음 (단순 배포된 사이트 공유)
-- - ["github"] : GitHub 연동 필요
-- - ["vercel"] : Vercel 배포 필요
-- - ["github", "vercel"] : GitHub와 Vercel 모두 필요
-- - ["gemini"] : Gemini API 필요
