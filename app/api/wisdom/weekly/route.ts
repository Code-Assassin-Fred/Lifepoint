import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');
        const userId = searchParams.get('userId');

        const sessionsRef = adminDb.collection('weekly_sessions');
        const today = new Date().toISOString().split('T')[0];

        if (action === 'history') {
            // Fetch past weekly sessions
            let query = sessionsRef.where('weekStarting', '<', today);

            const snapshot = await query.orderBy('weekStarting', 'desc').get();
            let history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Filter by targetAudience if userId is provided
            if (userId) {
                history = history.filter((s: any) =>
                    !s.targetAudience ||
                    s.targetAudience.type === 'everyone' ||
                    (s.targetAudience.type === 'individuals' && s.targetAudience.userIds?.includes(userId))
                );
            }

            return NextResponse.json(history);
        }

        // Fetch current active weekly sessions
        // We fetch both 'everyone' and potential targeted ones, then pick the best match
        const everyoneSnapshot = await sessionsRef
            .where('targetAudience.type', '==', 'everyone')
            .where('weekStarting', '<=', today)
            .orderBy('weekStarting', 'desc')
            .limit(1)
            .get();

        let session = null;
        if (!everyoneSnapshot.empty) {
            session = { id: everyoneSnapshot.docs[0].id, ...everyoneSnapshot.docs[0].data() };
        }

        // If userId is provided, check for targeted sessions for this user
        if (userId) {
            const targetedSnapshot = await sessionsRef
                .where('targetAudience.type', '==', 'individuals')
                .where('targetAudience.userIds', 'array-contains', userId)
                .where('weekStarting', '<=', today)
                .orderBy('weekStarting', 'desc')
                .limit(1)
                .get();

            if (!targetedSnapshot.empty) {
                const targetedSession = { id: targetedSnapshot.docs[0].id, ...targetedSnapshot.docs[0].data() };
                // If targeted session is newer or same age as everyone session, prefer it
                if (!session || (targetedSession as any).weekStarting >= (session as any).weekStarting) {
                    session = targetedSession;
                }
            }
        } else {
            // If no userId, and no specific target query was made, we still need to handle legacy docs without targetAudience
            if (!session) {
                const legacySnapshot = await sessionsRef
                    .where('weekStarting', '<=', today)
                    .orderBy('weekStarting', 'desc')
                    .limit(5)
                    .get();

                const legacy = legacySnapshot.docs.find(d => !d.data().targetAudience);
                if (legacy) {
                    session = { id: legacy.id, ...legacy.data() };
                }
            }
        }

        return NextResponse.json(session);
    } catch (error) {
        console.error('Weekly session fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { weekStarting, theme, summary, lessons, targetAudience } = body;

        const docRef = await adminDb.collection('weekly_sessions').add({
            weekStarting,
            theme,
            summary,
            lessons,
            targetAudience: targetAudience || { type: 'everyone', userIds: [] },
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id, message: 'Weekly session created successfully' });
    } catch (error) {
        console.error('Weekly session create error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        await adminDb.collection('weekly_sessions').doc(id).delete();
        return NextResponse.json({ message: 'Weekly session deleted successfully' });
    } catch (error) {
        console.error('Weekly session delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
