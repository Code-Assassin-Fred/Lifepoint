import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        // Fetch total users
        const totalUsersSnapshot = await adminDb.collection('users').count().get();
        const totalUsers = totalUsersSnapshot.data().count;

        // Fetch new signups (last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const newSignupsSnapshot = await adminDb.collection('users')
            .where('onboardingCompletedAt', '>=', twentyFourHoursAgo)
            .count()
            .get();
        const newSignups = newSignupsSnapshot.data().count;

        // Active Today (users who have been active since the start of the day)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayStartIso = todayStart.toISOString();

        const activeTodaySnapshot = await adminDb.collection('users')
            .where('lastActiveAt', '>=', todayStartIso)
            .count()
            .get();
        const activeToday = activeTodaySnapshot.data().count;

        // Calculate engagement rate
        const engagementRate = totalUsers > 0
            ? Math.round((activeToday / totalUsers) * 100)
            : 0;

        // Fetch total registrations
        const totalRegsSnapshot = await adminDb.collection('registrations').count().get();
        const totalRegs = totalRegsSnapshot.data().count;

        return NextResponse.json({
            stats: [
                { label: 'Total Users', value: totalUsers.toLocaleString(), change: '+0%', trend: 'up' },
                { label: 'Active Today', value: activeToday.toLocaleString(), change: '+2%', trend: 'up' },
                { label: 'Gathering Regs', value: totalRegs.toLocaleString(), change: '+0%', trend: 'up' },
                { label: 'Engagement', value: `${engagementRate}%`, change: '+1%', trend: 'up' },
            ]
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
