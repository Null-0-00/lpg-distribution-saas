#!/usr/bin/env node

/**
 * Enhanced Translation Validation Script
 * Uses the new validation system from translation-validator.ts
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Read and compile the TypeScript file
const translationsPath = path.join(__dirname, 'translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

// Compile TypeScript to JavaScript
const compiled = ts.transpile(translationsContent, {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2018,
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
});

// Write temporary compiled file
const tempPath = path.join(__dirname, 'translations.temp.js');
fs.writeFileSync(tempPath, compiled);

try {
  // Import the compiled module
  const translations = require('./translations.temp.js');

  console.log('=== Enhanced Translation Validation Report ===\n');

  // Get translation statistics
  const stats = translations.getTranslationStats();
  console.log('📊 Translation Statistics:');
  Object.entries(stats).forEach(([lang, data]) => {
    console.log(`  ${lang}:`);
    console.log(`    Complete: ${data.isComplete ? '✅' : '❌'}`);
    console.log(`    Total Keys: ${data.totalKeys}`);
    console.log(`    Translated: ${data.translatedKeys}`);
    console.log(`    Completion: ${data.completionPercentage}%`);
    if (data.missingKeys.length > 0) {
      console.log(`    Missing: ${data.missingKeys.length} keys`);
    }
  });

  console.log('\n🔍 Consistency Report:');
  const consistency = translations.checkTranslationConsistency();
  console.log(`  Total Keys: ${consistency.totalKeys}`);
  console.log(`  Consistent Keys: ${consistency.consistentKeys}`);
  console.log(`  Inconsistent Keys: ${consistency.inconsistentKeys.length}`);

  if (consistency.inconsistentKeys.length > 0) {
    console.log('  Inconsistent Keys:');
    consistency.inconsistentKeys.slice(0, 10).forEach((key) => {
      console.log(`    - ${key}`);
    });
    if (consistency.inconsistentKeys.length > 10) {
      console.log(
        `    ... and ${consistency.inconsistentKeys.length - 10} more`
      );
    }
  }

  // Check for empty translations
  Object.entries(consistency.emptyTranslations).forEach(([lang, keys]) => {
    if (keys.length > 0) {
      console.log(`\n  ⚠️  Empty translations in ${lang}: ${keys.length} keys`);
    }
  });

  // Check for missing translations
  Object.entries(consistency.missingInLanguages).forEach(([lang, keys]) => {
    if (keys.length > 0) {
      console.log(
        `\n  ❌ Missing translations in ${lang}: ${keys.length} keys`
      );
    }
  });

  // Detailed validation for each language
  console.log('\n📋 Detailed Validation:');
  Object.keys(stats).forEach((lang) => {
    const validation = translations.validateTranslationCompleteness(lang);
    console.log(`\n  ${lang.toUpperCase()}:`);
    console.log(
      `    Status: ${validation.isComplete ? '✅ Complete' : '❌ Incomplete'}`
    );
    console.log(`    Progress: ${validation.completionPercentage}%`);

    if (validation.missingKeys.length > 0) {
      console.log(`    Missing Keys (${validation.missingKeys.length}):`);
      validation.missingKeys.slice(0, 5).forEach((key) => {
        console.log(`      - ${key}`);
      });
      if (validation.missingKeys.length > 5) {
        console.log(`      ... and ${validation.missingKeys.length - 5} more`);
      }
    }
  });

  // Summary
  console.log('\n=== SUMMARY ===');
  const totalLanguages = Object.keys(stats).length;
  const completeLanguages = Object.values(stats).filter(
    (s) => s.isComplete
  ).length;
  console.log(`Total Languages: ${totalLanguages}`);
  console.log(`Complete Languages: ${completeLanguages}`);
  console.log(
    `Overall Quality: ${((completeLanguages / totalLanguages) * 100).toFixed(1)}%`
  );
} catch (error) {
  console.error('Error validating translations:', error.message);
} finally {
  // Clean up temporary file
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }
}
