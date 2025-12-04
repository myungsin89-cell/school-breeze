# 실제 배포 기능 테스트 가이드

## 완료된 작업 ✅

1. **NextAuth 설정 업데이트**
   - GitHub `public_repo` scope 추가
   - Access token을 session에 저장하도록 구성

2. **GitHub API 구현**
   - `forkRepository()` - 실제 레포지토리 fork 기능
   - `createRepoFromTemplate()` - Template repository 사용 기능

3. **Vercel API 구현**
   - `createVercelProject()` - Vercel 프로젝트 생성
   - 환경 변수 설정 및 배포 트리거

4. **Deploy API 라우트**
   - 실제 GitHub fork 및 Vercel 배포 로직 구현
   - 인증된 사용자의 access token 사용

5. **템플릿 데이터**
   - Vercel Next.js 공개 레포지토리 사용 준비

---

## 테스트 준비 (선택사항)

실제 배포 기능을 테스트하려면:

### 1. Supabase에 레포지토리 URL 추가

Supabase SQL Editor에서 실행:
```sql
UPDATE templates 
SET github_repo_url = 'vercel/next.js' 
WHERE id = 1;
```

### 2. Vercel Access Token (선택사항)

Vercel 배포까지 테스트하려면:
- https://vercel.com/account/tokens 방문
- 토큰 생성
- `.env.local`에 추가:
  ```
  VERCEL_ACCESS_TOKEN=your_token_here
  ```

**참고:** GitHub fork만 테스트하려면 Vercel 토큰 없이도 가능합니다!

---

## 현재 동작 방식

1. **사용자가 "선생님 로그인" 클릭**
   → GitHub OAuth로 로그인 (repo 권한 포함)

2. **템플릿 선택 후 "Use this Template" 클릭**
   → DeployWizard 열림

3. **앱 이름 입력 및 배포**
   → 실제 GitHub에 Fork 생성!
   → (Vercel 토큰 있으면) Vercel 배포도 자동 실행

---

## 제한 사항

- **Mock Mode (GitHub 연결/Vercel 연결 버튼):** 현재 UI상으로만 연결됨 표시
- **실제 동작:** GitHub access token은 이미 로그인 시 획득됨
- **Vercel:** 토큰 제공 시 실제 배포, 없으면 Skip

---

## 다음 단계

바로 테스트해볼 수 있습니다!
1. 브라우저에서 로그아웃 후 다시 로그인 (repo 권한 획득)
2. 템플릿 선택
3. 배포 마법사로 실제 Fork 테스트!
