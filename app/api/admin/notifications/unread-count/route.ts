import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('notifications')
            .where('read', '==', false)
            .count()
            .get();
        
        const count = snapshot.data().count;
        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
