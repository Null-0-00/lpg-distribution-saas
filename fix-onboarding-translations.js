const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/i18n/translations.ts');

console.log('🔧 Fixing onboarding translations...');

// Comprehensive mapping of onboarding translations
const onboardingTranslations = {
  // Core onboarding
  welcomeToOnboarding: 'সেটআপে স্বাগতম',
  setupYourBusinessData: 'শুরু করতে আপনার ব্যবসায়িক তথ্য সেটআপ করুন',
  companyNames: 'কোম্পানির নাম',
  productSetup: 'পণ্য সেটআপ',
  inventoryQuantities: 'ইনভেন্টরি পরিমাণ',
  driversSetup: 'চালক সেটআপ',
  receivablesSetup: 'বাকি সেটআপ',
  skipOnboarding: 'সেটআপ এড়িয়ে যান',
  completing: 'সম্পন্ন করা হচ্ছে...',
  completeSetup: 'সেটআপ সম্পন্ন করুন',
  setupBusiness: 'ব্যবসা সেটআপ',

  // Company step
  addCompanyNames: 'কোম্পানির নাম যোগ করুন',
  addCompaniesYouDistributeFor:
    'আপনি যে কোম্পানিগুলির জন্য বিতরণ করেন তা যোগ করুন',
  addNewCompany: 'নতুন কোম্পানি যোগ করুন',
  enterCompanyNamesLikeAygaz:
    'আয়গাজ, বাশুন্ধরা গ্যাসের মতো কোম্পানির নাম লিখুন',
  companyName: 'কোম্পানির নাম',
  enterCompanyName: 'কোম্পানির নাম লিখুন',
  companyNameRequired: 'কোম্পানির নাম প্রয়োজন',
  companyAlreadyExists: 'কোম্পানি ইতিমধ্যে বিদ্যমান',
  addedCompanies: 'যোগ করা কোম্পানি',
  companiesYouDistributeFor: 'আপনি যে কোম্পানিগুলির জন্য বিতরণ করেন',
  noCompaniesAdded: 'কোনো কোম্পানি যোগ করা হয়নি',
  addAtLeastOneCompany: 'অন্তত একটি কোম্পানি যোগ করুন',

  // Product step
  setupProductsAndSizes: 'পণ্য এবং আকার সেটআপ করুন',
  configureCylinderSizesAndProducts: 'সিলিন্ডারের আকার এবং পণ্য কনফিগার করুন',
  cylinderSizes: 'সিলিন্ডারের আকার',
  addCylinderSize: 'সিলিন্ডারের আকার যোগ করুন',
  addSizesLike12L20L: '১২ লিটার, ২০ লিটারের মতো আকার যোগ করুন',
  enterSizeLike12L: '১২ লিটার এর মতো আকার লিখুন',
  addSize: 'আকার যোগ করুন',
  cylinderSizeRequired: 'সিলিন্ডারের আকার প্রয়োজন',
  cylinderSizeAlreadyExists: 'সিলিন্ডারের আকার ইতিমধ্যে বিদ্যমান',
  enterDescription: 'বিবরণ লিখুন',
  addProduct: 'পণ্য যোগ করুন',
  addProductsForEachCompany: 'প্রতিটি কোম্পানির জন্য পণ্য যোগ করুন',
  productName: 'পণ্যের নাম',
  enterProductName: 'পণ্যের নাম লিখুন',
  currentPrice: 'বর্তমান দাম',
  enterPrice: 'দাম লিখুন',
  productNameRequired: 'পণ্যের নাম প্রয়োজন',
  validPriceRequired: 'বৈধ দাম প্রয়োজন',
  productAlreadyExists: 'পণ্য ইতিমধ্যে বিদ্যমান',
  addedProducts: 'যোগ করা পণ্য',
  addCylinderSizesAndProducts: 'সিলিন্ডারের আকার এবং পণ্য যোগ করুন',
  bothRequiredToProceed: 'এগিয়ে যেতে উভয়ই প্রয়োজন',

  // Inventory step
  setInitialInventory: 'প্রাথমিক ইনভেন্টরি সেট করুন',
  enterCurrentFullCylinderQuantities: 'বর্তমান পূর্ণ সিলিন্ডারের পরিমাণ লিখুন',
  fullCylinderInventory: 'পূর্ণ সিলিন্ডার ইনভেন্টরি',
  enterQuantityForEachProduct: 'প্রতিটি পণ্যের জন্য পরিমাণ লিখুন',
  noProductsAvailable: 'কোনো পণ্য উপলব্ধ নেই',
  addProductsFirst: 'প্রথমে পণ্য যোগ করুন',
  totalProducts: 'মোট পণ্য',
  totalFullCylinders: 'মোট পূর্ণ সিলিন্ডার',

  // Empty cylinders step
  setEmptyCylinderInventory: 'খালি সিলিন্ডার ইনভেন্টরি সেট করুন',
  enterCurrentEmptyCylinderQuantities: 'বর্তমান খালি সিলিন্ডারের পরিমাণ লিখুন',
  emptyCylinderInventory: 'খালি সিলিন্ডার ইনভেন্টরি',
  enterQuantityForEachSize: 'প্রতিটি আকারের জন্য পরিমাণ লিখুন',
  noCylinderSizesAvailable: 'কোনো সিলিন্ডারের আকার উপলব্ধ নেই',
  addCylinderSizesFirst: 'প্রথমে সিলিন্ডারের আকার যোগ করুন',
  totalSizes: 'মোট আকার',
  totalEmptyCylinders: 'মোট খালি সিলিন্ডার',

  // Drivers step
  addYourDrivers: 'আপনার চালক যোগ করুন',
  addDriversWhoWillSellProducts: 'যে চালকরা পণ্য বিক্রি করবেন তাদের যোগ করুন',
  enterDriverInformation: 'চালকের তথ্য লিখুন',
  enterDriverName: 'চালকের নাম লিখুন',
  shipmentDriver: 'শিপমেন্ট চালক',
  driverNameRequired: 'চালকের নাম প্রয়োজন',
  driverAlreadyExists: 'চালক ইতিমধ্যে বিদ্যমান',
  addedDrivers: 'যোগ করা চালক',
  driversInYourTeam: 'আপনার দলের চালকরা',
  noContactInfo: 'কোনো যোগাযোগের তথ্য নেই',
  noDriversAdded: 'কোনো চালক যোগ করা হয়নি',
  addAtLeastOneDriver: 'অন্তত একজন চালক যোগ করুন',

  // Receivables step
  setupReceivables: 'বাকি সেটআপ করুন',
  enterCurrentReceivablesForEachDriver:
    'প্রতিটি চালকের জন্য বর্তমান বাকি লিখুন',
  driverReceivables: 'চালকের বাকি',
  enterCashAndCylinderReceivables: 'নগদ এবং সিলিন্ডার বাকি লিখুন',
  amountOwedByCustomers: 'গ্রাহকদের কাছে পাওনা টাকা',
  cylindersOwedByCustomers: 'গ্রাহকদের কাছে পাওনা সিলিন্ডার',
  cylindersOwedByCustomersBySize:
    'আকার অনুযায়ী গ্রাহকদের কাছে পাওনা সিলিন্ডার',
  noDriversAvailable: 'কোনো চালক উপলব্ধ নেই',
  addDriversFirst: 'প্রথমে চালক যোগ করুন',
  noRetailDriversAvailable: 'কোনো খুচরা চালক উপলব্ধ নেই',
  addRetailDriversFirst: 'প্রথমে খুচরা চালক যোগ করুন',
  receivablesSummary: 'বাকি সারসংক্ষেপ',

  // Admin onboarding
  manualBusinessOnboarding: 'ম্যানুয়াল ব্যবসায়িক অনবোর্ডিং',
  businessInformation: 'ব্যবসায়িক তথ্য',
  businessName: 'ব্যবসার নাম',
  businessNamePlaceholder: 'যেমন, ঢাকা গ্যাস ডিস্ট্রিবিউটরস লিমিটেড',
  subdomain: 'সাবডোমেইন',
  subdomainPlaceholder: 'যেমন, dhaka-gas',
  plan: 'পরিকল্পনা',
  freemium: 'ফ্রিমিয়াম',
  professional: 'পেশাদার',
  enterprise: 'এন্টারপ্রাইজ',
  adminUser: 'অ্যাডমিন ব্যবহারকারী',
  adminName: 'অ্যাডমিনের নাম',
  adminNamePlaceholder: 'যেমন, জন ডো',
  adminEmail: 'অ্যাডমিনের ইমেইল',
  adminEmailPlaceholder: 'যেমন, admin@company.com',
  adminPassword: 'অ্যাডমিনের পাসওয়ার্ড',
  strongPassword: 'শক্তিশালী পাসওয়ার্ড',
  creatingBusiness: 'ব্যবসা তৈরি করা হচ্ছে...',
  onboardBusiness: 'ব্যবসা অনবোর্ড করুন',
  businessOnboardedSuccessfully: 'ব্যবসা সফলভাবে অনবোর্ড হয়েছে',
  businessCreatedWithAdmin: 'অ্যাডমিন সহ ব্যবসা তৈরি হয়েছে',
  failedToOnboardBusiness: 'ব্যবসা অনবোর্ড করতে ব্যর্থ',
  networkErrorOccurred: 'নেটওয়ার্ক ত্রুটি ঘটেছে',

  // API errors
  unauthorized: 'অননুমোদিত',
  userNotFound: 'ব্যবহারকারী পাওয়া যায়নি',
  onboardingAlreadyCompleted: 'অনবোর্ডিং ইতিমধ্যে সম্পন্ন',
  failedToCompleteOnboarding: 'অনবোর্ডিং সম্পন্ন করতে ব্যর্থ',
  failedToCheckOnboardingStatus: 'অনবোর্ডিং স্থিতি যাচাই করতে ব্যর্থ',
};

