import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^(\+88)?01[3-9]\d{8}$/, 'Invalid Bangladeshi phone number');

export const positiveNumberSchema = z
  .number()
  .positive('Value must be positive');

export const quantitySchema = z
  .number()
  .int()
  .positive('Quantity must be positive');

export const currencySchema = z
  .number()
  .nonnegative('Amount cannot be negative')
  .max(999999999.99, 'Amount is too large');

export const tenantNameSchema = z
  .string()
  .min(2, 'Company name must be at least 2 characters')
  .max(100, 'Company name cannot exceed 100 characters')
  .regex(/^[a-zA-Z0-9\s\-&.]+$/, 'Invalid characters in company name');

export const subdomainSchema = z
  .string()
  .min(3, 'Subdomain must be at least 3 characters')
  .max(20, 'Subdomain cannot exceed 20 characters')
  .regex(
    /^[a-z0-9-]+$/,
    'Subdomain can only contain lowercase letters, numbers, and hyphens'
  )
  .regex(/^[a-z0-9]/, 'Subdomain must start with a letter or number')
  .regex(/[a-z0-9]$/, 'Subdomain must end with a letter or number');

// Business validation functions
export function validateSaleEntry(data: {
  quantity: number;
  unitPrice: number;
  discount: number;
  cashDeposited: number;
  cylindersDeposited: number;
  saleType: string;
}) {
  const errors: string[] = [];

  if (data.quantity <= 0) {
    errors.push('Quantity must be positive');
  }

  if (data.unitPrice <= 0) {
    errors.push('Unit price must be positive');
  }

  if (data.discount < 0) {
    errors.push('Discount cannot be negative');
  }

  if (data.cashDeposited < 0) {
    errors.push('Cash deposited cannot be negative');
  }

  if (data.cylindersDeposited < 0) {
    errors.push('Cylinders deposited cannot be negative');
  }

  const totalValue = data.quantity * data.unitPrice - data.discount;
  if (data.cashDeposited > totalValue) {
    errors.push('Cash deposited cannot exceed total sale value');
  }

  if (data.saleType === 'REFILL' && data.cylindersDeposited > data.quantity) {
    errors.push(
      'Cylinders deposited cannot exceed sale quantity for refill sales'
    );
  }

  if (data.saleType === 'PACKAGE' && data.cylindersDeposited > 0) {
    errors.push('Package sales should not have cylinder deposits');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateInventoryCalculation(data: {
  yesterdayFull: number;
  yesterdayEmpty: number;
  packagePurchase: number;
  refillPurchase: number;
  totalSales: number;
  refillSales: number;
  emptyCylindersBuySell: number;
}) {
  const errors: string[] = [];

  if (data.yesterdayFull < 0) {
    errors.push("Yesterday's full cylinders cannot be negative");
  }

  if (data.yesterdayEmpty < 0) {
    errors.push("Yesterday's empty cylinders cannot be negative");
  }

  if (data.packagePurchase < 0) {
    errors.push('Package purchase cannot be negative');
  }

  if (data.refillPurchase < 0) {
    errors.push('Refill purchase cannot be negative');
  }

  if (data.totalSales < 0) {
    errors.push('Total sales cannot be negative');
  }

  if (data.refillSales < 0) {
    errors.push('Refill sales cannot be negative');
  }

  if (data.refillSales > data.totalSales) {
    errors.push('Refill sales cannot exceed total sales');
  }

  const calculatedFullCylinders =
    data.yesterdayFull +
    data.packagePurchase +
    data.refillPurchase -
    data.totalSales;

  if (calculatedFullCylinders < 0) {
    errors.push(
      'Calculated full cylinders would be negative - check your data'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
