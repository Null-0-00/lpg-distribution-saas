# Receivables Storage Fix for Onboarding

## Problem Identified

During onboarding, receivables data entered by users was **NOT being saved** to dedicated database tables. The data was only used for calculations in inventory summaries, making it impossible to retrieve detailed receivables information later.

## Issues Found

❌ **No receivables records created** - Data lost after onboarding  
❌ **No per-driver tracking** - Cannot see which driver has what receivables  
❌ **No size-wise breakdown** - Cannot track cylinder receivables by size  
❌ **No historical tracking** - Cannot track receivables changes over time  
❌ **No detailed reporting** - Cannot generate receivables reports

## Solution Implemented

### 1. Added Receivables Storage Logic

Added comprehensive receivables storage in `src/app/api/onboarding/complete/route.ts`:

```typescript
// 10. Create receivables records for each driver
await Promise.all(
  data.receivables.map(async (receivable) => {
    const driverIndex = parseInt(receivable.driverId);
    const driver = createdDrivers[driverIndex];

    if (!driver) return; // Skip if driver not found

    // Create initial receivable record for tracking
    await tx.receivableRecord.create({
      data: {
        tenantId,
        driverId: driver.id,
        date: today,
        cashReceivablesChange: receivable.cashReceivables,
        cylinderReceivablesChange: receivable.cylinderReceivables,
        totalCashReceivables: receivable.cashReceivables,
        totalCylinderReceivables: receivable.cylinderReceivables,
      },
    });

    // Create customer receivable for cash if any
    if (receivable.cashReceivables > 0) {
      await tx.customerReceivable.create({
        data: {
          tenantId,
          driverId: driver.id,
          customerName: 'Initial Onboarding Balance',
          receivableType: 'CASH',
          amount: receivable.cashReceivables,
          status: 'CURRENT',
        },
      });
    }

    // Create customer receivables for cylinders by size
    if (
      receivable.cylinderReceivablesBySizes &&
      receivable.cylinderReceivablesBySizes.length > 0
    ) {
      await Promise.all(
        receivable.cylinderReceivablesBySizes
          .map(async (sizeReceivable) => {
            if (sizeReceivable.quantity > 0) {
              return tx.customerReceivable.create({
                data: {
                  tenantId,
                  driverId: driver.id,
                  customerName: 'Initial Onboarding Balance',
                  receivableType: 'CYLINDER',
                  quantity: sizeReceivable.quantity,
                  size: sizeReceivable.size,
                  status: 'CURRENT',
                },
              });
            }
          })
          .filter(Boolean)
      );
    }
  })
);
```

### 2. Database Tables Used

**receivable_records** - Historical tracking

- Tracks receivables changes over time per driver
- Stores total cash and cylinder receivables
- Enables audit trail and historical reporting

**customer_receivables** - Detailed breakdown

- Stores individual receivable entries
- Separates cash and cylinder receivables
- Includes size-wise cylinder breakdown
- Enables detailed customer management

## Data Storage Structure

### Input Data (Onboarding Form)

```typescript
receivables: [
  {
    driverId: '0',
    cashReceivables: 1500.5,
    cylinderReceivables: 25,
    cylinderReceivablesBySizes: [
      { cylinderSizeId: '0', size: '12kg', quantity: 15 },
      { cylinderSizeId: '1', size: '45kg', quantity: 10 },
    ],
  },
];
```

### Database Records Created

**receivable_records table:**

- One record per driver with totals
- Historical tracking capability
- Links to driver for reporting

**customer_receivables table:**

- One record for cash receivables (if > 0)
- One record per cylinder size with receivables
- Detailed breakdown for management

## Retrieval Capabilities

### 1. Get Receivables by Driver

```sql
SELECT
  d.name as driver_name,
  rr.totalCashReceivables,
  rr.totalCylinderReceivables,
  rr.date
FROM receivable_records rr
JOIN drivers d ON rr.driverId = d.id
WHERE rr.tenantId = 'tenant-id'
ORDER BY d.name;
```

### 2. Get Cylinder Receivables by Size

```sql
SELECT
  d.name as driver_name,
  cr.size,
  cr.quantity
FROM customer_receivables cr
JOIN drivers d ON cr.driverId = d.id
WHERE cr.tenantId = 'tenant-id'
  AND cr.receivableType = 'CYLINDER'
  AND cr.status = 'CURRENT'
ORDER BY d.name, cr.size;
```

### 3. Get Cash Receivables Summary

```sql
SELECT
  d.name as driver_name,
  SUM(cr.amount) as total_cash_receivables
FROM customer_receivables cr
JOIN drivers d ON cr.driverId = d.id
WHERE cr.tenantId = 'tenant-id'
  AND cr.receivableType = 'CASH'
  AND cr.status = 'CURRENT'
GROUP BY d.id, d.name;
```

## Benefits of the Fix

✅ **Complete Data Preservation** - All receivables data saved permanently  
✅ **Driver-Specific Tracking** - Can track receivables per driver  
✅ **Size-Wise Breakdown** - Cylinder receivables tracked by size  
✅ **Historical Audit Trail** - Changes tracked over time  
✅ **Flexible Reporting** - Can generate reports by any criteria  
✅ **Customer Management** - Can manage individual customer receivables  
✅ **Payment Tracking** - Can track payments and collections  
✅ **Business Intelligence** - Rich data for analytics and insights

## Files Modified

- `src/app/api/onboarding/complete/route.ts` - Added receivables storage logic
- `sample-receivables-retrieval-api.ts` - Sample API for data retrieval
- `test-receivables-storage-fix.js` - Test verification script
- `analyze-receivables-storage-issue.js` - Problem analysis script

## Testing

Run the test script to verify the fix:

```bash
node test-receivables-storage-fix.js
```

This fix ensures that all receivables data entered during onboarding is properly stored with complete breakdowns and can be retrieved later for reporting, customer management, and business operations.
