import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * DELETE /api/templates/[id]/comments/[commentId]
 * 댓글 삭제 (작성자만)
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string; commentId: string } }
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
        const { commentId } = params;

        // 댓글 소유자 확인
        const { data: comment } = await supabaseAdmin
            .from('template_comments')
            .select('user_id')
            .eq('id', commentId)
            .single();

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        if (comment.user_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 댓글 삭제
        const { error } = await supabaseAdmin
            .from('template_comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            console.error('Comment deletion error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Comment deletion API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
