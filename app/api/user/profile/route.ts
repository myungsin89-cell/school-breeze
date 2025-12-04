import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@supabase/supabase-js';
import { encrypt } from '@/lib/crypto';

/**
 * 사용자 프로필 API
 * API 키를 저장하고 관리합니다.
 */

// Supabase 클라이언트 초기화
// Supabase 클라이언트 초기화 (Service Role Key 사용 - RLS 우회)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || 'placeholder'); // 키가 없으면 클라이언트 생성 시 에러 방지용 placeholder (실제 호출 시 에러 발생)

/**
 * GET /api/user/profile
 * 사용자 프로필에서 저장된 API 키 정보를 가져옵니다.
 * 보안을 위해 실제 키 값은 반환하지 않고, 존재 여부만 확인합니다.
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', session.user.email)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = "Row not found"
            throw error;
        }

        // 각 API 키의 존재 여부만 반환 (보안)
        return NextResponse.json({
            hasVercelToken: !!profile?.vercel_access_token,
            hasGeminiKey: !!profile?.gemini_api_key,
            hasSupabaseUrl: !!profile?.supabase_url,
            hasSupabaseKey: !!profile?.supabase_anon_key,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/user/profile
 * 사용자의 API 키를 저장합니다.
 * 
 * Body 예시:
 * {
 *   "vercelToken": "...",
 *   "geminiApiKey": "...",
 *   "supabaseUrl": "...",
 *   "supabaseAnonKey": "..."
 * }
 */
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: '서버 설정 오류: SUPABASE_SERVICE_ROLE_KEY가 없습니다.' }, { status: 500 });
        }

        const body = await request.json();
        const { vercelToken, geminiApiKey, supabaseUrl, supabaseAnonKey } = body;

        // 업데이트할 데이터 준비
        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        // 제공된 값만 업데이트
        if (vercelToken !== undefined) {
            try {
                updateData.vercel_access_token = encrypt(vercelToken);
            } catch (e) {
                console.error('Token encryption failed:', e);
                throw new Error('토큰 암호화에 실패했습니다.');
            }
        }
        if (geminiApiKey !== undefined) updateData.gemini_api_key = geminiApiKey;
        if (supabaseUrl !== undefined) updateData.supabase_url = supabaseUrl;
        if (supabaseAnonKey !== undefined) updateData.supabase_anon_key = supabaseAnonKey;

        // 프로필 존재 여부 확인
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .single();

        let error;
        if (existingProfile) {
            // 기존 프로필 업데이트
            const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('email', session.user.email);
            error = updateError;
        } else {
            // 새 프로필 생성
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    email: session.user.email,
                    ...updateData
                });
            error = insertError;
        }

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'API 키가 성공적으로 저장되었습니다.'
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/user/profile
 * 특정 API 키를 삭제합니다.
 */
export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const keyType = searchParams.get('type'); // 'vercel', 'gemini', 'supabase'

        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (keyType === 'vercel') {
            updateData.vercel_access_token = null;
        } else if (keyType === 'gemini') {
            updateData.gemini_api_key = null;
        } else if (keyType === 'supabase') {
            updateData.supabase_url = null;
            updateData.supabase_anon_key = null;
        }

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('email', session.user.email);

        if (error) throw error;

        return NextResponse.json({ success: true });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Profile delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
