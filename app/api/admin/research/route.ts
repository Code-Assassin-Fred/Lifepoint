import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('research_drafts')
            .orderBy('updatedAt', 'desc')
            .limit(10)
            .get();

        const drafts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate().toISOString() : doc.data().updatedAt
        }));

        return NextResponse.json(drafts);
    } catch (error) {
        console.error('Error fetching research drafts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { title, content, category } = await req.json();

        const docRef = await adminDb.collection('research_drafts').add({
            title,
            content,
            category: category || 'General',
            updatedAt: Timestamp.now()
        });

        return NextResponse.json({ id: docRef.id });
    } catch (error) {
        console.error('Error saving research draft:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
