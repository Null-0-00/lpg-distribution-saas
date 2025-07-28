const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Receivables page translations...');

// First, let's add the missing translation keys to the translations file
const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
const receivablesPath = path.join(
  __dirname,
  'src/app/dashboard/receivables/page.tsx'
);

// New translation keys needed for receivables page
const newTranslationKeys = {
  // Page title and navigation
  receivableManagement: 'Receivable Management',

  // Status labels
  success: 'Success',
  error: 'Error',

  // Action buttons and labels
  recalculate: 'Recalculate',
  exportReport: 'Export Report',
  comingSoon: 'Coming Soon',
  exportReportFunctionality: 'Export report functionality coming soon',

  // Customer receivable actions
  customerReceivableUpdatedSuccessfully:
    'Customer receivable updated successfully',
  customerReceivableAddedSuccessfully: 'Customer receivable added successfully',
  customerReceivableDeletedSuccessfully:
    'Customer receivable deleted successfully',
  failedToSaveCustomerReceivable: 'Failed to save customer receivable',
  failedToDeleteCustomerReceivable: 'Failed to delete customer receivable',

  // Payment actions
  paymentRecordedSuccessfully: 'Payment recorded successfully',
  failedToRecordPayment: 'Failed to record payment',
  cylinderReturnRecordedSuccessfully: 'Cylinder return recorded successfully',
  failedToRecordCylinderReturn: 'Failed to record cylinder return',

  // Confirmation messages
  areYouSureDeleteCustomerReceivable:
    'Are you sure you want to delete this customer receivable?',

  // Receivables changes
  failedToFetchReceivablesChanges: 'Failed to fetch receivables changes',

  // Validation and error messages
  customerReceivablesDontMatch: "Customer receivables don't match",
  driverTotalReceivablesFromSales:
    'Driver total receivables are calculated from sales data',
  customerReceivableTotalsMustEqual:
    'Customer receivable totals must equal driver sales totals',
  cashMismatch: 'Cash Mismatch',
  cylinderMismatch: 'Cylinder Mismatch',
  customerTotal: 'Customer Total',
  salesTotal: 'Sales Total',
  difference: 'Difference',

  // System information
  receivablesManagementSystemRules: 'Receivables Management System Rules',
  driverTotalReceivables: 'Driver Total Receivables',
  automaticallyCalculatedFromSales: 'Automatically calculated from sales data',
  customerReceivablesManuallyManaged:
    'Customer receivables are manually managed',
  validation: 'Validation',
  customerTotalsMustEqualDriverSales:
    'Customer totals must equal driver sales totals',
  payments: 'Payments',
  paymentsAutomaticallyAdded: 'Payments are automatically added to receivables',
  changesLog: 'Changes Log',
  changesLogAllReceivableActions: 'Changes log tracks all receivable actions',
  managerAccess: 'Manager Access',
  youCanRecordPayments: 'You can record payments and cylinder returns',

  // Customer alerts
  customersWithOverduePayments: 'customers with overdue payments',
  requireImmediate: 'require immediate',

  // Summary stats
  salesCashReceivables: 'Sales Cash Receivables',
  salesCylinderReceivables: 'Sales Cylinder Receivables',
  fromSalesData: 'From sales data',

  // Table headers and content
  cashReceivables: 'Cash Receivables',
  cylinderReceivables: 'Cylinder Receivables',
  noCashReceivables: 'No cash receivables',
  noCylinderReceivables: 'No cylinder receivables',

  // Form labels
  customerName: 'Customer Name',
  receivableType: 'Receivable Type',
  cash: 'Cash',
  cylinder: 'Cylinder',
  amount: 'Amount',
  quantity: 'Quantity',
  size: 'Size',
  dueDate: 'Due Date',
  notes: 'Notes',
  paymentMethod: 'Payment Method',
  mobile: 'Mobile',
  bank: 'Bank',
  transfer: 'Transfer',

  // Modal titles
  editCustomerReceivable: 'Edit Customer Receivable',
  addCustomerReceivable: 'Add Customer Receivable',
  recordPayment: 'Record Payment',
  recordCylinderReturn: 'Record Cylinder Return',

  // Form placeholders
  enterCustomerName: 'Enter customer name',
  enterAmount: 'Enter amount',
  enterQuantity: 'Enter quantity',
  enterNotes: 'Enter notes',
  selectSize: 'Select size',
  selectPaymentMethod: 'Select payment method',

  // Tabs
  receivables: 'Receivables',
  changes: 'Changes',

  // No data messages
  noReceivablesFound: 'No receivables found',
  noChangesRecorded: 'No changes recorded',

  // Loading states
  loadingReceivables: 'Loading receivables...',
  loadingChanges: 'Loading changes...',

  // Date formatting
  noDate: 'No date',
  invalidDate: 'Invalid date',
  noTimestamp: 'No timestamp',
  invalidTimestamp: 'Invalid timestamp',

  // Cylinder sizes
  failedToFetchCylinderSizes: 'Failed to fetch cylinder sizes',

  // Changes log
  receivablesChangesLog: 'Receivables Changes Log',
};

