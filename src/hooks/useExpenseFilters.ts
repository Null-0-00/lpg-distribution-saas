import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

interface ExpenseFilters {
  status: string;
  categoryId: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

interface UseExpenseFiltersProps {
  initialFilters?: Partial<ExpenseFilters>;
  onFiltersChange?: (filters: ExpenseFilters) => void;
}

export const useExpenseFilters = ({
  initialFilters = {},
  onFiltersChange,
}: UseExpenseFiltersProps = {}) => {
  const [filters, setFilters] = useState<ExpenseFilters>({
    status: 'all',
    categoryId: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    ...initialFilters,
  });

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  const debouncedFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch]
  );

  const updateFilter = (key: keyof ExpenseFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Call callback immediately for non-search filters
    if (key !== 'search') {
      onFiltersChange?.(newFilters);
    }
  };

  const updateFilters = (newFilters: Partial<ExpenseFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      status: 'all',
      categoryId: '',
      dateFrom: '',
      dateTo: '',
      search: '',
    };
    setFilters(resetFilters);
    onFiltersChange?.(resetFilters);
  };

  const clearSearch = () => {
    updateFilter('search', '');
  };

  const clearDateRange = () => {
    updateFilters({ dateFrom: '', dateTo: '' });
  };

  const setDateRange = (from: string, to: string) => {
    updateFilters({ dateFrom: from, dateTo: to });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== 'all' ||
      filters.categoryId !== '' ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.search !== ''
    );
  }, [filters]);

  const getFilterSummary = () => {
    const activeFilters = [];

    if (filters.status !== 'all') {
      activeFilters.push(`Status: ${filters.status}`);
    }
    if (filters.categoryId) {
      activeFilters.push('Category selected');
    }
    if (filters.dateFrom && filters.dateTo) {
      activeFilters.push(`Date: ${filters.dateFrom} to ${filters.dateTo}`);
    }
    if (filters.search) {
      activeFilters.push(`Search: "${filters.search}"`);
    }

    return activeFilters;
  };

  return {
    filters,
    debouncedFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearSearch,
    clearDateRange,
    setDateRange,
    hasActiveFilters,
    getFilterSummary,
  };
};
