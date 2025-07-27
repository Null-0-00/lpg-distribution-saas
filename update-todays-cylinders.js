// Update today's cylinder data to ensure consistency
// Run this with: node update-todays-cylinders.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateTodaysCylinders() {
  try {
    console.log("🔄 Updating today's cylinder data...\n");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split('T')[0];

    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true },
    });

    console.log(`👥 Found ${tenants.length} tenants\n`);

    for (const tenant of tenants) {
      console.log(`🏢 Processing tenant: ${tenant.name}`);

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

      console.log(`  📦 Found ${products.length} active products`);

      // Process full cylinders
      let fullCylindersProcessed = 0;
      for (const product of products) {
        if (!product.cylinderSize) continue;

        // Get inventory record for this product and today
        const inventoryRecord = await prisma.inventoryRecord.findFirst({
          where: {
            tenantId: tenant.id,
            productId: product.id,
            date: today,
          },
        });

        const fullCylinderQuantity = inventoryRecord?.fullCylinders || 0;

        // Create/update full cylinder record
        await prisma.fullCylinder.upsert({
          where: {
            tenantId_productId_date: {
              tenantId: tenant.id,
              productId: product.id,
              date: today,
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
            date: today,
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

      console.log(`  🛢️  Found ${cylinderSizes.length} cylinder sizes`);

      // Get cylinder receivables for today
      const receivableRecords = await prisma.receivableRecord.findMany({
        where: {
          tenantId: tenant.id,
          date: {
            lte: today,
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

      console.log(
        `  📊 Total cylinder receivables: ${totalCylinderReceivables}`
      );

      let emptyCylindersProcessed = 0;
      for (const cylinderSize of cylinderSizes) {
        // Get products for this cylinder size
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
            date: today,
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
            date: today,
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

        // Create/update empty cylinder record
        await prisma.emptyCylinder.upsert({
          where: {
            tenantId_cylinderSizeId_date: {
              tenantId: tenant.id,
              cylinderSizeId: cylinderSize.id,
              date: today,
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
            date: today,
          },
        });

        if (totalEmptyCylinders > 0) {
          emptyCylindersProcessed++;
        }

        console.log(
          `    ${cylinderSize.size}: ${totalEmptyCylinders} total (${quantityInHand} in hand, ${quantityWithDrivers} with drivers)`
        );
      }

      console.log(
        `  ✅ ${dateStr}: ${fullCylindersProcessed} full cylinder records, ${emptyCylindersProcessed} empty cylinder records\n`
      );
    }

    // Show final summary
    console.log("📊 Today's Summary:");
    const [fullCylindersTotal, emptyCylindersTotal] = await Promise.all([
      prisma.fullCylinder.aggregate({
        where: { date: today },
        _sum: { quantity: true },
      }),
      prisma.emptyCylinder.aggregate({
        where: { date: today },
        _sum: { quantity: true },
      }),
    ]);

    console.log(
      `📦 Total full cylinders today: ${fullCylindersTotal._sum.quantity || 0}`
    );
    console.log(
      `🛢️  Total empty cylinders today: ${emptyCylindersTotal._sum.quantity || 0}`
    );

    console.log("\n✅ Today's cylinder data updated successfully!");
    console.log(
      '🎉 The inventory page will now show consistent cylinder values!'
    );
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateTodaysCylinders().catch(console.error);
