import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    try {
        const insightsSnapshot = await adminDb.collection('devotions')
            .orderBy('date', 'desc')
            .limit(10)
            .get();

        const plansSnapshot = await adminDb.collection('studyPlans')
            .orderBy('createdAt', 'desc')
            .get();

        const insights = insightsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate ? doc.data().date.toDate().toISOString() : doc.data().date
        }));

        const growthPlans = plansSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt
        }));

        let bookmarks: string[] = [];
        let enrollments: Record<string, { completedSteps: number[] }> = {};

        if (userId) {
            const bookmarksSnapshot = await adminDb.collection('userBookmarks')
                .where('userId', '==', userId)
                .get();
            bookmarks = bookmarksSnapshot.docs.map(d => d.data().insightId);

            const enrollmentsSnapshot = await adminDb.collection('planEnrollments')
                .where('userId', '==', userId)
                .get();
            enrollmentsSnapshot.docs.forEach(d => {
                const data = d.data();
                enrollments[data.planId] = { completedSteps: data.completedSteps || [] };
            });
        }

        return NextResponse.json({ insights, growthPlans, bookmarks, enrollments });
    } catch (error) {
        console.error('Error fetching wisdom data via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
