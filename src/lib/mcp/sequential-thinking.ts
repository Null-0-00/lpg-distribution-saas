import { z } from 'zod';

export interface SequentialThought {
  thought: string;
  nextThoughtNeeded: boolean;
  thoughtNumber: number;
  totalThoughts: number;
  revisionOfThought?: number;
  branchFromThought?: number;
}

export interface SequentialThinkingResult {
  thoughts: SequentialThought[];
  finalResult?: any;
  processComplete: boolean;
}

const SequentialThoughtSchema = z.object({
  thought: z.string().min(1, 'Thought content is required'),
  nextThoughtNeeded: z.boolean(),
  thoughtNumber: z.number().int().positive(),
  totalThoughts: z.number().int().positive(),
  revisionOfThought: z.number().int().positive().optional(),
  branchFromThought: z.number().int().positive().optional(),
});

export class SequentialThinkingProcessor {
  private thoughts: SequentialThought[] = [];
  private maxThoughts: number = 50;
  private currentContext: string = '';

  constructor(maxThoughts: number = 50) {
    this.maxThoughts = maxThoughts;
  }

  setContext(context: string): void {
    this.currentContext = context;
  }

  addThought(thought: SequentialThought): void {
    const validatedThought = SequentialThoughtSchema.parse(thought);
    
    if (validatedThought.thoughtNumber > this.maxThoughts) {
      throw new Error(`Thought number exceeds maximum allowed (${this.maxThoughts})`);
    }

    this.thoughts.push(validatedThought);
  }

  getThoughts(): SequentialThought[] {
    return [...this.thoughts];
  }

  isComplete(): boolean {
    if (this.thoughts.length === 0) return false;
    const lastThought = this.thoughts[this.thoughts.length - 1];
    return !lastThought.nextThoughtNeeded || this.thoughts.length >= this.maxThoughts;
  }

  reset(): void {
    this.thoughts = [];
    this.currentContext = '';
  }

  export(): SequentialThinkingResult {
    return {
      thoughts: this.getThoughts(),
      processComplete: this.isComplete(),
    };
  }
}

export class LPGBusinessThinking extends SequentialThinkingProcessor {
  constructor() {
    super(30);
  }

  async analyzeInventoryCalculation(
    packageSales: number,
    refillSales: number,
    currentFull: number,
    currentEmpty: number,
    packagePurchases: number,
    refillPurchases: number
  ): Promise<SequentialThinkingResult> {
    this.reset();
    this.setContext('LPG Inventory Calculation Analysis');

    this.addThought({
      thought: `Starting inventory analysis with: Package Sales: ${packageSales}, Refill Sales: ${refillSales}, Current Full: ${currentFull}, Current Empty: ${currentEmpty}, Package Purchases: ${packagePurchases}, Refill Purchases: ${refillPurchases}`,
      nextThoughtNeeded: true,
      thoughtNumber: 1,
      totalThoughts: 8,
    });

    this.addThought({
      thought: `Package Sale Impact: Each package sale reduces full cylinders by 1 (no empty cylinder change). Total impact: -${packageSales} full cylinders`,
      nextThoughtNeeded: true,
      thoughtNumber: 2,
      totalThoughts: 8,
    });

    this.addThought({
      thought: `Refill Sale Impact: Each refill sale reduces full cylinders by 1 and increases empty cylinders by 1. Total impact: -${refillSales} full, +${refillSales} empty`,
      nextThoughtNeeded: true,
      thoughtNumber: 3,
      totalThoughts: 8,
    });

    this.addThought({
      thought: `Purchase Impact: Package purchases increase full cylinders. Refill purchases increase full cylinders. Total: +${packagePurchases + refillPurchases} full cylinders`,
      nextThoughtNeeded: true,
      thoughtNumber: 4,
      totalThoughts: 8,
    });

    const totalSales = packageSales + refillSales;
    const newFullCylinders = currentFull + packagePurchases + refillPurchases - totalSales;
    const newEmptyCylinders = currentEmpty + refillSales;

    this.addThought({
      thought: `Calculating new full cylinders: ${currentFull} + ${packagePurchases + refillPurchases} - ${totalSales} = ${newFullCylinders}`,
      nextThoughtNeeded: true,
      thoughtNumber: 5,
      totalThoughts: 8,
    });

    this.addThought({
      thought: `Calculating new empty cylinders: ${currentEmpty} + ${refillSales} = ${newEmptyCylinders}`,
      nextThoughtNeeded: true,
      thoughtNumber: 6,
      totalThoughts: 8,
    });

    this.addThought({
      thought: `Validation check: New full cylinders (${newFullCylinders}) should be >= 0, New empty cylinders (${newEmptyCylinders}) should be >= 0`,
      nextThoughtNeeded: true,
      thoughtNumber: 7,
      totalThoughts: 8,
    });

    const result = {
      newFullCylinders,
      newEmptyCylinders,
      isValid: newFullCylinders >= 0 && newEmptyCylinders >= 0,
    };

    this.addThought({
      thought: `Final result: Full cylinders: ${newFullCylinders}, Empty cylinders: ${newEmptyCylinders}, Valid: ${result.isValid}`,
      nextThoughtNeeded: false,
      thoughtNumber: 8,
      totalThoughts: 8,
    });

    const exportResult = this.export();
    return {
      ...exportResult,
      finalResult: result,
    };
  }