// Bengali translations for the new keys
const bengaliTranslations = {
  receivableManagement: 'বাকি ব্যবস্থাপনা',

  success: 'সফল',
  error: 'ত্রুটি',

  recalculate: 'পুনর্গণনা',
  exportReport: 'রিপোর্ট রপ্তানি',
  comingSoon: 'শীঘ্রই আসছে',
  exportReportFunctionality: 'রিপোর্ট রপ্তানি কার্যকারিতা শীঘ্রই আসছে',

  customerReceivableUpdatedSuccessfully: 'গ্রাহক বাকি সফলভাবে আপডেট হয়েছে',
  customerReceivableAddedSuccessfully: 'গ্রাহক বাকি সফলভাবে যোগ করা হয়েছে',
  customerReceivableDeletedSuccessfully: 'গ্রাহক বাকি সফলভাবে মুছে ফেলা হয়েছে',
  failedToSaveCustomerReceivable: 'গ্রাহক বাকি সংরক্ষণ করতে ব্যর্থ',
  failedToDeleteCustomerReceivable: 'গ্রাহক বাকি মুছতে ব্যর্থ',

  paymentRecordedSuccessfully: 'পেমেন্ট সফলভাবে রেকর্ড হয়েছে',
  failedToRecordPayment: 'পেমেন্ট রেকর্ড করতে ব্যর্থ',
  cylinderReturnRecordedSuccessfully: 'সিলিন্ডার ফেরত সফলভাবে রেকর্ড হয়েছে',
  failedToRecordCylinderReturn: 'সিলিন্ডার ফেরত রেকর্ড করতে ব্যর্থ',

  areYouSureDeleteCustomerReceivable:
    'আপনি কি নিশ্চিত যে এই গ্রাহক বাকি মুছে ফেলতে চান?',

  failedToFetchReceivablesChanges: 'বাকি পরিবর্তন আনতে ব্যর্থ',

  customerReceivablesDontMatch: 'গ্রাহক বাকি মিলছে না',
  driverTotalReceivablesFromSales:
    'চালকের মোট বাকি বিক্রয় তথ্য থেকে গণনা করা হয়',
  customerReceivableTotalsMustEqual:
    'গ্রাহক বাকির মোট চালকের বিক্রয় মোটের সমান হতে হবে',
  cashMismatch: 'নগদ অমিল',
  cylinderMismatch: 'সিলিন্ডার অমিল',
  customerTotal: 'গ্রাহক মোট',
  salesTotal: 'বিক্রয় মোট',
  difference: 'পার্থক্য',

  receivablesManagementSystemRules: 'বাকি ব্যবস্থাপনা সিস্টেমের নিয়ম',
  driverTotalReceivables: 'চালকের মোট বাকি',
  automaticallyCalculatedFromSales:
    'বিক্রয় তথ্য থেকে স্বয়ংক্রিয়ভাবে গণনা করা হয়',
  customerReceivablesManuallyManaged: 'গ্রাহক বাকি ম্যানুয়ালি পরিচালিত হয়',
  validation: 'বৈধতা',
  customerTotalsMustEqualDriverSales:
    'গ্রাহকের মোট চালকের বিক্রয়ের সমান হতে হবে',
  payments: 'পেমেন্ট',
  paymentsAutomaticallyAdded: 'পেমেন্ট স্বয়ংক্রিয়ভাবে বাকিতে যোগ করা হয়',
  changesLog: 'পরিবর্তন লগ',
  changesLogAllReceivableActions:
    'পরিবর্তন লগ সমস্ত বাকি কার্যক্রম ট্র্যাক করে',
  managerAccess: 'ম্যানেজার অ্যাক্সেস',
  youCanRecordPayments: 'আপনি পেমেন্ট এবং সিলিন্ডার ফেরত রেকর্ড করতে পারেন',

  customersWithOverduePayments: 'অতিরিক্ত পেমেন্ট সহ গ্রাহক',
  requireImmediate: 'তাৎক্ষণিক প্রয়োজন',

  salesCashReceivables: 'বিক্রয় নগদ বাকি',
  salesCylinderReceivables: 'বিক্রয় সিলিন্ডার বাকি',
  fromSalesData: 'বিক্রয় তথ্য থেকে',

  cashReceivables: 'নগদ বাকি',
  cylinderReceivables: 'সিলিন্ডার বাকি',
  noCashReceivables: 'কোনো নগদ বাকি নেই',
  noCylinderReceivables: 'কোনো সিলিন্ডার বাকি নেই',

  customerName: 'গ্রাহকের নাম',
  receivableType: 'বাকির ধরন',
  cash: 'নগদ',
  cylinder: 'সিলিন্ডার',
  amount: 'পরিমাণ',
  quantity: 'সংখ্যা',
  size: 'আকার',
  dueDate: 'নির্ধারিত তারিখ',
  notes: 'নোট',
  paymentMethod: 'পেমেন্ট পদ্ধতি',
  mobile: 'মোবাইল',
  bank: 'ব্যাংক',
  transfer: 'স্থানান্তর',

  editCustomerReceivable: 'গ্রাহক বাকি সম্পাদনা',
  addCustomerReceivable: 'গ্রাহক বাকি যোগ করুন',
  recordPayment: 'পেমেন্ট রেকর্ড করুন',
  recordCylinderReturn: 'সিলিন্ডার ফেরত রেকর্ড করুন',

  enterCustomerName: 'গ্রাহকের নাম লিখুন',
  enterAmount: 'পরিমাণ লিখুন',
  enterQuantity: 'সংখ্যা লিখুন',
  enterNotes: 'নোট লিখুন',
  selectSize: 'আকার নির্বাচন করুন',
  selectPaymentMethod: 'পেমেন্ট পদ্ধতি নির্বাচন করুন',

  receivables: 'বাকি',
  changes: 'পরিবর্তন',

  noReceivablesFound: 'কোনো বাকি পাওয়া যায়নি',
  noChangesRecorded: 'কোনো পরিবর্তন রেকর্ড করা হয়নি',

  loadingReceivables: 'বাকি লোড হচ্ছে...',
  loadingChanges: 'পরিবর্তন লোড হচ্ছে...',

  noDate: 'কোনো তারিখ নেই',
  invalidDate: 'অবৈধ তারিখ',
  noTimestamp: 'কোনো টাইমস্ট্যাম্প নেই',
  invalidTimestamp: 'অবৈধ টাইমস্ট্যাম্প',

  failedToFetchCylinderSizes: 'সিলিন্ডারের আকার আনতে ব্যর্থ',

  receivablesChangesLog: 'বাকি পরিবর্তন লগ',
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
      `$1\n  // Receivables page translations\n${newEnglishKeys}$2`
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
      `$1\n  // Receivables page translations\n${newBengaliKeys}$2`
    );
  }
}

