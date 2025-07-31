'use client';

import { useState, useEffect } from 'react';
import { Settings, Globe, DollarSign, Clock, Save, X } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { CURRENCIES, TIMEZONES, LANGUAGES } from '@/types/settings';

export default function SettingsPage() {
  const {
    settings,
    loading,
    error: contextError,
    updateSettings,
    getCurrencySymbol,
    getTimezoneLabel,
    getLanguageName,
    t,
  } = useSettings();

  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update local settings when context settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await updateSettings(localSettings);

      setSuccess(t('saveSuccess'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Settings save error:', err);
      setError(err instanceof Error ? err.message : t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof localSettings,
    value: string
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="bg-muted mb-2 h-8 w-48 animate-pulse rounded"></div>
            <div className="bg-muted h-5 w-80 animate-pulse rounded"></div>
          </div>
          <div className="bg-muted h-6 w-6 animate-pulse rounded"></div>
        </div>

        {/* Settings Form Skeleton */}
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="space-y-6">
            {/* Section 1 - Currency Settings */}
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="bg-muted h-5 w-5 animate-pulse rounded"></div>
                <div className="bg-muted h-6 w-32 animate-pulse rounded"></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="bg-muted mb-2 h-4 w-20 animate-pulse rounded"></div>
                  <div className="bg-muted h-10 w-full animate-pulse rounded"></div>
                </div>
                <div>
                  <div className="bg-muted mb-2 h-4 w-24 animate-pulse rounded"></div>
                  <div className="bg-muted h-10 w-full animate-pulse rounded"></div>
                </div>
              </div>
            </div>

            {/* Section 2 - Regional Settings */}
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="bg-muted h-5 w-5 animate-pulse rounded"></div>
                <div className="bg-muted h-6 w-32 animate-pulse rounded"></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="bg-muted mb-2 h-4 w-20 animate-pulse rounded"></div>
                  <div className="bg-muted h-10 w-full animate-pulse rounded"></div>
                </div>
                <div>
                  <div className="bg-muted mb-2 h-4 w-20 animate-pulse rounded"></div>
                  <div className="bg-muted h-10 w-full animate-pulse rounded"></div>
                </div>
              </div>
            </div>

            {/* Section 3 - Display Settings */}
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="bg-muted h-5 w-5 animate-pulse rounded"></div>
                <div className="bg-muted h-6 w-32 animate-pulse rounded"></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="bg-muted mb-2 h-4 w-24 animate-pulse rounded"></div>
                  <div className="bg-muted h-10 w-full animate-pulse rounded"></div>
                </div>
                <div>
                  <div className="bg-muted mb-2 h-4 w-28 animate-pulse rounded"></div>
                  <div className="bg-muted h-10 w-full animate-pulse rounded"></div>
                </div>
              </div>
            </div>

            {/* Save Button Skeleton */}
            <div className="flex justify-end pt-4">
              <div className="bg-muted h-10 w-24 animate-pulse rounded"></div>
            </div>
          </div>
        </div>

        {/* Settings Preview Skeleton */}
        <div className="bg-card border-border rounded-lg border p-6 shadow transition-colors">
          <div className="bg-muted mb-4 h-6 w-32 animate-pulse rounded"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="bg-muted h-4 w-32 animate-pulse rounded"></div>
                <div className="bg-muted h-4 w-24 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            {t('generalSettings')}
          </h1>
          <p className="text-muted-foreground">
            Configure global settings for currency, timezone, and language
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="text-muted-foreground h-6 w-6" />
        </div>
      </div>

      {/* Error Message */}
      {(error || contextError) && (
        <div className="flex items-center justify-between rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <span>{error || contextError}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center justify-between rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Settings Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Currency Settings */}
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="mb-4 flex items-center">
            <DollarSign className="mr-3 h-6 w-6 text-green-500" />
            <h2 className="text-foreground text-lg font-semibold">
              {t('currency')} {t('settings')}
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                {t('currency')}
              </label>
              <select
                value={localSettings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
              <p className="text-muted-foreground mt-1 text-sm">
                This will be used for all financial calculations and displays
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-sm">
                <strong>Current:</strong> {getCurrencySymbol()}{' '}
                {CURRENCIES.find((c) => c.code === settings.currency)?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Timezone Settings */}
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="mb-4 flex items-center">
            <Clock className="mr-3 h-6 w-6 text-blue-500" />
            <h2 className="text-foreground text-lg font-semibold">
              {t('timezone')} {t('settings')}
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                Default Timezone
              </label>
              <select
                value={localSettings.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIMEZONES.map((timezone) => (
                  <option key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </option>
                ))}
              </select>
              <p className="text-muted-foreground mt-1 text-sm">
                This affects all timestamps and scheduling
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-sm">
                <strong>Current:</strong> {getTimezoneLabel()}
              </p>
              <p className="text-muted-foreground text-sm">
                Local time:{' '}
                {new Date().toLocaleString('en-US', {
                  timeZone: settings.timezone,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="mb-4 flex items-center">
            <Globe className="mr-3 h-6 w-6 text-purple-500" />
            <h2 className="text-foreground text-lg font-semibold">
              {t('language')} {t('settings')}
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground mb-2 block text-sm font-medium">
                {t('language')}
              </label>
              <select
                value={localSettings.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="border-border bg-input text-foreground w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.name} ({language.code})
                  </option>
                ))}
              </select>
              <p className="text-muted-foreground mt-1 text-sm">
                This affects the interface language and date/number formats
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-sm">
                <strong>Current:</strong> {getLanguageName()}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Overview */}
        <div className="bg-card rounded-lg p-6 shadow">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            {t('settings')} Overview
          </h2>
          <div className="space-y-3">
            <div className="border-border flex items-center justify-between border-b py-2">
              <span className="text-muted-foreground text-sm">
                {t('currency')}
              </span>
              <span className="text-foreground text-sm font-medium">
                {getCurrencySymbol()} {settings.currency}
              </span>
            </div>
            <div className="border-border flex items-center justify-between border-b py-2">
              <span className="text-muted-foreground text-sm">Timezone</span>
              <span className="text-foreground text-sm font-medium">
                {settings.timezone}
              </span>
            </div>
            <div className="border-border flex items-center justify-between border-b py-2">
              <span className="text-muted-foreground text-sm">
                {t('language')}
              </span>
              <span className="text-foreground text-sm font-medium">
                {getLanguageName()}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Changes to these settings will affect all
              users and financial calculations throughout the system.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('save')} {t('settings')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
