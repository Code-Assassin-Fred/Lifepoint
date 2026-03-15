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

        const userDoc = await adminDb.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data();
        return NextResponse.json({
            user: {
                id: userDoc.id,
                displayName: userData?.displayName || 'Unknown User',
                email: userData?.email || '',
                photoURL: userData?.photoURL || null,
                role: userData?.role || 'user'
            }
        });
    } catch (error) {
        console.error('Error fetching user for message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
