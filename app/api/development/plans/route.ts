import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const snapshot = await adminDb.collection('growthPlans').orderBy('createdAt', 'desc').get();
        const plans = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json(plans);
    } catch (error) {
        console.error('Error fetching growth plans:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, duration, steps, category } = body;

        const planRef = await adminDb.collection('growthPlans').add({
            title,
            description,
            duration,
            steps,
            category,
            createdAt: new Date()
        });

        return NextResponse.json({ id: planRef.id, message: 'Growth plan created successfully' });
    } catch (error) {
        console.error('Error creating growth plan:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
