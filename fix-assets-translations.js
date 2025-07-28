const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Assets page translations...');

// First, let's add the missing translation keys to the translations file
const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
const assetsPath = path.join(__dirname, 'src/app/dashboard/assets/page.tsx');

// New translation keys needed for assets page
const newTranslationKeys = {
  // Page title and navigation
  assetsAndLiabilities: 'Assets and Liabilities',
  manageCompanyAssets: 'Manage company assets and financial obligations',
  companyAssets: 'Company Assets',
  companyLiabilities: 'Company Liabilities',

  // Action buttons and labels
  refresh: 'Refresh',
  addAssetsLiabilities: 'Add Assets/Liabilities',

  // Status labels
  success: 'Success',
  error: 'Error',

  // Summary stats
  netWorth: 'Net Worth',
  depreciation: 'Depreciation',

  // Table headers
  assetName: 'Asset Name',
  category: 'Category',
  quantity: 'Quantity',
  unitValue: 'Unit Value',
  totalValue: 'Total Value',
  netValue: 'Net Value',
  actions: 'Actions',
  liability: 'Liability',
  amount: 'Amount',
  dueDate: 'Due Date',
  monthlyPayment: 'Monthly Payment',
  status: 'Status',

  // Category display names
  fixedAsset: 'Fixed Asset',
  currentAsset: 'Current Asset',
  currentLiability: 'Current Liability',
  longTermLiability: 'Long-term Liability',

  // Asset/Liability actions
  editAsset: 'Edit Asset',
  deleteAsset: 'Delete Asset',
  editLiability: 'Edit Liability',
  deleteLiability: 'Delete Liability',

  // Toast messages
  assetDeletedSuccessfully: 'Asset deleted successfully!',
  liabilityDeletedSuccessfully: 'Liability deleted successfully!',
  unitValueUpdatedSuccessfully: 'Unit value updated successfully!',
  assetCreatedSuccessfully: 'Asset created successfully!',
  assetUpdatedSuccessfully: 'Asset updated successfully!',
  liabilityCreatedSuccessfully: 'Liability created successfully!',
  liabilityUpdatedSuccessfully: 'Liability updated successfully!',

  // Error messages
  failedToLoadAssetsLiabilities:
    'Failed to load assets and liabilities data. Please try again.',
  failedToDeleteAsset: 'Failed to delete asset. Please try again.',
  failedToDeleteLiability: 'Failed to delete liability. Please try again.',
  failedToUpdateUnitValue: 'Failed to update unit value. Please try again.',
  failedToCreateAsset: 'Failed to create asset. Please try again.',
  failedToUpdateAsset: 'Failed to update asset. Please try again.',
  failedToCreateLiability: 'Failed to create liability. Please try again.',
  failedToUpdateLiability: 'Failed to update liability. Please try again.',

  // Confirmation messages
  areYouSureDeleteAsset: 'Are you sure you want to delete this asset?',
  areYouSureDeleteLiability: 'Are you sure you want to delete this liability?',

  // Form labels
  name: 'Name',
  description: 'Description',
  value: 'Value',
  purchaseDate: 'Purchase Date',
  depreciationRate: 'Depreciation Rate',
  subCategory: 'Sub Category',

  // Status indicators
  active: 'ACTIVE',
  autoCalculated: 'Auto-calculated',
  auto: 'Auto',

  // No data messages
  noAssetsFound:
    'No assets found. Click "Add Assets/Liabilities" to get started.',
  noLiabilitiesFound:
    'No liabilities found. Click "Add Assets/Liabilities" to get started.',

  // Modal titles
  addAsset: 'Add Asset',
  editAssetTitle: 'Edit Asset',
  addLiability: 'Add Liability',
  editLiabilityTitle: 'Edit Liability',

  // Form placeholders
  enterAssetName: 'Enter asset name',
  enterLiabilityName: 'Enter liability name',
  enterDescription: 'Enter description',
  enterValue: 'Enter value',
  enterAmount: 'Enter amount',
  selectCategory: 'Select category',

  // Loading states
  loadingData: 'Loading data',

  // Date formatting
  notAvailable: 'N/A',

  // Button labels
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',

  // Asset categories
  inventory: 'Inventory',
  vehicles: 'Vehicles',
  equipment: 'Equipment',
  property: 'Property',
};

