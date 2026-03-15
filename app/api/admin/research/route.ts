import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        // Fetch single draft by ID
        if (id) {
            const doc = await adminDb.collection('research_drafts').doc(id).get();
            if (!doc.exists) {
                return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
            }
            const data = doc.data();
            return NextResponse.json({
                id: doc.id,
                ...data,
                updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data?.updatedAt
            });
        }

        // Fetch all drafts
        const snapshot = await adminDb.collection('research_drafts')
            .orderBy('updatedAt', 'desc')
            .limit(20)
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
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        return NextResponse.json({ id: docRef.id });
    } catch (error) {
        console.error('Error saving research draft:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, title, content, category } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
        }

        await adminDb.collection('research_drafts').doc(id).update({
            title,
            content,
            category: category || 'General',
            updatedAt: Timestamp.now()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating research draft:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
        }

        await adminDb.collection('research_drafts').doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting research draft:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
