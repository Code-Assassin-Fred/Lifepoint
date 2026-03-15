import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        const snapshot = await adminDb.collection('registrations')
            .where('eventId', '==', eventId)
            .get();

        const registrations = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                registeredAt: data.registeredAt?.toDate ? data.registeredAt.toDate().toISOString() : data.registeredAt
            };
        }).sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

        return NextResponse.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
