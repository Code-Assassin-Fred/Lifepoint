import { NextResponse } from 'next/server';

const DAILY_API_KEY = process.env.DAILY_API_KEY;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const recordingId = searchParams.get('recordingId');

    if (!DAILY_API_KEY) {
        return NextResponse.json({ error: 'Daily API key not configured' }, { status: 500 });
    }

    if (!recordingId) {
        return NextResponse.json({ error: 'Recording ID is required' }, { status: 400 });
    }

    try {
        // First check recording status
        console.log('[recording-url] Checking recording status for:', recordingId);
        const statusRes = await fetch(`https://api.daily.co/v1/recordings/${recordingId}`, {
            headers: { Authorization: `Bearer ${DAILY_API_KEY}` }
        });

        if (!statusRes.ok) {
            const errorData = await statusRes.json();
            console.error('[recording-url] Daily API error:', statusRes.status, errorData);
            return NextResponse.json({ error: 'Recording not found', details: errorData }, { status: 404 });
        }

        const statusData = await statusRes.json();
        console.log('[recording-url] Recording status:', statusData.status);

        if (statusData.status !== 'finished') {
            return NextResponse.json({ 
                error: 'Recording is still processing', 
                status: statusData.status 
            }, { status: 202 });
        }

        // Get a public access link (no auth required, temporary)
        console.log('[recording-url] Fetching access link...');
        const accessRes = await fetch(`https://api.daily.co/v1/recordings/${recordingId}/access-link`, {
            headers: { Authorization: `Bearer ${DAILY_API_KEY}` }
        });

        if (!accessRes.ok) {
            const accessError = await accessRes.json();
            console.error('[recording-url] Access link error:', accessRes.status, accessError);
            
            // Fallback: try the download_url directly
            if (statusData.download_url) {
                console.log('[recording-url] Falling back to download_url');
                return NextResponse.json({ downloadUrl: statusData.download_url });
            }
            
            return NextResponse.json({ error: 'Failed to get access link' }, { status: 500 });
        }

        const accessData = await accessRes.json();
        console.log('[recording-url] Got access link successfully');
        
        return NextResponse.json({ downloadUrl: accessData.download_link || accessData.link });
    } catch (error) {
        console.error('[recording-url] Unhandled error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
