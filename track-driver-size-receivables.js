#!/usr/bin/env node

/**
 * Guide: How to Track Cylinder Receivables by Size per Driver
 * This shows exactly how the data is stored and retrieved
 */

console.log('📊 TRACKING CYLINDER RECEIVABLES BY SIZE PER DRIVER\n');
console.log('===================================================\n');

// Sample data showing how receivables are stored
const sampleData = {
  drivers: [
    { id: 'driver-1', name: 'Ahmed Ali' },
    { id: 'driver-2', name: 'Hassan Omar' },
    { id: 'driver-3', name: 'Fatima Said' },
  ],

  // This is how the data gets stored in customer_receivables table
  customerReceivables: [
    // Ahmed Ali's receivables
    {
      driverId: 'driver-1',
      receivableType: 'CYLINDER',
      size: '12kg',
      quantity: 15,
    },
    {
      driverId: 'driver-1',
      receivableType: 'CYLINDER',
      size: '45kg',
      quantity: 10,
    },

    // Hassan Omar's receivables
    {
      driverId: 'driver-2',
      receivableType: 'CYLINDER',
      size: '12kg',
      quantity: 8,
    },
    {
      driverId: 'driver-2',
      receivableType: 'CYLINDER',
      size: '45kg',
      quantity: 4,
    },
    {
      driverId: 'driver-2',
      receivableType: 'CYLINDER',
      size: '5kg',
      quantity: 6,
    },

    // Fatima Said's receivables
    {
      driverId: 'driver-3',
      receivableType: 'CYLINDER',
      size: '12kg',
      quantity: 12,
    },
    {
      driverId: 'driver-3',
      receivableType: 'CYLINDER',
      size: '45kg',
      quantity: 7,
    },
  ],
};

console.log('🗃️ DATABASE STORAGE STRUCTURE:');
console.log('===============================');
console.log('Table: customer_receivables');
console.log('Fields: driverId, receivableType, size, quantity, status');
console.log('');

sampleData.customerReceivables.forEach((record, index) => {
  const driver = sampleData.drivers.find((d) => d.id === record.driverId);
  console.log(`Record ${index + 1}:`);
  console.log(`  Driver: ${driver?.name}`);
  console.log(`  Type: ${record.receivableType}`);
  console.log(`  Size: ${record.size}`);
  console.log(`  Quantity: ${record.quantity}`);
  console.log('');
});

console.log('🔍 RETRIEVAL METHODS:');
console.log('=====================');

console.log('\n1. GET ALL CYLINDER RECEIVABLES BY DRIVER:');
console.log('------------------------------------------');
console.log(`
SQL Query:
SELECT 
  d.name as driver_name,
  cr.size,
  cr.quantity
FROM customer_receivables cr
JOIN drivers d ON cr.driverId = d.id
WHERE cr.tenantId = 'your-tenant-id' 
  AND cr.receivableType = 'CYLINDER'
  AND cr.status = 'CURRENT'
ORDER BY d.name, cr.size;
`);

// Simulate the result
console.log('RESULT:');
const groupedByDriver = {};
sampleData.customerReceivables.forEach((record) => {
  const driver = sampleData.drivers.find((d) => d.id === record.driverId);
  if (!groupedByDriver[driver.name]) {
    groupedByDriver[driver.name] = [];
  }
  groupedByDriver[driver.name].push({
    size: record.size,
    quantity: record.quantity,
  });
});

Object.entries(groupedByDriver).forEach(([driverName, receivables]) => {
  console.log(`${driverName}:`);
  receivables.forEach((r) => {
    console.log(`  ${r.size}: ${r.quantity} cylinders`);
  });
  console.log('');
});

console.log('\n2. GET RECEIVABLES FOR SPECIFIC DRIVER:');
console.log('--------------------------------------');
console.log(`
SQL Query:
SELECT 
  cr.size,
  cr.quantity
FROM customer_receivables cr
JOIN drivers d ON cr.driverId = d.id
WHERE cr.tenantId = 'your-tenant-id' 
  AND d.name = 'Ahmed Ali'
  AND cr.receivableType = 'CYLINDER'
  AND cr.status = 'CURRENT'
ORDER BY cr.size;
`);

console.log('RESULT for Ahmed Ali:');
const ahmedReceivables = sampleData.customerReceivables.filter(
  (r) => r.driverId === 'driver-1'
);
ahmedReceivables.forEach((r) => {
  console.log(`  ${r.size}: ${r.quantity} cylinders`);
});

console.log('\n3. GET RECEIVABLES FOR SPECIFIC SIZE:');
console.log('------------------------------------');
console.log(`
SQL Query:
SELECT 
  d.name as driver_name,
  cr.quantity
FROM customer_receivables cr
JOIN drivers d ON cr.driverId = d.id
WHERE cr.tenantId = 'your-tenant-id' 
  AND cr.size = '12kg'
  AND cr.receivableType = 'CYLINDER'
  AND cr.status = 'CURRENT'
ORDER BY d.name;
`);

