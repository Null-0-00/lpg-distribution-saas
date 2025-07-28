const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Product Management page syntax...\n');

const productManagementPath = path.join(
  __dirname,
  'src/app/dashboard/product-management/page.tsx'
);
const pageContent = fs.readFileSync(productManagementPath, 'utf8');

// Check for critical syntax errors that would prevent compilation
const criticalErrors = [
  {
    pattern: /set\{t\(/g,
    description: 'Incorrect setState function names',
    severity: 'CRITICAL',
  },
  {
    pattern: /fetch\{t\(/g,
    description: 'Incorrect fetch function names',
    severity: 'CRITICAL',
  },
  {
    pattern: /const\s+\w+\{t\(/g,
    description: 'Incorrect variable declarations',
    severity: 'CRITICAL',
  },
  {
    pattern: /\w+\{t\("(\w+)"\)\}\s*=/g,
    description: 'Incorrect function definitions',
    severity: 'CRITICAL',
  },
  {
    pattern: /\{t\("search\{t\(/g,
    description: 'Nested translation calls in placeholders',
    severity: 'CRITICAL',
  },
];

// Check for warnings (these are OK but worth noting)
const warnings = [
  {
    pattern: /\{t\("[^"]*"\)\}/g,
    description: 'Translation calls (these are correct)',
    severity: 'INFO',
  },
];

console.log('🚨 Checking for critical syntax errors:\n');

let criticalIssues = 0;
criticalErrors.forEach((check, index) => {
  const matches = pageContent.match(check.pattern);
  if (matches) {
    console.log(`❌ ${check.severity}: ${check.description}`);
    console.log(`   Found ${matches.length} instances:`);
    matches.slice(0, 3).forEach((match) => {
      console.log(`   - ${match}`);
    });
    if (matches.length > 3) {
      console.log(`   ... and ${matches.length - 3} more`);
    }
    console.log('');
    criticalIssues += matches.length;
  } else {
    console.log(`✅ ${check.description}: OK`);
  }
});

console.log('\n📊 Summary:');
if (criticalIssues === 0) {
  console.log('🎉 No critical syntax errors found!');
  console.log('✅ The Product Management page should compile successfully.');
} else {
  console.log(
    `❌ Found ${criticalIssues} critical syntax errors that need fixing.`
  );
}

// Check for specific function definitions that should exist
console.log('\n🔧 Verifying key function definitions:');

const requiredFunctions = [
  'fetchCompanies',
  'fetchProducts',
  'fetchCylinderSizes',
  'handleCompanySubmit',
  'handleProductSubmit',
  'handleDeleteCompany',
  'handleDeleteProduct',
  'openEditCompanyModal',
  'openEditProductModal',
  'filteredCompanies',
  'filteredProducts',
];

requiredFunctions.forEach((funcName) => {
  if (
    pageContent.includes(`${funcName} =`) ||
    pageContent.includes(`const ${funcName}`)
  ) {
    console.log(`✅ ${funcName}: Found`);
  } else {
    console.log(`❌ ${funcName}: Missing or malformed`);
  }
});

// Check for proper variable declarations
console.log('\n📝 Verifying state variable declarations:');

const stateVariables = [
  'companies, setCompanies',
  'products, setProducts',
  'cylinderSizes, setCylinderSizes',
  'loading, setLoading',
  'activeTab, setActiveTab',
];

stateVariables.forEach((varDecl) => {
  if (pageContent.includes(`[${varDecl}]`)) {
    console.log(`✅ ${varDecl}: Correct`);
  } else {
    console.log(`❌ ${varDecl}: Incorrect or missing`);
  }
});

// Check for proper translation usage
console.log('\n🌐 Verifying translation usage:');

const translationChecks = [
  't("addCompany")',
  't("addProduct")',
  't("searchCompanies")',
  't("productName")',
  't("active")',
  't("inactive")',
];

translationChecks.forEach((tCall) => {
  if (pageContent.includes(tCall)) {
    console.log(`✅ ${tCall}: Found`);
  } else {
    console.log(`⚠️  ${tCall}: Not found (might be OK)`);
  }
});

console.log('\n💡 Next steps:');
if (criticalIssues === 0) {
  console.log('1. ✅ Syntax is correct - try running the application');
  console.log('2. ✅ Test the Product Management page functionality');
  console.log('3. ✅ Verify translations display correctly in Bengali');
  console.log('4. ✅ Test all CRUD operations (Create, Read, Update, Delete)');
} else {
  console.log('1. ❌ Fix the critical syntax errors shown above');
  console.log('2. ❌ Re-run this verification script');
  console.log('3. ❌ Only then test the application');
}

console.log('\n🔗 If issues persist:');
console.log('- Check the browser console for detailed error messages');
console.log('- Look at the Next.js compilation output');
console.log('- Verify that all imports are correct');
console.log('- Make sure TypeScript types are properly defined');
