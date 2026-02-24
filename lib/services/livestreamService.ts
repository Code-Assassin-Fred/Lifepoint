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
    startedAt: Timestamp;
    endedAt?: Timestamp;
    adminId: string;
    roomUrl: string;
    roomName: string;
    title: string;
}

const COLLECTION_NAME = 'livesessions';

export const livestreamService = {
    // Start a new live session
    async startSession(sessionData: Omit<LiveSession, 'id' | 'status' | 'startedAt'>) {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...sessionData,
            status: 'live',
            startedAt: Timestamp.now(),
        });
        return docRef.id;
    },

    // End an active live session
    async endSession(sessionId: string) {
        const docRef = doc(db, COLLECTION_NAME, sessionId);
        await updateDoc(docRef, {
            status: 'ended',
            endedAt: Timestamp.now(),
        });
    },

    // Get the currently active session
    subscribeToActiveSession(callback: (session: LiveSession | null) => void) {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('status', '==', 'live'),
            orderBy('startedAt', 'desc'),
            limit(1)
        );

        return onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                callback(null);
            } else {
                const sessionDoc = snapshot.docs[0];
                callback({ id: sessionDoc.id, ...sessionDoc.data() } as LiveSession);
            }
        });
    }
};
