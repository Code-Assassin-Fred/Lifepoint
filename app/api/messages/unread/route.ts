import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const unreadRef = adminDb.collection('messages')
            .where('receiverId', '==', userId)
            .where('read', '==', false);

        const snapshot = await unreadRef.get();
        let latestSenderId = null;

        if (!snapshot.empty) {
            latestSenderId = snapshot.docs[0].data().senderId;
        }

        return NextResponse.json({ count: snapshot.size, latestSenderId });
    } catch (error) {
        console.error('Error fetching unread messages count:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
