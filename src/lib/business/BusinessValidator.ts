import { z } from 'zod';

// Validation schemas
export const saleValidationSchema = z.object({
  quantity: z.number().positive().min(1),
  unitPrice: z.number().positive(),
  saleType: z.enum(['PACKAGE', 'REFILL']),
  paymentType: z.enum(['CASH', 'CREDIT', 'PARTIAL']),
  discount: z.number().min(0).default(0),
  cashDeposited: z.number().min(0),
  cylindersDeposited: z.number().min(0).default(0),
  driverId: z.string().uuid(),
  productId: z.string().uuid(),
  companyId: z.string().uuid(),
});

export const userPermissionSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'DRIVER']),
  action: z.string(),
  companyId: z.string().uuid(),
});

export type SaleValidation = z.infer<typeof saleValidationSchema>;
export type UserPermission = z.infer<typeof userPermissionSchema>;

export class BusinessValidator {
  // Validate sale data
  static validateSale(saleData: any): { isValid: boolean; errors?: string[] } {
    try {
      const result = saleValidationSchema.parse(saleData);

      // Additional business logic validation
      const errors: string[] = [];

      // Check if cash deposited doesn't exceed total value
      const totalValue = result.quantity * result.unitPrice;
      const netValue = totalValue - result.discount;

      if (result.cashDeposited > netValue) {
        errors.push('Cash deposited cannot exceed net sale value');
      }

      // For refill sales, customer must return empty cylinder
      if (result.saleType === 'REFILL' && result.cylindersDeposited === 0) {
        errors.push('Refill sales require empty cylinder return');
      }

      // For package sales, no cylinder return expected
      if (result.saleType === 'PACKAGE' && result.cylindersDeposited > 0) {
        errors.push('Package sales should not include cylinder returns');
      }

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return {
        isValid: false,
        errors: ['Unknown validation error'],
      };
    }
  }

  // Validate user permissions
  static validateUserPermission(
    role: string,
    action: string
  ): { isValid: boolean; message?: string } {
    const permissions = {
      ADMIN: [
        'CREATE_SALE',
        'UPDATE_SALE',
        'DELETE_SALE',
        'VIEW_REPORTS',
        'MANAGE_USERS',
      ],
      MANAGER: ['CREATE_SALE', 'UPDATE_SALE', 'VIEW_REPORTS'],
      DRIVER: ['CREATE_SALE'],
    };

    const userPermissions = permissions[role as keyof typeof permissions] || [];
    const hasPermission = userPermissions.includes(action);

    return {
      isValid: hasPermission,
      message: hasPermission
        ? undefined
        : `Role ${role} does not have permission for ${action}`,
    };
  }

  // Validate inventory calculations
  static validateInventoryUpdate(data: {
    previousFull: number;
    previousEmpty: number;
    purchases: number;
    sales: number;
    saleType: 'PACKAGE' | 'REFILL';
  }): { isValid: boolean; calculatedValues?: any; errors?: string[] } {
    const errors: string[] = [];

    try {
      let newFullCylinders = data.previousFull + data.purchases - data.sales;
      let newEmptyCylinders = data.previousEmpty;

      // Apply business logic based on sale type
      if (data.saleType === 'REFILL') {
        newEmptyCylinders += data.sales; // Customer returns empty cylinder
      }
      // For PACKAGE sales, no empty cylinder return

      if (newFullCylinders < 0) {
        errors.push('Cannot have negative full cylinder inventory');
      }

      if (newEmptyCylinders < 0) {
        errors.push('Cannot have negative empty cylinder inventory');
      }

      return {
        isValid: errors.length === 0,
        calculatedValues: {
          newFullCylinders,
          newEmptyCylinders,
        },
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Error calculating inventory values'],
      };
    }
  }

  // Validate financial calculations
  static validateReceivables(data: {
    previousCashReceivables: number;
    previousCylinderReceivables: number;
    driverSalesRevenue: number;
    cashDeposits: number;
    cylinderDeposits: number;
    discounts: number;
    driverRefillSales: number;
  }): { isValid: boolean; calculatedValues?: any; errors?: string[] } {
    const errors: string[] = [];

    try {
      // Calculate cash receivables change
      const cashReceivablesChange =
        data.driverSalesRevenue - data.cashDeposits - data.discounts;
      const newCashReceivables =
        data.previousCashReceivables + cashReceivablesChange;

      // Calculate cylinder receivables change
      const cylinderReceivablesChange =
        data.driverRefillSales - data.cylinderDeposits;
      const newCylinderReceivables =
        data.previousCylinderReceivables + cylinderReceivablesChange;

      if (newCashReceivables < 0) {
        errors.push('Cash receivables cannot be negative');
      }

      if (newCylinderReceivables < 0) {
        errors.push('Cylinder receivables cannot be negative');
      }

      return {
        isValid: errors.length === 0,
        calculatedValues: {
          newCashReceivables,
          newCylinderReceivables,
          cashReceivablesChange,
          cylinderReceivablesChange,
        },
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Error calculating receivables values'],
      };
    }
  }

  // Multi-tenant data validation
  static validateTenantAccess(
    userCompanyId: string,
    resourceCompanyId: string
  ): boolean {
    return userCompanyId === resourceCompanyId;
  }

  // Business rule validation for dates
  static validateSaleDate(saleDate: Date): {
    isValid: boolean;
    message?: string;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sale = new Date(saleDate);
    sale.setHours(0, 0, 0, 0);

    // Only allow sales for today or yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      sale.getTime() === today.getTime() ||
      sale.getTime() === yesterday.getTime()
    ) {
      return { isValid: true };
    }

    if (sale.getTime() > today.getTime()) {
      return {
        isValid: false,
        message: 'Cannot create sales for future dates',
      };
    }

    return {
      isValid: false,
      message: 'Can only create sales for today or yesterday',
    };
  }
}
