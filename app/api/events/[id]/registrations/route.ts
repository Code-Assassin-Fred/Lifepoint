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

        const registrations = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();
            let userId = data.userId;

            // Fallback: If userId is missing, try to find user by email
            if (!userId && data.userEmail) {
                const userSnapshot = await adminDb.collection('users')
                    .where('email', '==', data.userEmail)
                    .limit(1)
                    .get();
                if (!userSnapshot.empty) {
                    userId = userSnapshot.docs[0].id;
                }
            }

            return {
                id: doc.id,
                ...data,
                userId,
                registeredAt: data.registeredAt?.toDate ? data.registeredAt.toDate().toISOString() : data.registeredAt
            };
        }));
        
        registrations.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

        return NextResponse.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