// Bengali translations for the new keys
const bengaliTranslations = {
  assetsAndLiabilities: 'সম্পদ এবং দায়',
  manageCompanyAssets: 'কোম্পানির সম্পদ এবং আর্থিক বাধ্যবাধকতা পরিচালনা করুন',
  companyAssets: 'কোম্পানির সম্পদ',
  companyLiabilities: 'কোম্পানির দায়',

  refresh: 'রিফ্রেশ',
  addAssetsLiabilities: 'সম্পদ/দায় যোগ করুন',

  success: 'সফল',
  error: 'ত্রুটি',

  netWorth: 'নেট মূল্য',
  depreciation: 'অবচয়',

  assetName: 'সম্পদের নাম',
  category: 'বিভাগ',
  quantity: 'পরিমাণ',
  unitValue: 'একক মূল্য',
  totalValue: 'মোট মূল্য',
  netValue: 'নেট মূল্য',
  actions: 'কার্যক্রম',
  liability: 'দায়',
  amount: 'পরিমাণ',
  dueDate: 'নির্ধারিত তারিখ',
  monthlyPayment: 'মাসিক পেমেন্ট',
  status: 'অবস্থা',

  fixedAsset: 'স্থায়ী সম্পদ',
  currentAsset: 'চলতি সম্পদ',
  currentLiability: 'চলতি দায়',
  longTermLiability: 'দীর্ঘমেয়াদী দায়',

  editAsset: 'সম্পদ সম্পাদনা',
  deleteAsset: 'সম্পদ মুছুন',
  editLiability: 'দায় সম্পাদনা',
  deleteLiability: 'দায় মুছুন',

  assetDeletedSuccessfully: 'সম্পদ সফলভাবে মুছে ফেলা হয়েছে!',
  liabilityDeletedSuccessfully: 'দায় সফলভাবে মুছে ফেলা হয়েছে!',
  unitValueUpdatedSuccessfully: 'একক মূল্য সফলভাবে আপডেট হয়েছে!',
  assetCreatedSuccessfully: 'সম্পদ সফলভাবে তৈরি হয়েছে!',
  assetUpdatedSuccessfully: 'সম্পদ সফলভাবে আপডেট হয়েছে!',
  liabilityCreatedSuccessfully: 'দায় সফলভাবে তৈরি হয়েছে!',
  liabilityUpdatedSuccessfully: 'দায় সফলভাবে আপডেট হয়েছে!',

  failedToLoadAssetsLiabilities:
    'সম্পদ এবং দায়ের তথ্য লোড করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToDeleteAsset: 'সম্পদ মুছতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToDeleteLiability: 'দায় মুছতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToUpdateUnitValue:
    'একক মূল্য আপডেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToCreateAsset: 'সম্পদ তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToUpdateAsset: 'সম্পদ আপডেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToCreateLiability:
    'দায় তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToUpdateLiability:
    'দায় আপডেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',

  areYouSureDeleteAsset: 'আপনি কি নিশ্চিত যে এই সম্পদটি মুছে ফেলতে চান?',
  areYouSureDeleteLiability: 'আপনি কি নিশ্চিত যে এই দায়টি মুছে ফেলতে চান?',

  name: 'নাম',
  description: 'বিবরণ',
  value: 'মূল্য',
  purchaseDate: 'ক্রয়ের তারিখ',
  depreciationRate: 'অবচয়ের হার',
  subCategory: 'উপ বিভাগ',

  active: 'সক্রিয়',
  autoCalculated: 'স্বয়ংক্রিয়ভাবে গণনা করা',
  auto: 'স্বয়ংক্রিয়',

  noAssetsFound:
    'কোনো সম্পদ পাওয়া যায়নি। শুরু করতে "সম্পদ/দায় যোগ করুন" ক্লিক করুন।',
  noLiabilitiesFound:
    'কোনো দায় পাওয়া যায়নি। শুরু করতে "সম্পদ/দায় যোগ করুন" ক্লিক করুন।',

  addAsset: 'সম্পদ যোগ করুন',
  editAssetTitle: 'সম্পদ সম্পাদনা',
  addLiability: 'দায় যোগ করুন',
  editLiabilityTitle: 'দায় সম্পাদনা',

  enterAssetName: 'সম্পদের নাম লিখুন',
  enterLiabilityName: 'দায়ের নাম লিখুন',
  enterDescription: 'বিবরণ লিখুন',
  enterValue: 'মূল্য লিখুন',
  enterAmount: 'পরিমাণ লিখুন',
  selectCategory: 'বিভাগ নির্বাচন করুন',

  loadingData: 'তথ্য লোড হচ্ছে',

  notAvailable: 'উপলব্ধ নয়',

  save: 'সংরক্ষণ',
  cancel: 'বাতিল',
  close: 'বন্ধ',

  inventory: 'ইনভেন্টরি',
  vehicles: 'যানবাহন',
  equipment: 'সরঞ্জাম',
  property: 'সম্পত্তি',
};

