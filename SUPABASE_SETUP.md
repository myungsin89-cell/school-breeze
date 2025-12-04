# Supabase 데이터베이스 연결 가이드

## 1단계: Supabase 프로젝트 생성

1. **Supabase 웹사이트 방문**
   - https://supabase.com 접속
   - "Start your project" 또는 "Sign in" 클릭
   - GitHub 계정으로 로그인

2. **새 프로젝트 생성**
   - "New Project" 버튼 클릭
   - 프로젝트 정보 입력:
     - Name: `school-breeze` (또는 원하는 이름)
     - Database Password: 안전한 비밀번호 생성 (꼭 저장해두세요!)
     - Region: `Northeast Asia (Seoul)` 선택 (한국에서 가장 빠름)
   - "Create new project" 클릭
   - 프로젝트 생성까지 약 2분 소요

3. **API 키 확인**
   - 프로젝트 대시보드에서 ⚙️ Settings → API 클릭
   - 다음 정보를 복사해두세요:
     - `Project URL` (예: https://xxxxx.supabase.co)
     - `anon public` 키 (긴 문자열)

---

## 2단계: 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```
NEXT_PUBLIC_SUPABASE_URL=여기에_Project_URL_붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_public_키_붙여넣기
```

**예시:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3단계: 데이터베이스 테이블 생성

1. Supabase 대시보드에서 **SQL Editor** 클릭 (왼쪽 메뉴)
2. "New query" 클릭
3. `supabase/schema.sql` 파일의 내용을 복사하여 붙여넣기
4. "RUN" 버튼 클릭하여 실행

---

## 4단계: 개발 서버 재시작

환경 변수를 적용하려면 개발 서버를 재시작해야 합니다:

```bash
# 터미널에서 Ctrl+C로 서버 중지 후
npm run dev
```

---

## 5단계: 연결 확인

브라우저에서 http://localhost:3000 접속 후:
- 브라우저 콘솔(F12)에서 "using mock data" 메시지가 **사라지면 성공!**
- 템플릿 카드가 정상적으로 표시되는지 확인

---

## 문제 해결

### "supabaseUrl is required" 에러
- `.env.local` 파일이 프로젝트 루트(`app/` 폴더)에 있는지 확인
- 개발 서버를 재시작했는지 확인

### 템플릿이 표시되지 않음
- Supabase 대시보드 → Table Editor에서 `templates` 테이블에 데이터가 있는지 확인
- SQL Editor에서 schema.sql을 다시 실행해보세요
