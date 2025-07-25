/**
 * Integration test for enhanced translation system
 * Run this to verify the system works correctly
 */

import {
  getTranslation,
  getTranslationErrors,
  getTranslationErrorStats,
  clearTranslationErrors,
  checkTranslationConsistency,
  generateMissingTranslationKeys,
  TranslationErrorType,
} from './translations';

export function testEnhancedTranslationSystem() {
  console.log('🧪 Testing Enhanced Translation System...\n');

  // Clear any existing errors
  clearTranslationErrors();

  // Test 1: Valid translations
  console.log('✅ Test 1: Valid translations');
  const validEn = getTranslation('en', 'dashboard', 'TestComponent');
  const validBn = getTranslation('bn', 'dashboard', 'TestComponent');
  console.log(`English: ${validEn}`);
  console.log(`Bengali: ${validBn}\n`);

  // Test 2: Missing translation (should fallback)
  console.log('⚠️  Test 2: Missing translation key');
  const missing = getTranslation(
    'bn',
    'nonExistentKey' as any,
    'TestComponent'
  );
  console.log(`Missing key result: ${missing}\n`);

  // Test 3: Invalid language (should fallback)
  console.log('⚠️  Test 3: Invalid language');
  const invalidLang = getTranslation(
    'invalid-lang',
    'dashboard',
    'TestComponent'
  );
  console.log(`Invalid language result: ${invalidLang}\n`);

  // Test 4: Check error logging
  console.log('📊 Test 4: Error logging');
  const errors = getTranslationErrors();
  const errorStats = getTranslationErrorStats();
  console.log(`Total errors logged: ${errors.length}`);
  console.log('Error statistics:', errorStats);
  console.log('\n');

  // Test 5: Translation consistency check
  console.log('🔍 Test 5: Translation consistency');
  const consistencyReport = checkTranslationConsistency();
  console.log(`Total keys: ${consistencyReport.totalKeys}`);
  console.log(`Consistent keys: ${consistencyReport.consistentKeys}`);
  console.log(
    `Inconsistent keys: ${consistencyReport.inconsistentKeys.length}`
  );

  // Show missing keys for Bengali
  const missingInBengali = consistencyReport.missingInLanguages['bn'] || [];
  console.log(`Missing in Bengali: ${missingInBengali.length} keys`);
  if (missingInBengali.length > 0) {
    console.log(
      `First 5 missing keys: ${missingInBengali.slice(0, 5).join(', ')}`
    );
  }
  console.log('\n');

  // Test 6: Generate missing keys
  console.log('🔧 Test 6: Generate missing keys');
  const missingKeys = generateMissingTranslationKeys('bn');
  console.log(`Total missing keys in Bengali: ${missingKeys.length}`);
  if (missingKeys.length > 0) {
    console.log(`Sample missing keys: ${missingKeys.slice(0, 3).join(', ')}`);
  }
  console.log('\n');

  // Test 7: Error handling for edge cases
  console.log('🛡️  Test 7: Edge case handling');
  const emptyKey = getTranslation('en', '' as any, 'TestComponent');
  const nullKey = getTranslation('en', null as any, 'TestComponent');
  const undefinedKey = getTranslation('en', undefined as any, 'TestComponent');
  console.log(`Empty key: ${emptyKey}`);
  console.log(`Null key: ${nullKey}`);
  console.log(`Undefined key: ${undefinedKey}\n`);

  // Final error count
  const finalErrors = getTranslationErrors();
  const finalStats = getTranslationErrorStats();
  console.log('📈 Final Results:');
  console.log(`Total errors generated: ${finalErrors.length}`);
  console.log('Final error breakdown:', finalStats);

  // Show recent errors
  if (finalErrors.length > 0) {
    console.log('\n🔍 Recent errors:');
    finalErrors.slice(-3).forEach((error, index) => {
      console.log(
        `${index + 1}. ${error.type}: "${error.key}" in ${error.locale} -> "${error.fallbackUsed}"`
      );
    });
  }

  console.log('\n✅ Enhanced Translation System Test Complete!');

  return {
    totalErrors: finalErrors.length,
    errorStats: finalStats,
    consistencyReport,
    missingKeys: missingKeys.length,
  };
}

// Export for use in components or other tests
export default testEnhancedTranslationSystem;
