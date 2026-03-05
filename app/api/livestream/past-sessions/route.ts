import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('livesessions')
            .where('status', '==', 'ended')
            .get();

        const DAILY_API_KEY = process.env.DAILY_API_KEY;

        const sessionsPromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();
            let recordingUrl = data.recordingUrl;

            // If no recording URL yet, try to fetch from Daily.co
            if (!recordingUrl && DAILY_API_KEY && data.roomName) {
                try {
                    const recRes = await fetch(`https://api.daily.co/v1/recordings?room_name=${data.roomName}`, {
                        headers: { Authorization: `Bearer ${DAILY_API_KEY}` }
                    });
                    
                    if (recRes.ok) {
                        const recData = await recRes.json();
                        if (recData.data && recData.data.length > 0) {
                            // Find the most recent finished recording for this room
                            const recording = recData.data.find((r: any) => r.status === 'finished');
                            if (recording) {
                                recordingUrl = recording.download_url; // Note: Daily download URLs are temporary but we'll fetch them on each request for now
                                // Update Firestore so we know it has a recording
                                await doc.ref.update({ 
                                    recordingUrl: recordingUrl,
                                    recordingId: recording.id,
                                    recordingStatus: 'ready'
                                });
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error checking Daily.co recordings:', err);
                }
            }

            return {
                id: doc.id,
                ...data,
                recordingUrl,
                // Convert Firestore timestamps to ISO strings for easy client consumption
                endedAt: data.endedAt?.toDate ? data.endedAt.toDate().toISOString() : data.endedAt,
                startedAt: data.startedAt?.toDate ? data.startedAt.toDate().toISOString() : data.startedAt
            };
        });

        const sessions = await Promise.all(sessionsPromises);

        // Sort in memory to avoid "missing index" error
        sessions.sort((a: any, b: any) => {
            const dateA = a.endedAt ? new Date(a.endedAt).getTime() : 0;
            const dateB = b.endedAt ? new Date(b.endedAt).getTime() : 0;
            return dateB - dateA;
        });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching past sessions via Admin SDK:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
