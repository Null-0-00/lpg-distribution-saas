// Debug script to identify receivables saving issues
// Run this with: node debug-receivables.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function debugReceivables() {
  try {
    console.log('🔍 Starting receivables debug analysis...\n');

    // 1. Check database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // 2. Check if receivable_records table exists and has data
    console.log('2. Checking receivable_records table...');
    const recordCount = await prisma.receivableRecord.count();
    console.log(`📊 Total receivable records: ${recordCount}`);

    if (recordCount === 0) {
      console.log('⚠️  No receivable records found in database\n');
    } else {
      // Show recent records
      const recentRecords = await prisma.receivableRecord.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          driver: { select: { name: true } },
        },
      });

      console.log('📋 Recent receivable records:');
      recentRecords.forEach((record) => {
        console.log(
          `  - ${record.driver.name}: Cash=${record.totalCashReceivables}, Cylinders=${record.totalCylinderReceivables}, Date=${record.date.toISOString().split('T')[0]}`
        );
      });
      console.log('');
    }

    // 3. Check for active drivers
    console.log('3. Checking active drivers...');
    const activeDrivers = await prisma.driver.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, tenantId: true },
    });
    console.log(`👥 Active drivers: ${activeDrivers.length}`);

    if (activeDrivers.length === 0) {
      console.log('⚠️  No active drivers found\n');
      return;
    }

    // 4. Check recent sales data
    console.log('4. Checking recent sales data...');
    const recentSales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      take: 10,
      orderBy: { saleDate: 'desc' },
      include: {
        driver: { select: { name: true } },
      },
    });

    console.log(`💰 Recent sales (last 7 days): ${recentSales.length}`);
    if (recentSales.length > 0) {
      console.log('📋 Sample sales:');
      recentSales.slice(0, 3).forEach((sale) => {
        console.log(
          `  - ${sale.driver.name}: ${sale.saleType} ${sale.quantity} units, Value=${sale.totalValue}, Cash Deposited=${sale.cashDeposited}`
        );
      });
    }
    console.log('');

    // 5. Test receivables calculation for a specific driver
    if (activeDrivers.length > 0 && recentSales.length > 0) {
      console.log('5. Testing receivables calculation...');
      const testDriver = activeDrivers[0];
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      console.log(
        `🧪 Testing calculation for driver: ${testDriver.name} on ${todayStr}`
      );

      // Get sales data for today
      const todaySales = await prisma.sale.findMany({
        where: {
          tenantId: testDriver.tenantId,
          driverId: testDriver.id,
          saleDate: {
            gte: new Date(todayStr + 'T00:00:00.000Z'),
            lt: new Date(
              new Date(today.getTime() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0] + 'T00:00:00.000Z'
            ),
          },
        },
      });

      console.log(
        `📊 Sales for ${testDriver.name} today: ${todaySales.length}`
      );

      if (todaySales.length > 0) {
        const salesRevenue = todaySales.reduce(
          (sum, sale) => sum + sale.totalValue,
          0
        );
        const cashDeposited = todaySales.reduce(
          (sum, sale) => sum + sale.cashDeposited,
          0
        );
        const discounts = todaySales.reduce(
          (sum, sale) => sum + sale.discount,
          0
        );

        console.log(`  Sales Revenue: ${salesRevenue}`);
        console.log(`  Cash Deposited: ${cashDeposited}`);
        console.log(`  Discounts: ${discounts}`);
        console.log(
          `  Cash Receivables Change: ${salesRevenue - cashDeposited - discounts}`
        );

        // Try to create/update a receivable record
        try {
          console.log('🔄 Attempting to upsert receivable record...');

          const result = await prisma.receivableRecord.upsert({
            where: {
              tenantId_driverId_date: {
                tenantId: testDriver.tenantId,
                driverId: testDriver.id,
                date: new Date(todayStr),
              },
            },
            update: {
              cashReceivablesChange: salesRevenue - cashDeposited - discounts,
              totalCashReceivables: salesRevenue - cashDeposited - discounts,
              calculatedAt: new Date(),
            },
            create: {
              tenantId: testDriver.tenantId,
              driverId: testDriver.id,
              date: new Date(todayStr),
              cashReceivablesChange: salesRevenue - cashDeposited - discounts,
              totalCashReceivables: salesRevenue - cashDeposited - discounts,
            },
          });

          console.log('✅ Receivable record upsert successful!');
          console.log(`📝 Record ID: ${result.id}`);
          console.log(
            `💰 Total Cash Receivables: ${result.totalCashReceivables}`
          );
        } catch (upsertError) {
          console.log('❌ Receivable record upsert failed!');
          console.error('Error details:', upsertError);

          // Check for constraint violations
          if (upsertError.code === 'P2002') {
            console.log('🔍 Unique constraint violation detected');
          }
          if (upsertError.code === 'P2003') {
            console.log('🔍 Foreign key constraint violation detected');
          }
        }
      } else {
        console.log('ℹ️  No sales data for today to test with');
      }
    }

    // 6. Check for any orphaned or invalid data
    console.log('\n6. Checking for data integrity issues...');

    // Check for any constraint violations or data issues
    const allRecords = await prisma.receivableRecord.findMany({
      select: {
        id: true,
        tenantId: true,
        driverId: true,
        date: true,
        totalCashReceivables: true,
        totalCylinderReceivables: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`📊 Recent records summary:`);
    allRecords.forEach((record) => {
      console.log(
        `  - ID: ${record.id.substring(0, 8)}..., Date: ${record.date.toISOString().split('T')[0]}, Cash: ${record.totalCashReceivables}, Cylinders: ${record.totalCylinderReceivables}`
      );
    });

    // Check for records with zero values
    const zeroRecords = allRecords.filter(
      (r) => r.totalCashReceivables === 0 && r.totalCylinderReceivables === 0
    );
    if (zeroRecords.length > 0) {
      console.log(
        `⚠️  Found ${zeroRecords.length} records with zero receivables`
      );
    }

    console.log('\n✅ Debug analysis complete!');
  } catch (error) {
    console.error('❌ Debug analysis failed:', error);

    // Check specific error types
    if (error.code === 'P1001') {
      console.log('🔍 Database connection issue detected');
    }
    if (error.code === 'P2021') {
      console.log('🔍 Table does not exist');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug analysis
debugReceivables().catch(console.error);
