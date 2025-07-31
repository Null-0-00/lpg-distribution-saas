/**
 * FIFO Inventory Management Test Example
 *
 * This file demonstrates how the FIFO (First In, First Out) calculation works
 * for calculating average buying prices based on shipments and sales data.
 */

interface TestShipment {
  date: string;
  quantity: number;
  unitCost: number;
  description: string;
}

interface TestSale {
  date: string;
  quantity: number;
  unitPrice: number;
  description: string;
}

interface FifoTestResult {
  totalSoldQuantity: number;
  totalCOGS: number;
  averageBuyingPrice: number;
  remainingInventoryValue: number;
  calculation: string[];
}

/**
 * Example FIFO calculation for a product
 */
export function demonstrateFifoCalculation(): FifoTestResult {
  // Example shipments (purchases) - chronological order
  const shipments: TestShipment[] = [
    {
      date: '2024-01-05',
      quantity: 100,
      unitCost: 1000,
      description: 'First shipment from Supplier A',
    },
    {
      date: '2024-01-15',
      quantity: 50,
      unitCost: 1050,
      description: 'Second shipment from Supplier B',
    },
    {
      date: '2024-01-25',
      quantity: 75,
      unitCost: 980,
      description: 'Third shipment from Supplier A (better price)',
    },
  ];

  // Example sales - chronological order
  const sales: TestSale[] = [
    {
      date: '2024-01-10',
      quantity: 30,
      unitPrice: 1200,
      description: 'Sale to Customer X',
    },
    {
      date: '2024-01-20',
      quantity: 80,
      unitPrice: 1250,
      description: 'Sale to Customer Y',
    },
    {
      date: '2024-01-30',
      quantity: 40,
      unitPrice: 1300,
      description: 'Sale to Customer Z',
    },
  ];

  console.log('=== FIFO Inventory Calculation Example ===\n');

  // Create inventory batches from shipments
  const inventoryBatches = shipments.map((shipment) => ({
    date: shipment.date,
    originalQuantity: shipment.quantity,
    remainingQuantity: shipment.quantity,
    unitCost: shipment.unitCost,
    description: shipment.description,
  }));

  let totalSoldQuantity = 0;
  let totalCOGS = 0;
  const calculation: string[] = [];

  calculation.push('📦 INVENTORY BATCHES (Shipments):');
  inventoryBatches.forEach((batch, index) => {
    calculation.push(
      `  Batch ${index + 1}: ${batch.originalQuantity} units @ ৳${batch.unitCost}/unit (${batch.date})`
    );
  });
  calculation.push('');

  calculation.push('💰 SALES PROCESSING (FIFO - First In, First Out):');

  // Process sales using FIFO
  sales.forEach((sale, saleIndex) => {
    calculation.push(
      `\n🔄 Sale ${saleIndex + 1}: ${sale.quantity} units @ ৳${sale.unitPrice}/unit (${sale.date})`
    );

    let saleQuantityRemaining = sale.quantity;
    totalSoldQuantity += sale.quantity;

    // Allocate sale quantity to inventory batches (FIFO)
    for (
      let batchIndex = 0;
      batchIndex < inventoryBatches.length;
      batchIndex++
    ) {
      const batch = inventoryBatches[batchIndex];

      if (saleQuantityRemaining <= 0) break;
      if (batch.remainingQuantity <= 0) continue;

      // Take from this batch
      const quantityToTake = Math.min(
        saleQuantityRemaining,
        batch.remainingQuantity
      );
      const costForThisQuantity = quantityToTake * batch.unitCost;

      calculation.push(
        `   📤 Take ${quantityToTake} units from Batch ${batchIndex + 1} @ ৳${batch.unitCost}/unit = ৳${costForThisQuantity}`
      );

      // Update totals
      totalCOGS += costForThisQuantity;

      // Update batch and sale remaining quantities
      batch.remainingQuantity -= quantityToTake;
      saleQuantityRemaining -= quantityToTake;
    }

    if (saleQuantityRemaining > 0) {
      calculation.push(
        `   ⚠️ WARNING: ${saleQuantityRemaining} units could not be allocated (insufficient inventory)`
      );
    }
  });

  // Calculate remaining inventory
  let remainingInventoryValue = 0;
  calculation.push('\n📊 REMAINING INVENTORY:');
  inventoryBatches.forEach((batch, index) => {
    if (batch.remainingQuantity > 0) {
      const batchValue = batch.remainingQuantity * batch.unitCost;
      remainingInventoryValue += batchValue;
      calculation.push(
        `   Batch ${index + 1}: ${batch.remainingQuantity} units @ ৳${batch.unitCost}/unit = ৳${batchValue}`
      );
    }
  });

  const averageBuyingPrice =
    totalSoldQuantity > 0 ? totalCOGS / totalSoldQuantity : 0;

  calculation.push('\n📈 FINAL RESULTS:');
  calculation.push(`   Total Units Sold: ${totalSoldQuantity}`);
  calculation.push(`   Total COGS (Cost of Goods Sold): ৳${totalCOGS}`);
  calculation.push(
    `   Average Buying Price per Unit: ৳${averageBuyingPrice.toFixed(2)}`
  );
  calculation.push(`   Remaining Inventory Value: ৳${remainingInventoryValue}`);
  calculation.push(
    `   Remaining Inventory Quantity: ${inventoryBatches.reduce((sum, batch) => sum + batch.remainingQuantity, 0)} units`
  );

  // Print the calculation
  calculation.forEach((line) => console.log(line));

  return {
    totalSoldQuantity,
    totalCOGS,
    averageBuyingPrice,
    remainingInventoryValue,
    calculation,
  };
}

