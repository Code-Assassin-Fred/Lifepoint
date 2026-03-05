import { db } from '../firebase';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    onSnapshot,
    Timestamp,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';

export interface LiveSession {
    id?: string;
    status: 'live' | 'ended';
    startedAt: Timestamp | string;
    endedAt?: Timestamp | string;
    adminId: string;
    roomUrl: string;
    roomName: string;
    title: string;
}


const COLLECTION_NAME = 'livesessions';

export const livestreamService = {
    // Get the currently active session
    subscribeToActiveSession(callback: (session: LiveSession | null) => void) {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('status', '==', 'live'),
            orderBy('startedAt', 'desc'),
            limit(1)
        );

        return onSnapshot(q,
            (snapshot) => {
                if (snapshot.empty) {
                    callback(null);
                } else {
                    const sessionDoc = snapshot.docs[0];
                    callback({ id: sessionDoc.id, ...sessionDoc.data() } as LiveSession);
                }
            },
            (error) => {
                console.error('Livestream Firestore subscription error:', error);
                // Potentially handle permission denied by retrying or showing a message
            }
        );
    },

    // Get all past sessions
    async getPastSessions(): Promise<LiveSession[]> {
        try {
            const response = await fetch('/api/livestream/past-sessions');
            if (!response.ok) throw new Error('Failed to fetch past sessions');
            return await response.json();
        } catch (error) {
            console.error('Error in getPastSessions:', error);
            return [];
        }
    }
};
