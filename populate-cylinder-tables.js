// Script to populate cylinder tables with initial data
// Run this with: node populate-cylinder-tables.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function populateCylinderTables() {
  try {
    console.log('🔄 Populating cylinder tables with initial data...\n');

    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true },
    });

    console.log(`👥 Found ${tenants.length} tenants\n`);

    for (const tenant of tenants) {
      console.log(`🏢 Processing tenant: ${tenant.name}`);

      // Get date range for the last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      console.log(
        `📅 Processing dates from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
      );

      // Process each day
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const currentDate = new Date(d);
        currentDate.setHours(0, 0, 0, 0);
        const dateStr = currentDate.toISOString().split('T')[0];

        console.log(`  📊 Processing ${dateStr}...`);

        // Get all active products for this tenant
        const products = await prisma.product.findMany({
          where: {
            tenantId: tenant.id,
            isActive: true,
          },
          include: {
            company: true,
            cylinderSize: true,
          },
        });

        // Process full cylinders
        let fullCylindersProcessed = 0;
        for (const product of products) {
          if (!product.cylinderSize) continue;

          // Get inventory record for this product and date
          const inventoryRecord = await prisma.inventoryRecord.findFirst({
            where: {
              tenantId: tenant.id,
              productId: product.id,
              date: currentDate,
            },
          });

          const fullCylinderQuantity = inventoryRecord?.fullCylinders || 0;

          // Create full cylinder record
          await prisma.fullCylinder.upsert({
            where: {
              tenantId_productId_date: {
                tenantId: tenant.id,
                productId: product.id,
                date: currentDate,
              },
            },
            update: {
              quantity: fullCylinderQuantity,
              calculatedAt: new Date(),
            },
            create: {
              tenantId: tenant.id,
              productId: product.id,
              companyId: product.companyId,
              cylinderSizeId: product.cylinderSize.id,
              quantity: fullCylinderQuantity,
              date: currentDate,
            },
          });

          if (fullCylinderQuantity > 0) {
            fullCylindersProcessed++;
          }
        }

        // Process empty cylinders
        const cylinderSizes = await prisma.cylinderSize.findMany({
          where: {
            tenantId: tenant.id,
            isActive: true,
          },
        });

        // Get cylinder receivables for this date
        const receivableRecords = await prisma.receivableRecord.findMany({
          where: {
            tenantId: tenant.id,
            date: {
              lte: currentDate,
            },
          },
          orderBy: {
            date: 'desc',
          },
        });

        // Get latest receivables per driver
        const latestReceivablesByDriver = new Map();
        receivableRecords.forEach((record) => {
          if (!latestReceivablesByDriver.has(record.driverId)) {
            latestReceivablesByDriver.set(
              record.driverId,
              record.totalCylinderReceivables
            );
          }
        });

        const totalCylinderReceivables = Array.from(
          latestReceivablesByDriver.values()
        ).reduce((sum, amount) => sum + amount, 0);

        let emptyCylindersProcessed = 0;
        for (const cylinderSize of cylinderSizes) {
          // Get products for this cylinder size first
          const productsForSize = await prisma.product.findMany({
            where: {
              tenantId: tenant.id,
              cylinderSizeId: cylinderSize.id,
              isActive: true,
            },
          });

          const productIds = productsForSize.map((p) => p.id);

          // Get total empty cylinders from inventory records for this size
          const inventoryRecords = await prisma.inventoryRecord.findMany({
            where: {
              tenantId: tenant.id,
              date: currentDate,
              productId: {
                in: productIds,
              },
            },
          });

          const totalEmptyCylinders = inventoryRecords.reduce(
            (sum, record) => sum + record.emptyCylinders,
            0
          );

          // Calculate proportional receivables for this size
          const allSizesEmptyTotal = await prisma.inventoryRecord.aggregate({
            where: {
              tenantId: tenant.id,
              date: currentDate,
            },
            _sum: {
              emptyCylinders: true,
            },
          });

          const totalEmptyAcrossAllSizes =
            allSizesEmptyTotal._sum.emptyCylinders || 0;

          let proportionalReceivables = 0;
          if (totalEmptyAcrossAllSizes > 0) {
            proportionalReceivables = Math.round(
              (totalEmptyCylinders / totalEmptyAcrossAllSizes) *
                totalCylinderReceivables
            );
          }

          const quantityInHand = Math.max(
            0,
            totalEmptyCylinders - proportionalReceivables
          );
          const quantityWithDrivers = proportionalReceivables;

          // Create empty cylinder record
          await prisma.emptyCylinder.upsert({
            where: {
              tenantId_cylinderSizeId_date: {
                tenantId: tenant.id,
                cylinderSizeId: cylinderSize.id,
                date: currentDate,
              },
            },
            update: {
              quantity: totalEmptyCylinders,
              quantityInHand,
              quantityWithDrivers,
              calculatedAt: new Date(),
            },
            create: {
              tenantId: tenant.id,
              cylinderSizeId: cylinderSize.id,
              quantity: totalEmptyCylinders,
              quantityInHand,
              quantityWithDrivers,
              date: currentDate,
            },
          });

          if (totalEmptyCylinders > 0) {
            emptyCylindersProcessed++;
          }
        }

        console.log(
          `    ✅ ${dateStr}: ${fullCylindersProcessed} full cylinder records, ${emptyCylindersProcessed} empty cylinder records`
        );
      }

      console.log(`  ✅ Completed tenant: ${tenant.name}\n`);
    }

    // Show summary
    console.log('📊 Final Summary:');
    const fullCylindersTotal = await prisma.fullCylinder.count();
    const emptyCylindersTotal = await prisma.emptyCylinder.count();

    console.log(`📦 Total full cylinder records: ${fullCylindersTotal}`);
    console.log(`🛢️  Total empty cylinder records: ${emptyCylindersTotal}`);

    console.log('\n✅ Cylinder tables populated successfully!');
    console.log(
      '🎉 The cylinder tables are now ready and connected to the inventory page!'
    );
  } catch (error) {
    console.error('❌ Population failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

populateCylinderTables().catch(console.error);
