import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const otherUserId = searchParams.get('otherUserId');

        if (!userId || !otherUserId) {
            return NextResponse.json({ error: 'Missing user IDs' }, { status: 400 });
        }

        // Fetch messages where this user is sender or receiver with the other user
        // Due to Firestore compound query limits, fetch all between the two and sort manually if needed, 
        // or just use two queries. We'll use two queries or a single query if we store a threadId.
        // For simplicity: thread ID is alphabetical combination of the two IDs.
        
        const threadId = [userId, otherUserId].sort().join('_');

        const messagesRef = adminDb.collection('messages')
            .where('threadId', '==', threadId);

        const snapshot = await messagesRef.get();
        let messages = snapshot.docs.map(doc => {
            const data = doc.data();
            
            let tsMillis = 0;
            let isoString = new Date().toISOString();

            if (data.timestamp) {
                if (typeof data.timestamp.toDate === 'function') {
                    const date = data.timestamp.toDate();
                    tsMillis = date.getTime();
                    isoString = date.toISOString();
                } else if (typeof data.timestamp === 'string' || typeof data.timestamp === 'number') {
                    const date = new Date(data.timestamp);
                    tsMillis = date.getTime();
                    isoString = date.toISOString();
                }
            }

            return {
                id: doc.id,
                ...data,
                tsMillis, // Temporary field for sorting
                timestamp: isoString // Safe string for frontend
            };
        });

        // Sort in memory to avoid missing composite index errors on Firestore
        messages.sort((a, b) => a.tsMillis - b.tsMillis);
        
        // Remove the temporary sorting field
        messages = messages.map(({ tsMillis, ...rest }) => rest);

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { senderId, receiverId, content } = body;

        if (!senderId || !receiverId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const threadId = [senderId, receiverId].sort().join('_');

        const messageData = {
            senderId,
            receiverId,
            content,
            threadId,
            read: false,
            timestamp: new Date() // Will be serialized by admin SDK
        };

        const docRef = await adminDb.collection('messages').add(messageData);

        return NextResponse.json({ 
            success: true, 
            message: { 
                id: docRef.id, 
                ...messageData,
                timestamp: messageData.timestamp.toISOString()
            } 
        });
    } catch (error) {
        console.error('Error adding message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { threadId, receiverId } = body;

        if (!threadId || !receiverId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Only mark messages where receiverId matches the current user as read
        const unreadMessagesRef = adminDb.collection('messages')
            .where('threadId', '==', threadId)
            .where('receiverId', '==', receiverId)
            .where('read', '==', false);

        const snapshot = await unreadMessagesRef.get();

        if (snapshot.empty) {
            return NextResponse.json({ success: true, count: 0 });
        }

        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });

        await batch.commit();

        return NextResponse.json({ success: true, count: snapshot.size });
    } catch (error) {
        console.error('Error updating messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
