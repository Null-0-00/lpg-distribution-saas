import { useState, useMemo } from 'react';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UseExpensePaginationProps {
  initialPage?: number;
  initialLimit?: number;
  onPaginationChange?: (pagination: PaginationData) => void;
}

export const useExpensePagination = ({ 
  initialPage = 1, 
  initialLimit = 20,
  onPaginationChange
}: UseExpensePaginationProps = {}) => {
  const [pagination, setPagination] = useState<PaginationData>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0
  });

  const updatePagination = (newPagination: Partial<PaginationData>) => {
    const updated = { ...pagination, ...newPagination };
    setPagination(updated);
    onPaginationChange?.(updated);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      updatePagination({ page });
    }
  };

  const goToNextPage = () => {
    if (pagination.page < pagination.pages) {
      updatePagination({ page: pagination.page + 1 });
    }
  };

  const goToPrevPage = () => {
    if (pagination.page > 1) {
      updatePagination({ page: pagination.page - 1 });
    }
  };

  const goToFirstPage = () => {
    updatePagination({ page: 1 });
  };

  const goToLastPage = () => {
    updatePagination({ page: pagination.pages });
  };

  const changeLimit = (limit: number) => {
    updatePagination({ limit, page: 1 }); // Reset to first page when changing limit
  };

  const setTotalResults = (total: number) => {
    const pages = Math.ceil(total / pagination.limit);
    updatePagination({ total, pages });
  };

  const getVisiblePageNumbers = (maxVisible: number = 7) => {
    const { page, pages } = pagination;
    const pageNumbers = [];
    
    if (pages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Calculate start and end pages
      const halfVisible = Math.floor(maxVisible / 2);
      let start = Math.max(1, page - halfVisible);
      let end = Math.min(pages, page + halfVisible);
      
      // Adjust if we're near the beginning or end
      if (start === 1) {
        end = Math.min(pages, maxVisible);
      } else if (end === pages) {
        start = Math.max(1, pages - maxVisible + 1);
      }
      
      // Add ellipsis and boundary pages if needed
      if (start > 1) {
        pageNumbers.push(1);
        if (start > 2) {
          pageNumbers.push('...');
        }
      }
      
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      if (end < pages) {
        if (end < pages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(pages);
      }
    }
    
    return pageNumbers;
  };

  const getPaginationInfo = () => {
    const start = Math.max(1, (pagination.page - 1) * pagination.limit + 1);
    const end = Math.min(pagination.total, pagination.page * pagination.limit);
    
    return {
      start,
      end,
      total: pagination.total,
      showing: `${start}-${end} of ${pagination.total}`
    };
  };

  const canGoNext = pagination.page < pagination.pages;
  const canGoPrev = pagination.page > 1;

  const paginationStats = useMemo(() => {
    return getPaginationInfo();
  }, [pagination]);

  const visiblePages = useMemo(() => {
    return getVisiblePageNumbers();
  }, [pagination]);

  return {
    pagination,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    changeLimit,
    setTotalResults,
    updatePagination,
    canGoNext,
    canGoPrev,
    paginationStats,
    visiblePages
  };
};