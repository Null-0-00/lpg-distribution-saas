// Script to reset onboarding status so user can re-enter receivables
// Run this with: node reset-onboarding.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetOnboarding() {
  try {
    console.log('🔄 Resetting onboarding status...');

    // Reset onboarding status for all users
    const result = await prisma.user.updateMany({
      data: {
        onboardingCompleted: false,
        onboardingCompletedAt: null,
      },
    });

    console.log(`✅ Reset onboarding for ${result.count} users`);
    console.log(
      '📝 Users can now re-run onboarding and enter initial receivables'
    );
  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetOnboarding().catch(console.error);
