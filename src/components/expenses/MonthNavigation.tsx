import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthNavigationProps {
  currentMonth: { month: number; year: number };
  onNavigateMonth: (direction: 'prev' | 'next') => void;
}

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentMonth,
  onNavigateMonth
}) => {
  const formatMonthYear = (year: number, month: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-card rounded-lg shadow p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigateMonth('prev')}
            className="flex items-center px-3 py-2 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatMonthYear(currentMonth.year, currentMonth.month)}
            </span>
          </div>
          
          <button
            onClick={() => onNavigateMonth('next')}
            className="flex items-center px-3 py-2 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Viewing expenses for {formatMonthYear(currentMonth.year, currentMonth.month)}
        </div>
      </div>
    </div>
  );
};