# Google OAuth Setup Guide

구글 로그인을 사용하려면 Google Cloud Console에서 OAuth 2.0 클라이언트 ID를 생성해야 합니다.

## 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다
2. 프로젝트를 선택하거나 새로 만듭니다
3. **API 및 서비스** > **사용자 인증 정보**로 이동합니다
4. **사용자 인증 정보 만들기** > **OAuth 클라이언트 ID**를 선택합니다
5. 애플리케이션 유형: **웹 애플리케이션** 선택

## 2. 승인된 리디렉션 URI 설정

개발 환경과 프로덕션 환경에 대한 리디렉션 URI를 추가합니다:

- 개발: `http://localhost:3000/api/auth/callback/google`
- 프로덕션: `https://yourdomain.com/api/auth/callback/google`

## 3. 환경 변수 설정

`.env.local` 파일에 다음 내용을 추가합니다:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## 4. 데이터베이스 마이그레이션

Supabase SQL Editor에서 다음 SQL을 실행하여 기존 users 테이블을 업데이트합니다:

```sql
-- Drop existing table and recreate with new schema
DROP TABLE IF EXISTS users CASCADE;

-- Create updated users table
CREATE TABLE users (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text unique,
  email text unique,
  nickname text,
  password_hash text,
  oauth_provider text,
  oauth_id text,
  nickname_set boolean default false
);

-- Create unique index for OAuth users
CREATE UNIQUE INDEX users_oauth_provider_id_idx ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;
```

## 5. 테스트

1. 개발 서버를 시작합니다: `npm run dev`
2. `/login` 페이지로 이동합니다
3. **Google로 로그인** 버튼을 클릭합니다
4. Google 계정을 선택하고 권한을 부여합니다
5. 처음 로그인하는 경우 `/setup-nickname` 페이지로 리다이렉트됩니다
6. 별명을 입력하고 **시작하기**를 클릭합니다
7. 대시보드로 이동하는지 확인합니다

## 주의사항

- 구글 OAuth 앱 설정 시 테스트 모드에서는 100명까지만 사용할 수 있습니다
- 프로덕션으로 전환하려면 Google에 앱 검토를 요청해야 합니다