console.log('RESULT for 12kg cylinders:');
const size12kgReceivables = sampleData.customerReceivables.filter(
  (r) => r.size === '12kg'
);
size12kgReceivables.forEach((r) => {
  const driver = sampleData.drivers.find((d) => d.id === r.driverId);
  console.log(`  ${driver.name}: ${r.quantity} cylinders`);
});

console.log('\n4. GET TOTAL RECEIVABLES BY SIZE (ALL DRIVERS):');
console.log('----------------------------------------------');
console.log(`
SQL Query:
SELECT 
  cr.size,
  SUM(cr.quantity) as total_quantity,
  COUNT(DISTINCT cr.driverId) as driver_count
FROM customer_receivables cr
WHERE cr.tenantId = 'your-tenant-id' 
  AND cr.receivableType = 'CYLINDER'
  AND cr.status = 'CURRENT'
GROUP BY cr.size
ORDER BY cr.size;
`);

console.log('RESULT:');
const sizeGroups = {};
sampleData.customerReceivables.forEach((record) => {
  if (!sizeGroups[record.size]) {
    sizeGroups[record.size] = { total: 0, drivers: new Set() };
  }
  sizeGroups[record.size].total += record.quantity;
  sizeGroups[record.size].drivers.add(record.driverId);
});

Object.entries(sizeGroups).forEach(([size, data]) => {
  console.log(
    `  ${size}: ${data.total} cylinders (${data.drivers.size} drivers)`
  );
});

console.log('\n📱 API ENDPOINT EXAMPLES:');
console.log('=========================');

console.log('\n1. GET /api/receivables/driver/{driverId}/cylinders');
console.log('Returns all cylinder receivables for a specific driver');

console.log('\n2. GET /api/receivables/size/{size}');
console.log('Returns all receivables for a specific cylinder size');

console.log('\n3. GET /api/receivables/driver/{driverId}/size/{size}');
console.log('Returns receivables for specific driver and size combination');

console.log('\n4. GET /api/receivables/summary');
console.log('Returns complete breakdown by driver and size');

console.log('\n💡 PRACTICAL USAGE EXAMPLES:');
console.log('=============================');

console.log('\n📋 Business Scenarios:');
console.log('1. "How many 12kg cylinders does Ahmed Ali owe?"');
console.log('   → Query customer_receivables for Ahmed Ali + 12kg');

console.log('\n2. "Which drivers owe 45kg cylinders?"');
console.log('   → Query customer_receivables for 45kg, group by driver');

console.log('\n3. "What\'s the total 12kg receivables across all drivers?"');
console.log('   → Sum quantities for 12kg across all drivers');

console.log('\n4. "Generate receivables report by driver and size"');
console.log('   → Query all cylinder receivables, group by driver and size');

console.log('\n🔧 SAMPLE API IMPLEMENTATION:');
console.log('==============================');
console.log(`
// Get cylinder receivables by driver and size
async function getCylinderReceivablesByDriver(tenantId, driverId = null, size = null) {
  const whereClause = {
    tenantId,
    receivableType: 'CYLINDER',
    status: 'CURRENT',
    ...(driverId && { driverId }),
    ...(size && { size })
  };

  return await prisma.customerReceivable.findMany({
    where: whereClause,
    include: {
      driver: {
        select: { id: true, name: true, phone: true }
      }
    },
    orderBy: [
      { driver: { name: 'asc' } },
      { size: 'asc' }
    ]
  });
}

// Usage examples:
// getCylinderReceivablesByDriver('tenant-123') // All drivers, all sizes
// getCylinderReceivablesByDriver('tenant-123', 'driver-1') // Specific driver, all sizes  
// getCylinderReceivablesByDriver('tenant-123', null, '12kg') // All drivers, specific size
// getCylinderReceivablesByDriver('tenant-123', 'driver-1', '12kg') // Specific driver and size
`);

console.log('\n✅ SUMMARY:');
console.log('===========');
console.log("✅ Each driver's cylinder receivables are stored by size");
console.log('✅ Can query by driver, size, or any combination');
console.log('✅ Data is normalized for flexible reporting');
console.log('✅ Supports real-time tracking and updates');
console.log('✅ Enables detailed business analytics');

console.log('\n🎯 KEY BENEFITS:');
console.log('================');
console.log('• Track exactly which driver owes which cylinder sizes');
console.log('• Generate size-specific collection reports');
console.log('• Monitor cylinder receivables by product type');
console.log('• Support targeted collection efforts');
console.log('• Enable accurate inventory planning');
console.log('• Provide detailed customer service information');
