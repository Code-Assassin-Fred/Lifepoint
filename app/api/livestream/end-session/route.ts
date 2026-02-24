import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        // Update session in Firestore using Admin SDK
        const sessionRef = adminDb.collection('livesessions').doc(sessionId);
        await sessionRef.update({
            status: 'ended',
            endedAt: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error ending livestream session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
