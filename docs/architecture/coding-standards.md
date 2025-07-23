# Coding Standards - LPG Distributor SaaS

## Overview

This document defines the coding standards and best practices for the LPG Distributor SaaS project. These standards ensure code consistency, maintainability, and quality across the entire development team.

## General Principles

### Code Philosophy

- **Clean Code First**: Write code that is self-documenting and easy to understand
- **Business Logic Clarity**: Code should clearly reflect business requirements and domain logic
- **Multi-tenant Security**: Every data access must include tenant isolation
- **Type Safety**: Leverage TypeScript's type system for compile-time error prevention
- **Performance Awareness**: Consider scalability and performance implications in all decisions

## TypeScript Standards

### File Structure

```typescript
// 1. External imports
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 2. Internal imports (grouped by type)
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/database/client';
import { InventoryCalculator } from '@/lib/business';

// 3. Type definitions
interface CreateSaleRequest {
  driverId: string;
  productId: string;
  // ... other properties
}

// 4. Constants
const MAX_QUANTITY = 1000;

// 5. Main implementation
export async function POST(request: NextRequest) {
  // Implementation
}
```

### Naming Conventions

#### Variables and Functions

- Use **camelCase** for variables and functions
- Use descriptive names that reflect business domain

```typescript
// ✅ Good
const currentInventoryLevels = await calculator.getCurrentLevels();
const driverSalesRevenue = calculateRevenue(sales);

// ❌ Bad
const data = await calc.get();
const rev = calc(s);
```

#### Types and Interfaces

- Use **PascalCase** for types and interfaces
- Prefix interfaces with `I` only when necessary for disambiguation

```typescript
// ✅ Good
interface SaleFormData {
  driverId: string;
  quantity: number;
}

type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

// ✅ Acceptable when needed
interface ISaleValidator {
  validate(data: SaleFormData): ValidationResult;
}
```

#### Constants

- Use **SCREAMING_SNAKE_CASE** for module-level constants

```typescript
const MAX_SALE_QUANTITY = 1000;
const DEFAULT_CURRENCY = 'USD';
const INVENTORY_ALERT_THRESHOLD = 10;
```

#### Files and Directories

- Use **kebab-case** for file names
- Use **camelCase** for component files

```
// ✅ Good
src/lib/business/inventory-calculator.ts
src/components/forms/SaleForm.tsx
src/app/api/daily-sales/route.ts

// ❌ Bad
src/lib/business/InventoryCalculator.ts
src/components/forms/sale_form.tsx
```

### Type Definitions

#### Strict Typing

- Always define explicit types for function parameters and return values
- Use union types instead of `any`

```typescript
// ✅ Good
function calculateReceivables(
  salesData: SalesData[],
  deposits: number
): ReceivablesResult {
  // Implementation
}

// ❌ Bad
function calculateReceivables(salesData: any, deposits: any): any {
  // Implementation
}
```

#### Business Domain Types

- Create specific types that reflect business domain

```typescript
// ✅ Business-focused types
interface InventoryMovement {
  type:
    | 'SALE_PACKAGE'
    | 'SALE_REFILL'
    | 'PURCHASE_PACKAGE'
    | 'EMPTY_CYLINDER_BUY';
  quantity: number;
  productId: string;
  driverId?: string;
}

interface LPGBusinessFormulas {
  packageSale: (inventory: InventoryLevels) => InventoryLevels;
  refillSale: (inventory: InventoryLevels) => InventoryLevels;
}
```

## API Development Standards

### Route Handler Structure

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Extract tenant info
    const { tenantId, role } = session.user;

    // 3. Permission validation
    const permission = BusinessValidator.validateUserPermission(
      role,
      'CREATE_SALE'
    );
    if (!permission.isValid) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // 4. Request validation
    const body = await request.json();
    const validatedData = schema.parse(body);

    // 5. Business logic validation
    const businessValidation = BusinessValidator.validateSale(validatedData);
    if (!businessValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Business validation failed',
          details: businessValidation.errors,
        },
        { status: 400 }
      );
    }

    // 6. Database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Database operations
    });

    // 7. Success response
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    // 8. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Error Handling

- Always use try-catch blocks in API routes
- Provide specific error messages for business validation failures
- Never expose sensitive information in error responses

