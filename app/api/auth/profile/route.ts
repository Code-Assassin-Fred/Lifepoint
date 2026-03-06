import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const userDoc = await adminDb.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return NextResponse.json(null);
        }

        const data = userDoc.data();
        return NextResponse.json({
            role: data?.role || null,
            selectedModules: data?.selectedModules || [],
            onboarded: data?.onboarded === true
        });
    } catch (error) {
        console.error('Error fetching user profile via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
