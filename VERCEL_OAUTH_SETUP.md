# Vercel OAuth Integration 설정 가이드

## 1단계: Vercel Integration 생성

1. **Vercel Integrations 페이지 이동**
   - https://vercel.com/dashboard/integrations/console 접속
   - **"Create"** 버튼 클릭

2. **Integration 정보 입력**
   - **Name**: `School Breeze` (또는 원하는 이름)
   - **Description**: `선생님을 위한 웹앱 공유 플랫폼`
   - **Logo**: 원하는 로고 업로드 (선택사항)
   - **Website**: `http://localhost:3000`
   - **Redirect URL**: `http://localhost:3000/api/connect/vercel`

   ⚠️ **중요:** Redirect URL을 정확히 입력해야 합니다!

3. **Scopes 설정**
   - **User Information** 섹션에서:
     - ✅ `user` - Read user information

4. **"Create Integration"** 클릭

5. **Client ID와 Client Secret 확인**
   - 생성 후 표시되는 **Client ID**를 복사
   - **Client Secret**을 복사 (한 번만 표시되므로 꼭 저장!)

---

## 2단계: 환경 변수 추가

`.env.local` 파일에 다음 내용을 **추가**하세요:

```env
# Vercel OAuth
AUTH_VERCEL_ID=여기에_Client_ID_붙여넣기
AUTH_VERCEL_SECRET=여기에_Client_Secret_붙여넣기
```

⚠️ **중요:** 변수 이름을 정확히 입력해야 합니다!
- `AUTH_VERCEL_ID` (~~VERCEL_CLIENT_ID 아님~~)
- `AUTH_VERCEL_SECRET` (~~VERCEL_CLIENT_SECRET 아님~~)

---

## 3단계: 개발 서버 재시작

환경 변수를 추가한 후 개발 서버를 재시작하세요:

```bash
npm run dev
```

---

## 사용 방법

1. 로그인 후 **설정** 페이지로 이동
2. **Vercel** 섹션에서 **"Vercel로 연결하기"** 버튼 클릭
3. Vercel 인증 페이지에서 앱 권한 승인
4. 자동으로 설정 페이지로 돌아오며 연결 완료!

---

## 배포 시 (Vercel)

배포할 때는 Vercel Integration 설정을 업데이트해야 합니다:

1. **Vercel Integrations Console**에서 생성한 Integration 클릭
2. **Redirect URL** 업데이트:
   - `https://your-domain.vercel.app/api/connect/vercel` 추가
3. **Vercel 환경 변수**에 다음을 추가:
   - `AUTH_VERCEL_ID`
   - `AUTH_VERCEL_SECRET`

---

## 문제 해결

### "Invalid redirect_uri" 오류
- Redirect URL이 정확히 `http://localhost:3000/api/connect/vercel`인지 확인
- 배포 환경에서는 도메인을 실제 도메인으로 변경

### "Unauthorized" 오류
- Client ID와 Secret이 올바르게 `.env.local`에 설정되었는지 확인
- 개발 서버를 재시작했는지 확인

### 연결 후에도 "연결됨"이 표시되지 않음
- 브라우저 새로고침
- `/api/user/profile` 엔드포인트에서 Vercel 토큰이 저장되었는지 확인
