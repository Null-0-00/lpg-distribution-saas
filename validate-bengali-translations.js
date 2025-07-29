const fs = require('fs');
const path = require('path');

try {
  console.log('Validating Bengali translations...');

  // Read the translations file
  const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
  const content = fs.readFileSync(translationsPath, 'utf8');

  // Check for remaining placeholders
  const remainingPlaceholders = content.match(/\w+_bn/g);
  if (remainingPlaceholders) {
    console.log(
      `⚠️  Found ${remainingPlaceholders.length} remaining placeholders:`
    );
    remainingPlaceholders.slice(0, 10).forEach((placeholder) => {
      console.log(`  - ${placeholder}`);
    });
    if (remainingPlaceholders.length > 10) {
      console.log(`  ... and ${remainingPlaceholders.length - 10} more`);
    }
  } else {
    console.log('✅ No remaining placeholders found!');
  }

  // Check for TODO comments
  const todoComments = content.match(/\/\/\s*TODO:\s*Add Bengali translation/g);
  if (todoComments) {
    console.log(`⚠️  Found ${todoComments.length} remaining TODO comments`);
  } else {
    console.log('✅ No remaining TODO comments found!');
  }

  // Extract both translation objects
  const englishMatch = content.match(
    /const englishTranslations: Translations = \{([\s\S]*?)\};/
  );
  const bengaliMatch = content.match(
    /const bengaliTranslations: Translations = \{([\s\S]*?)\};/
  );

  if (!englishMatch || !bengaliMatch) {
    throw new Error('Could not find translation objects');
  }

  // Count properties
  const englishProps = (
    englishMatch[1].match(/^\s*[a-zA-Z][a-zA-Z0-9_]*\s*:/gm) || []
  ).length;
  const bengaliProps = (
    bengaliMatch[1].match(/^\s*[a-zA-Z][a-zA-Z0-9_]*\s*:/gm) || []
  ).length;

  console.log(`\n📊 Translation Statistics:`);
  console.log(`  English properties: ${englishProps}`);
  console.log(`  Bengali properties: ${bengaliProps}`);
  console.log(
    `  Property count match: ${englishProps === bengaliProps ? '✅' : '❌'}`
  );

  // Check for common translation patterns
  const bengaliContent = bengaliMatch[1];

  // Count different types of translations
  const bengaliScriptCount = (bengaliContent.match(/[\u0980-\u09FF]/g) || [])
    .length;
  const englishInBengaliCount = (bengaliContent.match(/[a-zA-Z]/g) || [])
    .length;

  console.log(`\n🔤 Character Analysis:`);
  console.log(`  Bengali script characters: ${bengaliScriptCount}`);
  console.log(`  English characters in Bengali: ${englishInBengaliCount}`);
  console.log(
    `  Bengali script ratio: ${Math.round((bengaliScriptCount / (bengaliScriptCount + englishInBengaliCount)) * 100)}%`
  );

  // Check for specific translation quality indicators
  const needsTranslationCount = (
    bengaliContent.match(/বাংলা অনুবাদ প্রয়োজন/g) || []
  ).length;
  const loadingTranslations = (bengaliContent.match(/লোড হচ্ছে/g) || []).length;
  const errorTranslations = (bengaliContent.match(/ত্রুটি/g) || []).length;
  const successTranslations = (bengaliContent.match(/সফল/g) || []).length;

  console.log(`\n🎯 Translation Quality Indicators:`);
  console.log(`  "Needs translation" markers: ${needsTranslationCount}`);
  console.log(`  Loading translations: ${loadingTranslations}`);
  console.log(`  Error translations: ${errorTranslations}`);
  console.log(`  Success translations: ${successTranslations}`);

  // Sample some translations for manual review
  console.log(`\n📝 Sample Translations (first 10):`);
  const sampleMatches = bengaliContent.match(
    /^\s*([a-zA-Z][a-zA-Z0-9_]*)\s*:\s*'([^']*)',?/gm
  );
  if (sampleMatches) {
    sampleMatches.slice(0, 10).forEach((match) => {
      const [, property, value] = match.match(
        /^\s*([a-zA-Z][a-zA-Z0-9_]*)\s*:\s*'([^']*)',?/
      );
      console.log(`  ${property}: "${value}"`);
    });
  }

  // Overall assessment
  console.log(`\n🎉 Overall Assessment:`);
  if (remainingPlaceholders && remainingPlaceholders.length > 0) {
    console.log(
      `❌ Translation incomplete - ${remainingPlaceholders.length} placeholders remaining`
    );
  } else if (needsTranslationCount > 50) {
    console.log(
      `⚠️  Translation needs improvement - many "needs translation" markers found`
    );
  } else if (bengaliScriptCount < englishInBengaliCount) {
    console.log(
      `⚠️  Translation quality could be improved - more English than Bengali characters`
    );
  } else {
    console.log(`✅ Translation appears to be complete and of good quality!`);
  }

  console.log('\n✅ Bengali translation validation completed!');
} catch (error) {
  console.error('❌ Error validating Bengali translations:', error.message);
  process.exit(1);
}
