import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        await adminDb.collection('livesessions').doc(sessionId).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting livestream session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
