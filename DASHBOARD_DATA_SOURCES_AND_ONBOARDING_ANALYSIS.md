# Dashboard Data Sources and Onboarding Analysis

## Comprehensive Data Sources Report for LPG Distributor SaaS Dashboard Pages

### 1. Daily Sales Report Page (`/dashboard/reports/daily-sales`)

#### Data Sources:

- **Primary Tables**: `sale`, `driver`, `expense`, `deposit`, `receivableRecord`
- **Key Columns**:
  - `sale`: `id`, `driverId`, `totalValue`, `discount`, `cashDeposited`, `cylindersDeposited`, `saleType`, `saleDate`, `quantity`
  - `driver`: `id`, `name`, `status`, `driverType`
  - `expense`: `id`, `description`, `amount`, `expenseDate`, `category`
  - `deposit`: `id`, `driverId`, `amount`, `depositDate`, `depositType`
  - `receivableRecord`: `totalCashReceivables`, `totalCylinderReceivables`, `cashReceivablesChange`, `cylinderReceivablesChange`

#### Business Logic & Calculations:

- **Cash Receivables Change** = `driver_sales_revenue - cash_deposits - discounts`
- **Cylinder Receivables Change** = `driver_refill_sales - cylinder_deposits`
- **Today's Cash Total** = `yesterday_cash_total + cash_receivables_change`
- **Today's Cylinder Total** = `yesterday_cylinder_total + cylinder_receivables_change`
- Real-time calculations with driver filtering and date-based aggregations
- Multi-tenant isolation with `tenantId` filtering

---

### 2. Inventory Page (`/dashboard/inventory`)

#### Data Sources:

- **Primary Tables**: `product`, `company`, `cylinderSize`, `inventoryMovement`, `inventoryRecord`, `sale`, `shipment`, `driverCylinderSizeBaseline`
- **Key Columns**:
  - `product`: `id`, `name`, `size`, `cylinderSizeId`, `purchasePrice`, `salePrice`
  - `company`: `id`, `name`, `companyType`
  - `cylinderSize`: `id`, `size`, `volume`
  - `inventoryMovement`: `id`, `productId`, `movementType`, `quantity`, `date`
  - `inventoryRecord`: `id`, `productId`, `cylinderSizeId`, `date`, `fullCylinders`, `emptyCylinders`, `totalCylinders`
  - `sale`: `quantity`, `saleType`, `saleDate`, `productId`, `cylindersDeposited`
  - `shipment`: `quantity`, `productId`, `shipmentDate`
  - `driverCylinderSizeBaseline`: `baselineQuantity`, `cylinderSizeId`

#### Business Logic & Calculations:

- **Package Sale Impact**: `-1 Full Cylinder`, `+0 Empty Cylinder`
- **Refill Sale Impact**: `-1 Full Cylinder`, `+1 Empty Cylinder`
- **Today's Full Cylinders** = `yesterday_full + package_purchase + refill_purchase - total_sales`
- **Today's Empty Cylinders** = `yesterday_empty + refill_sales + empty_cylinders_buy_sell`
- **Current Inventory Formula** = `baseline_inventory + purchases + returns - sales`
- **Cylinder Size Breakdown** = Aggregated from `driverCylinderSizeBaseline` + sales transactions
- Uses InventoryCalculator class for complex inventory calculations
- Progressive loading with caching for performance optimization

---

### 3. Receivables Page (`/dashboard/receivables`)

#### Data Sources:

- **Primary Tables**: `customerReceivable`, `driver`, `receivableRecord`, `driverCylinderSizeBaseline`, `sale`
- **Key Columns**:
  - `customerReceivable`: `id`, `driverId`, `customerName`, `receivableType`, `amount`, `quantity`, `size`, `dueDate`, `status`, `notes`
  - `driver`: `id`, `name`, `status`, `driverType`
  - `receivableRecord`: `date`, `totalCashReceivables`, `totalCylinderReceivables`
  - `driverCylinderSizeBaseline`: `baselineQuantity`, `cylinderSizeId`
  - `sale`: `quantity`, `cylindersDeposited`, `saleType`, `productId`

#### Business Logic & Calculations:

- **Driver Cash Receivables** = `latest_receivableRecord.totalCashReceivables`
- **Driver Cylinder Receivables** = `latest_receivableRecord.totalCylinderReceivables`
- **Cylinder Size Breakdown Formula**:
  - Start with: `driverCylinderSizeBaseline.baselineQuantity` (by size)
  - Add: `SUM(refill_sales.quantity)` where `saleType = 'REFILL'` (by product size)
  - Subtract: `SUM(sale.cylindersDeposited)` (by product size)
  - Result: `baseline + refill_sales - cylinder_deposits` (per size)
- **Customer Validation**: Customer totals must match sales-calculated totals
- **Auto-recalculation**: Missing receivable records calculated in background
- Smart auto-recalculation with 30-second caching

---

### 4. Assets Page (`/dashboard/assets`)

#### Data Sources:

