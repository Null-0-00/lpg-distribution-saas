import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface MonthNavigationProps {
  currentMonth: { month: number; year: number };
  onNavigateMonth: (direction: 'prev' | 'next') => void;
}

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentMonth,
  onNavigateMonth,
}) => {
  const { t } = useSettings();
  const formatMonthYear = (year: number, month: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigateMonth('prev')}
            className="border-border hover:bg-muted/50 flex items-center rounded-md border px-3 py-2 text-sm transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('previous')}
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatMonthYear(currentMonth.year, currentMonth.month)}
            </span>
          </div>

          <button
            onClick={() => onNavigateMonth('next')}
            className="border-border hover:bg-muted/50 flex items-center rounded-md border px-3 py-2 text-sm transition-colors"
          >
            {t('next')}
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t('viewingExpensesFor')}{' '}
          {formatMonthYear(currentMonth.year, currentMonth.month)}
        </div>
      </div>
    </div>
  );
};
