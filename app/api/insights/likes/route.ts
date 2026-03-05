import { NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sermonId = searchParams.get('sermonId');
    const userId = searchParams.get('userId');

    if (!sermonId) {
        return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 });
    }

    try {
        const sermonDoc = await adminDb.collection('sermons').doc(sermonId).get();
        const sermonData = sermonDoc.data();

        // Check if user has liked
        let hasLiked = false;
        if (userId) {
            const likeDoc = await adminDb.collection('sermons')
                .doc(sermonId)
                .collection('likes')
                .doc(userId)
                .get();
            hasLiked = likeDoc.exists;
        }

        return NextResponse.json({
            likeCount: sermonData?.likeCount || 0,
            hasLiked
        });
    } catch (error) {
        console.error('Error fetching likes via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { sermonId, userId, action } = await req.json();

        if (!sermonId || !userId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const sermonRef = adminDb.collection('sermons').doc(sermonId);
        const likeRef = sermonRef.collection('likes').doc(userId);

        if (action === 'like') {
            await adminDb.runTransaction(async (t) => {
                t.set(likeRef, { createdAt: new Date() });
                t.update(sermonRef, { likeCount: FieldValue.increment(1) });
            });
        } else {
            await adminDb.runTransaction(async (t) => {
                t.delete(likeRef);
                t.update(sermonRef, { likeCount: FieldValue.increment(-1) });
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error toggling like via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