- **Primary Tables**: `asset`, `inventoryAssetValue`, `receivableRecord`, `sale`, `expense`
- **Key Columns**:
  - `asset`: `id`, `name`, `assetType`, `category`, `originalValue`, `currentValue`, `acquisitionDate`, `depreciationRate`, `units`, `unitValue`
  - `inventoryAssetValue`: `id`, `productId`, `totalQuantity`, `totalValue`, `valueDate`
  - `receivableRecord`: `totalCashReceivables`, `totalCylinderReceivables`
  - `sale`: `totalValue`, `cashDeposited`
  - `expense`: `amount`, `category`

#### Business Logic & Calculations:

- **Current Cash Assets** = `SUM(sale.totalValue) - SUM(sale.cashDeposited) + SUM(receivableRecord.totalCashReceivables)`
- **Cylinder Inventory Valuation**:
  - Full Cylinders: `SUM(inventory_quantity × product.purchasePrice)` (by size)
  - **Empty Cylinders by Size**: `yesterday_empty_size + refill_sales_size + empty_cylinders_buy_sell_size`
  - Empty Cylinder Value: `SUM(empty_quantity_by_size × cylinder_unit_value_by_size)`
- **Empty Cylinder Formula by Size**:
  - **Yesterday's Empty (Size)** = Previous day's empty cylinder count for specific size
  - **Refill Sales (Size)** = `SUM(sale.quantity WHERE saleType = 'REFILL' AND product.cylinderSize = size)`
  - **Empty Buy/Sell (Size)** = `SUM(INCOMING_EMPTY) - SUM(OUTGOING_EMPTY)` by product size
  - **Result**: Each cylinder size calculated independently using exact business formula
- **Total Receivables Asset** = `SUM(receivableRecord.totalCashReceivables + receivableRecord.totalCylinderReceivables × cylinder_value)`
- **Manual Asset Depreciation**:
  - `current_value = original_value × (1 - depreciation_rate)^years_elapsed`
  - Or: `current_value = units × unit_value` (for unit-based assets)
- **Total Assets** = `manual_assets + auto_calculated_current_assets`
- Auto-calculates current assets from business operations with size-specific precision

---

### Summary

Each dashboard page implements sophisticated business logic with:

- **Multi-tenant data isolation** using `tenantId`
- **Real-time calculations** using exact business formulas
- **Progressive loading and caching** for performance
- **Comprehensive validation** between different data sources
- **Audit trails** for financial integrity
- **Mobile-optimized interfaces** with responsive design

The architecture ensures data consistency across all pages while maintaining high performance through strategic caching and optimized database queries.

## Key Business Calculation Formulas

### Inventory Calculations (CRITICAL)

- **Package Sale**: `-1 Full Cylinder`, `no Empty Cylinder change`
- **Refill Sale**: `-1 Full Cylinder`, `+1 Empty Cylinder`
- **Today's Full Cylinders**: `Yesterday's Full + Package Purchase + Refill Purchase - Total Sales`
- **Today's Empty Cylinders BY SIZE**: `Yesterday's Empty (Size) + Refill Sales (Size) + Empty Cylinders Buy/Sell (Size)`
  - Applied independently for each cylinder size (35L, 12L, etc.)
  - Assets page uses this formula for precise cylinder inventory valuation

### Receivables Calculations (CRITICAL)

- **Cash Receivables Change**: `driver_sales_revenue - cash_deposits - discounts`
- **Cylinder Receivables Change**: `driver_refill_sales - cylinder_deposits`
- **Today's Total**: `Yesterday's Total + Today's Changes`

### Asset Valuations

- **Current Cash**: `total_sales - cash_deposits + cash_receivables`
- **Cylinder Inventory Value**: `quantity × purchase_price` (full) + `quantity × unit_value` (empty)
- **Manual Asset Depreciation**: `original_value × (1 - rate)^years` or `units × unit_value`

### Empty Cylinder Aggregations

- **Total by Size**: `baseline + sales_impact + shipment_impact - outstanding_shipments`
- **In Hand**: `total_quantity - quantity_with_drivers`
- **Sales Impact**: `refill_sales - cylinder_deposits`

---

## Onboarding Data Storage Locations

### 1. **Companies** → `company` table

- **Columns**: `tenantId`, `name`, `isActive`
- **Source**: `data.companies` array from onboarding form

### 2. **Cylinder Sizes** → `cylinderSize` table

- **Columns**: `tenantId`, `size`, `description`, `isActive`
- **Source**: `data.cylinderSizes` array from onboarding form

### 3. **Products** → `product` table

- **Columns**: `tenantId`, `companyId`, `cylinderSizeId`, `name`, `size`, `currentPrice`, `isActive`
- **Source**: `data.products` array from onboarding form

### 4. **Drivers** → `driver` table

- **Columns**: `tenantId`, `name`, `phone`, `driverType`, `status`
- **Source**: `data.drivers` array from onboarding form

### 5. **Initial Inventory (Full Cylinders)** → `inventoryRecord` table

