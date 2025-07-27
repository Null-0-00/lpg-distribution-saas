// Create cylinder tables using Prisma's migration system
// Run this with: node create-cylinder-migration.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createCylinderTables() {
  try {
    console.log('🚀 Creating cylinder tables...\n');

    // Step 1: Create full_cylinders table
    console.log('1. Creating full_cylinders table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "full_cylinders" (
        "id" TEXT NOT NULL,
        "tenantId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "companyId" TEXT NOT NULL,
        "cylinderSizeId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "date" DATE NOT NULL,
        "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "full_cylinders_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('   ✅ full_cylinders table created\n');

    // Step 2: Create empty_cylinders table
    console.log('2. Creating empty_cylinders table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "empty_cylinders" (
        "id" TEXT NOT NULL,
        "tenantId" TEXT NOT NULL,
        "cylinderSizeId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "quantityInHand" INTEGER NOT NULL DEFAULT 0,
        "quantityWithDrivers" INTEGER NOT NULL DEFAULT 0,
        "date" DATE NOT NULL,
        "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "empty_cylinders_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('   ✅ empty_cylinders table created\n');

    // Step 3: Add foreign key constraints
    console.log('3. Adding foreign key constraints...');

    try {
      await prisma.$executeRaw`
        ALTER TABLE "full_cylinders" 
        ADD CONSTRAINT "full_cylinders_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      console.log('   ✅ full_cylinders -> tenants FK added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('   ⚠️  full_cylinders -> tenants FK already exists');
      } else {
        throw e;
      }
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "full_cylinders" 
        ADD CONSTRAINT "full_cylinders_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      console.log('   ✅ full_cylinders -> products FK added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('   ⚠️  full_cylinders -> products FK already exists');
      } else {
        throw e;
      }
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "full_cylinders" 
        ADD CONSTRAINT "full_cylinders_companyId_fkey" 
        FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      console.log('   ✅ full_cylinders -> companies FK added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('   ⚠️  full_cylinders -> companies FK already exists');
      } else {
        throw e;
      }
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "full_cylinders" 
        ADD CONSTRAINT "full_cylinders_cylinderSizeId_fkey" 
        FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      console.log('   ✅ full_cylinders -> cylinder_sizes FK added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log(
          '   ⚠️  full_cylinders -> cylinder_sizes FK already exists'
        );
      } else {
        throw e;
      }
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "empty_cylinders" 
        ADD CONSTRAINT "empty_cylinders_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      console.log('   ✅ empty_cylinders -> tenants FK added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('   ⚠️  empty_cylinders -> tenants FK already exists');
      } else {
        throw e;
      }
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "empty_cylinders" 
        ADD CONSTRAINT "empty_cylinders_cylinderSizeId_fkey" 
        FOREIGN KEY ("cylinderSizeId") REFERENCES "cylinder_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      console.log('   ✅ empty_cylinders -> cylinder_sizes FK added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log(
          '   ⚠️  empty_cylinders -> cylinder_sizes FK already exists'
        );
      } else {
        throw e;
      }
    }

    // Step 4: Add unique constraints
    console.log('\n4. Adding unique constraints...');

    try {
      await prisma.$executeRaw`
        ALTER TABLE "full_cylinders" 
        ADD CONSTRAINT "full_cylinders_tenantId_productId_date_key" 
        UNIQUE ("tenantId", "productId", "date")
      `;
      console.log('   ✅ full_cylinders unique constraint added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('   ⚠️  full_cylinders unique constraint already exists');
      } else {
        throw e;
      }
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "empty_cylinders" 
        ADD CONSTRAINT "empty_cylinders_tenantId_cylinderSizeId_date_key" 
        UNIQUE ("tenantId", "cylinderSizeId", "date")
      `;
      console.log('   ✅ empty_cylinders unique constraint added');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('   ⚠️  empty_cylinders unique constraint already exists');
      } else {
        throw e;
      }
    }

    // Step 5: Add indexes
    console.log('\n5. Adding indexes...');

    const indexes = [
      {
        table: 'full_cylinders',
        column: 'tenantId',
        name: 'full_cylinders_tenantId_idx',
      },
      {
        table: 'full_cylinders',
        column: 'date',
        name: 'full_cylinders_date_idx',
      },
      {
        table: 'full_cylinders',
        column: 'productId',
        name: 'full_cylinders_productId_idx',
      },
      {
        table: 'full_cylinders',
        column: 'companyId',
        name: 'full_cylinders_companyId_idx',
      },
      {
        table: 'full_cylinders',
        column: 'cylinderSizeId',
        name: 'full_cylinders_cylinderSizeId_idx',
      },
      {
        table: 'empty_cylinders',
        column: 'tenantId',
        name: 'empty_cylinders_tenantId_idx',
      },
      {
        table: 'empty_cylinders',
        column: 'date',
        name: 'empty_cylinders_date_idx',
      },
      {
        table: 'empty_cylinders',
        column: 'cylinderSizeId',
        name: 'empty_cylinders_cylinderSizeId_idx',
      },
    ];

    for (const index of indexes) {
      try {
        await prisma.$executeRawUnsafe(
          `CREATE INDEX IF NOT EXISTS "${index.name}" ON "${index.table}"("${index.column}")`
        );
        console.log(`   ✅ ${index.name} created`);
      } catch (e) {
        console.log(
          `   ⚠️  ${index.name} already exists or failed: ${e.message}`
        );
      }
    }

    // Step 6: Verify tables exist
    console.log('\n6. Verifying table creation...');

    const fullCylindersExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'full_cylinders'
      )
    `;

    const emptyCylindersExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'empty_cylinders'
      )
    `;

    console.log(
      `   📊 full_cylinders table: ${fullCylindersExists[0].exists ? '✅ EXISTS' : '❌ NOT FOUND'}`
    );
    console.log(
      `   📊 empty_cylinders table: ${emptyCylindersExists[0].exists ? '✅ EXISTS' : '❌ NOT FOUND'}`
    );

    if (fullCylindersExists[0].exists && emptyCylindersExists[0].exists) {
      console.log('\n🎉 Cylinder tables created successfully!');
      console.log('📋 Next steps:');
      console.log('1. Run: npx prisma generate');
      console.log('2. Run: node populate-cylinder-tables.js');
      console.log('3. Test with: node test-cylinder-tables.js');
    } else {
      console.log('\n❌ Some tables were not created successfully');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createCylinderTables().catch(console.error);