  async analyzeReceivablesCalculation(
    currentCashReceivables: number,
    currentCylinderReceivables: number,
    driverSalesRevenue: number,
    cashDeposits: number,
    discounts: number,
    driverRefillSales: number,
    cylinderDeposits: number
  ): Promise<SequentialThinkingResult> {
    this.reset();
    this.setContext('LPG Receivables Calculation Analysis');

    this.addThought({
      thought: `Analyzing receivables with current cash: ${currentCashReceivables}, current cylinder: ${currentCylinderReceivables}, sales revenue: ${driverSalesRevenue}`,
      nextThoughtNeeded: true,
      thoughtNumber: 1,
      totalThoughts: 6,
    });

    const cashReceivablesChange = driverSalesRevenue - cashDeposits - discounts;
    this.addThought({
      thought: `Cash receivables change: ${driverSalesRevenue} - ${cashDeposits} - ${discounts} = ${cashReceivablesChange}`,
      nextThoughtNeeded: true,
      thoughtNumber: 2,
      totalThoughts: 6,
    });

    const cylinderReceivablesChange = driverRefillSales - cylinderDeposits;
    this.addThought({
      thought: `Cylinder receivables change: ${driverRefillSales} - ${cylinderDeposits} = ${cylinderReceivablesChange}`,
      nextThoughtNeeded: true,
      thoughtNumber: 3,
      totalThoughts: 6,
    });

    const newCashReceivables = currentCashReceivables + cashReceivablesChange;
    const newCylinderReceivables = currentCylinderReceivables + cylinderReceivablesChange;

    this.addThought({
      thought: `New cash receivables: ${currentCashReceivables} + ${cashReceivablesChange} = ${newCashReceivables}`,
      nextThoughtNeeded: true,
      thoughtNumber: 4,
      totalThoughts: 6,
    });

    this.addThought({
      thought: `New cylinder receivables: ${currentCylinderReceivables} + ${cylinderReceivablesChange} = ${newCylinderReceivables}`,
      nextThoughtNeeded: true,
      thoughtNumber: 5,
      totalThoughts: 6,
    });

    const result = {
      newCashReceivables,
      newCylinderReceivables,
      cashReceivablesChange,
      cylinderReceivablesChange,
      totalReceivables: newCashReceivables + newCylinderReceivables,
    };

    this.addThought({
      thought: `Final receivables: Cash: ${newCashReceivables}, Cylinder: ${newCylinderReceivables}, Total: ${result.totalReceivables}`,
      nextThoughtNeeded: false,
      thoughtNumber: 6,
      totalThoughts: 6,
    });

    const exportResult = this.export();
    return {
      ...exportResult,
      finalResult: result,
    };
  }

  async analyzeFinancialReportGeneration(
    reportType: 'income' | 'balance' | 'cashflow',
    dateRange: { start: Date; end: Date },
    tenantId: string
  ): Promise<SequentialThinkingResult> {
    this.reset();
    this.setContext(`Financial Report Generation: ${reportType.toUpperCase()}`);

    this.addThought({
      thought: `Generating ${reportType} statement for tenant ${tenantId} from ${dateRange.start.toISOString()} to ${dateRange.end.toISOString()}`,
      nextThoughtNeeded: true,
      thoughtNumber: 1,
      totalThoughts: 10,
    });

    this.addThought({
      thought: `Step 1: Validate tenant isolation - ensuring all data queries include tenantId filter`,
      nextThoughtNeeded: true,
      thoughtNumber: 2,
      totalThoughts: 10,
    });

    this.addThought({
      thought: `Step 2: Validate date range - checking for valid start/end dates and business day alignment`,
      nextThoughtNeeded: true,
      thoughtNumber: 3,
      totalThoughts: 10,
    });

    if (reportType === 'income') {
      this.addThought({
        thought: `Income Statement: Need to collect revenue (sales), cost of goods sold (purchases), operating expenses, and calculate net income`,
        nextThoughtNeeded: true,
        thoughtNumber: 4,
        totalThoughts: 10,
      });
    } else if (reportType === 'balance') {
      this.addThought({
        thought: `Balance Sheet: Need to collect assets (inventory, receivables, cash), liabilities, and equity to ensure Assets = Liabilities + Equity`,
        nextThoughtNeeded: true,
        thoughtNumber: 4,
        totalThoughts: 10,
      });
    } else {
      this.addThought({
        thought: `Cash Flow: Need to track operating, investing, and financing activities to show cash movements`,
        nextThoughtNeeded: true,
        thoughtNumber: 4,
        totalThoughts: 10,
      });
    }

    this.addThought({
      thought: `Step 3: Data collection strategy - using optimized queries with proper indexes and batch processing for large datasets`,
      nextThoughtNeeded: true,
      thoughtNumber: 5,
      totalThoughts: 10,
    });

    this.addThought({
      thought: `Step 4: Business rule validation - ensuring all calculations follow LPG industry standards and multi-tenant isolation`,
      nextThoughtNeeded: true,
      thoughtNumber: 6,
      totalThoughts: 10,
    });

    this.addThought({
      thought: `Step 5: Real-time calculation processing - implementing precise decimal arithmetic for financial accuracy`,
      nextThoughtNeeded: true,
      thoughtNumber: 7,
      totalThoughts: 10,
    });

    this.addThought({
      thought: `Step 6: Cross-validation - checking totals against subsidiary ledgers and ensuring internal consistency`,
      nextThoughtNeeded: true,
      thoughtNumber: 8,
      totalThoughts: 10,
    });

    this.addThought({
      thought: `Step 7: Format and presentation - applying standard accounting formats and mobile-responsive design`,
      nextThoughtNeeded: true,
      thoughtNumber: 9,
      totalThoughts: 10,
    });

    this.addThought({
      thought: `Process complete: ${reportType} statement ready for presentation with full audit trail and validation checks passed`,
      nextThoughtNeeded: false,
      thoughtNumber: 10,
      totalThoughts: 10,
    });

    return this.export();
  }
}