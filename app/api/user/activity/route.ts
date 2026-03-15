import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const userRef = adminDb.collection('users').doc(userId);
        
        await userRef.update({
            lastActiveAt: new Date()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user activity:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
