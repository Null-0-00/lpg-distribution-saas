'use client';

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { LANGUAGES } from '@/types/settings';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await updateSettings({
        ...settings,
        language: languageCode,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update language:', error);
      // For auth pages, we can still update the local state even if API fails
      // This will work for the current session
      setIsOpen(false);
    }
  };

  const currentLanguage = LANGUAGES.find(
    (lang) => lang.code === settings.language
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        title="Change Language"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage?.name || 'English'}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
            <div className="py-1">
              {LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                    settings.language === language.code
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {language.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
