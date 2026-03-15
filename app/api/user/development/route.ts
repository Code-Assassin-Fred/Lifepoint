import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data() || {};

        // Fetch Global Pathway definition
        const pathwayDoc = await adminDb.collection('settings').doc('growthPathway').get();
        const globalSteps = pathwayDoc.exists 
            ? pathwayDoc.data()?.steps || [] 
            : [];

        // Map status based on user progress
        const completedSteps = userData.completedJourneySteps || [];
        const activeStepId = userData.activeJourneyStep || (globalSteps.length > 0 ? globalSteps[0].id : null);

        const steps = globalSteps.map((step: any) => ({
            ...step,
            status: completedSteps.includes(step.id) 
                ? 'completed' 
                : (step.id === activeStepId ? 'active' : 'locked')
        }));

        // Mentorship (if user has a mentor)
        let mentor = null;
        if (userData.mentorId) {
            const mentorDoc = await adminDb.collection('users').doc(userData.mentorId).get();
            if (mentorDoc.exists) {
                const mentorData = mentorDoc.data();
                mentor = {
                    name: mentorData?.displayName || 'Your Mentor',
                    role: mentorData?.mentorRole || 'Spiritual Mentor',
                    img: mentorData?.photoURL || 'https://i.pravatar.cc/150?u=1'
                };
            }
        }

        return NextResponse.json({
            level: userData.level || '1',
            levelName: userData.levelName || 'Seeker',
            xp: userData.xp || 0,
            nextMilestone: userData.nextMilestone || 'Next Level',
            xpNeeded: userData.xpNeeded || 100,
            streak: userData.streak || 0,
            badges: userData.badges?.length || 0,
            steps,
            mentor
        });
    } catch (error) {
        console.error('Error fetching development data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
