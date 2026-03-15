import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const doc = await adminDb.collection('settings').doc('growthPathways').get();
        if (!doc.exists) {
            return NextResponse.json({ pathways: [] });
        }
        return NextResponse.json(doc.data());
    } catch (error) {
        console.error('Error fetching growth pathways:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { pathways } = body;

        await adminDb.collection('settings').doc('growthPathways').set({
            pathways,
            updatedAt: new Date()
        });

        return NextResponse.json({ message: 'Pathways updated successfully' });
    } catch (error) {
        console.error('Error updating growth pathways:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
