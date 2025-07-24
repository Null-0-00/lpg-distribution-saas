'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page with any query parameters
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get('callbackUrl') || '/dashboard';

    router.replace(`/auth/login?callbackUrl=${encodeURIComponent(redirectTo)}`);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
