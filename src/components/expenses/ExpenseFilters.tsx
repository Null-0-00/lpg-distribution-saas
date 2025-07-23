import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ExpenseCategory } from '@/hooks/useCategories';

interface ExpenseFiltersProps {
  filters: {
    status: string;
    categoryId: string;
    dateFrom: string;
    dateTo: string;
    search: string;
  };
  categories: ExpenseCategory[];
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const activeCategories = categories.filter((cat) => cat.isActive);

  return (
    <div className="bg-card rounded-lg p-4 shadow">
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="border-border bg-input text-foreground w-full rounded-md border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transform"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="min-w-0 flex-shrink-0">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="min-w-0 flex-shrink-0">
          <select
            value={filters.categoryId}
            onChange={(e) => onFilterChange('categoryId', e.target.value)}
            className="border-border bg-input text-foreground w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {activeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="flex gap-2">
          <input
            type="date"
            placeholder="From"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            className="border-border bg-input text-foreground rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            placeholder="To"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            className="border-border bg-input text-foreground rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-muted-foreground border-border hover:bg-muted/50 flex items-center rounded-md border px-4 py-2 text-sm transition-colors"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="border-border mt-3 border-t pt-3">
          <div className="flex flex-wrap gap-2">
            {filters.status !== 'all' && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                Status: {filters.status}
                <button
                  onClick={() => onFilterChange('status', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.categoryId && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-200">
                Category:{' '}
                {activeCategories.find((c) => c.id === filters.categoryId)
                  ?.name || 'Unknown'}
                <button
                  onClick={() => onFilterChange('categoryId', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.dateFrom && filters.dateTo && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                Date: {filters.dateFrom} to {filters.dateTo}
                <button
                  onClick={() => {
                    onFilterChange('dateFrom', '');
                    onFilterChange('dateTo', '');
                  }}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
