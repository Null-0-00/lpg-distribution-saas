// Pagination utilities for API routes
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
  };
}

export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export class PaginationHelper {
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly MAX_LIMIT = 100;
  private static readonly DEFAULT_SORT_ORDER = 'desc';

  static parseParams(
    searchParams: URLSearchParams,
    options: PaginationOptions = {}
  ): PaginationParams {
    const {
      defaultLimit = this.DEFAULT_LIMIT,
      maxLimit = this.MAX_LIMIT,
      defaultSortBy = 'createdAt',
      defaultSortOrder = this.DEFAULT_SORT_ORDER,
    } = options;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(searchParams.get('limit') || defaultLimit.toString(), 10))
    );
    const sortBy = searchParams.get('sortBy') || defaultSortBy;
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || defaultSortOrder;
    const search = searchParams.get('search') || undefined;

    return {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    };
  }

  static calculatePagination(
    totalItems: number,
    currentPage: number,
    itemsPerPage: number
  ) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;
    const nextPage = hasNextPage ? currentPage + 1 : null;
    const previousPage = hasPreviousPage ? currentPage - 1 : null;

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage,
      hasPreviousPage,
      nextPage,
      previousPage,
    };
  }

  static getPrismaOptions(params: PaginationParams) {
    const { page = 1, limit = this.DEFAULT_LIMIT, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    
    return {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
    };
  }

  static async paginate<T>(
    countQuery: () => Promise<number>,
    dataQuery: (options: any) => Promise<T[]>,
    params: PaginationParams,
    options: PaginationOptions = {}
  ): Promise<PaginationResult<T>> {
    const {
      page = 1,
      limit = options.defaultLimit || this.DEFAULT_LIMIT,
    } = params;

    // Execute count and data queries in parallel
    const prismaOptions = this.getPrismaOptions(params);
    const [totalItems, data] = await Promise.all([
      countQuery(),
      dataQuery(prismaOptions),
    ]);

    const pagination = this.calculatePagination(totalItems, page, limit);

    return {
      data,
      pagination,
    };
  }

  // Helper for creating search conditions
  static createSearchCondition(
    search: string | undefined,
    searchableFields: string[]
  ): any {
    if (!search || searchableFields.length === 0) {
      return {};
    }

    const searchConditions = searchableFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const,
      },
    }));

    return {
      OR: searchConditions,
    };
  }

  // Helper for date range filtering
  static createDateRangeCondition(
    startDate?: string,
    endDate?: string,
    dateField: string = 'createdAt'
  ): any {
    const conditions: any = {};

    if (startDate) {
      conditions.gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.lte = end;
    }

    return Object.keys(conditions).length > 0 ? { [dateField]: conditions } : {};
  }

  // Helper for creating combined filter conditions
  static combineConditions(...conditions: any[]): any {
    const validConditions = conditions.filter(condition => 
      condition && Object.keys(condition).length > 0
    );

    if (validConditions.length === 0) {
      return {};
    }

    if (validConditions.length === 1) {
      return validConditions[0];
    }

    return {
      AND: validConditions,
    };
  }
}

// Type-safe pagination response wrapper
export function createPaginatedResponse<T>(
  result: PaginationResult<T>,
  message?: string
) {
  return {
    success: true,
    message,
    ...result,
  };
}

// Error response for pagination
export function createPaginationError(
  message: string,
  code: number = 400
) {
  return {
    success: false,
    error: message,
    code,
    data: [],
    pagination: {
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      nextPage: null,
      previousPage: null,
    },
  };
}

// Common pagination validation
export function validatePaginationParams(params: PaginationParams): string | null {
  const { page, limit } = params;

  if (page && page < 1) {
    return 'Page number must be greater than 0';
  }

  if (limit && limit < 1) {
    return 'Limit must be greater than 0';
  }

  if (limit && limit > PaginationHelper['MAX_LIMIT']) {
    return `Limit must not exceed ${PaginationHelper['MAX_LIMIT']}`;
  }

  return null;
}

// Performance monitoring for paginated queries
export class PaginationPerformanceMonitor {
  private static queryTimes = new Map<string, number[]>();

  static startTiming(endpoint: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      if (!this.queryTimes.has(endpoint)) {
        this.queryTimes.set(endpoint, []);
      }
      
      const times = this.queryTimes.get(endpoint)!;
      times.push(duration);
      
      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift();
      }
      
      // Log slow queries in development
      if (process.env.NODE_ENV === 'development' && duration > 1000) {
        console.warn(`Slow paginated query: ${endpoint} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  static getStats(endpoint?: string) {
    if (endpoint) {
      const times = this.queryTimes.get(endpoint) || [];
      if (times.length === 0) return null;
      
      return {
        endpoint,
        count: times.length,
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
      };
    }

    const allStats: any = {};
    for (const [ep, times] of this.queryTimes) {
      if (times.length > 0) {
        allStats[ep] = {
          count: times.length,
          average: times.reduce((a, b) => a + b, 0) / times.length,
          min: Math.min(...times),
          max: Math.max(...times),
        };
      }
    }
    
    return allStats;
  }
}