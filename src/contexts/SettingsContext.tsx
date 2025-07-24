'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  SettingsData,
  CURRENCIES,
  TIMEZONES,
  LANGUAGES,
} from '@/types/settings';
import { getTranslation, Translations } from '@/lib/i18n/translations';

interface SettingsContextType {
  settings: SettingsData;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: SettingsData) => Promise<void>;
  refreshSettings: () => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatDateTime: (date: Date | string) => string;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  getCurrencySymbol: () => string;
  getTimezoneLabel: () => string;
  getLanguageName: () => string;
  t: (key: keyof Translations) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SettingsData>({
    currency: 'BDT', // Better default for LPG distributors in Bangladesh
    timezone: 'Asia/Dhaka', // Better default timezone
    language: 'en',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/settings');

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // User is not authorized, use better defaults for LPG distributors
          setSettings({
            currency: 'BDT',
            timezone: 'Asia/Dhaka',
            language: 'en',
          });
          return;
        }
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Settings fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Use better defaults on error for LPG distributors
      setSettings({
        currency: 'BDT',
        timezone: 'Asia/Dhaka',
        language: 'en',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: SettingsData) => {
    try {
      setError(null);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
    } catch (err) {
      console.error('Settings update error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  const formatCurrency = (amount: number): string => {
    const currency = CURRENCIES.find((c) => c.code === settings.currency);
    const symbol = currency?.symbol || '৳'; // Default to BDT symbol

    try {
      // For BDT, use custom formatting since Intl might not support it properly
      if (settings.currency === 'BDT') {
        return `${amount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${symbol}`;
      }

      return new Intl.NumberFormat(
        settings.language === 'bn' ? 'bn-BD' : 'en-US',
        {
          style: 'currency',
          currency: settings.currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ).format(amount);
    } catch {
      // Fallback if Intl.NumberFormat fails
      return `${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${symbol}`;
    }
  };

  const formatDateTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    try {
      return new Intl.DateTimeFormat(settings.language, {
        timeZone: settings.timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(dateObj);
    } catch {
      // Fallback
      return dateObj.toLocaleString();
    }
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    try {
      // Use explicit format for consistent display regardless of browser locale
      return new Intl.DateTimeFormat('en-US', {
        timeZone: settings.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(dateObj);
    } catch {
      // Fallback to explicit US format
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }
  };

  const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    try {
      return new Intl.DateTimeFormat(settings.language, {
        timeZone: settings.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(dateObj);
    } catch {
      // Fallback
      return dateObj.toLocaleTimeString();
    }
  };

  const getCurrencySymbol = (): string => {
    const currency = CURRENCIES.find((c) => c.code === settings.currency);
    return currency?.symbol || '$';
  };

  const getTimezoneLabel = (): string => {
    const timezone = TIMEZONES.find((t) => t.value === settings.timezone);
    return timezone?.label || settings.timezone;
  };

  const getLanguageName = (): string => {
    const language = LANGUAGES.find((l) => l.code === settings.language);
    return language?.name || 'English';
  };

  const t = (key: keyof Translations): string => {
    return getTranslation(settings.language, key);
  };

  useEffect(() => {
    // Only fetch settings if we're not on the auth pages
    const isAuthPage =
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/auth/') ||
        window.location.pathname === '/');

    if (!isAuthPage) {
      fetchSettings();
    } else {
      // Use defaults for auth pages and set loading to false
      setLoading(false);
    }
  }, []);

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings,
    formatCurrency,
    formatDateTime,
    formatDate,
    formatTime,
    getCurrencySymbol,
    getTimezoneLabel,
    getLanguageName,
    t,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
