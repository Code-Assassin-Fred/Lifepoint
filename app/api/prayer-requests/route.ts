import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        let querySnapshot;
        if (userId) {
            // Fetch filtered by userId, then sort in-memory to avoid needing a composite index
            querySnapshot = await adminDb.collection('prayer_requests')
                .where('userId', '==', userId)
                .get();
        } else {
            // Admin view: fetch all ordered by timestamp
            querySnapshot = await adminDb.collection('prayer_requests')
                .orderBy('timestamp', 'desc')
                .get();
        }

        let requests = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Return serializable timestamp data
                timestamp: data.timestamp ? { 
                    _seconds: data.timestamp._seconds,
                    _nanoseconds: data.timestamp._nanoseconds,
                    // Keep a Date object for easy sorting in-memory
                    _date: data.timestamp.toDate()
                } : null
            };
        });

        // In-memory sort if filtered by userId
        if (userId) {
            requests.sort((a, b) => {
                const dateA = a.timestamp?._date?.getTime() || 0;
                const dateB = b.timestamp?._date?.getTime() || 0;
                return dateB - dateA;
            });
        }

        // Clean up internal _date before sending
        requests = requests.map(req => {
            const { timestamp, ...rest } = req;
            if (timestamp) {
                const { _date, ...tsRest } = timestamp as any;
                return { ...rest, timestamp: tsRest };
            }
            return req;
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Error fetching prayer requests via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { text, userName, userId } = await req.json();

        if (!text || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const prayerRef = await adminDb.collection('prayer_requests').add({
            text,
            userName: userName || 'Anonymous',
            userId,
            timestamp: new Date() // adminDb.add converts Date to Timestamp automatically
        });

        return NextResponse.json({ id: prayerRef.id, success: true });
    } catch (error) {
        console.error('Error posting prayer request via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
