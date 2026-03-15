import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data() || {};

        // Journey Steps definition
        const journeySteps = [
            { id: 'foundation', title: 'Believers Foundation', dur: '4 Weeks', icon: 'CheckCircle2' },
            { id: 'community', title: 'Life in Community', dur: '3 Weeks', icon: 'CheckCircle2' },
            { id: 'discovery', title: 'Spiritual Gifts Discovery', dur: '2 Weeks', icon: 'Clock' },
            { id: 'leadership', title: 'Leadership Level 1', dur: '6 Weeks', icon: 'Settings' },
            { id: 'mentorship', title: 'Mentorship Initiation', dur: 'Ongoing', icon: 'Users' }
        ];

        // Map status based on user progress (if we had a 'completedSteps' array)
        const completedSteps = userData.completedJourneySteps || ['foundation'];
        const activeStepId = userData.activeJourneyStep || 'community';

        const steps = journeySteps.map(step => ({
            ...step,
            status: completedSteps.includes(step.id) ? 'completed' : (step.id === activeStepId ? 'active' : 'locked')
        }));

        // Daily Habits
        const habits = [
            { label: 'Scripture Reading', icon: 'BookMarked', done: userData.habits?.scripture || false },
            { label: 'Morning Prayer', icon: 'Flame', done: userData.habits?.prayer || false },
            { label: 'Devotional Entry', icon: 'CheckCircle2', done: userData.habits?.devotional || false },
            { label: 'Evening Reflection', icon: 'Clock', done: userData.habits?.reflection || false }
        ];

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
            xp: userData.xp || 120,
            nextMilestone: userData.nextMilestone || 'Next Level',
            xpNeeded: userData.xpNeeded || 380,
            streak: userData.streak || 0,
            badges: userData.badges?.length || 0,
            steps,
            habits,
            mentor
        });
    } catch (error) {
        console.error('Error fetching development data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
