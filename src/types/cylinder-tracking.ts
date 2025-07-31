// Enhanced Cylinder Tracking Types
// Comprehensive types for size-based cylinder tracking system

export interface CylinderTrackingEventData {
  tenantId: string;
  date: Date;
  cylinderSizeId: string;
  productId?: string;
  eventType: CylinderEventType;
  eventId?: string;
}

export enum CylinderEventType {
  ONBOARDING = 'ONBOARDING',
  SALES = 'SALES',
  SHIPMENT = 'SHIPMENT',
  ADJUSTMENT = 'ADJUSTMENT',
  RECEIVABLES_UPDATE = 'RECEIVABLES_UPDATE'
}

export interface OnboardingCylinderData extends CylinderTrackingEventData {
  onboardingFullCylinders: number;
  onboardingEmptyCylinders: number;
  onboardingTotalCylinders: number;
  onboardingCylinderReceivables: number;
  onboardingDate: Date;
}

export interface SalesCylinderData extends CylinderTrackingEventData {
  // Sales quantities by type
  salesPackageQuantity: number;
  salesRefillQuantity: number;
  // Sales revenue data
  salesPackageRevenue: number;
  salesRefillRevenue: number;
  salesTotalRevenue: number;
  // Deposits and payments
  salesCashDeposited: number;
  salesCylinderDeposited: number;
  salesDiscounts: number;
  salesNetRevenue: number;
  // Impact on inventory
  packageSales: number;
  refillSales: number;
  totalSales: number;
}

export interface ShipmentCylinderData extends CylinderTrackingEventData {
  // Shipment quantities by direction and type
  shipmentIncomingFullQuantity: number;
  shipmentIncomingEmptyQuantity: number;
  shipmentOutgoingFullQuantity: number;
  shipmentOutgoingEmptyQuantity: number;
  // Shipment types
  shipmentPackageQuantity: number;
  shipmentRefillQuantity: number;
  shipmentTotalCost: number;
  // Impact on inventory
  packagePurchase: number;
  refillPurchase: number;
  emptyCylindersBuySell: number;
}

export interface ReceivablesCylinderData extends CylinderTrackingEventData {
  emptyCylinderReceivables: number;
  cashReceivablesChange: number;
  cylinderReceivablesChange: number;
  totalCashReceivables: number;
  totalCylinderReceivables: number;
}

export interface InventoryCylinderData extends CylinderTrackingEventData {
  fullCylinders: number;
  emptyCylinders: number;
  totalCylinders: number;
}

export interface ComprehensiveCylinderRecord 
  extends OnboardingCylinderData, 
          SalesCylinderData, 
          ShipmentCylinderData, 
          ReceivablesCylinderData, 
          InventoryCylinderData {
  id: string;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CylinderTrackingInput {
  tenantId: string;
  date: Date;
  cylinderSizeId: string;
  productId?: string;
  eventType: CylinderEventType;
  eventId?: string;
  
  // Optional data based on event type
  onboardingData?: Partial<OnboardingCylinderData>;
  salesData?: Partial<SalesCylinderData>;
  shipmentData?: Partial<ShipmentCylinderData>;
  receivablesData?: Partial<ReceivablesCylinderData>;
  inventoryData?: Partial<InventoryCylinderData>;
}

export interface CylinderTrackingQuery {
  tenantId: string;
  cylinderSizeId?: string;
  productId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  eventType?: CylinderEventType;
  eventId?: string;
}

export interface CylinderTrackingAggregation {
  cylinderSizeId: string;
  cylinderSize: string;
  
  // Onboarding totals
  totalOnboardingFullCylinders: number;
  totalOnboardingEmptyCylinders: number;
  totalOnboardingCylinderReceivables: number;
  
  // Sales totals
  totalPackageSales: number;
  totalRefillSales: number;
  totalSalesRevenue: number;
  totalCashDeposited: number;
  totalCylinderDeposited: number;
  
  // Shipment totals
  totalIncomingFull: number;
  totalIncomingEmpty: number;
  totalOutgoingFull: number;
  totalOutgoingEmpty: number;
  totalShipmentCost: number;
  
  // Current status
  currentFullCylinders: number;
  currentEmptyCylinders: number;
  currentTotalCylinders: number;
  currentCashReceivables: number;
  currentCylinderReceivables: number;
}

export interface CylinderMovementSummary {
  date: Date;
  cylinderSizeId: string;
  movements: {
    packageSalesOut: number;
    refillSalesOut: number;
    refillSalesEmptyIn: number;
    packagePurchaseIn: number;
    refillPurchaseIn: number;
    emptyPurchaseIn: number;
    emptySalesOut: number;
  };
  netFullCylinderChange: number;
  netEmptyCylinderChange: number;
  netReceivablesChange: number;
}

export interface CylinderValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface CylinderTrackingResult {
  success: boolean;
  data?: ComprehensiveCylinderRecord;
  errors?: CylinderValidationError[];
  warnings?: string[];
}

export interface CylinderTrackingBatchResult {
  success: boolean;
  processedCount: number;
  data?: ComprehensiveCylinderRecord[];
  errors?: Array<{
    index: number;
    input: CylinderTrackingInput;
    errors: CylinderValidationError[];
  }>;
  warnings?: string[];
}

// Business rule validation interfaces
export interface CylinderBusinessRules {
  validateQuantities: boolean;
  validateReceivables: boolean;
  validateInventoryBalance: boolean;
  validateOnboardingBaseline: boolean;
  enforceNonNegativeInventory: boolean;
  validateEventSequence: boolean;
}

export interface CylinderAuditTrail {
  recordId: string;
  tenantId: string;
  cylinderSizeId: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  oldValues?: Partial<ComprehensiveCylinderRecord>;
  newValues?: Partial<ComprehensiveCylinderRecord>;  
  changedBy?: string;
  changeReason?: string;
  timestamp: Date;
  eventId?: string;
}

// Export utility type for Prisma integration
export type PrismaCylinderTrackingData = Omit<
  ComprehensiveCylinderRecord, 
  'id' | 'createdAt' | 'updatedAt' | 'calculatedAt'
>;