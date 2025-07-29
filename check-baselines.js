// Simple script to check baseline records in database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBaselines() {
  try {
    console.log('Checking driver cylinder size baselines...');

    // Check total count
    const totalBaselines = await prisma.driverCylinderSizeBaseline.count();
    console.log('Total baseline records:', totalBaselines);

    // Get all baselines with details
    const baselines = await prisma.driverCylinderSizeBaseline.findMany({
      include: {
        driver: {
          select: { name: true },
        },
        cylinderSize: {
          select: { size: true },
        },
        tenant: {
          select: { name: true },
        },
      },
    });

    console.log('\nBaseline records:');
    baselines.forEach((baseline, index) => {
      console.log(
        `${index + 1}. Driver: ${baseline.driver.name}, Size: ${baseline.cylinderSize.size}, Quantity: ${baseline.baselineQuantity}, Source: ${baseline.source}`
      );
    });

    // Check tenants onboarding status
    const tenants = await prisma.tenant.findMany({
      select: {
        name: true,
        onboardingCompleted: true,
        onboardingCompletedAt: true,
      },
    });

    console.log('\nTenant onboarding status:');
    tenants.forEach((tenant) => {
      console.log(
        `- ${tenant.name}: ${tenant.onboardingCompleted ? 'Completed' : 'Pending'} ${tenant.onboardingCompletedAt ? `at ${tenant.onboardingCompletedAt}` : ''}`
      );
    });
  } catch (error) {
    console.error('Error checking baselines:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBaselines();
