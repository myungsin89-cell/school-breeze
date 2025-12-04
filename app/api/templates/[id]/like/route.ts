import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/templates/[id]/like
 * 템플릿에 좋아요 추가
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const { id: templateId } = params;

        // 이미 좋아요했는지 확인
        const { data: existing } = await supabaseAdmin
            .from('template_likes')
            .select('id')
            .eq('template_id', templateId)
            .eq('user_id', session.user.id)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Already liked' }, { status: 400 });
        }

        // 좋아요 추가
        const { error } = await supabaseAdmin
            .from('template_likes')
            .insert({
                template_id: templateId,
                user_id: session.user.id
            });

        if (error) {
            console.error('Like error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 업데이트된 좋아요 수 가져오기
        const { data: template } = await supabaseAdmin
            .from('templates')
            .select('likes_count')
            .eq('id', templateId)
            .single();

        return NextResponse.json({
            success: true,
            likes_count: template?.likes_count || 0
        });
    } catch (error) {
        console.error('Like API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/templates/[id]/like
 * 템플릿 좋아요 취소
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const { id: templateId } = params;

        // 좋아요 삭제
        const { error } = await supabaseAdmin
            .from('template_likes')
            .delete()
            .eq('template_id', templateId)
            .eq('user_id', session.user.id);

        if (error) {
            console.error('Unlike error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 업데이트된 좋아요 수 가져오기
        const { data: template } = await supabaseAdmin
            .from('templates')
            .select('likes_count')
            .eq('id', templateId)
            .single();

        return NextResponse.json({
            success: true,
            likes_count: template?.likes_count || 0
        });
    } catch (error) {
        console.error('Unlike API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
