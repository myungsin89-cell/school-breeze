import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        console.log('API Session:', session);

        if (!session?.user?.email) {
            console.log('No session or email found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabase) {
            console.error('Supabase client not initialized');
            return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('vercel_token, gemini_api_key')
            .eq('email', session.user.email)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
        }

        console.log('Fetched user profile:', user);
        return NextResponse.json(user);
    } catch (error) {
        console.error('Internal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
