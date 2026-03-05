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
        const response = await fetch(`https://api.daily.co/v1/recordings/${recordingId}`, {
            headers: { Authorization: `Bearer ${DAILY_API_KEY}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Daily API error:', errorData);
            return NextResponse.json({ error: 'Failed to fetch recording details' }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json({ downloadUrl: data.download_url });
    } catch (error) {
        console.error('Error fetching recording URL:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
