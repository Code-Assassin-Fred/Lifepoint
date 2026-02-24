import { NextResponse } from 'next/server';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_DOMAIN = process.env.NEXT_PUBLIC_DAILY_DOMAIN;

export async function POST(req: Request) {
    if (!DAILY_API_KEY) {
        return NextResponse.json({ error: 'Daily API key not configured' }, { status: 500 });
    }

    try {
        const { title } = await req.json();

        // Create a room in Daily.co
        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${DAILY_API_KEY}`,
            },
            body: JSON.stringify({
                name: `lifepoint-${Date.now()}`,
                properties: {
                    enable_chat: true,
                    start_video_off: false,
                    start_audio_off: false,
                    exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Daily API error:', errorData);
            return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
        }

        const room: { url: string; name: string } = await response.json();

        // Create a join token for the admin (owner)
        const tokenResponse = await fetch('https://api.daily.co/v1/meeting-tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${DAILY_API_KEY}`,
            },
            body: JSON.stringify({
                properties: {
                    room_name: room.name,
                    is_owner: true,
                    user_name: 'Admin',
                },
            }),
        });

        if (!tokenResponse.ok) {
            return NextResponse.json({ error: 'Failed to create join token' }, { status: 500 });
        }

        const { token } = (await tokenResponse.json()) as { token: string };

        return NextResponse.json({
            roomUrl: room.url,
            roomName: room.name,
            token: token,
        });
    } catch (error) {
        console.error('Error creating livestream room:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
