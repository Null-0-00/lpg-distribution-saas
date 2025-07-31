// Enhanced Cylinder Tracking Business Logic
// Implements comprehensive size-based cylinder tracking with automatic data population

import { PrismaClient } from '@prisma/client';
import {
  CylinderTrackingInput,
  CylinderTrackingResult,
  CylinderTrackingBatchResult,
  CylinderEventType,
  OnboardingCylinderData,
  SalesCylinderData,
  ShipmentCylinderData,
  ReceivablesCylinderData,
  ComprehensiveCylinderRecord,
  CylinderValidationError,
  CylinderBusinessRules,
  CylinderTrackingQuery,
  CylinderTrackingAggregation,
  PrismaCylinderTrackingData,
} from '@/types/cylinder-tracking';
import { CylinderTrackingValidator } from './cylinder-tracking-validator';

export class CylinderTrackingService {
  private readonly businessRules: CylinderBusinessRules = {
    validateQuantities: true,
    validateReceivables: true,
    validateInventoryBalance: true,
    validateOnboardingBaseline: true,
    enforceNonNegativeInventory: true,
    validateEventSequence: true,
  };

  private readonly validator: CylinderTrackingValidator;

  constructor(private prisma: PrismaClient) {
    this.validator = new CylinderTrackingValidator(prisma, this.businessRules);
  }

  /**
   * Create or update cylinder tracking record with automatic data population
   */
  async upsertCylinderTrackingRecord(
    input: CylinderTrackingInput
  ): Promise<CylinderTrackingResult> {
    try {
      // Sanitize input data
      const sanitizedInput = this.validator.sanitizeInput(input);

      // Validate input data
      const validationErrors =
        await this.validator.validateCylinderTrackingInput(sanitizedInput);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors,
        };
      }

      // Prepare comprehensive data based on event type
      const trackingData = await this.prepareTrackingData(sanitizedInput);

      // Get date for database operations
      const dateOnly = new Date(sanitizedInput.date);
      dateOnly.setHours(0, 0, 0, 0);

      // Upsert the record
      const record = await this.prisma.inventoryRecord.upsert({
        where: {
          tenantId_date_productId_cylinderSizeId: {
            tenantId: sanitizedInput.tenantId,
            date: dateOnly,
            productId: sanitizedInput.productId || '',
            cylinderSizeId: sanitizedInput.cylinderSizeId,
          },
        },
        update: {
          ...trackingData,
          calculatedAt: new Date(),
        },
        create: {
          ...trackingData,
          tenantId: sanitizedInput.tenantId,
          date: dateOnly,
          productId: sanitizedInput.productId || '',
          cylinderSizeId: sanitizedInput.cylinderSizeId,
        },
        include: {
          cylinderSize: true,
        },
      });

