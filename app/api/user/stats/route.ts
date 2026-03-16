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
        
        // Fetch Real Bible Engagement
        const enrollmentsSnapshot = await adminDb.collection('planEnrollments')
            .where('userId', '==', userId)
            .get();
        
        const bookmarksSnapshot = await adminDb.collection('userBookmarks')
            .where('userId', '==', userId)
            .get();

        // Calculate progress percentage
        let totalSteps = 0;
        let completedSteps = 0;
        enrollmentsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            totalSteps += data.totalSteps || 10; // default to 10 if missing
            completedSteps += (data.completedSteps || []).length;
        });

        const engagementPct = totalSteps > 0 
            ? Math.round((completedSteps / totalSteps) * 100) 
            : (bookmarksSnapshot.size > 0 ? 10 : 0); // fallback to small % if they have bookmarks

        const prayerRequestsSnapshot = await adminDb.collection('prayer_requests')
            .where('userId', '==', userId)
            .get();
        
        const selectedModules = userData.selectedModules || [];
        
        const stats = [
            { 
                label: 'Bible engagement', 
                value: `${engagementPct}%`, 
                change: engagementPct > 0 ? 'active' : 'start', 
                trend: 'up' 
            },
            { 
                label: 'Prayer Streak', 
                value: `${userData.streak || 0} Days`, 
                change: `+${prayerRequestsSnapshot.size}`, 
                trend: 'up' 
            },
            { 
                label: 'Active Programs', 
                value: selectedModules.length.toString(), 
                change: 'current', 
                trend: 'neutral' 
            },
            { 
                label: 'Growth Points', 
                value: (userData.xp || 0).toString(), 
                change: `Rank ${userData.level || 1}`, 
                trend: 'up' 
            },
        ];

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
