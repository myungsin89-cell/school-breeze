import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// DELETE - 템플릿 삭제
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
        const { id } = params;

        // 작성자 확인
        const { data: template } = await supabaseAdmin
            .from('templates')
            .select('author_id')
            .eq('id', id)
            .single();

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        if (template.author_id !== session.user.id) {
            console.error('Delete forbidden: user', session.user.id, 'trying to delete template owned by', template.author_id);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        console.log('Deleting template:', id, 'for user:', session.user.id);

        // 관련 데이터 먼저 삭제 (명시적 cascade)
        // likes와 comments는 ON DELETE CASCADE로 자동 삭제되지만, 명시적으로 삭제
        const { error: likesError } = await supabaseAdmin
            .from('template_likes')
            .delete()
            .eq('template_id', id);

        if (likesError) {
            console.error('Error deleting likes:', likesError);
        }

        const { error: commentsError } = await supabaseAdmin
            .from('template_comments')
            .delete()
            .eq('template_id', id);

        if (commentsError) {
            console.error('Error deleting comments:', commentsError);
        }

        // 템플릿 삭제
        const { error } = await supabaseAdmin
            .from('templates')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting template:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('Template deleted successfully:', id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - 템플릿 수정
export async function PUT(
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
        const { id } = params;
        const body = await request.json();

        // 작성자 확인
        const { data: template } = await supabaseAdmin
            .from('templates')
            .select('author_id')
            .eq('id', id)
            .single();

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        if (template.author_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 업데이트
        const { error } = await supabaseAdmin
            .from('templates')
            .update({
                title: body.title,
                description: body.description,
                thumbnail_url: body.thumbnail_url,
                repo_url: body.repo_url || null,
                demo_url: body.demo_url || null,
                category: body.category,
                template_type: body.template_type || 'github',
                required_apis: body.required_apis || []
            })
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
