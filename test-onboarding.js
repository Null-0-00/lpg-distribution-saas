// Test script to verify onboarding baseline creation
const testOnboardingData = {
  companies: [{ name: 'Test Company A' }, { name: 'Test Company B' }],
  cylinderSizes: [
    { size: '12kg', description: 'Small cylinder' },
    { size: '45kg', description: 'Large cylinder' },
  ],
  products: [
    {
      name: 'Test Product 1',
      companyId: '0',
      cylinderSizeId: '0',
      currentPrice: 100,
    },
    {
      name: 'Test Product 2',
      companyId: '1',
      cylinderSizeId: '1',
      currentPrice: 200,
    },
  ],
  inventory: [
    { productId: '0', fullCylinders: 10 },
    { productId: '1', fullCylinders: 20 },
  ],
  emptyCylinders: [
    { cylinderSizeId: '0', quantity: 5 },
    { cylinderSizeId: '1', quantity: 8 },
  ],
  drivers: [
    { name: 'Test Driver 1', phone: '1234567890' },
    { name: 'Test Driver 2', phone: '0987654321' },
  ],
  receivables: [
    {
      driverId: '0',
      cashReceivables: 500,
      cylinderReceivables: 3,
      cylinderReceivablesBySizes: [
        { cylinderSizeId: '0', size: '12kg', quantity: 2 },
        { cylinderSizeId: '1', size: '45kg', quantity: 1 },
      ],
    },
    {
      driverId: '1',
      cashReceivables: 750,
      cylinderReceivables: 4,
      cylinderReceivablesBySizes: [
        { cylinderSizeId: '0', size: '12kg', quantity: 1 },
        { cylinderSizeId: '1', size: '45kg', quantity: 3 },
      ],
    },
  ],
};

async function testOnboarding() {
  try {
    console.log(
      'Testing onboarding with data:',
      JSON.stringify(testOnboardingData, null, 2)
    );

    const response = await fetch(
      'http://localhost:3003/api/onboarding/complete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testOnboardingData),
      }
    );

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.debug) {
      console.log('\n=== DEBUG INFO ===');
      console.log('Baselines created:', result.debug.baselinesCreated);
      console.log('Drivers created:', result.debug.driversCreated);
      console.log('Cylinder sizes created:', result.debug.cylinderSizesCreated);
      console.log('Baseline IDs:', result.debug.baselinesIds);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testOnboarding();
