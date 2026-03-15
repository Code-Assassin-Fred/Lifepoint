import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const role = searchParams.get('role');

        let query;
        if (role === 'admin') {
            query = adminDb.collection('mentorshipRequests').orderBy('createdAt', 'desc');
        } else if (userId) {
            query = adminDb.collection('mentorshipRequests')
                .where('userId', 'eq', userId)
                .orderBy('createdAt', 'desc');
        } else {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const snapshot = await query.get();
        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, userName, reason, area } = body;

        const requestRef = await adminDb.collection('mentorshipRequests').add({
            userId,
            userName,
            reason,
            area,
            status: 'pending',
            createdAt: new Date()
        });

        return NextResponse.json({ id: requestRef.id, message: 'Request submitted successfully' });
    } catch (error) {
        console.error('Error submitting request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { requestId, status, mentorId } = body;

        const updateData: any = {
            status,
            updatedAt: new Date()
        };
        if (mentorId) updateData.mentorId = mentorId;

        await adminDb.collection('mentorshipRequests').doc(requestId).update(updateData);

        return NextResponse.json({ message: 'Request updated successfully' });
    } catch (error) {
        console.error('Error updating request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
