const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Assets page translations...\n');

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

// Key assets translations to test
const keyAssetsTranslations = [
  'assetsAndLiabilities',
  'companyAssets',
  'companyLiabilities',
  'addAssetsLiabilities',
  'refresh',
  'success',
  'error',
  'netWorth',
  'depreciation',
  'assetName',
  'category',
  'quantity',
  'unitValue',
  'totalValue',
  'netValue',
  'actions',
  'liability',
  'amount',
  'dueDate',
  'status',
  'fixedAsset',
  'currentAsset',
  'currentLiability',
  'longTermLiability',
  'editAsset',
  'deleteAsset',
  'editLiability',
  'deleteLiability',
  'assetDeletedSuccessfully',
  'liabilityDeletedSuccessfully',
  'areYouSureDeleteAsset',
  'areYouSureDeleteLiability',
  'noAssetsFound',
  'noLiabilitiesFound',
];

console.log('🔍 Checking key assets translations:\n');

let allGood = true;

keyAssetsTranslations.forEach((key) => {
  // Look for the key in Bengali translations
  const keyRegex = new RegExp(`\\s+${key}:\\s+'([^']+)'`, 'g');
  const match = keyRegex.exec(bengaliContent);

  if (match) {
    const translation = match[1];

    // Check if it's still a placeholder (same as key name)
    if (translation === key) {
      console.log(`❌ ${key}: Still has placeholder value`);
      allGood = false;
    } else if (translation.includes('TODO')) {
      console.log(`❌ ${key}: Still has TODO comment`);
      allGood = false;
    } else {
      console.log(`✅ ${key}: "${translation}"`);
    }
  } else {
    console.log(`❌ ${key}: Not found in Bengali translations`);
    allGood = false;
  }
});

console.log('\n📄 Checking page component for proper translation usage:\n');

// Check if hardcoded strings have been replaced
const hardcodedChecks = [
  {
    search: "title: 'Success',",
    shouldNotExist: true,
    description: 'Success toast title',
  },
  {
    search: "title: 'Error',",
    shouldNotExist: true,
    description: 'Error toast title',
  },
  {
    search: "'Assets and Liabilities'",
    shouldNotExist: true,
    description: 'Page title',
  },
  {
    search: "'Company Assets'",
    shouldNotExist: true,
    description: 'Assets table title',
  },
  {
    search: "'Asset deleted successfully!'",
    shouldNotExist: true,
    description: 'Delete success message',
  },
  {
    search: "'Are you sure you want to delete this asset?'",
    shouldNotExist: true,
    description: 'Delete confirmation',
  },
  {
    search: "t('success')",
    shouldExist: true,
    description: 'Success translation call',
  },
  {
    search: "t('error')",
    shouldExist: true,
    description: 'Error translation call',
  },
  {
    search: "t('assetsAndLiabilities')",
    shouldExist: true,
    description: 'Page title translation call',
  },
  {
    search: "t('assetDeletedSuccessfully')",
    shouldExist: true,
    description: 'Delete success translation call',
  },
];

let pageChecksGood = true;

hardcodedChecks.forEach((check) => {
  const exists = pageContent.includes(check.search);

  if (check.shouldExist && exists) {
    console.log(`✅ ${check.description}: Translation call found`);
  } else if (check.shouldNotExist && !exists) {
    console.log(`✅ ${check.description}: Hardcoded text removed`);
  } else if (check.shouldExist && !exists) {
    console.log(`❌ ${check.description}: Translation call missing`);
    pageChecksGood = false;
  } else if (check.shouldNotExist && exists) {
    console.log(`❌ ${check.description}: Hardcoded text still present`);
    pageChecksGood = false;
  }
});

console.log('\n📊 Summary:');
if (allGood && pageChecksGood) {
  console.log('🎉 All assets translations are properly set!');
  console.log('✨ The assets page should now display correctly in Bengali.');
  console.log(
    '🚀 Users can now manage assets and liabilities with a fully localized interface.'
  );
} else {
  if (!allGood) {
    console.log('⚠️  Some assets translations still need attention.');
  }
  if (!pageChecksGood) {
    console.log(
      '⚠️  Some hardcoded text in the page component needs to be replaced.'
    );
  }
}

// Check for any remaining hardcoded English text patterns
console.log('\n🔍 Checking for remaining hardcoded patterns...');
const hardcodedPatterns = [
  /'[A-Z][^']*successfully'/g,
  /'[A-Z][^']*failed'/g,
  /'Are you sure[^']*'/g,
  /title:\s*'[A-Z][^']*'/g,
  /description:\s*'[A-Z][^']*'/g,
];

let remainingHardcoded = [];
hardcodedPatterns.forEach((pattern, index) => {
  const matches = pageContent.match(pattern);
  if (matches) {
    matches.forEach((match) => {
      // Skip if it's already a translation call
      if (!match.includes('t(') && !match.includes('{t(')) {
        remainingHardcoded.push(match);
      }
    });
  }
});

if (remainingHardcoded.length > 0) {
  console.log(
    `⚠️  Found ${remainingHardcoded.length} potential hardcoded strings:`
  );
  remainingHardcoded.slice(0, 10).forEach((text) => {
    console.log(`   - ${text}`);
  });
  if (remainingHardcoded.length > 10) {
    console.log(`   ... and ${remainingHardcoded.length - 10} more`);
  }
} else {
  console.log('✅ No obvious hardcoded patterns found.');
}

console.log('\n💡 Next steps:');
console.log('1. Test the assets page in the browser');
console.log(
  '2. Switch language to Bengali and verify all text displays correctly'
);
console.log(
  '3. Test all functionality (add, edit, delete assets/liabilities) with Bengali interface'
);
console.log('4. Check that error messages and confirmations appear in Bengali');
console.log(
  '5. Verify that table headers and status indicators display properly in Bengali'
);
