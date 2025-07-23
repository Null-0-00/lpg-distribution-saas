export const APP_CONFIG = {
  name: 'LPG Distributor Management System',
  description: 'Comprehensive SaaS platform for LPG distributors',
  version: '1.0.0',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
} as const;

export const BUSINESS_RULES = {
  // Inventory rules
  PACKAGE_SALE_CYLINDER_CHANGE: {
    fullCylinders: -1,
    emptyCylinders: 0,
  },
  REFILL_SALE_CYLINDER_CHANGE: {
    fullCylinders: -1,
    emptyCylinders: 1,
  },

  // Receivables aging periods (in days)
  RECEIVABLES_AGING: {
    current: 0,
    days30: 30,
    days60: 60,
    days90: 90,
  },

  // Default thresholds
  LOW_STOCK_THRESHOLD: 10,
  MAX_DAILY_SALES_ENTRIES: 100,
  MAX_CONCURRENT_USERS: 1000,
} as const;

export const API_LIMITS = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
} as const;

export const CURRENCY = {
  code: 'BDT',
  symbol: '৳',
  locale: 'bn-BD',
} as const;

export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  timestamp: 'yyyy-MM-dd HH:mm:ss',
} as const;