      return {
        success: true,
        data: this.mapToComprehensiveRecord(record),
      };
    } catch (error) {
      console.error('Error in upsertCylinderTrackingRecord:', error);
      return {
        success: false,
        errors: [
          {
            field: 'system',
            message: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  /**
   * Process onboarding completion event
   */
  async processOnboardingEvent(
    tenantId: string,
    onboardingData: Array<{
      cylinderSizeId: string;
      productId?: string;
      fullCylinders: number;
      emptyCylinders: number;
      cylinderReceivables: number;
    }>
  ): Promise<CylinderTrackingBatchResult> {
    const results: CylinderTrackingResult[] = [];
    const errors: Array<{
      index: number;
      input: CylinderTrackingInput;
      errors: CylinderValidationError[];
    }> = [];

    const onboardingDate = new Date();

    for (let i = 0; i < onboardingData.length; i++) {
      const data = onboardingData[i];

      const input: CylinderTrackingInput = {
        tenantId,
        date: onboardingDate,
        cylinderSizeId: data.cylinderSizeId,
        productId: data.productId,
        eventType: CylinderEventType.ONBOARDING,
        onboardingData: {
          tenantId,
          date: onboardingDate,
          cylinderSizeId: data.cylinderSizeId,
          productId: data.productId,
          eventType: CylinderEventType.ONBOARDING,
          onboardingFullCylinders: data.fullCylinders,
          onboardingEmptyCylinders: data.emptyCylinders,
          onboardingTotalCylinders: data.fullCylinders + data.emptyCylinders,
          onboardingCylinderReceivables: data.cylinderReceivables,
          onboardingDate,
        },
        inventoryData: {
          tenantId,
          date: onboardingDate,
          cylinderSizeId: data.cylinderSizeId,
          productId: data.productId,
          eventType: CylinderEventType.ONBOARDING,
          fullCylinders: data.fullCylinders,
          emptyCylinders: data.emptyCylinders,
          totalCylinders: data.fullCylinders + data.emptyCylinders,
        },
        receivablesData: {
          tenantId,
          date: onboardingDate,
          cylinderSizeId: data.cylinderSizeId,
          productId: data.productId,
          eventType: CylinderEventType.ONBOARDING,
          emptyCylinderReceivables: data.cylinderReceivables,
          cashReceivablesChange: 0,
          cylinderReceivablesChange: data.cylinderReceivables,
          totalCashReceivables: 0,
          totalCylinderReceivables: data.cylinderReceivables,
        },
      };

      const result = await this.upsertCylinderTrackingRecord(input);
      results.push(result);

      if (!result.success) {
        errors.push({
          index: i,
          input,
          errors: result.errors || [],
        });
      }
    }

    return {
      success: errors.length === 0,
      processedCount: results.filter((r) => r.success).length,
      data: results.filter((r) => r.success).map((r) => r.data!),
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Process sales event
   */
  async processSalesEvent(
    tenantId: string,
    saleData: {
      saleId: string;
      productId: string;
      cylinderSizeId: string;
      saleDate: Date;
      saleType: 'PACKAGE' | 'REFILL';
      quantity: number;
      unitPrice: number;
      totalValue: number;
      discount: number;
      netValue: number;
      cashDeposited: number;
      cylindersDeposited: number;
    }
  ): Promise<CylinderTrackingResult> {
    const input: CylinderTrackingInput = {
      tenantId,
      date: saleData.saleDate,
      cylinderSizeId: saleData.cylinderSizeId,
      productId: saleData.productId,
      eventType: CylinderEventType.SALES,
      eventId: saleData.saleId,
      salesData: {
        tenantId,
        date: saleData.saleDate,
        cylinderSizeId: saleData.cylinderSizeId,
        productId: saleData.productId,
        eventType: CylinderEventType.SALES,
        eventId: saleData.saleId,
        salesPackageQuantity:
          saleData.saleType === 'PACKAGE' ? saleData.quantity : 0,
        salesRefillQuantity:
          saleData.saleType === 'REFILL' ? saleData.quantity : 0,
        salesPackageRevenue:
          saleData.saleType === 'PACKAGE' ? saleData.totalValue : 0,
        salesRefillRevenue:
          saleData.saleType === 'REFILL' ? saleData.totalValue : 0,
        salesTotalRevenue: saleData.totalValue,
        salesCashDeposited: saleData.cashDeposited,
        salesCylinderDeposited: saleData.cylindersDeposited,
        salesDiscounts: saleData.discount,
        salesNetRevenue: saleData.netValue,
        packageSales: saleData.saleType === 'PACKAGE' ? saleData.quantity : 0,
        refillSales: saleData.saleType === 'REFILL' ? saleData.quantity : 0,
        totalSales: saleData.quantity,
      },
    };

    // Calculate receivables impact
    const cashReceivablesChange =
      saleData.netValue - saleData.cashDeposited - saleData.discount;
    const cylinderReceivablesChange =
      saleData.saleType === 'REFILL'
        ? saleData.quantity - saleData.cylindersDeposited
        : 0;

    input.receivablesData = {
      tenantId,
      date: saleData.saleDate,
      cylinderSizeId: saleData.cylinderSizeId,
      productId: saleData.productId,
      eventType: CylinderEventType.SALES,
      eventId: saleData.saleId,
      emptyCylinderReceivables: 0, // Will be calculated
      cashReceivablesChange,
      cylinderReceivablesChange,
      totalCashReceivables: 0, // Will be calculated
      totalCylinderReceivables: 0, // Will be calculated
    };

    return await this.upsertCylinderTrackingRecord(input);
  }

  /**
   * Process shipment event
   */
  async processShipmentEvent(
    tenantId: string,
    shipmentData: {
      shipmentId: string;
      productId: string;
      cylinderSizeId: string;
      shipmentDate: Date;
      shipmentType:
        | 'INCOMING_FULL'
        | 'INCOMING_EMPTY'
        | 'OUTGOING_FULL'
        | 'OUTGOING_EMPTY';
      quantity: number;
      unitCost?: number;
      totalCost?: number;
      isRefill?: boolean;
      status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED';
    }
  ): Promise<CylinderTrackingResult> {
    const input: CylinderTrackingInput = {
      tenantId,
      date: shipmentData.shipmentDate,
      cylinderSizeId: shipmentData.cylinderSizeId,
      productId: shipmentData.productId,
      eventType: CylinderEventType.SHIPMENT,
      eventId: shipmentData.shipmentId,
      shipmentData: {
        tenantId,
        date: shipmentData.shipmentDate,
        cylinderSizeId: shipmentData.cylinderSizeId,
        productId: shipmentData.productId,
        eventType: CylinderEventType.SHIPMENT,
        eventId: shipmentData.shipmentId,
        shipmentIncomingFullQuantity:
          shipmentData.shipmentType === 'INCOMING_FULL'
            ? shipmentData.quantity
            : 0,
        shipmentIncomingEmptyQuantity:
          shipmentData.shipmentType === 'INCOMING_EMPTY'
            ? shipmentData.quantity
            : 0,
        shipmentOutgoingFullQuantity:
          shipmentData.shipmentType === 'OUTGOING_FULL'
            ? shipmentData.quantity
            : 0,
        shipmentOutgoingEmptyQuantity:
          shipmentData.shipmentType === 'OUTGOING_EMPTY'
            ? shipmentData.quantity
            : 0,
        shipmentPackageQuantity:
          shipmentData.shipmentType === 'INCOMING_FULL' &&
          !shipmentData.isRefill
            ? shipmentData.quantity
            : 0,
        shipmentRefillQuantity:
          shipmentData.shipmentType === 'INCOMING_FULL' && shipmentData.isRefill
            ? shipmentData.quantity
            : 0,
        shipmentTotalCost: shipmentData.totalCost || 0,
        packagePurchase:
          shipmentData.shipmentType === 'INCOMING_FULL' &&
          !shipmentData.isRefill &&
          shipmentData.status === 'COMPLETED'
            ? shipmentData.quantity
            : 0,
        refillPurchase:
          shipmentData.shipmentType === 'INCOMING_FULL' && shipmentData.isRefill
            ? shipmentData.quantity
            : 0,
        emptyCylindersBuySell:
          this.calculateEmptyCylindersBuySell(shipmentData),
      },
    };

    return await this.upsertCylinderTrackingRecord(input);
  }

  /**
   * Get cylinder tracking aggregation by size
   */
  async getCylinderTrackingAggregation(
    query: CylinderTrackingQuery
  ): Promise<CylinderTrackingAggregation[]> {
    const whereClause: any = {
      tenantId: query.tenantId,
    };

    if (query.cylinderSizeId) {
      whereClause.cylinderSizeId = query.cylinderSizeId;
    }

    if (query.productId) {
      whereClause.productId = query.productId;
    }

    if (query.dateFrom || query.dateTo) {
      whereClause.date = {};
      if (query.dateFrom) whereClause.date.gte = query.dateFrom;
      if (query.dateTo) whereClause.date.lte = query.dateTo;
    }

    if (query.eventType) {
      whereClause.eventType = query.eventType;
    }

    if (query.eventId) {
      whereClause.eventId = query.eventId;
    }

    const records = await this.prisma.inventoryRecord.findMany({
      where: whereClause,
      include: {
        cylinderSize: true,
      },
    });

    // Group by cylinderSizeId and aggregate
    const aggregationMap = new Map<string, CylinderTrackingAggregation>();

    for (const record of records) {
      const key = record.cylinderSizeId;

      if (!aggregationMap.has(key)) {
        aggregationMap.set(key, {
          cylinderSizeId: record.cylinderSizeId,
          cylinderSize: record.cylinderSize.size,
          totalOnboardingFullCylinders: 0,
          totalOnboardingEmptyCylinders: 0,
          totalOnboardingCylinderReceivables: 0,
          totalPackageSales: 0,
          totalRefillSales: 0,
          totalSalesRevenue: 0,
          totalCashDeposited: 0,
          totalCylinderDeposited: 0,
          totalIncomingFull: 0,
          totalIncomingEmpty: 0,
          totalOutgoingFull: 0,
          totalOutgoingEmpty: 0,
          totalShipmentCost: 0,
          currentFullCylinders: 0,
          currentEmptyCylinders: 0,
          currentTotalCylinders: 0,
          currentCashReceivables: 0,
          currentCylinderReceivables: 0,
        });
      }

      const agg = aggregationMap.get(key)!;

      // Aggregate data using available fields
      agg.totalOnboardingFullCylinders +=
        (record as any).onboardingFullCylinders || 0;
      agg.totalOnboardingEmptyCylinders +=
        (record as any).onboardingEmptyCylinders || 0;
      agg.totalOnboardingCylinderReceivables +=
        (record as any).onboardingCylinderReceivables || 0;
      agg.totalPackageSales += record.packageSales || 0;
      agg.totalRefillSales += record.refillSales || 0;
      agg.totalSalesRevenue += (record as any).salesTotalRevenue || 0;
      agg.totalCashDeposited += (record as any).salesCashDeposited || 0;
      agg.totalCylinderDeposited += (record as any).salesCylinderDeposited || 0;
      agg.totalIncomingFull +=
        (record as any).shipmentIncomingFullQuantity || 0;
      agg.totalIncomingEmpty +=
        (record as any).shipmentIncomingEmptyQuantity || 0;
      agg.totalOutgoingFull +=
        (record as any).shipmentOutgoingFullQuantity || 0;
      agg.totalOutgoingEmpty +=
        (record as any).shipmentOutgoingEmptyQuantity || 0;
      agg.totalShipmentCost += (record as any).shipmentTotalCost || 0;

      // Use latest values for current status
      agg.currentFullCylinders = record.fullCylinders;
      agg.currentEmptyCylinders = record.emptyCylinders;
      agg.currentTotalCylinders = record.totalCylinders;
      agg.currentCashReceivables = (record as any).totalCashReceivables || 0;
      agg.currentCylinderReceivables = record.emptyCylinderReceivables || 0;
    }

    return Array.from(aggregationMap.values());
  }

  /**
   * Prepare tracking data based on event type and input
   */
  private async prepareTrackingData(
    input: CylinderTrackingInput
  ): Promise<PrismaCylinderTrackingData> {
    // Get existing record to preserve data
    const existing = await this.getExistingRecord(input);

    const mergedData = this.mergeEventData(input, existing);
    const data: PrismaCylinderTrackingData = {
      tenantId: input.tenantId,
      productId: input.productId,
      cylinderSizeId: input.cylinderSizeId,
      date: input.date,
      eventType: input.eventType,
      eventId: input.eventId,

      // Onboarding data
      onboardingFullCylinders:
        mergedData.onboardingFullCylinders ??
        existing?.onboardingFullCylinders ??
        0,
      onboardingEmptyCylinders:
        mergedData.onboardingEmptyCylinders ??
        existing?.onboardingEmptyCylinders ??
        0,
      onboardingTotalCylinders:
        mergedData.onboardingTotalCylinders ??
        existing?.onboardingTotalCylinders ??
        0,
      onboardingCylinderReceivables:
        mergedData.onboardingCylinderReceivables ??
        existing?.onboardingCylinderReceivables ??
        0,
      onboardingDate:
        mergedData.onboardingDate ?? existing?.onboardingDate ?? input.date,

      // Sales data
      salesPackageQuantity:
        mergedData.salesPackageQuantity ?? existing?.salesPackageQuantity ?? 0,
      salesRefillQuantity:
        mergedData.salesRefillQuantity ?? existing?.salesRefillQuantity ?? 0,
      salesPackageRevenue:
        mergedData.salesPackageRevenue ?? existing?.salesPackageRevenue ?? 0,
      salesRefillRevenue:
        mergedData.salesRefillRevenue ?? existing?.salesRefillRevenue ?? 0,
      salesTotalRevenue:
        mergedData.salesTotalRevenue ?? existing?.salesTotalRevenue ?? 0,
      salesCashDeposited:
        mergedData.salesCashDeposited ?? existing?.salesCashDeposited ?? 0,
      salesCylinderDeposited:
        mergedData.salesCylinderDeposited ??
        existing?.salesCylinderDeposited ??
        0,
      salesDiscounts:
        mergedData.salesDiscounts ?? existing?.salesDiscounts ?? 0,
      salesNetRevenue:
        mergedData.salesNetRevenue ?? existing?.salesNetRevenue ?? 0,
      packageSales: mergedData.packageSales ?? existing?.packageSales ?? 0,
      refillSales: mergedData.refillSales ?? existing?.refillSales ?? 0,
      totalSales: mergedData.totalSales ?? existing?.totalSales ?? 0,

      // Shipment data
      shipmentIncomingFullQuantity:
        mergedData.shipmentIncomingFullQuantity ??
        existing?.shipmentIncomingFullQuantity ??
        0,
      shipmentIncomingEmptyQuantity:
        mergedData.shipmentIncomingEmptyQuantity ??
        existing?.shipmentIncomingEmptyQuantity ??
        0,
      shipmentOutgoingFullQuantity:
        mergedData.shipmentOutgoingFullQuantity ??
        existing?.shipmentOutgoingFullQuantity ??
        0,
      shipmentOutgoingEmptyQuantity:
        mergedData.shipmentOutgoingEmptyQuantity ??
        existing?.shipmentOutgoingEmptyQuantity ??
        0,
      shipmentPackageQuantity:
        mergedData.shipmentPackageQuantity ??
        existing?.shipmentPackageQuantity ??
        0,
      shipmentRefillQuantity:
        mergedData.shipmentRefillQuantity ??
        existing?.shipmentRefillQuantity ??
        0,
      shipmentTotalCost:
        mergedData.shipmentTotalCost ?? existing?.shipmentTotalCost ?? 0,
      packagePurchase:
        mergedData.packagePurchase ?? existing?.packagePurchase ?? 0,
      refillPurchase:
        mergedData.refillPurchase ?? existing?.refillPurchase ?? 0,
      emptyCylindersBuySell:
        mergedData.emptyCylindersBuySell ??
        existing?.emptyCylindersBuySell ??
        0,

      // Receivables data
      emptyCylinderReceivables:
        mergedData.emptyCylinderReceivables ??
        existing?.emptyCylinderReceivables ??
        0,
      cashReceivablesChange:
        mergedData.cashReceivablesChange ??
        existing?.cashReceivablesChange ??
        0,
      cylinderReceivablesChange:
        mergedData.cylinderReceivablesChange ??
        existing?.cylinderReceivablesChange ??
        0,
      totalCashReceivables:
        mergedData.totalCashReceivables ?? existing?.totalCashReceivables ?? 0,
      totalCylinderReceivables:
        mergedData.totalCylinderReceivables ??
        existing?.totalCylinderReceivables ??
        0,

      // Inventory data
      fullCylinders: mergedData.fullCylinders ?? existing?.fullCylinders ?? 0,
      emptyCylinders:
        mergedData.emptyCylinders ?? existing?.emptyCylinders ?? 0,
      totalCylinders:
        mergedData.totalCylinders ?? existing?.totalCylinders ?? 0,
    };

    return data;
  }

  /**
   * Get existing record for data preservation
   */
  private async getExistingRecord(
    input: CylinderTrackingInput
  ): Promise<Partial<PrismaCylinderTrackingData>> {
    const dateOnly = new Date(input.date);
    dateOnly.setHours(0, 0, 0, 0);

    const existing = await this.prisma.inventoryRecord.findUnique({
      where: {
        tenantId_date_productId_cylinderSizeId: {
          tenantId: input.tenantId,
          date: dateOnly,
          productId: input.productId || '',
          cylinderSizeId: input.cylinderSizeId,
        },
      },
    });

    if (!existing) {
      return {};
    }

    // Return existing data without Prisma metadata, fixing null handling
    const {
      id,
      createdAt,
      updatedAt,
      calculatedAt,
      productId,
      ...existingData
    } = existing;
    return {
      ...existingData,
      productId: productId || '',
    };
  }

  /**
   * Merge event-specific data
   */
  private mergeEventData(
    input: CylinderTrackingInput,
    existing: Partial<PrismaCylinderTrackingData>
  ): Partial<PrismaCylinderTrackingData> {
    const merged: Partial<PrismaCylinderTrackingData> = {};

    // Apply onboarding data
    if (input.onboardingData) {
      Object.assign(merged, {
        onboardingFullCylinders:
          input.onboardingData.onboardingFullCylinders ??
          existing.onboardingFullCylinders ??
          0,
        onboardingEmptyCylinders:
          input.onboardingData.onboardingEmptyCylinders ??
          existing.onboardingEmptyCylinders ??
          0,
        onboardingTotalCylinders:
          input.onboardingData.onboardingTotalCylinders ??
          existing.onboardingTotalCylinders ??
          0,
        onboardingCylinderReceivables:
          input.onboardingData.onboardingCylinderReceivables ??
          existing.onboardingCylinderReceivables ??
          0,
        onboardingDate:
          input.onboardingData.onboardingDate ?? existing.onboardingDate,
      });
    }

    // Apply sales data
    if (input.salesData) {
      Object.assign(merged, {
        salesPackageQuantity:
          (existing.salesPackageQuantity ?? 0) +
          (input.salesData.salesPackageQuantity ?? 0),
        salesRefillQuantity:
          (existing.salesRefillQuantity ?? 0) +
          (input.salesData.salesRefillQuantity ?? 0),
        salesPackageRevenue:
          (existing.salesPackageRevenue ?? 0) +
          (input.salesData.salesPackageRevenue ?? 0),
        salesRefillRevenue:
          (existing.salesRefillRevenue ?? 0) +
          (input.salesData.salesRefillRevenue ?? 0),
        salesTotalRevenue:
          (existing.salesTotalRevenue ?? 0) +
          (input.salesData.salesTotalRevenue ?? 0),
        salesCashDeposited:
          (existing.salesCashDeposited ?? 0) +
          (input.salesData.salesCashDeposited ?? 0),
        salesCylinderDeposited:
          (existing.salesCylinderDeposited ?? 0) +
          (input.salesData.salesCylinderDeposited ?? 0),
        salesDiscounts:
          (existing.salesDiscounts ?? 0) +
          (input.salesData.salesDiscounts ?? 0),
        salesNetRevenue:
          (existing.salesNetRevenue ?? 0) +
          (input.salesData.salesNetRevenue ?? 0),
        packageSales:
          (existing.packageSales ?? 0) + (input.salesData.packageSales ?? 0),
        refillSales:
          (existing.refillSales ?? 0) + (input.salesData.refillSales ?? 0),
        totalSales:
          (existing.totalSales ?? 0) + (input.salesData.totalSales ?? 0),
      });
    }

    // Apply shipment data
    if (input.shipmentData) {
      Object.assign(merged, {
        shipmentIncomingFullQuantity:
          (existing.shipmentIncomingFullQuantity ?? 0) +
          (input.shipmentData.shipmentIncomingFullQuantity ?? 0),
        shipmentIncomingEmptyQuantity:
          (existing.shipmentIncomingEmptyQuantity ?? 0) +
          (input.shipmentData.shipmentIncomingEmptyQuantity ?? 0),
        shipmentOutgoingFullQuantity:
          (existing.shipmentOutgoingFullQuantity ?? 0) +
          (input.shipmentData.shipmentOutgoingFullQuantity ?? 0),
        shipmentOutgoingEmptyQuantity:
          (existing.shipmentOutgoingEmptyQuantity ?? 0) +
          (input.shipmentData.shipmentOutgoingEmptyQuantity ?? 0),
        shipmentPackageQuantity:
          (existing.shipmentPackageQuantity ?? 0) +
          (input.shipmentData.shipmentPackageQuantity ?? 0),
        shipmentRefillQuantity:
          (existing.shipmentRefillQuantity ?? 0) +
          (input.shipmentData.shipmentRefillQuantity ?? 0),
        shipmentTotalCost:
          (existing.shipmentTotalCost ?? 0) +
          (input.shipmentData.shipmentTotalCost ?? 0),
        packagePurchase:
          (existing.packagePurchase ?? 0) +
          (input.shipmentData.packagePurchase ?? 0),
        refillPurchase:
          (existing.refillPurchase ?? 0) +
          (input.shipmentData.refillPurchase ?? 0),
        emptyCylindersBuySell:
          (existing.emptyCylindersBuySell ?? 0) +
          (input.shipmentData.emptyCylindersBuySell ?? 0),
      });
    }

    // Apply receivables data
    if (input.receivablesData) {
      Object.assign(merged, {
        emptyCylinderReceivables:
          input.receivablesData.emptyCylinderReceivables ??
          existing.emptyCylinderReceivables ??
          0,
        cashReceivablesChange:
          (existing.cashReceivablesChange ?? 0) +
          (input.receivablesData.cashReceivablesChange ?? 0),
        cylinderReceivablesChange:
          (existing.cylinderReceivablesChange ?? 0) +
          (input.receivablesData.cylinderReceivablesChange ?? 0),
        totalCashReceivables:
          input.receivablesData.totalCashReceivables ??
          existing.totalCashReceivables ??
          0,
        totalCylinderReceivables:
          input.receivablesData.totalCylinderReceivables ??
          existing.totalCylinderReceivables ??
          0,
      });
    }

    // Apply inventory data
    if (input.inventoryData) {
      Object.assign(merged, {
        fullCylinders:
          input.inventoryData.fullCylinders ?? existing.fullCylinders ?? 0,
        emptyCylinders:
          input.inventoryData.emptyCylinders ?? existing.emptyCylinders ?? 0,
        totalCylinders:
          input.inventoryData.totalCylinders ?? existing.totalCylinders ?? 0,
      });
    }

    return merged;
  }

  /**
   * Calculate empty cylinders buy/sell based on shipment data
   */
  private calculateEmptyCylindersBuySell(shipmentData: {
    shipmentType: string;
    quantity: number;
    status: string;
  }): number {
    if (shipmentData.status !== 'COMPLETED') {
      return 0;
    }

    if (shipmentData.shipmentType === 'INCOMING_EMPTY') {
      return shipmentData.quantity; // Buy
    } else if (shipmentData.shipmentType === 'OUTGOING_EMPTY') {
      return -shipmentData.quantity; // Sell
    }

    return 0;
  }

  /**
   * Map Prisma record to comprehensive record type
   */
  private mapToComprehensiveRecord(record: any): ComprehensiveCylinderRecord {
    return {
      id: record.id,
      tenantId: record.tenantId,
      productId: record.productId,
      cylinderSizeId: record.cylinderSizeId,
      date: record.date,
      eventType: record.eventType as CylinderEventType,
      eventId: record.eventId,
      // Onboarding data
      onboardingFullCylinders: record.onboardingFullCylinders,
      onboardingEmptyCylinders: record.onboardingEmptyCylinders,
      onboardingTotalCylinders: record.onboardingTotalCylinders,
      onboardingCylinderReceivables: record.onboardingCylinderReceivables,
      onboardingDate: record.onboardingDate,
      // Sales data
      salesPackageQuantity: record.salesPackageQuantity,
      salesRefillQuantity: record.salesRefillQuantity,
      salesPackageRevenue: record.salesPackageRevenue,
      salesRefillRevenue: record.salesRefillRevenue,
      salesTotalRevenue: record.salesTotalRevenue,
      salesCashDeposited: record.salesCashDeposited,
      salesCylinderDeposited: record.salesCylinderDeposited,
      salesDiscounts: record.salesDiscounts,
      salesNetRevenue: record.salesNetRevenue,
      packageSales: record.packageSales,
      refillSales: record.refillSales,
      totalSales: record.totalSales,
      // Shipment data
      shipmentIncomingFullQuantity: record.shipmentIncomingFullQuantity,
      shipmentIncomingEmptyQuantity: record.shipmentIncomingEmptyQuantity,
      shipmentOutgoingFullQuantity: record.shipmentOutgoingFullQuantity,
      shipmentOutgoingEmptyQuantity: record.shipmentOutgoingEmptyQuantity,
      shipmentPackageQuantity: record.shipmentPackageQuantity,
      shipmentRefillQuantity: record.shipmentRefillQuantity,
      shipmentTotalCost: record.shipmentTotalCost,
      packagePurchase: record.packagePurchase,
      refillPurchase: record.refillPurchase,
      emptyCylindersBuySell: record.emptyCylindersBuySell,
      // Receivables data
      emptyCylinderReceivables: record.emptyCylinderReceivables,
      cashReceivablesChange: record.cashReceivablesChange,
      cylinderReceivablesChange: record.cylinderReceivablesChange,
      totalCashReceivables: record.totalCashReceivables,
      totalCylinderReceivables: record.totalCylinderReceivables,
      // Inventory data
      fullCylinders: record.fullCylinders,
      emptyCylinders: record.emptyCylinders,
      totalCylinders: record.totalCylinders,
      // Metadata
      calculatedAt: record.calculatedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
