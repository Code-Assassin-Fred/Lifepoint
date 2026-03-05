import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('livesessions')
            .where('status', '==', 'ended')
            .get();

        const sessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to ISO strings for easy client consumption
            endedAt: doc.data().endedAt?.toDate().toISOString(),
            startedAt: doc.data().startedAt?.toDate().toISOString()
        }));

        // Sort in memory to avoid "missing index" error
        sessions.sort((a: any, b: any) => {
            const dateA = a.endedAt ? new Date(a.endedAt).getTime() : 0;
            const dateB = b.endedAt ? new Date(b.endedAt).getTime() : 0;
            return dateB - dateA;
        });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching past sessions via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
