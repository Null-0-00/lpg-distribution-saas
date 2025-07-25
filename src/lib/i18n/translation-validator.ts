/**
 * Enhanced Translation Validation and Fallback System
 *
 * This module provides comprehensive validation, error handling, and fallback
 * mechanisms for the translation system to ensure robust internationalization.
 */

import { Translations } from './translations';

// Translation error types
export enum TranslationErrorType {
  MISSING_KEY = 'missing_key',
  INVALID_FORMAT = 'invalid_format',
  LOADING_FAILED = 'loading_failed',
  INVALID_LANGUAGE = 'invalid_language',
  EMPTY_TRANSLATION = 'empty_translation',
  FALLBACK_USED = 'fallback_used',
}

// Translation error interface
export interface TranslationError {
  type: TranslationErrorType;
  key: string;
  locale: string;
  component?: string;
  timestamp: Date;
  fallbackUsed: string;
  originalError?: Error;
}

// Translation validation result
export interface ValidationResult {
  isValid: boolean;
  errors: TranslationError[];
  warnings: string[];
}

// Translation consistency report
export interface ConsistencyReport {
  totalKeys: number;
  consistentKeys: number;
  inconsistentKeys: string[];
  missingInLanguages: Record<string, string[]>;
  emptyTranslations: Record<string, string[]>;
  duplicateValues: Record<string, string[]>;
}

// Translation logger class
class TranslationLogger {
  private errors: TranslationError[] = [];
  private maxErrors = 1000; // Prevent memory leaks
  private logToConsole = process.env.NODE_ENV === 'development';

  logError(error: TranslationError): void {
    // Add to internal log
    this.errors.push(error);

    // Keep only recent errors to prevent memory issues
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (this.logToConsole) {
      const message = `[Translation ${error.type.toUpperCase()}] Key: "${error.key}", Locale: "${error.locale}", Fallback: "${error.fallbackUsed}"`;

      switch (error.type) {
        case TranslationErrorType.MISSING_KEY:
        case TranslationErrorType.EMPTY_TRANSLATION:
          console.warn(message);
          break;
        case TranslationErrorType.INVALID_FORMAT:
        case TranslationErrorType.LOADING_FAILED:
        case TranslationErrorType.INVALID_LANGUAGE:
          console.error(message, error.originalError);
          break;
        case TranslationErrorType.FALLBACK_USED:
          console.info(message);
          break;
      }
    }

    // In production, you might want to send errors to a monitoring service
    if (
      process.env.NODE_ENV === 'production' &&
      this.shouldReportError(error)
    ) {
      this.reportToMonitoring(error);
    }
  }

  private shouldReportError(error: TranslationError): boolean {
    // Only report critical errors in production
    return [
      TranslationErrorType.LOADING_FAILED,
      TranslationErrorType.INVALID_FORMAT,
    ].includes(error.type);
  }

  private reportToMonitoring(error: TranslationError): void {
    // Placeholder for monitoring service integration
    // You could integrate with services like Sentry, LogRocket, etc.
    console.error('[Translation Monitoring]', error);
  }

  getErrors(): TranslationError[] {
    return [...this.errors];
  }

  getErrorsByType(type: TranslationErrorType): TranslationError[] {
    return this.errors.filter((error) => error.type === type);
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrorStats(): Record<TranslationErrorType, number> {
    const stats = {} as Record<TranslationErrorType, number>;

    Object.values(TranslationErrorType).forEach((type) => {
      stats[type] = 0;
    });

    this.errors.forEach((error) => {
      stats[error.type]++;
    });

    return stats;
  }
}

// Global translation logger instance
export const translationLogger = new TranslationLogger();

// Enhanced translation validator class
export class TranslationValidator {
  private translations: Record<string, Translations>;
  private primaryLanguage: string;

  constructor(
    translations: Record<string, Translations>,
    primaryLanguage = 'en'
  ) {
    this.translations = translations;
    this.primaryLanguage = primaryLanguage;
  }

