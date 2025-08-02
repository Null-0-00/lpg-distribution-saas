const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function checkProdTables() {
  try {
    console.log('🔍 Checking production NextAuth tables...');
    console.log(
      'Database URL:',
      process.env.DATABASE_URL?.substring(0, 50) + '...'
    );

    // Check if NextAuth tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('accounts', 'sessions', 'verificationtokens')
      ORDER BY table_name;
    `;

    console.log('NextAuth tables found:', tables);

    // Check sessions table specifically
    try {
      const sessions =
        await prisma.$queryRaw`SELECT COUNT(*) as count FROM "sessions"`;
      console.log(
        '✅ Sessions table exists with',
        sessions[0].count,
        'records'
      );
    } catch (error) {
      console.log('❌ Sessions table not found:', error.message);
    }

    // Check accounts table
    try {
      const accounts =
        await prisma.$queryRaw`SELECT COUNT(*) as count FROM "accounts"`;
      console.log(
        '✅ Accounts table exists with',
        accounts[0].count,
        'records'
      );
    } catch (error) {
      console.log('❌ Accounts table not found:', error.message);
    }
  } catch (error) {
    console.error('❌ Error checking production tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProdTables();
