import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventId, name, email, userId } = body;

        if (!eventId || !name || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if already registered
        const existingReg = await adminDb.collection('registrations')
            .where('eventId', '==', eventId)
            .where('userEmail', '==', email)
            .get();

        if (!existingReg.empty) {
            return NextResponse.json({ error: 'You are already registered for this event' }, { status: 400 });
        }

        // Create registration
        const registration = {
            eventId,
            userId: userId || null,
            userName: name,
            userEmail: email,
            registeredAt: Timestamp.now()
        };

        await adminDb.collection('registrations').add(registration);

        // Optional: Increment registration count on the event document
        const eventRef = adminDb.collection('events').doc(eventId);
        await eventRef.update({
            registrationCount: FieldValue.increment(1)
        });

        // Add a notification for admin
        await adminDb.collection('notifications').add({
            type: 'event_registration',
            title: 'New Event Registration',
            message: `${name} has registered for an event.`,
            link: `/dashboard/admin/workshops`,
            createdAt: Timestamp.now(),
            read: false
        });

        return NextResponse.json({ message: 'Registration successful' }, { status: 201 });
    } catch (error) {
        console.error('Error registering for event:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
