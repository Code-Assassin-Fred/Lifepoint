import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sermonId = searchParams.get('sermonId');

    if (!sermonId) {
        return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
    }

    try {
        const snapshot = await adminDb.collection('sermons')
            .doc(sermonId)
            .collection('comments')
            .orderBy('createdAt', 'desc')
            .get();

        const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString()
        }));

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { sermonId, text, userName, userId } = await req.json();

        if (!sermonId || !text || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const commentRef = await adminDb.collection('sermons')
            .doc(sermonId)
            .collection('comments')
            .add({
                text,
                userName: userName || 'Anonymous',
                userId,
                createdAt: new Date()
            });

        return NextResponse.json({ id: commentRef.id, success: true });
    } catch (error) {
        console.error('Error posting comment via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
