'use client';

import { useState, useEffect } from 'react';
import { LANGUAGES } from '@/types/settings';
import { Globe } from 'lucide-react';

export function AuthLanguageToggle() {
  const [currentLanguage, setCurrentLanguage] = useState('bn');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get language from localStorage or default to Bengali
    const savedLanguage = localStorage.getItem('auth-language') || 'bn';
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    console.log('Language changing to:', languageCode);
    setCurrentLanguage(languageCode);
    localStorage.setItem('auth-language', languageCode);
    setIsOpen(false);

    // Small delay to ensure state is updated before reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="relative">
        <button
          className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          title="Change Language"
        >
          <Globe className="h-4 w-4" />
          <span>বাংলা (Bengali)</span>
        </button>
      </div>
    );
  }

  const currentLang = LANGUAGES.find((lang) => lang.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        title="Change Language"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLang?.name || 'বাংলা (Bengali)'}</span>
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
                    currentLanguage === language.code
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
