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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[3fr_2fr] bg-white">
      {/* Left Column: Form */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-gray-600">
              {isSignup
                ? 'Join our community and start your journey today.'
                : 'Enter your details to access your account.'}
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-60 shadow-sm"
            >
              <FcGoogle className="w-5 h-5" />
              <span className="text-sm font-semibold">Continue with Google</span>
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-1 border-t border-gray-100" />
              <span className="px-4 text-xs font-medium text-gray-400 bg-white">or</span>
              <div className="flex-1 border-t border-gray-100" />
            </div>

            {error && (
              <div className={`p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-1 duration-200 ${error.includes('sent') || error.includes('cancelled') ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                {error}
              </div>
            )}

            <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={signupDisplayName}
                    onChange={(e) => setSignupDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all placeholder-gray-400 text-sm"
                    disabled={loading}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={isSignup ? signupEmail : loginEmail}
                  onChange={(e) => isSignup ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all placeholder-gray-400 text-sm"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  {!isSignup && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-semibold text-gray-500 hover:text-black transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={isSignup ? signupPassword : loginPassword}
                    onChange={(e) => isSignup ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all placeholder-gray-400 text-sm"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                  </button>
                </div>
              </div>

              {isSignup && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all placeholder-gray-400 text-sm"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all duration-200 disabled:opacity-60 shadow-lg shadow-black/10 mt-2"
              >
                {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={toggleMode}
                className="font-bold text-black hover:underline underline-offset-4"
              >
                {isSignup ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          <p className="text-center text-[10px] uppercase tracking-widest text-gray-400 mt-12">
            By continuing, you agree to our{' '}
            <a href="/terms" className="hover:text-black transition-colors">Terms</a> &{' '}
            <a href="/privacy" className="hover:text-black transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block relative overflow-hidden bg-gray-100">
        <img
          src="/auth-bg.png"
          alt="Abstract Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="backdrop-blur-md bg-white/10 p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold mb-2">Empowering Your Spiritual Journey</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Join thousands of others in discovering purpose, finding community, and growing in wisdom through our integrated platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
