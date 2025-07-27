'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { Moon, Sun, Monitor, Globe } from 'lucide-react';
import { ImprovedAuthLanguageToggle } from './ImprovedAuthLanguageToggle';

type Theme = 'light' | 'dark' | 'system';

export function AuthTopToggles() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    console.log('Theme changing from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div className="fixed right-4 top-4 z-50 flex items-center space-x-3">
        <div className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
          <Globe className="h-4 w-4" />
          <span>বাংলা (Bengali)</span>
        </div>
        <div className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
          <button className="rounded-md p-2 text-gray-400">
            <Sun className="h-4 w-4" />
          </button>
          <button className="rounded-md p-2 text-gray-400">
            <Moon className="h-4 w-4" />
          </button>
          <button className="rounded-md bg-blue-600 p-2 text-white">
            <Monitor className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center space-x-3">
      {/* Language Toggle */}
      <ImprovedAuthLanguageToggle />

      {/* Theme Toggle */}
      <div className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
        <button
          onClick={() => handleThemeChange('light')}
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
          onClick={() => handleThemeChange('dark')}
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
          onClick={() => handleThemeChange('system')}
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
