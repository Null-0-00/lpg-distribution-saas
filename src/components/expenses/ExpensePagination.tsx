import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExpensePaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const ExpensePagination: React.FC<ExpensePaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const getVisiblePages = () => {
    const { page, pages } = pagination;
    const visiblePages = [];
    const maxVisible = 7;

    if (pages <= maxVisible) {
      for (let i = 1; i <= pages; i++) {
        visiblePages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisible / 2);
      let start = Math.max(1, page - halfVisible);
      let end = Math.min(pages, page + halfVisible);

      if (start === 1) {
        end = Math.min(pages, maxVisible);
      } else if (end === pages) {
        start = Math.max(1, pages - maxVisible + 1);
      }

      if (start > 1) {
        visiblePages.push(1);
        if (start > 2) {
          visiblePages.push('...');
        }
      }

      for (let i = start; i <= end; i++) {
        visiblePages.push(i);
      }

      if (end < pages) {
        if (end < pages - 1) {
          visiblePages.push('...');
        }
        visiblePages.push(pages);
      }
    }

    return visiblePages;
  };

  const getPaginationInfo = () => {
    const start = Math.max(1, (pagination.page - 1) * pagination.limit + 1);
    const end = Math.min(pagination.total, pagination.page * pagination.limit);
    return { start, end };
  };

  const { start, end } = getPaginationInfo();
  const visiblePages = getVisiblePages();

  if (pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="bg-card border-border border-t px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{start}</span> to{' '}
            <span className="font-medium">{end}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> results
          </p>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Per page:
            </label>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="border-border bg-background text-muted-foreground hover:bg-muted/50 relative inline-flex items-center rounded-l-md border px-2 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {visiblePages.map((pageNum, index) => (
            <button
              key={index}
              onClick={() =>
                typeof pageNum === 'number' ? onPageChange(pageNum) : undefined
              }
              disabled={pageNum === '...'}
              className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                pageNum === pagination.page
                  ? 'z-10 border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-200'
                  : pageNum === '...'
                    ? 'cursor-default border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="border-border bg-background text-muted-foreground hover:bg-muted/50 relative inline-flex items-center rounded-r-md border px-2 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
