# Frontend Data Mapping - Optimized Database

## Current Frontend Requirements → New Database Tables

This document shows exactly which database table/view to use for each frontend component.

---

## 🏠 **Dashboard Page** (`/dashboard`)

### Summary Cards (Top Row)

```typescript
// GET /api/dashboard/summary
const data = await db.query(`
  SELECT * FROM dashboard_summary 
  WHERE tenant_id = ? AND date = CURRENT_DATE
`);

// Cards Data:
// - Full Cylinders: data.full_cylinders
// - Empty Cylinders: data.empty_cylinders
// - Cylinder Receivables: data.cylinder_receivables
// - Empty Cylinders in Hand: data.total_empty_cylinders_in_hand
// - Total Cylinders: data.total_cylinders
```

**Database Source:** `dashboard_summary` view

---

## 📦 **Inventory Page** (`/dashboard/inventory`)

### 1. Summary Cards (Top Row)

```typescript
// Same as dashboard - GET /api/dashboard/summary
// Uses: dashboard_summary view
```

### 2. ভরা সিলিন্ডার (Full Cylinders Table)

```typescript
// GET /api/inventory/full-cylinders
const data = await db.query(`
  SELECT * FROM full_cylinders_by_size 
  WHERE tenant_id = ?
  ORDER BY size
`);

// Table Data:
// Company | Size | Quantity
// --------|------|----------
// data[0].company | data[0].size | data[0].quantity
```

**Database Source:** `full_cylinders_by_size` view

- **Company**: `current_size_inventory.primary_company_name`
- **Size**: `cylinder_sizes.size`
- **Quantity**: `current_size_inventory.full_cylinders`

### 3. Empty Cylinders Table

```typescript
// GET /api/inventory/empty-cylinders
const data = await db.query(`
  SELECT 
    cs.size,
    csi.empty_cylinders,
    csi.empty_cylinders_in_hand,
    csi.cylinder_receivables,
    0 as ongoing_shipments
  FROM current_size_inventory csi
  JOIN cylinder_sizes cs ON csi.cylinder_size_id = cs.id
  WHERE csi.tenant_id = ?
  ORDER BY cs.size
`);
```

**Database Source:** `current_size_inventory` table

### 4. দৈনিক মজুদ ট্র্যাক (Daily Inventory Tracking Table)

```typescript
// GET /api/inventory/daily-tracking?days=4
const data = await db.query(`
  SELECT * FROM daily_inventory_tracking 
  WHERE tenant_id = ? 
  AND date >= CURRENT_DATE - INTERVAL '4 days'
  ORDER BY date DESC
`);

// All columns directly available:
// - date, package_sales_qty, refill_sales_qty, total_sales_qty
// - package_purchase_qty, refill_purchase_qty
// - full_cylinders, outstanding_shipments
// - empty_cylinders_buy_sell, empty_cylinder_receivables
// - empty_cylinders_in_stock, total_cylinders
// - full_cylinders_by_sizes (JSON with size breakdowns)
```

**Database Source:** `daily_inventory_tracking` view

---

## 💰 **Sales Page** (`/dashboard/sales`)

### Daily Sales Entry

