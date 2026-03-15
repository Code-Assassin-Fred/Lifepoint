import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const role = searchParams.get('role');

        let query;
        if (role === 'admin') {
            query = adminDb.collection('mentorshipSessions').orderBy('scheduledAt', 'desc');
        } else if (userId) {
            query = adminDb.collection('mentorshipSessions')
                .where('participants', 'array-contains', userId)
                .orderBy('scheduledAt', 'desc');
        } else {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const snapshot = await query.get();
        const sessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, type, scheduledAt, mentorId, participants, description } = body;

        const sessionRef = await adminDb.collection('mentorshipSessions').add({
            title,
            type, // 'individual' | 'group'
            scheduledAt: new Date(scheduledAt),
            mentorId,
            participants: participants || [],
            description,
            status: 'scheduled',
            createdAt: new Date()
        });

        return NextResponse.json({ id: sessionRef.id, message: 'Session scheduled successfully' });
    } catch (error) {
        console.error('Error scheduling session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { sessionId, status } = body;

        await adminDb.collection('mentorshipSessions').doc(sessionId).update({
            status,
            updatedAt: new Date()
        });

        return NextResponse.json({ message: 'Session updated successfully' });
    } catch (error) {
        console.error('Error updating session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
