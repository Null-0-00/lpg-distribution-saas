/**
 * Test script to verify template variable mapping works correctly
 */

// Simple template replacement function to test
function replaceTemplateVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(
      new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
      value
    );
  }
  return result;
}

// Test template (similar to what's in the message templates)
const testTemplate = `প্রিয় {{customerName}},

আপনার বকেয়ার হালনাগাদ তথ্য:

নগদ বকেয়া: {{cashAmount}}
সিলিন্ডার বকেয়া: {{cylinderAmount}}

এলাকা: {{areaName}}
ড্রাইভার: {{driverName}}

*LPG ডিস্ট্রিবিউটর সিস্টেম*`;

// Test variables (similar to what's provided in receivables-messaging.ts)
const testVariables = {
  customerName: 'রহিম সাহেব',
  cashAmount: '১,৫০০ টাকা',
  cylinderAmount: '৫ টি',
  areaName: 'পুরান ঢাকা',
  driverName: 'করিম ভাই',
};

console.log('=== TEMPLATE VARIABLE MAPPING TEST ===\n');

console.log('Original Template:');
console.log(testTemplate);

console.log('\nTest Variables:');
console.log(JSON.stringify(testVariables, null, 2));

console.log('\nProcessed Message:');
const processedMessage = replaceTemplateVariables(testTemplate, testVariables);
console.log(processedMessage);

console.log('\n=== VERIFICATION ===');

// Check if all placeholders were replaced
const remainingPlaceholders = processedMessage.match(/\{\{[^}]+\}\}/g);
if (remainingPlaceholders) {
  console.log(
    '❌ ERROR: Unreplaced placeholders found:',
    remainingPlaceholders
  );
} else {
  console.log('✅ SUCCESS: All template variables were replaced correctly');
}

// Check specific values
const checks = [
  {
    name: 'Customer Name',
    expected: testVariables.customerName,
    found: processedMessage.includes(testVariables.customerName),
  },
  {
    name: 'Cash Amount',
    expected: testVariables.cashAmount,
    found: processedMessage.includes(testVariables.cashAmount),
  },
  {
    name: 'Cylinder Amount',
    expected: testVariables.cylinderAmount,
    found: processedMessage.includes(testVariables.cylinderAmount),
  },
  {
    name: 'Area Name',
    expected: testVariables.areaName,
    found: processedMessage.includes(testVariables.areaName),
  },
  {
    name: 'Driver Name',
    expected: testVariables.driverName,
    found: processedMessage.includes(testVariables.driverName),
  },
];

console.log('\nDetailed Verification:');
checks.forEach((check) => {
  const status = check.found ? '✅' : '❌';
  console.log(
    `${status} ${check.name}: ${check.expected} ${check.found ? 'FOUND' : 'NOT FOUND'}`
  );
});

const allPassed = checks.every((check) => check.found);
console.log(
  `\n${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}: Template variable mapping ${allPassed ? 'works correctly' : 'has issues'}`
);
