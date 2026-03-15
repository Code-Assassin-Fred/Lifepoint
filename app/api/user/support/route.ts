import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        // Fetch Community Projects (Goals and Progress)
        const projectsSnapshot = await adminDb.collection('projects').get();
        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Default projects if none exist in DB
        const displayProjects = projects.length > 0 ? projects : [
            { title: 'New Community Center', raised: 840000, goal: 1200000, progress: 70, icon: 'Globe', color: 'bg-teal-600' },
            { title: 'Global Mission Fund', raised: 12000, goal: 25000, progress: 48, icon: 'Zap', color: 'bg-sky-600' },
            { title: 'Food Drive 2025', raised: 8500, goal: 10000, progress: 85, icon: 'Users', color: 'bg-red-500' }
        ];

        let history: any[] = [];
        let stats = { raisedThisMonth: 0, familiesHelped: 0 };

        if (userId) {
            // Fetch User Giving History
            const historySnapshot = await adminDb.collection('donations')
                .where('userId', '==', userId)
                .orderBy('date', 'desc')
                .limit(5)
                .get();
            
            history = historySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate ? doc.data().date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : doc.data().date
            }));
        }

        // Aggregate Global Stats (derived or hardcoded for now until we have a total aggregation)
        const globalStatsSnapshot = await adminDb.collection('stats').doc('giving').get();
        if (globalStatsSnapshot.exists) {
            stats = globalStatsSnapshot.data() as any;
        } else {
            // Realistic placeholders based on accumulated data
            stats = { raisedThisMonth: 45000, familiesHelped: 1200 };
        }

        return NextResponse.json({ projects: displayProjects, history, stats });
    } catch (error) {
        console.error('Error fetching support data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
