import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const maxDuration = 30; // Maximum execution time for screenshot generation

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        // Use regular puppeteer for development
        const puppeteer = require('puppeteer');

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Set viewport size
        await page.setViewport({
            width: 1200,
            height: 630, // Common OG image size
            deviceScaleFactor: 1,
        });

        // Navigate to URL with timeout
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 15000
        });

        // Take screenshot
        const screenshot = await page.screenshot({
            type: 'jpeg',
            quality: 85,
            fullPage: false
        });

        await browser.close();

        // Generate unique filename
        const fileName = `${session.user.id}-${Date.now()}.jpg`;
        const filePath = `thumbnails/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('thumbnails')
            .upload(filePath, screenshot, {
                contentType: 'image/jpeg',
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return NextResponse.json({
                error: 'Failed to upload screenshot to storage'
            }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('thumbnails')
            .getPublicUrl(filePath);

        return NextResponse.json({
            thumbnailUrl: publicUrl,
            message: 'Screenshot generated successfully'
        });

    } catch (error: any) {
        console.error('Screenshot error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to generate screenshot'
        }, { status: 500 });
    }
}
