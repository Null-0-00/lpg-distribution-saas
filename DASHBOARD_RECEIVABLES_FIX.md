# Dashboard Receivables Display Fix

## Problem
The "বাকি" (remaining/receivables) box on the dashboard was showing the wrong value (7,060.00 ৳) instead of the correct cash receivables value (8,000.00 ৳) that's displayed on the receivables page.

## Root Cause Analysis
1. **Wrong Calculation Logic**: The dashboard was adding both cash and cylinder receivables:
   ```typescript
   // OLD (WRONG)
   pendingReceivables: pendingReceivables
     ? pendingReceivables.totalCashReceivables + pendingReceivables.totalCylinderReceivables
     : 0,
   ```

2. **Incomplete Data Source**: The dashboard was only using the single latest receivable record instead of summing from all active retail drivers.

## Data Analysis
- **BABLU**: 7,000.00 ৳ cash + 60 cylinder units
- **NIHAN**: 1,000.00 ৳ cash + 15 cylinder units
- **Total Cash Receivables**: 8,000.00 ৳ (correct)
- **Combined Total (OLD)**: 8,075.00 ৳ (wrong - includes cylinders)
- **Dashboard was showing**: 7,060.00 ৳ (wrong - only BABLU's combined total)

## Solution Implemented

### 1. Fixed Calculation Logic
Changed the dashboard to show only cash receivables:
```typescript
// NEW (CORRECT)
pendingReceivables: totalCashReceivables?.[0]?.totalCashReceivables || 0,
```

### 2. Fixed Data Source Query
Replaced single record lookup with proper aggregation across all active retail drivers:
```sql
-- NEW QUERY
SELECT COALESCE(SUM(rr."totalCashReceivables"), 0) as "totalCashReceivables"
FROM receivable_records rr
INNER JOIN drivers d ON rr."driverId" = d.id
WHERE rr."tenantId" = ${tenantId}
  AND d.status = 'ACTIVE'
  AND d."driverType" = 'RETAIL'
  AND rr.date = (
    SELECT MAX(rr2.date)
    FROM receivable_records rr2
    WHERE rr2."driverId" = rr."driverId"
      AND rr2."tenantId" = ${tenantId}
  )
```

## Files Modified
- `src/app/api/dashboard/combined/route.ts` - Fixed the receivables calculation logic

## Verification
✅ Dashboard now shows: **8,000.00 ৳** (cash receivables only)  
✅ Matches receivables page: **8,000.00 ৳** ("বিক্রয় নগদ প্রাপ্য")  
✅ Includes all active retail drivers: BABLU (7,000.00 ৳) + NIHAN (1,000.00 ৳)

## Test Results
```
🎯 Dashboard Totals:
   Total Cash Receivables: 8000.00 ৳
   Total Cylinder Receivables: 75 units
   Dashboard Should Show (NEW): 8000.00 ৳ (cash only) ✅

✅ Manual Verification: 8000.00 ৳
✅ API Query Result: 8000.00 ৳
✅ Match: YES
```

## Impact
- **User Experience**: Dashboard now shows consistent and accurate receivables data
- **Business Logic**: Correctly separates cash receivables from cylinder receivables
- **Data Integrity**: Ensures all active retail drivers are included in the total
- **Consistency**: Dashboard values now match the detailed receivables page

The "বাকি" box now correctly displays the total cash receivables amount that matches what users see on the dedicated receivables management page.