/**
 * Example showing why FIFO is important for accurate cost calculation
 */
export function demonstrateWhyFifoMatters(): void {
  console.log('\n=== WHY FIFO MATTERS FOR ACCURATE COSTING ===\n');

  const shipments = [
    { date: 'Jan 1', qty: 100, cost: 1000 },
    { date: 'Jan 15', qty: 100, cost: 1200 }, // Price increased
    { date: 'Jan 30', qty: 100, cost: 900 }, // Price decreased
  ];

  const sales = [
    { date: 'Jan 10', qty: 50 }, // Should use Jan 1 batch (৳1000)
    { date: 'Jan 20', qty: 100 }, // Should use remaining Jan 1 (50 units) + Jan 15 (50 units)
    { date: 'Feb 5', qty: 80 }, // Should use remaining Jan 15 (50 units) + Jan 30 (30 units)
  ];

  console.log('📦 INVENTORY PURCHASES:');
  shipments.forEach((s) =>
    console.log(`   ${s.date}: ${s.qty} units @ ৳${s.cost}/unit`)
  );

  console.log('\n💰 SALES:');
  sales.forEach((s) => console.log(`   ${s.date}: ${s.qty} units`));

  // Calculate FIFO
  let batches = shipments.map((s) => ({ ...s, remaining: s.qty }));
  let totalCOGS = 0;
  let totalSold = 0;

  console.log('\n🔄 FIFO CALCULATION:');

  sales.forEach((sale, saleIndex) => {
    console.log(`\n   Sale ${saleIndex + 1} - ${sale.qty} units:`);
    let saleRemaining = sale.qty;
    totalSold += sale.qty;

    for (let batch of batches) {
      if (saleRemaining <= 0 || batch.remaining <= 0) continue;

      const take = Math.min(saleRemaining, batch.remaining);
      const cost = take * batch.cost;
      totalCOGS += cost;

      console.log(
        `     - ${take} units from ${batch.date} batch @ ৳${batch.cost} = ৳${cost}`
      );

      batch.remaining -= take;
      saleRemaining -= take;
    }
  });

  const avgBuyingPrice = totalSold > 0 ? totalCOGS / totalSold : 0;

  console.log(`\n📊 RESULTS:`);
  console.log(`   Total Sold: ${totalSold} units`);
  console.log(`   Total COGS: ৳${totalCOGS}`);
  console.log(
    `   Average Buying Price (FIFO): ৳${avgBuyingPrice.toFixed(2)}/unit`
  );

  // Compare with simple average
  const simpleAvg =
    shipments.reduce((sum, s) => sum + s.cost, 0) / shipments.length;
  console.log(
    `   Simple Average of All Purchases: ৳${simpleAvg.toFixed(2)}/unit`
  );
  console.log(
    `   Difference: ৳${Math.abs(avgBuyingPrice - simpleAvg).toFixed(2)}/unit`
  );

  console.log(
    `\n✅ FIFO provides accurate cost based on actual inventory flow!`
  );
}

// Uncomment to run examples:
// demonstrateFifoCalculation();
// demonstrateWhyFifoMatters();
