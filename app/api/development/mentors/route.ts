import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const snapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
        const admins = snapshot.docs.map(doc => ({
            id: doc.id,
            displayName: doc.data().displayName || 'Bishop/Admin',
            photoURL: doc.data().photoURL || `https://i.pravatar.cc/150?u=${doc.id}`,
            role: doc.data().mentorRole || 'Spiritual Mentor'
        }));

        return NextResponse.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
