import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        // Fetch total users
        const usersSnapshot = await adminDb.collection('users').count().get();
        const totalUsers = usersSnapshot.data().count;

        // Fetch new signups (last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const newSignupsSnapshot = await adminDb.collection('users')
            .where('onboardingCompletedAt', '>=', twentyFourHoursAgo)
            .count()
            .get();
        const newSignups = newSignupsSnapshot.data().count;

        // Active Today (users who have onboardingCompletedAt today)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayStartIso = todayStart.toISOString();

        const activeTodaySnapshot = await adminDb.collection('users')
            .where('onboardingCompletedAt', '>=', todayStartIso)
            .count()
            .get();
        const activeToday = activeTodaySnapshot.data().count;

        // Calculate a mock engagement rate based on active today vs total
        const engagementRate = totalUsers > 0
            ? Math.round((activeToday / totalUsers) * 100)
            : 0;

        return NextResponse.json({
            stats: [
                { label: 'Total Users', value: totalUsers.toLocaleString(), change: '+0%', trend: 'up' },
                { label: 'Active Today', value: activeToday.toLocaleString(), change: '+0%', trend: 'up' },
                { label: 'New Signups', value: newSignups.toLocaleString(), change: '+0%', trend: 'up' },
                { label: 'Engagement', value: `${engagementRate}%`, change: '+0%', trend: 'up' },
            ]
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
