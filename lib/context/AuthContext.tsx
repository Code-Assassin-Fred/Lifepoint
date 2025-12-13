'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextProps {
    user: FirebaseUser | null;
    loading: boolean;
    onboardingComplete: boolean;
    role: string | null;
    selectedModules: string[];
}

const AuthContext = createContext<AuthContextProps>({
    user: null,
    loading: true,
    onboardingComplete: false,
    role: null,
    selectedModules: [],
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Listen to real-time updates on user document
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const unsubscribeDoc = onSnapshot(
                    userDocRef,
                    (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            setRole(data.role || null);
                            setSelectedModules(data.selectedModules || []);
                            setOnboardingComplete(data.onboarded === true);
                        } else {
                            setRole(null);
                            setSelectedModules([]);
                            setOnboardingComplete(false);
                        }
                        setLoading(false);
                    },
                    (err) => {
                        console.error('Firestore listener error:', err);
                        setLoading(false);
                    }
                );

                // Cleanup doc listener when auth changes
                return () => unsubscribeDoc();
            } else {
                setRole(null);
                setSelectedModules([]);
                setOnboardingComplete(false);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, loading, role, onboardingComplete, selectedModules }}
        >
            {children}
        </AuthContext.Provider>
    );
};