console.log('📖 Reading translations file...');
let translationsContent = fs.readFileSync(translationsPath, 'utf8');

// Add new keys to English translations
console.log('➕ Adding new translation keys to English section...');
const englishTranslationsEndPattern =
  /(const englishTranslations: Translations = \{[\s\S]*?)(\n};)/;
const englishMatch = translationsContent.match(englishTranslationsEndPattern);

if (englishMatch) {
  let newEnglishKeys = '';
  Object.entries(newTranslationKeys).forEach(([key, value]) => {
    // Check if key already exists
    if (!translationsContent.includes(`${key}:`)) {
      newEnglishKeys += `  ${key}: '${value}',\n`;
    }
  });

  if (newEnglishKeys) {
    translationsContent = translationsContent.replace(
      englishTranslationsEndPattern,
      `$1\n  // Assets page translations\n${newEnglishKeys}$2`
    );
  }
}

// Add new keys to Bengali translations
console.log('➕ Adding new translation keys to Bengali section...');
const bengaliTranslationsEndPattern =
  /(const bengaliTranslations: Translations = \{[\s\S]*?)(\n};)/;
const bengaliMatch = translationsContent.match(bengaliTranslationsEndPattern);

if (bengaliMatch) {
  let newBengaliKeys = '';
  Object.entries(bengaliTranslations).forEach(([key, value]) => {
    // Check if key already exists
    if (!translationsContent.includes(`${key}:`)) {
      newBengaliKeys += `  ${key}: '${value}',\n`;
    }
  });

  if (newBengaliKeys) {
    translationsContent = translationsContent.replace(
      bengaliTranslationsEndPattern,
      `$1\n  // Assets page translations\n${newBengaliKeys}$2`
    );
  }
}

// Write updated translations file
console.log('💾 Writing updated translations file...');
fs.writeFileSync(translationsPath, translationsContent);

console.log('📝 Updating Assets page component...');
let pageContent = fs.readFileSync(assetsPath, 'utf8');

