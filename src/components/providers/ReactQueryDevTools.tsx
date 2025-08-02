'use client';

import React from 'react';

// Component to safely render React Query DevTools
const DevToolsInternal: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);

  const DevToolsComponent = React.useMemo(() => {
    // Only import the devtools if we're in development mode and mounted
    if (
      typeof window !== 'undefined' &&
      mounted &&
      process.env.NODE_ENV === 'development'
    ) {
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

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Only render if component is mounted and we have the DevToolsComponent
  if (!mounted || !DevToolsComponent) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <DevToolsComponent initialIsOpen={false} />
    </React.Suspense>
  );
};

export const ReactQueryDevTools: React.FC = () => {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <DevToolsInternal />;
};
