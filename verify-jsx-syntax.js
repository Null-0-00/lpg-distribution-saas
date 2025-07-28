const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying JSX syntax in Product Management page...\n');

const productManagementPath = path.join(
  __dirname,
  'src/app/dashboard/product-management/page.tsx'
);
const pageContent = fs.readFileSync(productManagementPath, 'utf8');

// Check for common JSX syntax errors
const jsxErrors = [
  {
    pattern: /title="[^"]*\{[^}]*\}[^"]*"/g,
    description:
      'JSX expressions inside string literals (should use template literals)',
    severity: 'CRITICAL',
  },
  {
    pattern: /className="[^"]*\{[^}]*\}[^"]*"/g,
    description: 'JSX expressions inside className string literals',
    severity: 'CRITICAL',
  },
  {
    pattern: /placeholder="[^"]*\{[^}]*\}[^"]*"/g,
    description: 'JSX expressions inside placeholder string literals',
    severity: 'CRITICAL',
  },
  {
    pattern: /\{[^}]*"[^"]*\{[^}]*\}[^"]*"[^}]*\}/g,
    description: 'Nested JSX expressions',
    severity: 'WARNING',
  },
];

console.log('🚨 Checking for JSX syntax errors:\n');

let criticalIssues = 0;
jsxErrors.forEach((check, index) => {
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
    if (check.severity === 'CRITICAL') {
      criticalIssues += matches.length;
    }
  } else {
    console.log(`✅ ${check.description}: OK`);
  }
});

// Check for proper JSX structure
console.log('\n🔧 Verifying JSX structure:');

const structureChecks = [
  {
    pattern: /return\s*\(/,
    description: 'Function has return statement',
    shouldExist: true,
  },
  {
    pattern: /<div className="bg-background/,
    description: 'Main container div exists',
    shouldExist: true,
  },
  {
    pattern: /\{\s*\/\*.*\*\/\s*\}/,
    description: 'JSX comments are properly formatted',
    shouldExist: true,
  },
  {
    pattern: /\{t\('[^']*'\)\}/,
    description: 'Translation calls are properly formatted',
    shouldExist: true,
  },
];

structureChecks.forEach((check) => {
  const matches = pageContent.match(check.pattern);
  const exists = matches && matches.length > 0;

  if (check.shouldExist && exists) {
    console.log(`✅ ${check.description}: Found`);
  } else if (!check.shouldExist && !exists) {
    console.log(`✅ ${check.description}: Not found (good)`);
  } else if (check.shouldExist && !exists) {
    console.log(`❌ ${check.description}: Missing`);
    criticalIssues++;
  } else {
    console.log(`⚠️  ${check.description}: Found (might be issue)`);
  }
});

// Check for balanced braces and parentheses
console.log('\n🔍 Checking brace/parenthesis balance:');

const openBraces = (pageContent.match(/\{/g) || []).length;
const closeBraces = (pageContent.match(/\}/g) || []).length;
const openParens = (pageContent.match(/\(/g) || []).length;
const closeParens = (pageContent.match(/\)/g) || []).length;

console.log(`Braces: ${openBraces} open, ${closeBraces} close`);
console.log(`Parentheses: ${openParens} open, ${closeParens} close`);

if (openBraces === closeBraces) {
  console.log('✅ Braces are balanced');
} else {
  console.log('❌ Braces are NOT balanced');
  criticalIssues++;
}

if (openParens === closeParens) {
  console.log('✅ Parentheses are balanced');
} else {
  console.log('❌ Parentheses are NOT balanced');
  criticalIssues++;
}

console.log('\n📊 Summary:');
if (criticalIssues === 0) {
  console.log('🎉 No critical JSX syntax errors found!');
  console.log('✅ The Product Management page should compile successfully.');
} else {
  console.log(
    `❌ Found ${criticalIssues} critical JSX syntax errors that need fixing.`
  );
}

console.log('\n💡 Next steps:');
if (criticalIssues === 0) {
  console.log('1. ✅ JSX syntax is correct - try running the application');
  console.log('2. ✅ Test the Product Management page functionality');
  console.log('3. ✅ Verify translations display correctly');
} else {
  console.log('1. ❌ Fix the critical JSX syntax errors shown above');
  console.log('2. ❌ Re-run this verification script');
  console.log('3. ❌ Only then test the application');
}
