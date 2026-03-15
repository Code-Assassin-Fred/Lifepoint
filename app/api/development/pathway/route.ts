import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const doc = await adminDb.collection('settings').doc('growthPathway').get();
        if (!doc.exists) {
            return NextResponse.json({ steps: [] });
        }
        return NextResponse.json(doc.data());
    } catch (error) {
        console.error('Error fetching growth pathway:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { steps } = body;

        await adminDb.collection('settings').doc('growthPathway').set({
            steps,
            updatedAt: new Date()
        });

        return NextResponse.json({ message: 'Pathway updated successfully' });
    } catch (error) {
        console.error('Error updating growth pathway:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
