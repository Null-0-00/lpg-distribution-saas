// Business Validation Rules
// Implements business constraints and validation logic for LPG operations

import { z } from 'zod';
import {
  SaleType,
  PaymentType,
  PurchaseType,
  ShipmentType,
  UserRole,
} from '@prisma/client';

// Sale validation schema
export const saleValidationSchema = z
  .object({
    driverId: z.string().min(1, 'Driver is required'),
    productId: z.string().min(1, 'Product is required'),
    saleType: z.nativeEnum(SaleType),
    quantity: z
      .number()
      .min(1, 'Quantity must be at least 1')
      .max(1000, 'Quantity too large'),
    unitPrice: z.number().min(0, 'Unit price cannot be negative'),
    discount: z.number().min(0, 'Discount cannot be negative'),
    paymentType: z.nativeEnum(PaymentType),
    cashDeposited: z.number().min(0, 'Cash deposited cannot be negative'),
    cylindersDeposited: z
      .number()
      .int()
      .min(0, 'Cylinders deposited cannot be negative'),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // Business rule: Cash deposited cannot exceed net value
      const totalValue = data.quantity * data.unitPrice;
      const netValue = totalValue - data.discount;
      return data.cashDeposited <= netValue;
    },
    {
      message: 'Cash deposited cannot exceed net sale value',
      path: ['cashDeposited'],
    }
  )
  .refine(
    (data) => {
      // Business rule: Cylinder deposits only valid for refill sales
      if (data.saleType === SaleType.PACKAGE && data.cylindersDeposited > 0) {
        return false;
      }
      return true;
    },
    {
      message: 'Cylinder deposits only allowed for refill sales',
      path: ['cylindersDeposited'],
    }
  )
  .refine(
    (data) => {
      // Business rule: For refill sales, cylinder deposits cannot exceed quantity
      if (
        data.saleType === SaleType.REFILL &&
        data.cylindersDeposited > data.quantity
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Cylinder deposits cannot exceed refill quantity',
      path: ['cylindersDeposited'],
    }
  );

// Purchase validation schema
export const purchaseValidationSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  productId: z.string().min(1, 'Product is required'),
  purchaseType: z.nativeEnum(PurchaseType),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

// Shipment validation schema
export const shipmentValidationSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  productId: z.string().min(1, 'Product is required'),
  shipmentType: z.nativeEnum(ShipmentType),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative').optional(),
  invoiceNumber: z.string().optional(),
  vehicleNumber: z.string().optional(),
  notes: z.string().optional(),
});

// Driver validation schema
export const driverValidationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
  route: z.string().optional(),
  joiningDate: z.date().optional(),
});

// Product validation schema
export const productValidationSchema = z
  .object({
    companyId: z.string().min(1, 'Company is required'),
    name: z.string().min(1, 'Product name is required'),
    size: z.string().min(1, 'Size is required'),
    fullCylinderWeight: z
      .number()
      .min(0, 'Weight cannot be negative')
      .optional(),
    emptyCylinderWeight: z
      .number()
      .min(0, 'Weight cannot be negative')
      .optional(),
    currentPrice: z.number().min(0, 'Price cannot be negative'),
    lowStockThreshold: z.number().int().min(0, 'Threshold cannot be negative'),
  })
  .refine(
    (data) => {
      // Business rule: Full cylinder weight should be greater than empty cylinder weight
      if (data.fullCylinderWeight && data.emptyCylinderWeight) {
        return data.fullCylinderWeight > data.emptyCylinderWeight;
      }
      return true;
    },
    {
      message:
        'Full cylinder weight must be greater than empty cylinder weight',
      path: ['fullCylinderWeight'],
    }
  );

// Expense validation schema
export const expenseValidationSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  expenseDate: z.date(),
  receiptUrl: z.string().url('Invalid URL format').optional(),
  notes: z.string().optional(),
});

// Asset validation schema
export const assetValidationSchema = z.object({
  name: z.string().min(2, 'Asset name must be at least 2 characters'),
  category: z.enum(['FIXED_ASSET', 'CURRENT_ASSET']),
  subCategory: z.string().optional(),
  value: z.number().min(0, 'Asset value cannot be negative'),
  description: z.string().optional(),
  purchaseDate: z.date().optional(),
  depreciationRate: z
    .number()
    .min(0)
    .max(100, 'Depreciation rate must be between 0-100%')
    .optional(),
});

// Liability validation schema
export const liabilityValidationSchema = z.object({
  name: z.string().min(2, 'Liability name must be at least 2 characters'),
  category: z.enum(['CURRENT_LIABILITY', 'LONG_TERM_LIABILITY']),
  amount: z.number().min(0, 'Liability amount cannot be negative'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
});

// User validation schema
export const userValidationSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(UserRole),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional(),
});

// Business validation functions
export class BusinessValidator {
  /**
   * Validate sale business rules
   */
  static validateSale(saleData: {
    quantity: number;
    paymentType: PaymentType;
    saleType: SaleType;
    cashDeposited: number;
    netValue: number;
    cylindersDeposited: number;
    isOnCredit: boolean;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for negative inventory impact
    if (saleData.quantity <= 0) {
      errors.push('Sale quantity must be positive');
    }

    // Validate payment consistency
    if (
      saleData.paymentType === PaymentType.CASH &&
      saleData.cashDeposited === 0
    ) {
      errors.push('Cash payment requires cash deposit');
    }

    if (
      saleData.paymentType === PaymentType.CYLINDER_CREDIT &&
      saleData.saleType !== SaleType.REFILL
    ) {
      errors.push('Cylinder credit only valid for refill sales');
    }

    // Validate credit rules
    if (saleData.isOnCredit && saleData.cashDeposited >= saleData.netValue) {
      errors.push('Credit sales cannot have full cash deposit');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate inventory operation
   */
  static validateInventoryOperation(
    operationType: 'sale' | 'purchase',
    quantity: number,
    currentStock: number
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (operationType === 'sale' && quantity > currentStock) {
      errors.push('Cannot sell more than current stock');
    }

    if (quantity <= 0) {
      errors.push('Quantity must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate financial transaction
   */
  static validateFinancialTransaction(
    amount: number,
    description: string,
    category?: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (amount <= 0) {
      errors.push('Amount must be positive');
    }

    if (!description || description.trim().length < 5) {
      errors.push('Description must be at least 5 characters');
    }

    // Add category-specific validations if needed
    if (category === 'SALARY' && amount > 100000) {
      errors.push('Salary amount seems unusually high, please verify');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate date range
   */
  static validateDateRange(
    startDate: Date,
    endDate: Date
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (startDate > endDate) {
      errors.push('Start date cannot be after end date');
    }

    const now = new Date();
    if (startDate > now) {
      errors.push('Start date cannot be in the future');
    }

    // Limit report range to reasonable period
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff > 365) {
      errors.push('Date range cannot exceed 365 days');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate user permissions
   */
  static validateUserPermission(
    userRole: UserRole,
    operation: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Define role-based permissions
    const managerOperations = [
      'CREATE_SALE',
      'CREATE_PURCHASE',
      'CREATE_EXPENSE',
      'VIEW_INVENTORY',
      'VIEW_BASIC_REPORTS',
    ];

    if (userRole === UserRole.ADMIN) {
      // Admin can perform all operations
      return { isValid: true, errors: [] };
    }

    if (
      userRole === UserRole.MANAGER &&
      !managerOperations.includes(operation)
    ) {
      errors.push('Insufficient permissions for this operation');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
