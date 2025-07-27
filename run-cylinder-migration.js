// Script to run the cylinder tables migration
// Run this with: node run-cylinder-migration.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Running cylinder tables migration...\n');

    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      'prisma',
      'migrations',
      'add_cylinder_tables.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`${i + 1}. Executing: ${statement.substring(0, 50)}...`);

      try {
        await prisma.$executeRawUnsafe(statement);
        console.log('   ✅ Success\n');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('   ⚠️  Already exists, skipping\n');
        } else {
          console.error('   ❌ Error:', error.message);
          throw error;
        }
      }
    }

    console.log('✅ Migration completed successfully!\n');

    // Verify the tables were created
    console.log('🔍 Verifying table creation...');

    const fullCylindersCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'full_cylinders'
    `;

    const emptyCylindersCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'empty_cylinders'
    `;

    console.log(
      `📊 full_cylinders table: ${fullCylindersCount[0].count > 0 ? 'EXISTS' : 'NOT FOUND'}`
    );
    console.log(
      `📊 empty_cylinders table: ${emptyCylindersCount[0].count > 0 ? 'EXISTS' : 'NOT FOUND'}`
    );

    console.log('\n🎉 Cylinder tables migration completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Restart your development server');
    console.log('3. Test the new cylinder tables functionality');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration().catch(console.error);
