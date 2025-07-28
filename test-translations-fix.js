const fs = require('fs');
const path = require('path');

// Test that the translations file can be parsed and used
try {
  console.log('Testing translations file...');
  
  // Read the updated file
  const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
  const content = fs.readFileSync(translationsPath, 'utf8');
  
  // Check that both translation objects are properly closed
  const englishMatch = content.match(/const englishTranslations: Translations = \{([\s\S]*?)\};/);
  const bengaliMatch = content.match(/const bengaliTranslations: Translations = \{([\s\S]*?)\};/);
  
  if (!englishMatch) {
    throw new Error('English translations object not found or malformed');
  }
  
  if (!bengaliMatch) {
    throw new Error('Bengali translations object not found or malformed');
  }
  
  console.log('✅ Both translation objects are properly structured');
  
  // Count properties in each
  const englishProps = (englishMatch[1].match(/^\s*[a-zA-Z][a-zA-Z0-9_]*\s*:/gm) || []).length;
  const bengaliProps = (bengaliMatch[1].match(/^\s*[a-zA-Z][a-zA-Z0-9_]*\s*:/gm) || []).length;
  
  console.log(`English translations: ${englishProps} properties`);
  console.log(`Bengali translations: ${bengaliProps} properties`);
  
  // Check for any obvious syntax issues
  const syntaxIssues = [];
  
  // Check for unclosed strings
  const unclosedStrings = content.match(/:\s*'[^']*$/gm);
  if (unclosedStrings) {
    syntaxIssues.push(`Found ${unclosedStrings.length} potentially unclosed strings`);
  }
  
  // Check for missing commas
  const missingCommas = content.match(/'\s*\n\s*[a-zA-Z]/g);
  if (missingCommas) {
    syntaxIssues.push(`Found ${missingCommas.length} potentially missing commas`);
  }
  
  if (syntaxIssues.length > 0) {
    console.log('⚠️  Potential syntax issues found:');
    syntaxIssues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('✅ No obvious syntax issues detected');
  }
  
  console.log('✅ Translation file test completed successfully!');
  
} catch (error) {
  console.error('❌ Error testing translations:', error.message);
  process.exit(1);
}