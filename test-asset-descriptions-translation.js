const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Asset Descriptions Translation...\n');

// Read the translations file
const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

// Read the assets page
const pagePath = path.join(__dirname, 'src/app/dashboard/assets/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

// Extract Bengali translations section
const bengaliMatch = translationsContent.match(
  /const bengaliTranslations: Translations = \{([\s\S]*?)\n\};/
);

if (!bengaliMatch) {
  console.error('❌ Could not find Bengali translations object');
  process.exit(1);
}

const bengaliContent = bengaliMatch[1];

// Asset description translation keys to test
const assetDescriptionTranslations = [
  'cashReceivablesAsset',
  'cashInHandAsset',
  'outstandingCashReceivablesFromDrivers',
  'availableCashCalculatedFromDeposits',
  'fullCylinders',
  'emptyCylinders',
];

console.log('🔍 Checking asset description translations:\n');

let allGood = true;

assetDescriptionTranslations.forEach((key) => {
  const keyRegex = new RegExp(`\\s+${key}:\\s+'([^']+)'`, 'g');
  const match = keyRegex.exec(bengaliContent);

  if (match) {
    const translation = match[1];
    console.log(`✅ ${key}: "${translation}"`);
  } else {
    console.log(`❌ ${key}: Not found in Bengali translations`);
    allGood = false;
  }
});

console.log('\n📄 Checking translation function implementation:\n');

// Check if translation functions exist
const translationFunctionChecks = [
  {
    search: 'translateAssetName',
    description: 'Asset name translation function',
  },
  {
    search: 'translateAssetDescription',
    description: 'Asset description translation function',
  },
  {
    search: "t('cashReceivablesAsset')",
    description: 'Cash Receivables translation call',
  },
  {
    search: "t('cashInHandAsset')",
    description: 'Cash in Hand translation call',
  },
  {
    search: "t('fullCylinders')",
    description: 'Full Cylinders translation call',
  },
  {
    search: "t('emptyCylinders')",
    description: 'Empty Cylinders translation call',
  },
  {
    search: 'translateAssetName(asset.name)',
    description: 'Asset name translation usage',
  },
  {
    search: 'translateAssetDescription(asset.description)',
    description: 'Asset description translation usage',
  },
];

let implementationGood = true;

translationFunctionChecks.forEach((check) => {
  if (pageContent.includes(check.search)) {
    console.log(`✅ ${check.description}: Found`);
  } else {
    console.log(`❌ ${check.description}: Missing`);
    implementationGood = false;
  }
});

console.log('\n🔍 Checking for remaining hardcoded asset descriptions:\n');

const hardcodedAssetPatterns = [
  'Cash Receivables',
  'Cash in Hand',
  'Outstanding cash receivables from drivers',
  'Available cash calculated from deposits minus expenses',
  'Full Cylinders -',
  'Empty Cylinders -',
];

let remainingHardcoded = [];

hardcodedAssetPatterns.forEach((pattern) => {
  // Look for hardcoded patterns that are NOT inside translation functions
  const regex = new RegExp(pattern, 'g');
  const matches = pageContent.match(regex);

  if (matches) {
    matches.forEach((match) => {
      // Check if it's inside a translation mapping (which is OK)
      const beforeMatch = pageContent.substring(0, pageContent.indexOf(match));
      const isInTranslationMapping =
        (beforeMatch.includes(
          'const translations: { [key: string]: string } = {'
        ) &&
          !beforeMatch.includes('};')) ||
        beforeMatch.lastIndexOf('const translations') >
          beforeMatch.lastIndexOf('};');

      if (!isInTranslationMapping) {
        remainingHardcoded.push(match);
      }
    });
  }
});

if (remainingHardcoded.length > 0) {
  console.log(
    `⚠️  Found ${remainingHardcoded.length} remaining hardcoded asset descriptions:`
  );
  remainingHardcoded.forEach((text) => {
    console.log(`   - ${text}`);
  });
} else {
  console.log(
    '✅ No hardcoded asset descriptions found outside translation mappings.'
  );
}

console.log('\n📊 Summary:');
if (allGood && implementationGood && remainingHardcoded.length === 0) {
  console.log('🎉 Perfect! All asset descriptions are properly translated!');
  console.log('✨ Asset names and descriptions will now display in Bengali.');
  console.log('🚀 Users will see localized asset information including:');
  console.log('   • Cash Receivables → নগদ প্রাপ্য');
  console.log('   • Cash in Hand → হাতে নগদ');
  console.log('   • Full Cylinders → পূর্ণ সিলিন্ডার');
  console.log('   • Empty Cylinders → খালি সিলিন্ডার');
  console.log('   • Asset descriptions in Bengali');
} else {
  console.log('⚠️  Some issues still need attention:');
  if (!allGood) {
    console.log('   • Some translation keys are missing');
  }
  if (!implementationGood) {
    console.log('   • Translation functions are not properly implemented');
  }
  if (remainingHardcoded.length > 0) {
    console.log('   • Some hardcoded asset descriptions remain');
  }
}

console.log('\n💡 Testing steps:');
console.log('1. Navigate to http://localhost:3000/dashboard/assets');
console.log('2. Switch language to Bengali');
console.log('3. Verify asset names display in Bengali:');
console.log('   • "Cash Receivables" should show as "নগদ প্রাপ্য"');
console.log('   • "Cash in Hand" should show as "হাতে নগদ"');
console.log(
  '   • "Full Cylinders - AYGAZ 35L" should show as "পূর্ণ সিলিন্ডার - AYGAZ 35L"'
);
console.log(
  '   • "Empty Cylinders - 12L" should show as "খালি সিলিন্ডার - 12L"'
);
console.log('4. Verify asset descriptions display in Bengali');
console.log('5. Check that all auto-calculated assets show Bengali text');