  /**
   * Validates a translation key exists in the primary language
   */
  validateKey(key: string): boolean {
    const primaryTranslations = this.translations[this.primaryLanguage];
    return primaryTranslations && key in primaryTranslations;
  }

  /**
   * Validates a specific translation value
   */
  validateTranslation(
    key: string,
    value: string,
    locale: string
  ): ValidationResult {
    const errors: TranslationError[] = [];
    const warnings: string[] = [];

    // Check if key exists
    if (!this.validateKey(key)) {
      errors.push({
        type: TranslationErrorType.MISSING_KEY,
        key,
        locale,
        timestamp: new Date(),
        fallbackUsed: key,
      });
    }

    // Check if translation is empty
    if (!value || value.trim().length === 0) {
      errors.push({
        type: TranslationErrorType.EMPTY_TRANSLATION,
        key,
        locale,
        timestamp: new Date(),
        fallbackUsed: this.getFallbackValue(key),
      });
    }

    // Check for potential formatting issues
    if (value && this.hasFormatIssues(value)) {
      warnings.push(
        `Potential formatting issues in translation for key "${key}" in locale "${locale}"`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Checks translation consistency across all languages
   */
  checkConsistency(): ConsistencyReport {
    const primaryTranslations = this.translations[this.primaryLanguage];
    if (!primaryTranslations) {
      throw new Error(`Primary language "${this.primaryLanguage}" not found`);
    }

    const allKeys = Object.keys(primaryTranslations);
    const languages = Object.keys(this.translations);

    const report: ConsistencyReport = {
      totalKeys: allKeys.length,
      consistentKeys: 0,
      inconsistentKeys: [],
      missingInLanguages: {},
      emptyTranslations: {},
      duplicateValues: {},
    };

    // Initialize language-specific arrays
    languages.forEach((lang) => {
      report.missingInLanguages[lang] = [];
      report.emptyTranslations[lang] = [];
      report.duplicateValues[lang] = [];
    });

    // Check each key across all languages
    allKeys.forEach((key) => {
      let isConsistent = true;
      const values: Record<string, string> = {};

      languages.forEach((lang) => {
        const translations = this.translations[lang];
        const value = translations?.[key as keyof Translations];

        if (!value) {
          report.missingInLanguages[lang].push(key);
          isConsistent = false;
        } else if (value.trim().length === 0) {
          report.emptyTranslations[lang].push(key);
          isConsistent = false;
        } else {
          values[lang] = value;
        }
      });

      // Check for duplicate values within a language
      Object.entries(values).forEach(([lang, value]) => {
        const duplicates = Object.entries(values)
          .filter(
            ([otherLang, otherValue]) =>
              otherLang !== lang && otherValue === value
          )
          .map(([otherLang]) => otherLang);

        if (duplicates.length > 0) {
          report.duplicateValues[lang].push(
            `${key} (same as ${duplicates.join(', ')})`
          );
        }
      });

      if (isConsistent) {
        report.consistentKeys++;
      } else {
        report.inconsistentKeys.push(key);
      }
    });

    return report;
  }

  /**
   * Generates missing translation keys for a target language
   */
  generateMissingKeys(targetLocale: string): string[] {
    const primaryTranslations = this.translations[this.primaryLanguage];
    const targetTranslations = this.translations[targetLocale];

    if (!primaryTranslations) {
      return [];
    }

    const allKeys = Object.keys(primaryTranslations);

    if (!targetTranslations) {
      return allKeys;
    }

    return allKeys.filter(
      (key) =>
        !targetTranslations[key as keyof Translations] ||
        targetTranslations[key as keyof Translations].trim().length === 0
    );
  }

  /**
   * Gets a fallback value for a missing translation
   */
  private getFallbackValue(key: string): string {
    const primaryTranslations = this.translations[this.primaryLanguage];
    return primaryTranslations?.[key as keyof Translations] || key;
  }

  /**
   * Checks for potential formatting issues in translations
   */
  private hasFormatIssues(value: string): boolean {
    // Check for common formatting issues
    const issues = [
      // Unmatched brackets
      /\{[^}]*$/.test(value) || /^[^{]*\}/.test(value),
      // Suspicious HTML tags
      /<[^>]*$/.test(value) || /^[^<]*>/.test(value),
      // Multiple consecutive spaces
      /\s{3,}/.test(value),
      // Leading/trailing whitespace (might be intentional, so just flag)
      /^\s|\s$/.test(value),
    ];

    return issues.some((issue) => issue);
  }
}

// Enhanced fallback system
export class TranslationFallbackSystem {
  private translations: Record<string, Translations>;
  private fallbackChain: string[];
  private validator: TranslationValidator;

  constructor(
    translations: Record<string, Translations>,
    fallbackChain: string[] = ['en', 'bn']
  ) {
    this.translations = translations;
    this.fallbackChain = fallbackChain;
    this.validator = new TranslationValidator(translations);
  }

  /**
   * Gets a translation with comprehensive fallback handling
   */
  getTranslation(key: string, locale: string, component?: string): string {
    try {
      // Validate inputs
      if (!key || typeof key !== 'string') {
        const error: TranslationError = {
          type: TranslationErrorType.INVALID_FORMAT,
          key: String(key) || '[INVALID_KEY]',
          locale,
          component,
          timestamp: new Date(),
          fallbackUsed: '[INVALID_KEY]',
          originalError: new Error('Invalid key parameter'),
        };
        translationLogger.logError(error);
        return '[INVALID_KEY]';
      }

      if (!locale || typeof locale !== 'string') {
        const error: TranslationError = {
          type: TranslationErrorType.INVALID_LANGUAGE,
          key,
          locale: String(locale) || '[INVALID_LOCALE]',
          component,
          timestamp: new Date(),
          fallbackUsed: this.getFallbackTranslation(key),
          originalError: new Error('Invalid locale parameter'),
        };
        translationLogger.logError(error);
        return this.getFallbackTranslation(key);
      }

      // Try to get translation from requested locale
      const requestedTranslation = this.getTranslationFromLocale(key, locale);
      if (requestedTranslation) {
        return requestedTranslation;
      }

      // Log missing translation and try fallback chain
      const error: TranslationError = {
        type: TranslationErrorType.MISSING_KEY,
        key,
        locale,
        component,
        timestamp: new Date(),
        fallbackUsed: '',
      };

      // Try fallback chain
      for (const fallbackLocale of this.fallbackChain) {
        if (fallbackLocale === locale) continue; // Skip if same as requested

        const fallbackTranslation = this.getTranslationFromLocale(
          key,
          fallbackLocale
        );
        if (fallbackTranslation) {
          error.fallbackUsed = fallbackTranslation;
          error.type = TranslationErrorType.FALLBACK_USED;
          translationLogger.logError(error);
          return fallbackTranslation;
        }
      }

      // Final fallback: return the key itself
      error.fallbackUsed = key;
      translationLogger.logError(error);
      return key;
    } catch (originalError) {
      const error: TranslationError = {
        type: TranslationErrorType.LOADING_FAILED,
        key,
        locale,
        component,
        timestamp: new Date(),
        fallbackUsed: key,
        originalError: originalError as Error,
      };
      translationLogger.logError(error);
      return key;
    }
  }

  /**
   * Gets translation from a specific locale
   */
  private getTranslationFromLocale(key: string, locale: string): string | null {
    const translations = this.translations[locale];
    if (!translations) {
      return null;
    }

    const value = translations[key as keyof Translations];
    if (!value || value.trim().length === 0) {
      return null;
    }

    return value;
  }

  /**
   * Gets the best available fallback translation
   */
  private getFallbackTranslation(key: string): string {
    for (const locale of this.fallbackChain) {
      const translation = this.getTranslationFromLocale(key, locale);
      if (translation) {
        return translation;
      }
    }
    return key;
  }

  /**
   * Updates the fallback chain
   */
  updateFallbackChain(chain: string[]): void {
    this.fallbackChain = chain;
  }

  /**
   * Gets current fallback chain
   */
  getFallbackChain(): string[] {
    return [...this.fallbackChain];
  }
}
