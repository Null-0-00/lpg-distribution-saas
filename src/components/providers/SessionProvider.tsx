'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider
      // Refetch session when window becomes visible
      refetchOnWindowFocus={true}
      // Keep session updated
      refetchInterval={5 * 60} // 5 minutes
      // Handle network errors gracefully
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
