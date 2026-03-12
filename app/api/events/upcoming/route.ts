import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const now = new Date();
        const snapshot = await adminDb.collection('events')
            .where('date', '>=', now)
            .orderBy('date', 'asc')
            .get();

        const events = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate ? data.date.toDate().toISOString() : data.date
            };
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
