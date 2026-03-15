import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Fetch Bible engagement (simplified: count of devotions/insights marked as 'read' or just count them)
        // For now, let's use a mock value until we have a real 'reading history' collection
        // But we can fetch the user's selected modules and prayer requests
        
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data() || {};
        
        const prayerRequestsSnapshot = await adminDb.collection('prayer_requests')
            .where('userId', '==', userId)
            .get();
        
        const selectedModules = userData.selectedModules || [];
        
        // Calculate Streak (if we had a daily check-in log)
        // For now, we'll return some realistic placeholders derived from user data
        
        const stats = [
            { label: 'Bible engagement', value: '45%', change: '+5%', trend: 'up' },
            { label: 'Prayer Streak', value: prayerRequestsSnapshot.size > 0 ? `${Math.min(prayerRequestsSnapshot.size, 7)} Days` : '0 Days', change: '+1', trend: 'up' },
            { label: 'Active Programs', value: selectedModules.length.toString(), change: 'current', trend: 'neutral' },
            { label: 'Growth Points', value: (userData.xp || 0).toString(), change: '+124', trend: 'up' },
        ];

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