```typescript
// POST /api/sales/entry
await db.query(`
  INSERT INTO transaction_logs (
    tenant_id, transaction_type, driver_id, product_id, company_id,
    quantity, unit_price, total_amount, cash_deposit, cylinder_deposit,
    discount, net_amount, transaction_date, created_by
  ) VALUES (?, 'SALE_PACKAGE', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Trigger automatically updates:
// - daily_inventory_snapshots
// - daily_product_breakdowns
// - daily_size_breakdowns
// - current_inventory_summary
// - current_product_inventory
// - current_size_inventory
```

**Database Source:** `transaction_logs` table (with automatic trigger updates)

### Sales History/Reports

```typescript
// GET /api/sales/history?startDate=X&endDate=Y
const data = await db.query(`
  SELECT 
    tl.transaction_date as date,
    d.name as driver_name,
    p.name as product_name,
    c.name as company_name,
    tl.quantity,
    tl.unit_price,
    tl.total_amount,
    tl.net_amount
  FROM transaction_logs tl
  JOIN drivers d ON tl.driver_id = d.id
  JOIN products p ON tl.product_id = p.id  
  JOIN companies c ON tl.company_id = c.id
  WHERE tl.tenant_id = ? 
  AND tl.transaction_type IN ('SALE_PACKAGE', 'SALE_REFILL')
  AND tl.transaction_date BETWEEN ? AND ?
  ORDER BY tl.transaction_date DESC
`);
```

**Database Source:** `transaction_logs` table with joins

---

## 🚚 **Purchases Page** (`/dashboard/purchases`)

### Purchase Entry

```typescript
// POST /api/purchases/entry
await db.query(`
  INSERT INTO transaction_logs (
    tenant_id, transaction_type, product_id, company_id,
    quantity, unit_price, total_amount, invoice_number, 
    supplier_name, transaction_date, created_by
  ) VALUES (?, 'PURCHASE_PACKAGE', ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Same automatic trigger updates as sales
```

**Database Source:** `transaction_logs` table

---

## 📊 **Reports Page** (`/dashboard/reports`)

### Financial Summary Report

```typescript
// GET /api/reports/financial-summary?period=monthly
const data = await db.query(`
  SELECT 
    date,
    total_sales_revenue,
    total_purchase_cost,
    gross_profit,
    net_profit
  FROM daily_inventory_snapshots 
  WHERE tenant_id = ? 
  AND date >= ?
  ORDER BY date DESC
`);
```

**Database Source:** `daily_inventory_snapshots` table

### Product Performance Report

```typescript
// GET /api/reports/product-performance
const data = await db.query(`
  SELECT 
    p.name as product_name,
    c.name as company_name,
    SUM(dpb.total_sales) as total_sales,
    SUM(dpb.sales_revenue) as total_revenue,
    AVG(cpi.avg_daily_sales) as avg_daily_sales,
    cpi.full_cylinders as current_stock
  FROM daily_product_breakdowns dpb
  JOIN products p ON dpb.product_id = p.id
  JOIN companies c ON p.company_id = c.id
  JOIN current_product_inventory cpi ON dpb.product_id = cpi.product_id
  WHERE dpb.snapshot_id IN (
    SELECT id FROM daily_inventory_snapshots 
    WHERE tenant_id = ? AND date >= ?
  )
  GROUP BY p.id, p.name, c.name, cpi.avg_daily_sales, cpi.full_cylinders
  ORDER BY total_revenue DESC
`);
```

**Database Source:** `daily_product_breakdowns` + `current_product_inventory`

---

## 🔧 **API Endpoints Mapping**

### Simple, Fast Endpoints (No Calculations)

| Frontend Component    | API Endpoint                         | Database Source                   | Query Type       |
| --------------------- | ------------------------------------ | --------------------------------- | ---------------- |
| Dashboard Cards       | `GET /api/dashboard/summary`         | `dashboard_summary` view          | Single query     |
| Full Cylinders Table  | `GET /api/inventory/full-cylinders`  | `full_cylinders_by_size` view     | Single query     |
| Empty Cylinders Table | `GET /api/inventory/empty-cylinders` | `current_size_inventory` table    | Single query     |
| Daily Inventory Track | `GET /api/inventory/daily-tracking`  | `daily_inventory_tracking` view   | Single query     |
| Sales Entry           | `POST /api/sales/entry`              | `transaction_logs` table          | Insert + Trigger |
| Purchase Entry        | `POST /api/purchases/entry`          | `transaction_logs` table          | Insert + Trigger |
| Sales History         | `GET /api/sales/history`             | `transaction_logs` table          | Single query     |
| Financial Reports     | `GET /api/reports/financial`         | `daily_inventory_snapshots` table | Single query     |

---

## ✅ **Benefits of This Approach**

### 1. **Performance**

- ✅ **Single query per page** - No complex calculations
- ✅ **Pre-calculated data** - Triggers handle all math
- ✅ **Indexed tables** - Fast lookups
- ✅ **No JOIN complexity** - Views handle relationships

### 2. **Consistency**

- ✅ **Same data everywhere** - Single source of truth
- ✅ **Real-time updates** - Triggers update all related tables
- ✅ **No calculation errors** - Database handles all math

### 3. **Developer Experience**

- ✅ **Simple API calls** - Straightforward queries
- ✅ **No business logic in frontend** - Just display data
- ✅ **Easy debugging** - Clear data flow
- ✅ **Fast development** - No complex calculations to write

### 4. **Example Frontend Code**

```typescript
// OLD WAY (Complex calculations in frontend)
const fullCylinders = await calculateFullCylinders(sales, purchases, inventory);
const breakdown = await calculateSizeBreakdown(products, cylinders);
const totals = await aggregateData(multiple, complex, queries);

// NEW WAY (Simple data fetching)
const data = await fetch('/api/inventory/full-cylinders').then((r) => r.json());
// Data is ready to display immediately!
```

---

## 🚀 **Implementation Steps**

1. **✅ Create optimized schema** (Done)
2. **Create migration scripts** to move existing data
3. **Implement trigger functions** for automatic calculations
4. **Update API endpoints** to use new tables
5. **Test data consistency** between old and new systems
6. **Deploy and switch over** to new system

This approach eliminates all the database confusion and provides exactly what the frontend needs with maximum performance and consistency.
