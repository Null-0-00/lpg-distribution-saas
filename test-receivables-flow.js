// Test the complete receivables calculation flow
// Run this with: node test-receivables-flow.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testReceivablesFlow() {
  try {
    console.log('🧪 Testing complete receivables calculation flow...\n');

    // Get a test tenant and driver
    const tenant = await prisma.tenant.findFirst({
      include: {
        drivers: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    });

    if (!tenant || tenant.drivers.length === 0) {
      console.log('❌ No active tenant/driver found for testing');
      return;
    }

    const driver = tenant.drivers[0];
    console.log(
      `🎯 Testing with Tenant: ${tenant.name}, Driver: ${driver.name}`
    );

    // Test date - today
    const testDate = new Date();
    const dateStr = testDate.toISOString().split('T')[0];
    console.log(`📅 Test Date: ${dateStr}\n`);

    // Step 1: Check existing sales data
    console.log('Step 1: Checking sales data...');
    const salesData = await prisma.sale.aggregate({
      where: {
        tenantId: tenant.id,
        driverId: driver.id,
        saleDate: {
          gte: new Date(dateStr + 'T00:00:00.000Z'),
          lt: new Date(
            new Date(testDate.getTime() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0] + 'T00:00:00.000Z'
          ),
        },
      },
      _sum: {
        totalValue: true,
        discount: true,
        cashDeposited: true,
        cylindersDeposited: true,
      },
      _count: {
        id: true,
      },
    });

    console.log(`📊 Sales Summary:`);
    console.log(`  - Total Sales: ${salesData._count.id}`);
    console.log(`  - Revenue: ${salesData._sum.totalValue || 0}`);
    console.log(`  - Cash Deposited: ${salesData._sum.cashDeposited || 0}`);
    console.log(`  - Discounts: ${salesData._sum.discount || 0}`);
    console.log(
      `  - Cylinders Deposited: ${salesData._sum.cylindersDeposited || 0}`
    );

    // Step 2: Calculate refill sales
    console.log('\nStep 2: Checking refill sales...');
    const refillSales = await prisma.sale.aggregate({
      where: {
        tenantId: tenant.id,
        driverId: driver.id,
        saleDate: {
          gte: new Date(dateStr + 'T00:00:00.000Z'),
          lt: new Date(
            new Date(testDate.getTime() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0] + 'T00:00:00.000Z'
          ),
        },
        saleType: 'REFILL',
      },
      _sum: {
        quantity: true,
      },
    });

    console.log(`🔄 Refill Sales Quantity: ${refillSales._sum.quantity || 0}`);

    // Step 3: Calculate receivables changes
    const driverSalesRevenue = salesData._sum.totalValue || 0;
    const cashDeposits = salesData._sum.cashDeposited || 0;
    const discounts = salesData._sum.discount || 0;
    const cylinderDeposits = salesData._sum.cylindersDeposited || 0;
    const refillQuantity = refillSales._sum.quantity || 0;

    const cashReceivablesChange = driverSalesRevenue - cashDeposits - discounts;
    const cylinderReceivablesChange = refillQuantity - cylinderDeposits;

    console.log('\nStep 3: Calculated changes...');
    console.log(`💰 Cash Receivables Change: ${cashReceivablesChange}`);
    console.log(
      `🛢️  Cylinder Receivables Change: ${cylinderReceivablesChange}`
    );

    // Step 4: Get previous day's totals
    console.log('\nStep 4: Getting previous totals...');
    const yesterday = new Date(testDate.getTime() - 24 * 60 * 60 * 1000);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayRecord = await prisma.receivableRecord.findFirst({
      where: {
        tenantId: tenant.id,
        driverId: driver.id,
        date: {
          gte: yesterday,
          lt: new Date(dateStr + 'T00:00:00.000Z'),
        },
      },
      orderBy: { date: 'desc' },
    });

    let yesterdayCashTotal = 0;
    let yesterdayCylinderTotal = 0;

    if (yesterdayRecord) {
      yesterdayCashTotal = yesterdayRecord.totalCashReceivables;
      yesterdayCylinderTotal = yesterdayRecord.totalCylinderReceivables;
      console.log(
        `📋 Found yesterday's record: Cash=${yesterdayCashTotal}, Cylinders=${yesterdayCylinderTotal}`
      );
    } else {
      // Check for onboarding record
      const onboardingRecord = await prisma.receivableRecord.findFirst({
        where: {
          tenantId: tenant.id,
          driverId: driver.id,
        },
        orderBy: { date: 'asc' },
      });

      if (onboardingRecord) {
        yesterdayCashTotal = onboardingRecord.totalCashReceivables;
        yesterdayCylinderTotal = onboardingRecord.totalCylinderReceivables;
        console.log(
          `📋 Using onboarding record: Cash=${yesterdayCashTotal}, Cylinders=${yesterdayCylinderTotal}`
        );
      } else {
        console.log(`📋 No previous records found, starting from zero`);
      }
    }

    // Step 5: Calculate new totals
    const totalCashReceivables = yesterdayCashTotal + cashReceivablesChange;
    const totalCylinderReceivables =
      yesterdayCylinderTotal + cylinderReceivablesChange;

    console.log('\nStep 5: New totals...');
    console.log(`💰 Total Cash Receivables: ${totalCashReceivables}`);
    console.log(`🛢️  Total Cylinder Receivables: ${totalCylinderReceivables}`);

    // Step 6: Test the upsert operation
    console.log('\nStep 6: Testing upsert operation...');

    const upsertData = {
      tenantId: tenant.id,
      driverId: driver.id,
      date: new Date(dateStr),
      cashReceivablesChange,
      cylinderReceivablesChange,
      totalCashReceivables,
      totalCylinderReceivables,
    };

    console.log('📝 Upsert data:', JSON.stringify(upsertData, null, 2));

    try {
      const result = await prisma.receivableRecord.upsert({
        where: {
          tenantId_driverId_date: {
            tenantId: tenant.id,
            driverId: driver.id,
            date: new Date(dateStr),
          },
        },
        update: {
          cashReceivablesChange,
          cylinderReceivablesChange,
          totalCashReceivables,
          totalCylinderReceivables,
          calculatedAt: new Date(),
        },
        create: upsertData,
      });

      console.log('✅ Upsert successful!');
      console.log(`📝 Record ID: ${result.id}`);
      console.log(`📅 Date: ${result.date.toISOString().split('T')[0]}`);
      console.log(`💰 Cash: ${result.totalCashReceivables}`);
      console.log(`🛢️  Cylinders: ${result.totalCylinderReceivables}`);

      // Step 7: Verify the record was saved
      console.log('\nStep 7: Verifying saved record...');
      const savedRecord = await prisma.receivableRecord.findUnique({
        where: {
          tenantId_driverId_date: {
            tenantId: tenant.id,
            driverId: driver.id,
            date: new Date(dateStr),
          },
        },
      });

      if (savedRecord) {
        console.log('✅ Record verification successful!');
        console.log(`📝 Verified ID: ${savedRecord.id}`);
      } else {
        console.log(
          '❌ Record verification failed - record not found after upsert!'
        );
      }
    } catch (upsertError) {
      console.log('❌ Upsert operation failed!');
      console.error('Error details:', upsertError);

      // Detailed error analysis
      if (upsertError.code) {
        console.log(`🔍 Error Code: ${upsertError.code}`);
      }
      if (upsertError.meta) {
        console.log(`🔍 Error Meta:`, upsertError.meta);
      }

      // Check specific constraint violations
      if (upsertError.code === 'P2002') {
        console.log('🔍 Unique constraint violation - duplicate key');
      }
      if (upsertError.code === 'P2003') {
        console.log('🔍 Foreign key constraint violation');
      }
      if (upsertError.code === 'P2025') {
        console.log('🔍 Record not found for update');
      }
    }

    console.log('\n✅ Receivables flow test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testReceivablesFlow().catch(console.error);
