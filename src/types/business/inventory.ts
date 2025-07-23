export interface InventoryRecord {
  id: string;
  tenantId: string;
  date: Date;
  packageSales: number;
  refillSales: number;
  totalSales: number;
  packagePurchase: number;
  refillPurchase: number;
  emptyCylindersBuySell: number;
  fullCylinders: number;
  emptyCylinders: number;
  totalCylinders: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: string;
  tenantId: string;
  date: Date;
  type: MovementType;
  productId: string;
  driverId?: string;
  quantity: number;
  description: string;
  reference?: string;
  createdAt: Date;
}

export enum MovementType {
  SALE_PACKAGE = 'SALE_PACKAGE',
  SALE_REFILL = 'SALE_REFILL',
  PURCHASE_PACKAGE = 'PURCHASE_PACKAGE',
  PURCHASE_REFILL = 'PURCHASE_REFILL',
  EMPTY_CYLINDER_BUY = 'EMPTY_CYLINDER_BUY',
  EMPTY_CYLINDER_SELL = 'EMPTY_CYLINDER_SELL',
  ADJUSTMENT_POSITIVE = 'ADJUSTMENT_POSITIVE',
  ADJUSTMENT_NEGATIVE = 'ADJUSTMENT_NEGATIVE',
}

export interface InventoryStatus {
  productId: string;
  productName: string;
  companyName: string;
  fullCylinders: number;
  emptyCylinders: number;
  totalCylinders: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  lastUpdated: Date;
}

export interface InventoryCalculation {
  packageSales: number;
  refillSales: number;
  totalSales: number;
  packagePurchase: number;
  refillPurchase: number;
  emptyCylindersBuySell: number;
  todaysFullCylinders: number;
  todaysEmptyCylinders: number;
  totalCylinders: number;
}

export interface CylinderMovement {
  date: Date;
  fullCylinderMovement: number;
  emptyCylinderMovement: number;
  netMovement: number;
  runningFullTotal: number;
  runningEmptyTotal: number;
}
