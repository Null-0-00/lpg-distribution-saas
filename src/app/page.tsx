import Link from 'next/link';
import { APP_CONFIG } from '@/lib/utils/constants';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { HomePageClient } from '@/components/pages/HomePageClient';

export default async function Home() {
  try {
    const session = await auth();

    if (session?.user) {
      console.log('🏠 Home page user role:', session.user.role);
      // Redirect super admins to super admin dashboard
      if (session.user.role === 'SUPER_ADMIN') {
        console.log('🔄 Redirecting super admin to /super-admin');
        redirect('/super-admin');
      } else {
        console.log('🔄 Redirecting regular user to /dashboard');
        redirect('/dashboard');
      }
    }
  } catch (error) {
    // Check if this is a Next.js redirect (which is expected)
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.includes('NEXT_REDIRECT')
    ) {
      // This is a normal redirect, re-throw it to allow the redirect to happen
      throw error;
    }
    console.error('🚨 Home page auth error:', error);
    // Continue to show home page if auth fails
  }

  return <HomePageClient />;
}