```typescript
// ✅ Good error handling
try {
  const result = await businessOperation();
  return NextResponse.json({ data: result });
} catch (error) {
  if (error instanceof BusinessValidationError) {
    return NextResponse.json(
      {
        error: 'Business rule violation',
        code: error.code,
        message: error.userMessage,
      },
      { status: 400 }
    );
  }

  console.error('Operation failed:', error);
  return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
}
```

## React Component Standards

### Component Structure

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Component-specific imports
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';

// Types and schemas
const formSchema = z.object({
  // Schema definition
});

interface ComponentProps {
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

// Component implementation
export function ComponentName({ onSubmit, loading = false }: ComponentProps) {
  // 1. Hooks
  const { formatCurrency } = useSettings();
  const [localState, setLocalState] = useState<StateType>(initialValue);

  // 2. Form handling
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // defaults
    }
  });

  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 4. Event handlers
  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Error handling
    }
  };

  // 5. Render
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* JSX */}
    </form>
  );
}
```

### Props and State

- Always define explicit TypeScript interfaces for props
- Use descriptive names for state variables
- Prefer controlled components over uncontrolled

```typescript
// ✅ Good
interface SaleFormProps {
  onSubmit: (data: SaleFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<SaleFormData>;
  loading?: boolean;
}

const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [inventoryWarning, setInventoryWarning] = useState<string>('');
```

## Business Logic Standards

### Calculator Classes

```typescript
export class InventoryCalculator {
  constructor(private prisma: PrismaClient) {}

  /**
   * Core inventory calculation using exact PRD formulas:
   * - Package Sale: -1 Full Cylinder, no Empty Cylinder change
   * - Refill Sale: -1 Full Cylinder, +1 Empty Cylinder
   */
  async calculateInventoryForDate(
    data: InventoryCalculationData
  ): Promise<InventoryResult> {
    // Implementation with clear business logic
  }

