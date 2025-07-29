# Onboarding Empty Cylinders Calculation Fix

## Problem

During onboarding, the empty cylinders value entered by users was being incorrectly saved:

- `totalEmptyCylindersInHand` was set equal to `totalEmptyCylinders`
- This ignored the business logic that cylinder receivables should reduce the "in hand" quantity

## Solution

Fixed the calculation in `src/app/api/onboarding/complete/route.ts` to properly implement:

```
totalEmptyCylindersInHand = totalEmptyCylinders - totalCylinderReceivables
```

## Changes Made

### 1. Fixed Inventory Summary Calculation

**Before:**

```typescript
totalEmptyCylindersInHand: totalEmptyCylinders,
```

**After:**

```typescript
const totalEmptyCylindersInHand = totalEmptyCylinders - totalCylinderReceivables;
// ...
totalEmptyCylindersInHand,
```

### 2. Fixed Current Size Inventory Records

**Before:**

```typescript
emptyCylindersInHand: emptyCylinder.quantity,
cylinderReceivables: 0,
```

**After:**

```typescript
// Calculate cylinder receivables for this size from receivables data
const cylinderReceivablesForSize = data.receivables.reduce((sum, rec) => {
  if (rec.cylinderReceivablesBySizes) {
    const sizeReceivables = rec.cylinderReceivablesBySizes.find(
      size => size.cylinderSizeId === emptyCylinder.cylinderSizeId
    );
    return sum + (sizeReceivables?.quantity || 0);
  }
  return sum;
}, 0);

const emptyCylindersInHandForSize = emptyCylinder.quantity - cylinderReceivablesForSize;

emptyCylindersInHand: Math.max(0, emptyCylindersInHandForSize),
cylinderReceivables: cylinderReceivablesForSize,
```

### 3. Fixed Daily Inventory Snapshot

**Before:**

```typescript
emptyCylindersInHand: totalEmptyCylinders,
```

**After:**

```typescript
emptyCylindersInHand: totalEmptyCylindersInHand,
```

## Impact

### Database Tables Affected

1. **`current_inventory_summary`** - Overall totals now correctly calculated
2. **`current_size_inventory`** - Per-size calculations now accurate
3. **`daily_inventory_snapshots`** - Initial baseline now uses correct values

### Business Logic Compliance

- ✅ Empty cylinders entered during onboarding = `totalEmptyCylinders`
- ✅ Empty cylinders in hand = `totalEmptyCylinders - totalCylinderReceivables`
- ✅ Calculation applied consistently across all inventory tables
- ✅ Size-specific receivables properly distributed

## Example Calculation

**Input:**

- 12kg Empty Cylinders: 100
- 45kg Empty Cylinders: 50
- 12kg Cylinder Receivables: 20
- 45kg Cylinder Receivables: 10

**Results:**

- Total Empty Cylinders: 150
- Total Cylinder Receivables: 30
- **Total Empty Cylinders In Hand: 120** ✅

**Per Size:**

- 12kg In Hand: 100 - 20 = 80
- 45kg In Hand: 50 - 10 = 40

## Testing

Run the test script to verify calculations:

```bash
node test-onboarding-empty-cylinders-fix.js
```

## Files Modified

- `src/app/api/onboarding/complete/route.ts` - Main onboarding logic
- `test-onboarding-empty-cylinders-fix.js` - Test verification script

This fix ensures that the onboarding process correctly implements your business logic for empty cylinder inventory management.
