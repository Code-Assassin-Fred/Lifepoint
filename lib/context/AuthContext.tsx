'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setRole(data.role || null);
            setOnboardingComplete(data.onboarded || false);
          } else {
            setRole(null);
            setOnboardingComplete(false);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setRole(null);
          setOnboardingComplete(false);
        }
      } else {
        setRole(null);
        setOnboardingComplete(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, role, onboardingComplete }}
    >
      {children}
    </AuthContext.Provider>
  );
};
