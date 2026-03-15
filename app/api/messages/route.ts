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
            .where('threadId', '==', threadId)
            .orderBy('timestamp', 'asc');

        const snapshot = await messagesRef.get();
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate().toISOString() // Convert Timestamp to string
        }));

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
