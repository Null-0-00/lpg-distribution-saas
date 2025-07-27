import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface OnboardingStatus {
  completed: boolean;
  loading: boolean;
}

export function useOnboarding(): OnboardingStatus & {
  checkOnboardingStatus: () => Promise<void>;
} {
  const { data: session, status } = useSession();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    completed: false,
    loading: true,
  });

  const checkOnboardingStatus = async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setOnboardingStatus({ completed: false, loading: false });
      return;
    }

    try {
      const response = await fetch('/api/onboarding/status');
      if (response.ok) {
        const data = await response.json();
        setOnboardingStatus({
          completed: data.completed,
          loading: false,
        });
      } else {
        setOnboardingStatus({ completed: false, loading: false });
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingStatus({ completed: false, loading: false });
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, [session, status]);

  return {
    ...onboardingStatus,
    checkOnboardingStatus,
  };
}
