import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('sermons')
            .orderBy('date', 'desc')
            .get();

        const sessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate ? doc.data().date.toDate().toISOString() : doc.data().date
        }));

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sermons via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { sessionId, action } = await req.json();

        if (action === 'delete') {
            await adminDb.collection('sermons').doc(sessionId).delete();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error performing action on sermon:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
