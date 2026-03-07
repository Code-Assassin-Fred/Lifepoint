import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    try {
        // Fetch current active weekly session (e.g., most recent weekStarting <= today)
        const today = new Date().toISOString().split('T')[0];
        const sessionsRef = adminDb.collection('weekly_sessions');
        const snapshot = await sessionsRef
            .where('weekStarting', '<=', today)
            .orderBy('weekStarting', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return NextResponse.json(null);
        }

        const session = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        return NextResponse.json(session);
    } catch (error) {
        console.error('Weekly session fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { weekStarting, theme, summary, lessons } = body;

        const docRef = await adminDb.collection('weekly_sessions').add({
            weekStarting,
            theme,
            summary,
            lessons,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id, message: 'Weekly session created successfully' });
    } catch (error) {
        console.error('Weekly session create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
