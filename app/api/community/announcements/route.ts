import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, imageUrl, authorName, authorRole } = body;

        const docRef = await adminDb.collection('announcements').add({
            title,
            content,
            imageUrl: imageUrl || null,
            authorName: authorName || 'Lifepoint Admin',
            authorRole: authorRole || 'Admin',
            createdAt: Timestamp.now()
        });

        return NextResponse.json({ id: docRef.id }, { status: 201 });
    } catch (error) {
        console.error('Error creating announcement:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const snapshot = await adminDb.collection('announcements')
            .orderBy('createdAt', 'desc')
            .get();

        const announcements = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
            };
        });

        return NextResponse.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        await adminDb.collection('announcements').doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
