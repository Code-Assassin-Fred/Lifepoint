import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const DAILY_API_KEY = process.env.DAILY_API_KEY;

export async function POST(req: Request) {
    if (!DAILY_API_KEY) {
        console.error('[create-room] DAILY_API_KEY is not configured');
        return NextResponse.json({ error: 'Daily API key not configured' }, { status: 500 });
    }

    try {
        const { title, adminId } = await req.json();
        console.log('[create-room] Step 1: Creating room for title:', title);

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
                    enable_screenshare: true,
                    enable_recording: 'cloud',
                    start_video_off: false,
                    start_audio_off: false,
                    exp: Math.floor(Date.now() / 1000) + 7200,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[create-room] Daily room creation failed:', response.status, errorData);
            return NextResponse.json({ error: 'Failed to create room', details: errorData }, { status: 500 });
        }

        const room: { url: string; name: string } = await response.json();
        console.log('[create-room] Step 2: Room created:', room.url, room.name);

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
            const tokenError = await tokenResponse.json();
            console.error('[create-room] Token creation failed:', tokenResponse.status, tokenError);
            return NextResponse.json({ error: 'Failed to create join token', details: tokenError }, { status: 500 });
        }

        const { token } = (await tokenResponse.json()) as { token: string };
        console.log('[create-room] Step 3: Token created successfully');

        // Save session to Firestore using Admin SDK
        const docRef = await adminDb.collection('livesessions').add({
            title,
            adminId: adminId || 'unknown',
            roomUrl: room.url,
            roomName: room.name,
            status: 'live',
            startedAt: new Date(),
        });
        console.log('[create-room] Step 4: Firestore doc created:', docRef.id);

        return NextResponse.json({
            roomUrl: room.url,
            roomName: room.name,
            token: token,
        });
    } catch (error) {
        console.error('[create-room] Unhandled error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
