export interface Sale {
  id: string;
  tenantId: string;
  driverId: string;
  productId: string;
  saleType: SaleType;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  paymentType: PaymentType;
  discount: number;
  cashDeposited: number;
  cylindersDeposited: number;
  isOnCredit: boolean;
  isCylinderCredit: boolean;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum SaleType {
  PACKAGE = "PACKAGE",
  REFILL = "REFILL",
}

export enum PaymentType {
  CASH = "CASH",
  CREDIT = "CREDIT",
  CYLINDER_CREDIT = "CYLINDER_CREDIT",
}

export interface DailySalesEntry {
  driverId: string;
  productId: string;
  companyId: string;
  saleType: SaleType;
  quantity: number;
  unitPrice: number;
  paymentType: PaymentType;
  discount: number;
  cashDeposited: number;
  cylindersDeposited: number;
}

export interface DailySalesReport {
  date: Date;
  driverName: string;
  packageSalesQty: number;
  refillSalesQty: number;
  totalSalesQty: number;
  totalSalesValue: number;
  discount: number;
  totalDeposited: number;
  totalCylindersReceivables: number;
  totalReceivables: number;
  changeInReceivables: number;
}

export interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  averageSaleValue: number;
  packageSalesPercentage: number;
  refillSalesPercentage: number;
  cashSalesPercentage: number;
  creditSalesPercentage: number;
}