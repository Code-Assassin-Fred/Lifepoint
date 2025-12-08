'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextProps {
  user: FirebaseUser | null;
  loading: boolean;
  onboardingComplete: boolean;
  role: string | null;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  onboardingComplete: false,
  role: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
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
              setOnboardingComplete(data.onboarded === true);
            } else {
              setRole(null);
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
        setOnboardingComplete(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, role, onboardingComplete }}
    >
      {children}
    </AuthContext.Provider>
  );
};