// Replace hardcoded strings with translation calls
const replacements = [
  // Page title and headers
  ['Assets and Liabilities', '{t("assetsAndLiabilities")}'],
  [
    'Manage company assets and financial obligations',
    '{t("manageCompanyAssets")}',
  ],
  ['Company Assets', '{t("companyAssets")}'],
  ['Company Liabilities', '{t("companyLiabilities")}'],

  // Button texts
  ['Refresh', '{t("refresh")}'],
  ['Add Assets/Liabilities', '{t("addAssetsLiabilities")}'],

  // Toast messages
  ["title: 'Success',", "title: t('success'),"],
  ["title: 'Error',", "title: t('error'),"],
  [
    "description: 'Asset deleted successfully!',",
    "description: t('assetDeletedSuccessfully'),",
  ],
  [
    "description: 'Liability deleted successfully!',",
    "description: t('liabilityDeletedSuccessfully'),",
  ],
  [
    "description: 'Unit value updated successfully!',",
    "description: t('unitValueUpdatedSuccessfully'),",
  ],
  [
    "'Failed to load assets and liabilities data. Please try again.'",
    "t('failedToLoadAssetsLiabilities')",
  ],
  [
    "description: 'Failed to delete asset. Please try again.',",
    "description: t('failedToDeleteAsset'),",
  ],
  [
    "description: 'Failed to delete liability. Please try again.',",
    "description: t('failedToDeleteLiability'),",
  ],
  [
    "description: 'Failed to update unit value. Please try again.',",
    "description: t('failedToUpdateUnitValue'),",
  ],

  // Confirmation messages
  [
    "'Are you sure you want to delete this asset?'",
    "t('areYouSureDeleteAsset')",
  ],
  [
    "'Are you sure you want to delete this liability?'",
    "t('areYouSureDeleteLiability')",
  ],

  // Table headers
  ['Asset Name', '{t("assetName")}'],
  ['Category', '{t("category")}'],
  ['Quantity', '{t("quantity")}'],
  ['Unit Value', '{t("unitValue")}'],
  ['Total Value', '{t("totalValue")}'],
  ['Net Value', '{t("netValue")}'],
  ['Actions', '{t("actions")}'],
  ['Liability', '{t("liability")}'],
  ['Amount', '{t("amount")}'],
  ['Due Date', '{t("dueDate")}'],
  ['Monthly Payment', '{t("monthlyPayment")}'],
  ['Status', '{t("status")}'],

  // Category display names
  ["'Fixed Asset'", "t('fixedAsset')"],
  ["'Current Asset'", "t('currentAsset')"],
  ["'Current Liability'", "t('currentLiability')"],
  ["'Long-term Liability'", "t('longTermLiability')"],

  // Status and labels
  ['Net Worth', '{t("netWorth")}'],
  ['Depreciation', '{t("depreciation")}'],
  ["'Auto-calculated'", "t('autoCalculated')"],
  ["'Auto'", "t('auto')"],
  ["'ACTIVE'", "t('active')"],
  ["'N/A'", "t('notAvailable')"],

  // Tooltips
  ['title="Edit Asset"', 'title={t("editAsset")}'],
  ['title="Delete Asset"', 'title={t("deleteAsset")}'],
  ['title="Edit Liability"', 'title={t("editLiability")}'],
  ['title="Delete Liability"', 'title={t("deleteLiability")}'],

  // No data messages
  [
    'No assets found. Click "Add Assets/Liabilities" to get started.',
    '{t("noAssetsFound")}',
  ],
  [
    'No liabilities found. Click "Add Assets/Liabilities" to get started.',
    '{t("noLiabilitiesFound")}',
  ],

  // Dynamic success messages
  [
    "`${modalType === 'asset' ? 'Asset' : 'Liability'} ${isEditing ? 'updated' : 'created'} successfully!`",
    '`${modalType === \'asset\' ? (isEditing ? t("assetUpdatedSuccessfully") : t("assetCreatedSuccessfully")) : (isEditing ? t("liabilityUpdatedSuccessfully") : t("liabilityCreatedSuccessfully"))}`',
  ],

  // Dynamic error messages
  [
    "`Failed to ${editingItem ? 'update' : 'create'} ${modalType}. Please try again.`",
    '`${editingItem ? (modalType === \'asset\' ? t("failedToUpdateAsset") : t("failedToUpdateLiability")) : (modalType === \'asset\' ? t("failedToCreateAsset") : t("failedToCreateLiability"))}`',
  ],
];

// Apply replacements
let replacementCount = 0;
replacements.forEach(([search, replace]) => {
  if (pageContent.includes(search)) {
    pageContent = pageContent.replace(
      new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      replace
    );
    console.log(`✅ Replaced: ${search.substring(0, 50)}...`);
    replacementCount++;
  }
});

// Write updated page content
fs.writeFileSync(assetsPath, pageContent);

console.log(`\n🎉 Assets page translations fixed!`);
console.log(`✨ Applied ${replacementCount} replacements.`);
console.log(
  `📊 Added ${Object.keys(newTranslationKeys).length} new translation keys.`
);

console.log('\n📋 Summary of changes:');
console.log('✅ Added translation keys for page titles and headers');
console.log('✅ Replaced hardcoded English text with translation calls');
console.log('✅ Added proper Bengali translations for all UI elements');
console.log('✅ Fixed toast messages and confirmation dialogs');
console.log('✅ Localized table headers and status indicators');
console.log('✅ Fixed error messages and success notifications');

console.log('\n🚀 The Assets page should now display properly in Bengali!');
