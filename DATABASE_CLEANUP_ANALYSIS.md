# Database Cleanup Analysis & Optimization Plan

## Current Problems

### 1. **Too Many Models (35 total)**

The current database has 35+ models causing confusion and complexity:

- Multiple overlapping inventory tables (`InventoryRecord`, `InventoryMovement`, `InventoryAssetValue`, `FullCylinder`, `EmptyCylinder`)
- Redundant sales tables (`Sale`, `DailySales`)
- Complex receivables system (`ReceivableRecord`, `CustomerReceivable`)
- Unnecessary audit tables for simple operations

### 2. **Complex Calculations**

- Frontend doing complex inventory calculations
- Multiple API endpoints with different calculation logic
- Inconsistent data between different views
- Performance issues due to real-time calculations

### 3. **Data Inconsistency**

- ভরা সিলিন্ডার table showing different values than দৈনিক মজুদ ট্র্যাক
- Same data calculated differently in different endpoints
- No single source of truth

## Frontend Requirements Analysis

Based on the inventory page, here's what the frontend actually needs:

### 1. **Daily Inventory Tracking (দৈনিক মজুদ ট্র্যাক)**

- Date
- Package Sales Qty + breakdown by product
- Refill Sales Qty + breakdown by product
- Total Sales Qty + breakdown by product
- Package Purchase + breakdown by product
- Refill Purchase + breakdown by product
- Full Cylinders (total + breakdown by size)
- Outstanding Shipments + breakdown
- Empty Cylinders Buy/Sell + breakdown by size
- Empty Cylinder Receivables + breakdown by size
- Empty Cylinders in Stock + breakdown by size
- Total Cylinders + breakdown by size

### 2. **Current Inventory Summary**

- Full Cylinders by Company & Size
- Empty Cylinders by Size with receivables breakdown
- Current totals for dashboard cards

### 3. **Summary Metrics**

- Total Full Cylinders
- Total Empty Cylinders
- Total Cylinder Receivables
- Empty Cylinders in Hand
- Total Cylinders

## Proposed Clean Database Structure

### Core Tables (Keep & Optimize)

#### 1. **Tenant** ✅

```sql
-- Keep as is - multi-tenancy
```

#### 2. **User** ✅

```sql
-- Keep as is - authentication
```

#### 3. **Company** ✅

```sql
-- Keep as is - LPG companies (Bashundhara, Orion, etc.)
```

#### 4. **CylinderSize** ✅

```sql
-- Keep as is - sizes (12kg, 45kg, etc.)
```

#### 5. **Product** ✅

```sql
-- Keep as is - company + size combinations
```

#### 6. **Driver** ✅

```sql
-- Keep as is - sales drivers
```

### New Optimized Tables (Replace Multiple Tables)

#### 7. **DailyInventorySnapshot** (NEW - Replace InventoryRecord, InventoryMovement, etc.)

```sql
model DailyInventorySnapshot {
  id                        String   @id @default(cuid())
  tenantId                  String
  date                      DateTime @db.Date

  -- Sales Data (aggregated from all drivers)
  packageSalesQty           Int      @default(0)
  packageSalesRevenue       Float    @default(0)
  refillSalesQty           Int      @default(0)
  refillSalesRevenue       Float    @default(0)
  totalSalesQty            Int      @default(0)
  totalSalesRevenue        Float    @default(0)

  -- Purchase Data (aggregated)
  packagePurchaseQty       Int      @default(0)
  packagePurchaseCost      Float    @default(0)
  refillPurchaseQty        Int      @default(0)
  refillPurchaseCost       Float    @default(0)

  -- Current Inventory (calculated)
  fullCylinders            Int      @default(0)
  emptyCylinders           Int      @default(0)
  totalCylinders           Int      @default(0)

  -- Receivables (calculated)
  cylinderReceivables      Int      @default(0)
  cashReceivables          Float    @default(0)

  -- Financial Summary
  netProfit                Float    @default(0)
  totalCosts               Float    @default(0)

  -- System
  calculatedAt             DateTime @default(now())
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt

  tenant                   Tenant   @relation(fields: [tenantId], references: [id])

  -- Relations to breakdown tables
  productBreakdowns        DailyProductBreakdown[]
  sizeBreakdowns          DailySizeBreakdown[]

  @@unique([tenantId, date])
  @@index([tenantId, date])
}
```

#### 8. **DailyProductBreakdown** (NEW - Product-level details)

```sql
model DailyProductBreakdown {
  id                    String   @id @default(cuid())
  snapshotId            String
  productId             String

  -- Sales by product
  packageSales          Int      @default(0)
  refillSales           Int      @default(0)
  totalSales            Int      @default(0)
  salesRevenue          Float    @default(0)

  -- Purchases by product
  packagePurchase       Int      @default(0)
  refillPurchase        Int      @default(0)
  purchaseCost          Float    @default(0)

  -- Current inventory by product
  fullCylinders         Int      @default(0)

  snapshot              DailyInventorySnapshot @relation(fields: [snapshotId], references: [id])
  product               Product  @relation(fields: [productId], references: [id])

  @@unique([snapshotId, productId])
}
```

