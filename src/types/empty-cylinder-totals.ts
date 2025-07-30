// TypeScript types for empty_cylinder_totals_by_size view

export interface EmptyCylinderTotalsBySize {
  tenantId: string;
  cylinderSizeId: string;
  cylinderSizeName: string;
  
  // Baseline quantities
  quantityWithDrivers: number;
  onboardingBaseline: number;
  
  // Sales impact
  totalRefillSales: number;
  totalCylinderDeposits: number;
  netSalesImpact: number;
  
  // Shipment impact
  incomingEmptyShipments: number;
  outgoingEmptyShipments: number;
  netShipmentImpact: number;
  outstandingShipments: number;
  
  // Calculated totals
  totalQuantity: number;
  quantityWithDriversCurrent: number;
  quantityInHand: number;
  
  // Metadata
  calculatedAt: Date;
}

export interface EmptyCylinderSummary {
  [cylinderSize: string]: {
    totalQuantity: number;
    quantityInHand: number;
    quantityWithDrivers: number;
    breakdown: {
      onboardingBaseline: number;
      salesImpact: number;
      shipmentImpact: number;
      outstandingShipments: number;
    };
  };
}