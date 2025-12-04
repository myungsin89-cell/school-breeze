import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/templates/[id]/comments
 * 템플릿 댓글 목록 조회
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const { id: templateId } = params;

        const { data, error } = await supabaseAdmin
            .from('template_comments')
            .select('*')
            .eq('template_id', templateId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Comments fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Comments API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/templates/[id]/comments
 * 댓글 작성
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const { id: templateId } = params;
        const body = await request.json();
        const { content } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('template_comments')
            .insert({
                template_id: templateId,
                user_id: session.user.id,
                user_name: session.user.name || session.user.email?.split('@')[0] || 'Unknown',
                content: content.trim()
            })
            .select()
            .single();

        if (error) {
            console.error('Comment creation error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Comment API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
