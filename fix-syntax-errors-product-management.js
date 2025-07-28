const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing syntax errors in Product Management page...');

const productManagementPath = path.join(
  __dirname,
  'src/app/dashboard/product-management/page.tsx'
);

console.log('📖 Reading Product Management page...');
let pageContent = fs.readFileSync(productManagementPath, 'utf8');

// Fix all the incorrect replacements that broke the syntax
const fixes = [
  // Fix variable names and function calls
  ['current{t("price")}', 'currentPrice'],
  ['cylinder{t("size")}', 'cylinderSize'],
  ['filtered{t("companies")}', 'filteredCompanies'],

  // Fix placeholder strings that got incorrectly nested
  [
    'placeholder={t("search{t("companies")}")}',
    'placeholder={t("searchCompanies")}',
  ],

  // Fix comments that got translated
  ['/* {t("companies")} Tab */', '/* Companies Tab */'],
  ['/* {t("companies")} Header */', '/* Companies Header */'],
  ['/* {t("companies")} Grid */', '/* Companies Grid */'],

  // Fix any other nested translation calls
  ['{t("code")}:', 'Code:'],
  ['{t("products")}:', 'Products:'],

  // Fix any remaining function parameter issues
  [
    'openEditCylinderSizeModal = (cylinder{t("size")}: CylinderSize)',
    'openEditCylinderSizeModal = (cylinderSize: CylinderSize)',
  ],
];

console.log('🔨 Applying fixes...');
let fixCount = 0;

fixes.forEach(([search, replace]) => {
  if (pageContent.includes(search)) {
    pageContent = pageContent.replace(
      new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      replace
    );
    console.log(`✅ Fixed: ${search} → ${replace}`);
    fixCount++;
  }
});

// Additional specific fixes for complex patterns
console.log('🔧 Applying additional pattern fixes...');

// Fix any remaining nested t() calls in object properties
pageContent = pageContent.replace(/(\w+)\{t\("(\w+)"\)\}/g, '$1$2');

// Fix any remaining nested t() calls in function names
pageContent = pageContent.replace(
  /(\w+)\{t\("(\w+)"\)\}(\s*=|\s*\()/g,
  '$1$2$3'
);

// Fix any remaining nested t() calls in variable declarations
pageContent = pageContent.replace(
  /const\s+(\w+)\{t\("(\w+)"\)\}/g,
  'const $1$2'
);

// Fix any remaining nested t() calls in comments
pageContent = pageContent.replace(
  /\/\*\s*\{t\("([^"]+)"\)\}\s*\*\//g,
  '/* $1 */'
);

console.log('💾 Writing fixed file...');
fs.writeFileSync(productManagementPath, pageContent);

console.log(`\n🎉 Fixed ${fixCount} syntax errors!`);
console.log('✨ The Product Management page should now compile correctly.');

// Verify the fix by checking for common syntax error patterns
console.log('\n🔍 Verifying fixes...');
const errorPatterns = [
  /\{t\("[^"]*"\)\}/g, // Nested translation calls
  /\w+\{t\(/g, // Function names with translation calls
  /const\s+\w+\{t\(/g, // Variable declarations with translation calls
];

let remainingErrors = 0;
errorPatterns.forEach((pattern, index) => {
  const matches = pageContent.match(pattern);
  if (matches) {
    console.log(
      `⚠️  Pattern ${index + 1}: Found ${matches.length} potential issues`
    );
    matches.slice(0, 3).forEach((match) => console.log(`   - ${match}`));
    remainingErrors += matches.length;
  }
});

if (remainingErrors === 0) {
  console.log('✅ No obvious syntax error patterns found.');
} else {
  console.log(`⚠️  Found ${remainingErrors} potential remaining issues.`);
}

console.log('\n💡 Next steps:');
console.log('1. Check if the application compiles without errors');
console.log('2. Test the Product Management page functionality');
console.log('3. Verify that translations still work correctly');
console.log('4. Run the application to ensure no runtime errors');
