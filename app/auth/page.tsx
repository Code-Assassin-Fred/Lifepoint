'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  sendPasswordResetEmail,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, db, googleProvider } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/context/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { user, onboardingComplete, role, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Redirect logic (runs once user state is confirmed)
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      if (!onboardingComplete) {
        router.replace('/onboarding');
      } else {
        router.replace(`/dashboard/${role || 'user'}`);
      }
    }
  }, [user, onboardingComplete, role, authLoading, router]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Enter a valid email address';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailError = validateEmail(loginEmail);
    const passwordError = validatePassword(loginPassword);

    if (emailError || passwordError) {
      setError(emailError || passwordError || 'Please fix the errors above');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      // Redirect handled by useEffect
    } catch (err: any) {
      const msg = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : err.message || 'Failed to sign in';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signupDisplayName.trim()) return setError('Full name is required');
    if (validateEmail(signupEmail)) return setError('Please enter a valid email');
    if (validatePassword(signupPassword)) return setError('Password must be at least 6 characters');
    if (signupPassword !== signupConfirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      await updateProfile(cred.user, { displayName: signupDisplayName.trim() });

      await setDoc(doc(db, 'users', cred.user.uid), {
        displayName: signupDisplayName.trim(),
        email: signupEmail,
        photoURL: null,
        ai_enabled: true,
        onboarded: false,
        premium_access: false,
        role: null,
        created_at: serverTimestamp(),
      });

      router.replace('/onboarding');
    } catch (err: any) {
      setError(err.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Try signing in.'
        : err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await import('firebase/firestore').then(firebase => firebase.getDoc(userDocRef));

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          displayName: user.displayName || 'User',
          email: user.email,
          photoURL: user.photoURL,
          ai_enabled: true,
          onboarded: false,
          premium_access: false,
          role: null,
          created_at: serverTimestamp(),
        });
      }
      // Redirect handled by useEffect
    } catch (err: any) {
      setError(err.code === 'auth/popup-closed-by-user'
        ? 'Sign-in cancelled'
        : 'Google sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = loginEmail;
    if (!email || validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError('Failed to send reset email. Try again.');
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError(null);
    setLoginEmail('');
    setLoginPassword('');
    setSignupDisplayName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-700 font-medium">Loading Lifepoint...</p>
        </div>
      </div>
    );
  }

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignup ? 'Join Lifepoint' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isSignup ? 'Start your faith & growth journey today' : 'Sign in to continue growing'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-4 text-sm text-gray-500 bg-white">or</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {error && (
            <div className={`p-4 rounded-lg text-sm ${error.includes('sent') || error.includes('cancelled') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {error}
            </div>
          )}

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-5">
            {isSignup && (
              <input
                type="text"
                placeholder="Full Name"
                value={signupDisplayName}
                onChange={(e) => setSignupDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={isSignup ? signupEmail : loginEmail}
              onChange={(e) => isSignup ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={loading}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={isSignup ? signupPassword : loginPassword}
                onChange={(e) => isSignup ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>

            {isSignup && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-60"
            >
              {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button onClick={toggleMode} className="text-red-600 font-medium hover:underline">
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {!isSignup && (
            <div className="mt-4 text-center">
              <button onClick={handleForgotPassword} className="text-sm text-red-600 hover:underline">
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-red-600 underline">Terms</a> and{' '}
          <a href="/privacy" className="text-red-600 underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}