  /**
   * Private helper methods should be clearly documented
   */
  private async getSalesData(tenantId: string, date: Date): Promise<SalesData> {
    // Implementation
  }
}
```

### Validation Standards

- Always validate business rules in addition to schema validation
- Provide clear error messages that relate to business domain

```typescript
// ✅ Good business validation
export class BusinessValidator {
  static validateSale(saleData: SaleData): ValidationResult {
    const errors: string[] = [];

    // Business rule: Cash deposited cannot exceed net sale value
    if (saleData.cashDeposited > saleData.netValue) {
      errors.push('Cash deposited cannot exceed the net sale value');
    }

    // Business rule: Refill sales require empty cylinder return
    if (saleData.saleType === 'REFILL' && saleData.cylindersDeposited === 0) {
      errors.push(
        'Refill sales require at least one empty cylinder to be returned'
      );
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
```

## Database Standards

### Prisma Query Patterns

- Always include tenant isolation in queries
- Use transactions for related operations
- Optimize queries with proper select statements

```typescript
// ✅ Good query pattern
const sales = await prisma.sale.findMany({
  where: {
    tenantId, // Always include tenant isolation
    saleDate: {
      gte: startDate,
      lte: endDate,
    },
  },
  select: {
    // Only select needed fields
    id: true,
    quantity: true,
    saleType: true,
    driver: {
      select: { name: true },
    },
    product: {
      select: { name: true, size: true },
    },
  },
  orderBy: { saleDate: 'desc' },
});
```

### Transaction Patterns

```typescript
// ✅ Proper transaction usage
const result = await prisma.$transaction(async (tx) => {
  // 1. Create main record
  const sale = await tx.sale.create({ data: saleData });

  // 2. Update related records
  await inventoryCalculator.recordMovement(tx, movementData);

  // 3. Update calculations
  await receivablesCalculator.updateReceivables(tx, receivablesData);

  return sale;
});
```

## Testing Standards

### Unit Test Structure

```typescript
describe('InventoryCalculator', () => {
  let calculator: InventoryCalculator;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    calculator = new InventoryCalculator(mockPrisma);
  });

  describe('calculateInventoryForDate', () => {
    it('should correctly calculate inventory for package sales', async () => {
      // Arrange
      const testData = createTestInventoryData();

      // Act
      const result = await calculator.calculateInventoryForDate(testData);

      // Assert
      expect(result.fullCylinders).toBe(expectedValue);
      expect(result.emptyCylinders).toBe(expectedValue);
    });

    it('should correctly calculate inventory for refill sales', async () => {
      // Test implementation
    });
  });
});
```

## Security Standards

### Multi-tenant Data Access

- **ALWAYS** include tenantId in database queries
- **NEVER** trust client-provided tenant information
- **ALWAYS** validate tenant access in middleware

```typescript
// ✅ Secure query pattern
const userSales = await prisma.sale.findMany({
  where: {
    tenantId: session.user.tenantId, // From authenticated session
    driverId: requestData.driverId,
  },
});

// ❌ Insecure - missing tenant isolation
const userSales = await prisma.sale.findMany({
  where: {
    driverId: requestData.driverId,
  },
});
```

### Input Validation

- Use Zod schemas for all external input
- Validate business rules after schema validation
- Sanitize data before database operations

```typescript
// ✅ Comprehensive validation
const createSaleSchema = z.object({
  driverId: z.string().cuid(),
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(1000),
  unitPrice: z.number().min(0),
  // ... other fields
});

// Validate schema first
const validatedData = createSaleSchema.parse(requestData);

// Then validate business rules
const businessValidation = BusinessValidator.validateSale(validatedData);
if (!businessValidation.isValid) {
  throw new BusinessValidationError(businessValidation.errors);
}
```

## Performance Standards

### Database Query Optimization

- Use appropriate indexes
- Limit query results with pagination
- Use select to fetch only needed fields
- Implement caching for frequently accessed data

```typescript
// ✅ Optimized query
const salesSummary = await prisma.sale.findMany({
  where: { tenantId, saleDate: { gte: startDate, lte: endDate } },
  select: {
    id: true,
    quantity: true,
    netValue: true,
    driver: { select: { name: true } },
  },
  orderBy: { saleDate: 'desc' },
  take: limit,
  skip: (page - 1) * limit,
});
```

### Async Operations

- Use Promise.all for parallel operations
- Implement proper error handling for async operations
- Use setImmediate for non-blocking background tasks

```typescript
// ✅ Parallel data fetching
const [drivers, products, inventory] = await Promise.all([
  fetchActiveDrivers(tenantId),
  fetchActiveProducts(tenantId),
  calculateCurrentInventory(tenantId),
]);

// ✅ Background processing
setImmediate(async () => {
  try {
    await updateInventoryRecords(tenantId);
  } catch (error) {
    console.error('Background inventory update failed:', error);
  }
});
```

## Documentation Standards

### Code Comments

- Focus on **why** not **what**
- Document business rules and complex calculations
- Use JSDoc for public APIs

```typescript
/**
 * Calculates receivables using exact business formulas from PRD:
 * - Cash Receivables Change = driver_sales_revenue - cash_deposits - discounts
 * - Cylinder Receivables Change = driver_refill_sales - cylinder_deposits
 *
 * @param data - Receivables calculation input data
 * @returns Calculated receivables with changes and totals
 */
async calculateReceivablesForDate(data: ReceivablesCalculationData): Promise<ReceivablesResult> {
  // Apply exact PRD formulas
  const cashReceivablesChange = data.driverSalesRevenue - data.cashDeposits - data.discounts;
  // ... implementation
}
```

### README and Documentation

- Keep README current with setup instructions
- Document API endpoints with examples
- Maintain architecture documentation
- Document business rules and formulas

## Code Review Checklist

### Before Submitting PR

- [ ] All TypeScript errors resolved
- [ ] ESLint passes with no warnings
- [ ] Tests pass and cover new functionality
- [ ] Business logic includes proper validation
- [ ] Multi-tenant security implemented
- [ ] Error handling covers edge cases
- [ ] Performance implications considered
- [ ] Documentation updated if needed

### Reviewer Checklist

- [ ] Code follows established patterns
- [ ] Business logic is correct and testable
- [ ] Security considerations addressed
- [ ] Performance is acceptable
- [ ] Error messages are user-friendly
- [ ] Edge cases are handled
- [ ] Tests adequately cover functionality

## Tools and Automation

### Development Tools

- **ESLint**: For code quality and consistency
- **Prettier**: For code formatting
- **TypeScript**: For type safety
- **Jest**: For unit testing
- **Husky**: For pre-commit hooks

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

## Conclusion

These coding standards ensure that the LPG Distributor SaaS codebase remains maintainable, secure, and performant as it scales. All team members should follow these standards consistently, and they should be enforced through code reviews and automated tooling.

Regular reviews and updates of these standards should be conducted to incorporate new best practices and lessons learned from development experience.
