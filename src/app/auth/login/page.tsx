'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession, getSession } from 'next-auth/react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { AuthTopToggles } from '@/components/ui/AuthTopToggles';

function LoginForm() {
  const { t, currentLanguage } = useTranslation({ component: 'LoginPage' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  console.log('LoginForm - Current language:', currentLanguage);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Handle success messages
  useEffect(() => {
    const successMessage = searchParams.get('message');
    if (successMessage) {
      setMessage(successMessage);
    }
  }, [searchParams]);

  // Simple redirect logic - only run once when fully authenticated
  useEffect(() => {
    if (
      status === 'authenticated' &&
      session?.user?.email &&
      !redirecting &&
      !loading
    ) {
      console.log('🔄 Authenticated user detected, redirecting...');
      setRedirecting(true);

      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

      // Immediate redirect without any delays
      window.location.replace(callbackUrl);
    }
  }, [status, session, redirecting, loading, searchParams]);

  // Don't render anything if we're redirecting or if already authenticated
  if (redirecting || (status === 'authenticated' && session?.user?.email)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || redirecting) return;

    setLoading(true);
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please enter ' + t('email') + ' and password');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid ' + t('email') + ' address');
      setLoading(false);
      return;
    }

    try {
      console.log('🔑 Starting sign-in process for:', email);

      // Use NextAuth signIn with redirect: true for simplicity
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: searchParams.get('callbackUrl') || '/dashboard',
        redirect: false, // We'll handle redirect manually after verification
      });

      console.log('📋 Sign-in attempt result:', result);

      if (result?.error) {
        console.error('❌ Sign-in failed:', result.error);
        setError(
          'Invalid email or password. Please check your credentials and try again.'
        );
        setLoading(false);
      } else if (result?.ok) {
        console.log('✅ Sign-in successful, verifying session...');

        // Wait a moment for the session to be established, then check it
        setTimeout(async () => {
          try {
            const newSession = await getSession();
            console.log('🔍 Session check:', newSession);

            if (newSession?.user?.email) {
              console.log('✅ Session confirmed, redirecting...');
              const callbackUrl =
                searchParams.get('callbackUrl') || '/dashboard';
              window.location.replace(callbackUrl);
            } else {
              console.log('❌ Session not established');
              setError('Authentication failed. Please try again.');
              setLoading(false);
            }
          } catch (sessionError) {
            console.error('🚨 Session verification error:', sessionError);
            setError('Authentication verification failed. Please try again.');
            setLoading(false);
          }
        }, 1000);
      } else {
        console.error('❓ Unexpected sign-in result:', result);
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('🚨 Sign-in error:', error);
      setError('An error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  // Render loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 transition-colors sm:px-6 lg:px-8 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 transition-colors sm:px-6 lg:px-8 dark:bg-gray-900">
      <AuthTopToggles />

      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('signInToYourAccount')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('createYourAccount')}
            </Link>
          </p>
        </div>

        {message && (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/50">
            <p className="text-sm text-green-600 dark:text-green-400">
              {message}
            </p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('emailAddress')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder={t('emailAddress')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 transition-colors focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/50">
              <div className="text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                disabled={loading}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900 dark:text-white"
              >
                {t('rememberMe')}
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t('forgotPassword')}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || redirecting}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? t('signingIn') : t('login')}
            </button>
          </div>
        </form>

        {/* Test Credentials Helper for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/50">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {t('testCredentials')}: admin@demo.com / admin123
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
