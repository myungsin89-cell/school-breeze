import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성 (서비스 롤 키 사용 - RLS 우회 필요 시)
// 하지만 여기서는 사용자 토큰을 사용하거나, 서비스 롤을 사용하되 user_id로 필터링해야 함.
// 간단하게 서비스 롤 키를 사용하여 모든 권한을 가진 클라이언트를 생성하고, 로직에서 user_id를 검증합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: '로그인이 필요합니다.' },
                { status: 401 }
            );
        }

        // 사용자의 배포 목록 조회
        const { data, error } = await supabase
            .from('user_deployments')
            .select(`
                *,
                templates (
                    title,
                    thumbnail_url,
                    description
                )
            `)
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ deployments: data });

    } catch (error) {
        console.error('배포 목록 조회 오류:', error);
        return NextResponse.json(
            { error: '배포 목록을 불러오는데 실패했습니다.' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: '로그인이 필요합니다.' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: '삭제할 배포 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        // 본인의 배포인지 확인하고 삭제
        const { error } = await supabase
            .from('user_deployments')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('배포 기록 삭제 오류:', error);
        return NextResponse.json(
            { error: '배포 기록을 삭제하는데 실패했습니다.' },
            { status: 500 }
        );
    }
}
