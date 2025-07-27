'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Moon, Sun, Monitor } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';

export function TopToggles() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center space-x-3">
      {/* Language Toggle */}
      <LanguageToggle />

      {/* Theme Toggle */}
      <div className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
        <button
          onClick={() => setTheme('light')}
          className={`rounded-md p-2 transition-colors ${
            theme === 'light'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-white'
          }`}
          title="Light Mode"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`rounded-md p-2 transition-colors ${
            theme === 'dark'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-white'
          }`}
          title="Dark Mode"
        >
          <Moon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`rounded-md p-2 transition-colors ${
            theme === 'system'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-white'
          }`}
          title="System Theme"
        >
          <Monitor className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
