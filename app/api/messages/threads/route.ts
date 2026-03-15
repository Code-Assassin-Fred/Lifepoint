import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role'); // 'admin' or 'user'

        if (!role) {
            return NextResponse.json({ error: 'Missing role' }, { status: 400 });
        }

        let users = [];
        
        // If admin, fetch all generic users to start threads with (or existing threads ideally)
        // For simplicity, we just fetch all users with role 'user'
        if (role === 'admin') {
            const usersSnapshot = await adminDb.collection('users').where('role', '==', 'user').get();
            users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } 
        // If user, fetch all admins (mentors)
        else {
            const adminsSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
            users = adminsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching message threads:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
