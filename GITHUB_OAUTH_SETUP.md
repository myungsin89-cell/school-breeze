# GitHub OAuth App 설정 가이드

## 1단계: GitHub OAuth App 생성

1. **GitHub 설정 페이지 이동**
   - https://github.com/settings/developers 접속
   - 왼쪽 메뉴에서 **"OAuth Apps"** 클릭
   - **"New OAuth App"** 버튼 클릭

2. **OAuth App 정보 입력**
   - **Application name**: `School Breeze` (또는 원하는 이름)
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: `선생님을 위한 웹앱 공유 플랫폼` (선택사항)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
   
   ⚠️ **중요:** Callback URL을 정확히 입력해야 합니다!

3. **"Register application"** 클릭

4. **Client ID와 Client Secret 확인**
   - 생성 후 바로 표시되는 **Client ID**를 복사
   - **"Generate a new client secret"** 클릭
   - 생성된 **Client Secret**을 복사 (한 번만 표시되므로 꼭 저장!)

---

## 2단계: 환경 변수 추가

`.env.local` 파일에 다음 내용을 **추가**하세요:

```env
# GitHub OAuth
AUTH_GITHUB_ID=여기에_Client_ID_붙여넣기
AUTH_GITHUB_SECRET=여기에_Client_Secret_붙여넣기

# Google OAuth (선택사항)
GOOGLE_CLIENT_ID=여기에_Google_Client_ID_붙여넣기
GOOGLE_CLIENT_SECRET=여기에_Google_Client_Secret_붙여넣기

# NextAuth Secret (랜덤 문자열)
AUTH_SECRET=여기에_랜덤_문자열_입력
```

⚠️ **중요:** 변수 이름을 정확히 입력해야 합니다!
- `AUTH_GITHUB_ID` (~~GITHUB_CLIENT_ID 아님~~)
- `AUTH_GITHUB_SECRET` (~~GITHUB_CLIENT_SECRET 아님~~)

**AUTH_SECRET 생성 방법:**
터미널에서 다음 명령어 실행:
```bash
openssl rand -base64 32
```

또는 온라인 생성기 사용: https://generate-secret.vercel.app/32

---

## 배포 시 (Vercel)

배포할 때는 `.env.local` 대신 Vercel 환경 변수에 다음을 추가:
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`  
- `GOOGLE_CLIENT_ID` (선택사항)
- `GOOGLE_CLIENT_SECRET` (선택사항)
- `AUTH_SECRET`
- **Authorization callback URL**: `https://your-domain.vercel.app/api/auth/callback/github`

