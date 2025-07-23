"use client";

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
    t
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

  const handleInputChange = (field: keyof typeof localSettings, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('generalSettings')}</h1>
          <p className="text-muted-foreground">Configure global settings for currency, timezone, and language</p>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      {/* Error Message */}
      {(error || contextError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-between">
          <span>{error || contextError}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Settings */}
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-6 w-6 text-green-500 mr-3" />
            <h2 className="text-lg font-semibold text-foreground">{t('currency')} {t('settings')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('currency')}
              </label>
              <select
                value={localSettings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input text-foreground"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground mt-1">
                This will be used for all financial calculations and displays
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Current:</strong> {getCurrencySymbol()} {CURRENCIES.find(c => c.code === settings.currency)?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Timezone Settings */}
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-lg font-semibold text-foreground">{t('timezone')} {t('settings')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Default Timezone
              </label>
              <select
                value={localSettings.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input text-foreground"
              >
                {TIMEZONES.map((timezone) => (
                  <option key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground mt-1">
                This affects all timestamps and scheduling
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Current:</strong> {getTimezoneLabel()}
              </p>
              <p className="text-sm text-muted-foreground">
                Local time: {new Date().toLocaleString('en-US', { timeZone: settings.timezone })}
              </p>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-purple-500 mr-3" />
            <h2 className="text-lg font-semibold text-foreground">{t('language')} {t('settings')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('language')}
              </label>
              <select
                value={localSettings.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input text-foreground"
              >
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.name} ({language.code})
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground mt-1">
                This affects the interface language and date/number formats
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Current:</strong> {getLanguageName()}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Overview */}
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('settings')} Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">{t('currency')}</span>
              <span className="text-sm font-medium text-foreground">
                {getCurrencySymbol()} {settings.currency}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Timezone</span>
              <span className="text-sm font-medium text-foreground">{settings.timezone}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">{t('language')}</span>
              <span className="text-sm font-medium text-foreground">
                {getLanguageName()}
              </span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Changes to these settings will affect all users and financial calculations throughout the system.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('save')} {t('settings')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}