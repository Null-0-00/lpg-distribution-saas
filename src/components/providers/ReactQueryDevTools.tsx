'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const ReactQueryDevTools: React.FC = () => {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [mounted, setMounted] = React.useState(false);

  // Check if QueryClient is available
  let queryClient;
  try {
    queryClient = useQueryClient();
  } catch (error) {
    // If useQueryClient throws, QueryClient is not available
    queryClient = null;
  }

  const DevToolsComponent = React.useMemo(() => {
    // Only import the devtools if we're in development mode and mounted
    if (typeof window !== 'undefined' && mounted) {
      return React.lazy(() =>
        import('@tanstack/react-query-devtools').then((module) => ({
          default: module.ReactQueryDevtools,
        }))
      );
    }
    return null;
  }, [mounted]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Only render if QueryClient is available, component is mounted, and we have the DevToolsComponent
  if (!queryClient || !mounted || !DevToolsComponent) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      {DevToolsComponent && <DevToolsComponent initialIsOpen={false} />}
    </React.Suspense>
  );
};