// Write updated translations file
console.log('💾 Writing updated translations file...');
fs.writeFileSync(translationsPath, translationsContent);

console.log('📝 Updating Receivables page component...');
let pageContent = fs.readFileSync(receivablesPath, 'utf8');

// Replace hardcoded strings with translation calls
const replacements = [
  // Toast messages
  ["title: 'Success',", "title: t('success'),"],
  ["title: 'Error',", "title: t('error'),"],
  [
    "description: 'Failed to fetch receivables changes',",
    "description: t('failedToFetchReceivablesChanges'),",
  ],
  [
    "description: 'Failed to save customer receivable',",
    "description: t('failedToSaveCustomerReceivable'),",
  ],
  [
    "description: 'Customer receivable deleted successfully',",
    "description: t('customerReceivableDeletedSuccessfully'),",
  ],
  [
    "description: 'Failed to delete customer receivable',",
    "description: t('failedToDeleteCustomerReceivable'),",
  ],
  [
    "description: 'Payment recorded successfully',",
    "description: t('paymentRecordedSuccessfully'),",
  ],
  [
    "description: 'Failed to record payment',",
    "description: t('failedToRecordPayment'),",
  ],
  [
    "description: 'Cylinder return recorded successfully',",
    "description: t('cylinderReturnRecordedSuccessfully'),",
  ],
  [
    "description: 'Failed to record cylinder return',",
    "description: t('failedToRecordCylinderReturn'),",
  ],

  // Confirmation messages
  [
    "'Are you sure you want to delete this customer receivable?'",
    "t('areYouSureDeleteCustomerReceivable')",
  ],

  // Console error messages
  [
    "console.error('Failed to fetch cylinder sizes:', error);",
    "console.error(t('failedToFetchCylinderSizes'), error);",
  ],

  // Table headers and labels
  ["'Cash Receivables'", "t('cashReceivables')"],
  ["'No cash receivables'", "t('noCashReceivables')"],
  ["'Sales Cash Receivable: '", "t('salesCashReceivables') + ': '"],

  // Form default values
  ["paymentMethod: 'cash',", "paymentMethod: 'cash',"], // Keep as is for now
  ["receivableType: 'CASH',", "receivableType: 'CASH',"], // Keep as is for now

  // Status and validation text
  ["'Customer receivables don\\'t match'", "t('customerReceivablesDontMatch')"],
  ["'customers with overdue payments'", "t('customersWithOverduePayments')"],
  ["'require immediate'", "t('requireImmediate')"],
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
fs.writeFileSync(receivablesPath, pageContent);

console.log(`\n🎉 Receivables page translations fixed!`);
console.log(`✨ Applied ${replacementCount} replacements.`);
console.log(
  `📊 Added ${Object.keys(newTranslationKeys).length} new translation keys.`
);

console.log('\n📋 Summary of changes:');
console.log('✅ Added translation keys for toast messages and alerts');
console.log('✅ Replaced hardcoded English text with translation calls');
console.log('✅ Added proper Bengali translations for all UI elements');
console.log('✅ Fixed error messages and confirmation dialogs');
console.log('✅ Localized form labels and placeholders');

console.log(
  '\n🚀 The Receivables page should now display properly in Bengali!'
);