#### 9. **DailySizeBreakdown** (NEW - Size-level details)

```sql
model DailySizeBreakdown {
  id                      String   @id @default(cuid())
  snapshotId              String
  cylinderSizeId          String

  -- Inventory by size
  fullCylinders           Int      @default(0)
  emptyCylinders          Int      @default(0)
  emptyCylindersInHand    Int      @default(0)
  cylinderReceivables     Int      @default(0)

  -- Outstanding orders by size
  outstandingShipments    Int      @default(0)

  snapshot                DailyInventorySnapshot @relation(fields: [snapshotId], references: [id])
  cylinderSize            CylinderSize @relation(fields: [cylinderSizeId], references: [id])

  @@unique([snapshotId, cylinderSizeId])
}
```

#### 10. **TransactionLog** (NEW - Replace Sale, DailySales, Purchase, etc.)

```sql
model TransactionLog {
  id                String          @id @default(cuid())
  tenantId          String
  type              TransactionType -- SALE_PACKAGE, SALE_REFILL, PURCHASE_PACKAGE, PURCHASE_REFILL

  -- Core data
  driverId          String?         -- Only for sales
  productId         String
  companyId         String
  quantity          Int
  unitPrice         Float
  totalAmount       Float

  -- Sales specific
  cashDeposit       Float?          @default(0)
  cylinderDeposit   Int?            @default(0)
  discount          Float?          @default(0)

  -- System
  transactionDate   DateTime        @db.Date
  createdAt         DateTime        @default(now())

  tenant            Tenant          @relation(fields: [tenantId], references: [id])
  driver            Driver?         @relation(fields: [driverId], references: [id])
  product           Product         @relation(fields: [productId], references: [id])
  company           Company         @relation(fields: [companyId], references: [id])

  @@index([tenantId, transactionDate])
  @@index([type, transactionDate])
}

enum TransactionType {
  SALE_PACKAGE
  SALE_REFILL
  PURCHASE_PACKAGE
  PURCHASE_REFILL
}
```

### Tables to Remove (Causing Confusion)

#### ❌ Remove These Models:

1. **InventoryRecord** - Replace with DailyInventorySnapshot
2. **InventoryMovement** - Replace with TransactionLog
3. **InventoryAssetValue** - Calculate in snapshot
4. **FullCylinder** - Data in DailySizeBreakdown
5. **EmptyCylinder** - Data in DailySizeBreakdown
6. **Sale** - Replace with TransactionLog
7. **DailySales** - Replace with DailyProductBreakdown
8. **Purchase** - Replace with TransactionLog
9. **ReceivableRecord** - Calculate in snapshot
10. **CustomerReceivable** - Calculate in snapshot

## Data Flow & Calculation Strategy

### 1. **Real-time Transaction Entry**

```
User Entry → TransactionLog → Trigger Daily Calculation
```

### 2. **Daily Calculation Process**

```sql
-- Trigger function that runs after each transaction
CREATE OR REPLACE FUNCTION update_daily_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate today's totals from TransactionLog
  -- Update DailyInventorySnapshot
  -- Update DailyProductBreakdown
  -- Update DailySizeBreakdown
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. **Frontend Data Access**

```typescript
// Simple, fast queries - no calculations needed
const todaySnapshot = await prisma.dailyInventorySnapshot.findUnique({
  where: { tenantId_date: { tenantId, date: today } },
  include: {
    productBreakdowns: { include: { product: { include: { company: true } } } },
    sizeBreakdowns: { include: { cylinderSize: true } },
  },
});
```

## Implementation Benefits

### 1. **Performance**

- ✅ No real-time calculations
- ✅ Single query per page
- ✅ Pre-calculated breakdowns
- ✅ Indexed for fast access

### 2. **Consistency**

- ✅ Single source of truth
- ✅ Same data everywhere
- ✅ Automatic calculations via triggers

### 3. **Simplicity**

- ✅ 10 tables instead of 35
- ✅ Clear data relationships
- ✅ Easy to understand structure

### 4. **Maintainability**

- ✅ Single calculation logic
- ✅ Clear audit trail
- ✅ Easy to add new metrics

## Next Steps

1. ✅ **Create new optimized schema**
2. **Create database migration script**
3. **Create trigger functions for calculations**
4. **Update API endpoints to use new tables**
5. **Test data consistency**
6. **Deploy and migrate existing data**

---

_This analysis shows we can reduce 35 models to ~10 focused models while improving performance and consistency._
