/**
 * Enhanced Translation Hook
 *
 * Provides translation functionality with component context for better error tracking
 */

import { useSettings } from '@/contexts/SettingsContext';
import { getTranslation, Translations } from '@/lib/i18n/translations';

export interface UseTranslationOptions {
  component?: string;
  fallbackLanguage?: string;
}

export function useTranslation(options: UseTranslationOptions = {}) {
  const { settings } = useSettings();
  const { component, fallbackLanguage = 'en' } = options;

  /**
   * Get translation with component context
   */
  const t = (key: keyof Translations): string => {
    return getTranslation(settings.language, key, component);
  };

  /**
   * Get translation with explicit language override
   */
  const tLang = (key: keyof Translations, language: string): string => {
    return getTranslation(language, key, component);
  };

  /**
   * Get translation with fallback to specific language
   */
  const tWithFallback = (
    key: keyof Translations,
    fallback?: string
  ): string => {
    const translation = getTranslation(settings.language, key, component);

    // If translation equals the key (meaning it wasn't found), try fallback
    if (translation === key && fallback) {
      return getTranslation(fallback, key, component);
    }

    return translation;
  };

  /**
   * Check if a translation key exists
   */
  const hasTranslation = (
    key: keyof Translations,
    language?: string
  ): boolean => {
    const lang = language || settings.language;
    const translation = getTranslation(lang, key, component);
    return translation !== key; // If translation equals key, it means it wasn't found
  };

  /**
   * Get current language
   */
  const currentLanguage = settings.language;

  /**
   * Check if current language is RTL (Right-to-Left)
   */
  const isRTL =
    currentLanguage === 'ar' ||
    currentLanguage === 'he' ||
    currentLanguage === 'fa';

  return {
    t,
    tLang,
    tWithFallback,
    hasTranslation,
    currentLanguage,
    isRTL,
    // Expose settings for advanced use cases
    formatCurrency: useSettings().formatCurrency,
    formatDate: useSettings().formatDate,
    formatDateTime: useSettings().formatDateTime,
    formatTime: useSettings().formatTime,
  };
}

/**
 * Hook for translation debugging and monitoring
 */
export function useTranslationDebug() {
  const {
    getTranslationErrors,
    getTranslationErrorStats,
    clearTranslationErrors,
    checkTranslationConsistency,
    generateMissingTranslationKeys,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require('@/lib/i18n/translations');

  return {
    getErrors: getTranslationErrors,
    getErrorStats: getTranslationErrorStats,
    clearErrors: clearTranslationErrors,
    checkConsistency: checkTranslationConsistency,
    getMissingKeys: generateMissingTranslationKeys,
  };
}