- **Columns**: `tenantId`, `productId`, `date`, `fullCylinders`, `emptyCylinders`, `totalCylinders`
- **Key Values**: `fullCylinders` set from `data.inventory[].fullCylinders`
- **Purpose**: Shipment baseline values for full cylinders

### 6. **Initial Empty Cylinders** → `inventoryRecord` table (updated/created)

- **Columns**: `emptyCylinders`, `totalCylinders`, `cylinderSizeId` (required)
- **Source**: `data.emptyCylinders` array with quantities by cylinder size
- **Purpose**: Direct cylinder size linkage for precise inventory tracking

### 7. **Driver Receivables** → `receivableRecord` table

- **Columns**: `tenantId`, `driverId`, `date`, `totalCashReceivables`, `totalCylinderReceivables`
- **Key Values**:
  - `totalCashReceivables` from `data.receivables[].cashReceivables`
  - `totalCylinderReceivables` from `data.receivables[].cylinderReceivables`
- **Purpose**: Starting balances (not changes)

### 8. **Permanent Cylinder Size Baselines** → `driverCylinderSizeBaseline` table ⭐

- **Columns**: `tenantId`, `driverId`, `cylinderSizeId`, `baselineQuantity`, `source`
- **Source**: `data.receivables[].cylinderReceivablesBySizes` array
- **Purpose**: **Permanent baseline breakdown by cylinder size per driver**
- **Key**: These records are used in the receivables API to calculate current breakdowns

### 9. **Customer Receivables (Backward Compatibility)** → `customerReceivable` table

- **Columns**: `tenantId`, `driverId`, `customerName`, `receivableType`, `quantity`, `size`, `status`
- **Default Values**: `customerName: 'Onboarding Balance'`, `status: 'CURRENT'`
- **Source**: `data.receivables[].cylinderReceivablesBySizes`

### 10. **Empty Cylinder Records** → `emptyCylinder` table

- **Stored Columns**: `tenantId`, `productId`, `cylinderSizeId`, `date`, `baselineQuantity`, `createdAt`, `updatedAt`
- **Auto-calculated from Sales**:
  - `refillSales` = Sum from `sale` table where `saleType = 'REFILL'` by `productId`/`cylinderSizeId`
  - `cylinderDeposits` = Sum of `sale.cylindersDeposited` by `productId`/`cylinderSizeId`
- **Auto-calculated from Shipments**:
  - `emptyCylindersBuySell` = Sum of `INCOMING_EMPTY`/`OUTGOING_EMPTY` shipments by `productId`
  - `outstandingShipments` = Sum of `PENDING`/`IN_TRANSIT` status shipments by `productId`
- **Auto-calculated Quantities**:
  - `totalQuantity` = `baselineQuantity` + `refillSales` + `emptyCylindersBuySell` - `cylinderDeposits` - `outstandingShipments`
  - `quantityWithDrivers` = Cylinder receivables by size (from `driverCylinderSizeBaseline` + sales transactions)
  - `quantityInHand` = `totalQuantity` - `quantityWithDrivers`
- **Purpose**: Pure baseline storage with all operational values calculated dynamically from authoritative sources

### 10a. **Empty Cylinder Totals by Size** → `empty_cylinder_totals_by_size` view ⭐

- **Data Sources**: Aggregates from `driverCylinderSizeBaseline`, `sale`, `shipment`, `emptyCylinder` tables
- **Key Fields**:
  - `cylinderSizeId`, `cylinderSizeName`
  - `totalQuantity`, `quantityInHand`, `quantityWithDrivers`
  - `onboardingBaseline`, `netSalesImpact`, `netShipmentImpact`
- **Calculation Formulas**:
  - **Sales Impact**: `SUM(refill_sales) - SUM(cylinder_deposits)` (by cylinder size)
  - **Shipment Impact**: `SUM(INCOMING_EMPTY) - SUM(OUTGOING_EMPTY)` (by cylinder size)
  - **Quantity With Drivers**: `SUM(driverCylinderSizeBaseline.baselineQuantity)` (by size)
  - **Total Quantity**: `onboarding_baseline + net_sales_impact + net_shipment_impact - outstanding_shipments`
  - **Quantity In Hand**: `total_quantity - quantity_with_drivers`
- **Purpose**: Real-time aggregation of all empty cylinders grouped by cylinder size only
- **API Endpoint**: `/api/inventory/empty-cylinders-by-size`

### 11. **User Onboarding Status** → `user` table

- **Columns**: `onboardingCompleted`, `onboardingCompletedAt`
- **Purpose**: Prevents re-running onboarding

## Critical Baseline Storage

The most important onboarding values for ongoing operations are stored in:

1. **`driverCylinderSizeBaseline`** - This is the permanent reference used by the receivables API to calculate current cylinder breakdowns by size
2. **`receivableRecord`** - Starting cash and cylinder receivable totals
3. **`inventoryRecord`** - Initial full and empty cylinder quantities
4. **`emptyCylinder`** - Detailed empty cylinder tracking by product and size

These baseline values are then used throughout the application to calculate current states using exact business formulas.
