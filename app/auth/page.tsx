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
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/context/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { user, onboardingComplete, role, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });

  // Signup form state
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupErrors, setSignupErrors] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Redirect if already signed-in
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      if (!onboardingComplete) router.replace('/onboarding');
      else router.replace(`/dashboard/${role || 'user'}`);
    }
  }, [user, onboardingComplete, role, authLoading, router]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Enter a valid email address';
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateLogin = () => {
    let valid = true;
    const emailError = validateEmail(loginEmail);
    const passwordError = validatePassword(loginPassword);

    setLoginErrors({ email: emailError || '', password: passwordError || '' });

    if (emailError || passwordError) valid = false;
    return valid;
  };

  const validateSignup = () => {
    let valid = true;
    const displayNameError = signupDisplayName.trim() ? '' : 'Full name is required';
    const emailError = validateEmail(signupEmail);
    const passwordError = validatePassword(signupPassword);
    const confirmPasswordError =
      signupPassword !== signupConfirmPassword ? 'Passwords do not match' : '';

    setSignupErrors({
      displayName: displayNameError,
      email: emailError || '',
      password: passwordError || '',
      confirmPassword: confirmPasswordError || '',
    });

    if (displayNameError || emailError || passwordError || confirmPasswordError) valid = false;
    return valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateLogin()) return;

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      if (credential.user) {
        const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (!data.onboarded) router.replace('/onboarding');
          else router.replace(`/dashboard/${data.role || 'user'}`);
        } else {
          router.replace('/onboarding');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateSignup()) return;

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      if (credential.user) {
        await updateProfile(credential.user, { displayName: signupDisplayName.trim() });
        await setDoc(doc(db, 'users', credential.user.uid), {
          displayName: signupDisplayName.trim(),
          email: signupEmail,
          ai_enabled: true,
          onboarded: false,
          premium_access: false,
          role: null,
          created_at: serverTimestamp(),
        });
        router.replace('/onboarding');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const user = credential.user;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            displayName: user.displayName || 'No Name',
            email: user.email,
            ai_enabled: true,
            onboarded: false,
            premium_access: false,
            role: null,
            created_at: serverTimestamp(),
          });
          router.replace('/onboarding');
        } else {
          const data = userDoc.data();
          if (!data.onboarded) router.replace('/onboarding');
          else router.replace(`/dashboard/${data.role || 'user'}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = loginEmail || signupEmail;
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setError(null);
    setLoginEmail('');
    setLoginPassword('');
    setLoginErrors({ email: '', password: '' });
    setSignupDisplayName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupErrors({ displayName: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Preparing your workspace…</p>
        </div>
      </div>
    );
  }

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isSignup ? 'Start your learning journey today' : 'Sign in to continue your learning'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60"
          >
            <FcGoogle className="h-5 w-5 mr-3" />
            {isSignup ? 'Sign up with Google' : 'Sign in with Google'}
          </button>

          {/* Divider */}
          <div className="mt-6 mb-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={isSignup ? handleSignup : handleLogin}
            className="space-y-4"
          >
            {isSignup && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={signupDisplayName}
                  onChange={(e) => setSignupDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    signupErrors.displayName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {signupErrors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{signupErrors.displayName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={isSignup ? signupEmail : loginEmail}
                onChange={(e) => isSignup ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  (isSignup ? signupErrors.email : loginErrors.email) ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {(isSignup ? signupErrors.email : loginErrors.email) && (
                <p className="mt-1 text-sm text-red-600">
                  {isSignup ? signupErrors.email : loginErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={isSignup ? signupPassword : loginPassword}
                  onChange={(e) => isSignup ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    (isSignup ? signupErrors.password : loginErrors.password) ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400" /> : <AiOutlineEye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {(isSignup ? signupErrors.password : loginErrors.password) && (
                <p className="mt-1 text-sm text-red-600">{isSignup ? signupErrors.password : loginErrors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      signupErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showConfirmPassword ? <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400" /> : <AiOutlineEye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                {signupErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{signupErrors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60"
            >
              {loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Create account' : 'Sign in')}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {isSignup ? 'Already have an account?' : 'Don’t have an account?'}{' '}
            <button type="button" onClick={toggleMode} className="text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:underline" disabled={loading}>
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          {/* Forgot password */}
          {!isSignup && (
            <div className="mt-4 text-center">
              <button type="button" className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline" onClick={handleForgotPassword} disabled={loading}>
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="text-center text-sm text-gray-500">
          By continuing, you agree to Lifepoint’s{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">Terms of Service</a> and{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
