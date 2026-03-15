import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = params.id;

        const snapshot = await adminDb.collection('registrations')
            .where('eventId', '==', eventId)
            .orderBy('registeredAt', 'desc')
            .get();

        const registrations = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                registeredAt: data.registeredAt?.toDate ? data.registeredAt.toDate().toISOString() : data.registeredAt
            };
        });

        return NextResponse.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
