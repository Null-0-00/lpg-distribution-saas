const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Product Management translations...\n');

// Read the translations file
const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

// Read the product management page
const pagePath = path.join(
  __dirname,
  'src/app/dashboard/product-management/page.tsx'
);
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

// Key product management translations to test
const keyProductManagementTranslations = [
  'addCompany',
  'addProduct',
  'searchCompanies',
  'searchProducts',
  'totalProducts',
  'activeProducts',
  'lowStock',
  'totalStock',
  'productName',
  'cylinderSize',
  'currentPrice',
  'currentStock',
  'lowStockAlert',
  'created',
  'actions',
  'active',
  'inactive',
  'editCompany',
  'deleteCompany',
  'editProduct',
  'deleteProduct',
  'cylinderSizes',
  'full',
  'empty',
  'loading',
  'units',
  'areYouSureDeleteCompany',
  'areYouSureDeleteProduct',
  'failedToSaveCompany',
  'failedToSaveProduct',
];

console.log('🔍 Checking key product management translations:\n');

let allGood = true;

keyProductManagementTranslations.forEach((key) => {
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
    search: 'placeholder="Search companies..."',
    shouldNotExist: true,
    description: 'Search companies placeholder',
  },
  {
    search: 'placeholder="Search products..."',
    shouldNotExist: true,
    description: 'Search products placeholder',
  },
  {
    search: '<span>Add Company</span>',
    shouldNotExist: true,
    description: 'Add Company button',
  },
  {
    search: '<span>Add Product</span>',
    shouldNotExist: true,
    description: 'Add Product button',
  },
  {
    search: 'Product Name',
    shouldNotExist: true,
    description: 'Product Name header',
  },
  {
    search: 'Current Price',
    shouldNotExist: true,
    description: 'Current Price header',
  },
  { search: 'Loading...', shouldNotExist: true, description: 'Loading text' },
  {
    search: 't("addCompany")',
    shouldExist: true,
    description: 'Add Company translation call',
  },
  {
    search: 't("addProduct")',
    shouldExist: true,
    description: 'Add Product translation call',
  },
  {
    search: 't("productName")',
    shouldExist: true,
    description: 'Product Name translation call',
  },
  {
    search: 't("loading")',
    shouldExist: true,
    description: 'Loading translation call',
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
  console.log('🎉 All product management translations are properly set!');
  console.log(
    '✨ The product management page should now display correctly in Bengali.'
  );
  console.log(
    '🚀 Users can now manage companies, products, and cylinder sizes in Bengali.'
  );
} else {
  if (!allGood) {
    console.log(
      '⚠️  Some product management translations still need attention.'
    );
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
  /placeholder="[^"]*"/g,
  /<span>[A-Z][^<]*<\/span>/g,
  /title="[A-Z][^"]*"/g,
  /'[A-Z][^']*\?'/g, // Confirmation messages
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
console.log('1. Test the product management page in the browser');
console.log(
  '2. Switch language to Bengali and verify all text displays correctly'
);
console.log(
  '3. Test all functionality (add, edit, delete) with Bengali interface'
);
console.log('4. Check that error messages and confirmations appear in Bengali');
