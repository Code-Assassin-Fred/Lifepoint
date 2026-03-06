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
    recordingUrl?: string;
    recordingStatus?: 'ready' | 'processing';
}


const COLLECTION_NAME = 'livesessions';

export const livestreamService = {
    // Get the currently active session (Interval Polling using Admin SDK)
    subscribeToActiveSession(callback: (session: LiveSession | null) => void) {
        const checkActive = async () => {
            try {
                const response = await fetch('/api/livestream/active-session');
                if (!response.ok) throw new Error('Failed to fetch active session');
                const session = await response.json();
                callback(session);
            } catch (error) {
                console.error('Error in subscribeToActiveSession polling:', error);
                callback(null);
            }
        };

        // Initial check
        checkActive();

        // Poll every 30 seconds for live status updates
        const interval = setInterval(checkActive, 30000);

        // Return a cleanup function
        return () => clearInterval(interval);
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
