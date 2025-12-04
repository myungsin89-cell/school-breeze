import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, repo_url, demo_url, thumbnail_url, category, template_type, required_apis } = body;

        // Validation
        if (!title || !description || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 테플릿 타입에 따라 필수 필드 검증
        if (template_type === 'github' && !repo_url) {
            return NextResponse.json({ error: "GitHub URL is required for GitHub templates" }, { status: 400 });
        }
        if (template_type === 'deployed' && !demo_url) {
            return NextResponse.json({ error: "Website URL is required for deployed templates" }, { status: 400 });
        }

        // Check for Service Role Key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('Missing Supabase configuration');
            return NextResponse.json({ error: "Server configuration error: Missing Service Role Key" }, { status: 500 });
        }

        // Create Admin Client to bypass RLS
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        console.log('Attempting to insert template with author_id:', session.user.id);

        const { data, error } = await supabaseAdmin
            .from('templates')
            .insert({
                title,
                description,
                repo_url: repo_url || null,
                demo_url: demo_url || null,
                thumbnail_url,
                category,
                template_type: template_type || 'github',
                required_apis: required_apis || [],
                author_id: session.user.id,
                author_name: session.user.name || session.user.email?.split('@')[0] || 'Unknown'
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error Details:', JSON.stringify(error, null, 2));
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Template Creation Error:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
