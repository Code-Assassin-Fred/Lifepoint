import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('livesessions')
            .where('status', '==', 'live')
            .orderBy('startedAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return NextResponse.json(null);
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        return NextResponse.json({
            id: doc.id,
            ...data,
            startedAt: data.startedAt?.toDate ? data.startedAt.toDate().toISOString() : data.startedAt
        });
    } catch (error) {
        console.error('Error fetching active session via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
