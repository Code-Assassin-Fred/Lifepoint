'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

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
    const lastPingRef = useRef<number>(0);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user document via Admin SDK (Semi-realtime via polling or single fetch)
                const fetchUserProfile = async () => {
                    try {
                        const response = await fetch(`/api/auth/profile?userId=${firebaseUser.uid}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data) {
                                setRole(data.role || null);
                                setSelectedModules(data.selectedModules || []);
                                setOnboardingComplete(data.onboarded === true);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching user profile:', error);
                    } finally {
                        setLoading(false);
                    }
                };

                fetchUserProfile();

                // Poll user profile every 2 minutes for any role changes
                const interval = setInterval(fetchUserProfile, 120000);
                
                return () => clearInterval(interval);
            } else {
                setRole(null);
                setSelectedModules([]);
                setOnboardingComplete(false);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Activity tracking effect
    useEffect(() => {
        if (!user) return;

        const PING_COOLDOWN = 5 * 60 * 1000; // 5 minutes

        const pingActivity = async () => {
            const now = Date.now();
            if (now - lastPingRef.current < PING_COOLDOWN) return;

            try {
                await fetch('/api/user/activity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.uid }),
                });
                lastPingRef.current = now;
            } catch (error) {
                console.error('Failed to ping activity:', error);
            }
        };

        // Ping on initial load and setup interval
        pingActivity();
        const intervalId = setInterval(pingActivity, 60000); // Check every minute

        // Also ping on visibility change
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                pingActivity();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user]);

    return (
        <AuthContext.Provider
            value={{ user, loading, role, onboardingComplete, selectedModules }}
        >
            {children}
        </AuthContext.Provider>
    );
};
