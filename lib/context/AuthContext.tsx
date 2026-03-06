'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

    return (
        <AuthContext.Provider
            value={{ user, loading, role, onboardingComplete, selectedModules }}
        >
            {children}
        </AuthContext.Provider>
    );
};
