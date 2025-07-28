const fs = require('fs');
const path = require('path');

console.log('🔍 Testing receivables translation fixes...\n');

// Read the receivables page file
const receivablesPagePath = path.join(
  __dirname,
  'src/app/dashboard/receivables/page.tsx'
);
const receivablesContent = fs.readFileSync(receivablesPagePath, 'utf8');

// Read the translations file
const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

// Test cases for hardcoded English text that should be replaced
const hardcodedTextTests = [
  {
    text: 'Sales Cash Receivable:',
    shouldExist: false,
    replacement: "t('salesCashReceivables')",
    description: 'Sales Cash Receivable should use translation',
  },
  {
    text: 'Cylinder Receivable:',
    shouldExist: false,
    replacement: "t('cylinderReceivable')",
    description: 'Cylinder Receivable should use translation',
  },
  {
    text: 'Customer Records:',
    shouldExist: false,
    replacement: "t('customerRecords')",
    description: 'Customer Records should use translation',
  },
  {
    text: 'Active:',
    shouldExist: false,
    replacement: "t('active')",
    description: 'Active should use translation',
  },
  {
    text: 'Status Breakdown:',
    shouldExist: false,
    replacement: "t('statusBreakdown')",
    description: 'Status Breakdown should use translation',
  },
  {
    text: 'Current:',
    shouldExist: false,
    replacement: "t('current')",
    description: 'Current should use translation',
  },
  {
    text: 'Due Soon:',
    shouldExist: false,
    replacement: "t('dueSoon')",
    description: 'Due Soon should use translation',
  },
  {
    text: 'Overdue:',
    shouldExist: false,
    replacement: "t('overdue')",
    description: 'Overdue should use translation',
  },
  {
    text: 'Paid:',
    shouldExist: false,
    replacement: "t('paid')",
    description: 'Paid should use translation',
  },
  {
    text: 'No cash receivables',
    shouldExist: false,
    replacement: "t('noCashReceivables')",
    description: 'No cash receivables should use translation',
  },
  {
    text: 'No cylinder receivables',
    shouldExist: false,
    replacement: "t('noCylinderReceivables')",
    description: 'No cylinder receivables should use translation',
  },
];

// Test for hardcoded text in actual rendered content (not comments)
const renderContentTests = [
  {
    pattern: />\s*Cash Receivables\s*</,
    description: 'Cash Receivables in rendered content should use translation',
  },
  {
    pattern: />\s*Cylinder Receivables\s*</,
    description:
      'Cylinder Receivables in rendered content should use translation',
  },
];

// Test translation keys exist
const translationKeyTests = [
  'salesCashReceivables',
  'cylinderReceivable',
  'customerRecords',
  'statusBreakdown',
  'current',
  'dueSoon',
  'overdue',
  'paid',
  'cashReceivables',
  'cylinderReceivables',
  'noCashReceivables',
  'noCylinderReceivables',
];

let allTestsPassed = true;

console.log('📝 Testing hardcoded text replacement...');
hardcodedTextTests.forEach((test, index) => {
  const exists = receivablesContent.includes(test.text);
  const hasReplacement = receivablesContent.includes(test.replacement);

  if (test.shouldExist && !exists) {
    console.log(
      `❌ ${index + 1}. ${test.description} - Expected text not found`
    );
    allTestsPassed = false;
  } else if (!test.shouldExist && exists) {
    console.log(
      `❌ ${index + 1}. ${test.description} - Hardcoded text still exists: "${test.text}"`
    );
    allTestsPassed = false;
  } else if (!test.shouldExist && !hasReplacement) {
    console.log(
      `⚠️  ${index + 1}. ${test.description} - Translation not found: ${test.replacement}`
    );
    allTestsPassed = false;
  } else {
    console.log(`✅ ${index + 1}. ${test.description}`);
  }
});

console.log('\n🎯 Testing rendered content (excluding comments)...');
renderContentTests.forEach((test, index) => {
  const matches = receivablesContent.match(test.pattern);
  if (matches) {
    console.log(
      `❌ ${index + 1}. ${test.description} - Found: "${matches[0]}"`
    );
    allTestsPassed = false;
  } else {
    console.log(`✅ ${index + 1}. ${test.description}`);
  }
});

console.log('\n🔑 Testing translation keys exist...');
translationKeyTests.forEach((key, index) => {
  const englishExists =
    translationsContent.includes(`${key}: '`) ||
    translationsContent.includes(`${key}: "`);
  const bengaliExists =
    translationsContent.includes(`${key}: '`) ||
    translationsContent.includes(`${key}: "`);

  if (englishExists) {
    console.log(`✅ ${index + 1}. Translation key '${key}' exists`);
  } else {
    console.log(`❌ ${index + 1}. Translation key '${key}' missing`);
    allTestsPassed = false;
  }
});

console.log('\n🌐 Testing Bengali translations...');
const bengaliTranslations = {
  salesCashReceivables: 'বিক্রয় নগদ বাকি',
  cylinderReceivable: 'সিলিন্ডার বাকি',
  customerRecords: 'গ্রাহক রেকর্ড',
  statusBreakdown: 'স্ট্যাটাস বিভাজন',
  current: 'বর্তমান',
  dueSoon: 'শীঘ্রই দেয়',
  overdue: 'বকেয়া',
  paid: 'পরিশোধিত',
  cashReceivables: 'নগদ বাকি',
  cylinderReceivables: 'সিলিন্ডার বাকি',
  noCashReceivables: 'কোনো নগদ বাকি নেই',
  noCylinderReceivables: 'কোনো সিলিন্ডার বাকি নেই',
};

Object.entries(bengaliTranslations).forEach(([key, bengaliText], index) => {
  const exists = translationsContent.includes(`${key}: '${bengaliText}'`);
  if (exists) {
    console.log(
      `✅ ${index + 1}. Bengali translation for '${key}': ${bengaliText}`
    );
  } else {
    console.log(
      `❌ ${index + 1}. Bengali translation missing for '${key}': ${bengaliText}`
    );
    allTestsPassed = false;
  }
});

console.log('\n📊 Summary:');
if (allTestsPassed) {
  console.log('✅ All translation fixes have been applied successfully!');
  console.log(
    '🎉 The receivables page should now display properly translated text.'
  );
} else {
  console.log('❌ Some translation fixes are missing or incomplete.');
  console.log(
    '🔧 Please review the failed tests above and apply the necessary fixes.'
  );
}

console.log('\n🚀 Next steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Navigate to http://localhost:3000/dashboard/receivables');
console.log(
  '3. Verify that all text is properly translated based on language settings'
);
console.log(
  '4. Test language switching to ensure both English and Bengali work correctly'
);
