import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, date, time, location, imageUrl } = body;

        const eventDate = new Date(date);

        const docRef = await adminDb.collection('events').add({
            title,
            description,
            date: Timestamp.fromDate(eventDate),
            time,
            location,
            imageUrl,
            createdAt: Timestamp.now()
        });

        return NextResponse.json({ id: docRef.id }, { status: 201 });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const snapshot = await adminDb.collection('events')
            .orderBy('date', 'asc')
            .get();

        const events = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate ? data.date.toDate().toISOString() : data.date
            };
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching all events:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