// Read the current translations file
const content = fs.readFileSync(filePath, 'utf8');

console.log('📖 Reading current translations...');

// Replace each placeholder translation with proper Bengali translation
let updatedContent = content;
let replacementCount = 0;

Object.entries(onboardingTranslations).forEach(([key, bengaliTranslation]) => {
  // Look for patterns like: keyName: 'keyName', // TODO: Add Bengali translation
  const placeholderPattern = new RegExp(
    `(\\s+${key}:\\s+)'${key}',\\s*//\\s*TODO:\\s*Add Bengali translation`,
    'g'
  );

  // Also look for patterns without TODO comment
  const simplePattern = new RegExp(`(\\s+${key}:\\s+)'${key}',`, 'g');

  if (placeholderPattern.test(updatedContent)) {
    updatedContent = updatedContent.replace(
      placeholderPattern,
      `$1'${bengaliTranslation}',`
    );
    console.log(`✅ Fixed: ${key} -> ${bengaliTranslation}`);
    replacementCount++;
  } else if (simplePattern.test(updatedContent)) {
    updatedContent = updatedContent.replace(
      simplePattern,
      `$1'${bengaliTranslation}',`
    );
    console.log(`✅ Fixed: ${key} -> ${bengaliTranslation}`);
    replacementCount++;
  }
});

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent);

console.log(
  `\n🎉 Successfully fixed ${replacementCount} onboarding translations!`
);
console.log('✨ Onboarding should now display properly in Bengali.');
