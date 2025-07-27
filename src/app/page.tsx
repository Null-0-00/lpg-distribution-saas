import Link from 'next/link';
import { APP_CONFIG } from '@/lib/utils/constants';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { HomePageClient } from '@/components/pages/HomePageClient';

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return <HomePageClient />;
}
