import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');

        const sessionsRef = adminDb.collection('weekly_sessions');
        const today = new Date().toISOString().split('T')[0];

        if (action === 'history') {
            // Fetch all past weekly sessions
            const snapshot = await sessionsRef
                .where('weekStarting', '<', today)
                .orderBy('weekStarting', 'desc')
                .get();

            const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return NextResponse.json(history);
        }

        // Fetch current active weekly session (most recent weekStarting <= today)
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

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        await adminDb.collection('weekly_sessions').doc(id).delete();
        return NextResponse.json({ message: 'Weekly session deleted successfully' });
    } catch (error) {
        console.error('Weekly session delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
