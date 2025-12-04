-- 소셜 기능 추가: 좋아요, 댓글
-- 2024-11-30

-- 1. templates 테이블에 likes_count 컬럼 추가
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- 2. template_likes 테이블 생성 (좋아요)
CREATE TABLE IF NOT EXISTS template_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- 한 사용자가 같은 템플릿에 중복 좋아요 방지
    UNIQUE(template_id, user_id)
);

-- 3. template_comments 테이블 생성 (댓글)
CREATE TABLE IF NOT EXISTS template_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. RLS 정책 설정

-- template_likes RLS
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 좋아요 목록을 볼 수 있음
CREATE POLICY "Anyone can view likes"
ON template_likes FOR SELECT
USING (true);

-- 인증된 사용자만 좋아요 추가 가능
CREATE POLICY "Authenticated users can add likes"
ON template_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 자신의 좋아요만 삭제 가능
CREATE POLICY "Users can delete their own likes"
ON template_likes FOR DELETE
USING (auth.uid() = user_id);

-- template_comments RLS
ALTER TABLE template_comments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 댓글을 볼 수 있음
CREATE POLICY "Anyone can view comments"
ON template_comments FOR SELECT
USING (true);

-- 인증된 사용자만 댓글 작성 가능
CREATE POLICY "Authenticated users can add comments"
ON template_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 자신의 댓글만 삭제 가능
CREATE POLICY "Users can delete their own comments"
ON template_comments FOR DELETE
USING (auth.uid() = user_id);

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_template_likes_template_id ON template_likes(template_id);
CREATE INDEX IF NOT EXISTS idx_template_likes_user_id ON template_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_template_comments_template_id ON template_comments(template_id);
CREATE INDEX IF NOT EXISTS idx_templates_likes_count ON templates(likes_count DESC);

-- 6. 좋아요 카운트 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_template_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE templates 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.template_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE templates 
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.template_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. 트리거 설정
DROP TRIGGER IF EXISTS trigger_update_likes_count ON template_likes;
CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON template_likes
FOR EACH ROW
EXECUTE FUNCTION update_template_likes_count();
