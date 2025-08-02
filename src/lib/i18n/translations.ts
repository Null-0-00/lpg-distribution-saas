import {
  TranslationValidator,
  TranslationFallbackSystem,
  translationLogger,
  TranslationError,
  TranslationErrorType,
  ValidationResult,
  ConsistencyReport,
} from './translation-validator';

export interface Translations {
  // Navigation
  dashboard: string;
  sales: string;
  drivers: string;
  shipments: string;
  receivables: string;
  assets: string;
  expenses: string;
  settings: string;
  inventory: string;
  users: string;
  reports: string;
  productManagement: string;
  dailySalesReport: string;
  analytics: string;

  // Auth Pages
  signInToYourAccount: string;
  createYourAccount: string;
  signInToExistingAccount: string;
  password: string;
  confirmPassword: string;
  rememberMe: string;
  forgotPassword: string;
  resetYourPassword: string;
  enterEmailForPasswordReset: string;
  passwordResetLinkSent: string;
  sendResetLink: string;
  backToSignIn: string;
  pleaseEnterYourEmailAddress: string;
  pleaseEnterAValidEmailAddress: string;
  signingIn: string;
  createAccount: string;
  termsOfService: string;
  privacyPolicy: string;
  agreeToTerms: string;
  passwordsDontMatch: string;
  passwordMinLength: string;
  registrationFailed: string;
  anErrorOccurred: string;
  accountCreatedSuccessfully: string;

  // Placeholders
  fullNamePlaceholder: string;
  companyNamePlaceholder: string;
  passwordPlaceholder: string;
  confirmPasswordPlaceholder: string;

  // Home Page
  manageLpgDistributionBusiness: string;
  salesManagement: string;
  inventoryControl: string;
  financialReports: string;
  dailySalesRetailDrivers: string;
  automatedCalculationsExactFormulas: string;
  viewComprehensiveReports: string;
  adminDashboardDescription: string;
  adminDashboardTitle: string;
  auditLogsDescription: string;
  auditLogsTitle: string;
  companyManagementDescription: string;
  companyManagementTitle: string;
  distributorAssignmentsDescription: string;
  distributorAssignmentsTitle: string;
  pricingManagementDescription: string;
  pricingManagementTitle: string;
  productManagementDescription: string;
  productManagementTitle: string;
  systemAnalyticsDescription: string;
  systemAnalyticsTitle: string;
  systemSettingsDescription: string;
  systemSettingsTitle: string;
  userManagementDescription: string;
  userManagementTitle: string;

  // Common Actions
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
  total: string;
  actions: string;
  noQuickActionsAvailable: string;
  noPageAccessPermissions: string;
  contactAdminForPageAccess: string;
  loading: string;
  noData: string;
  noRecentActivity: string;
  refresh: string;
  recalculate: string;
  export: string;
  view: string;
  print: string;
  download: string;
  upload: string;
  submit: string;
  next: string;
  previous: string;
  close: string;
  back: string;
  forward: string;
  confirm: string;
  logout: string;

  // Forms
  name: string;
  email: string;
  phone: string;
  address: string;
  code: string;
  description: string;
  amount: string;
  date: string;
  saleDate: string;
  fixedToToday: string;
  notes: string;
  status: string;
  type: string;
  category: string;
  active: string;
  inactive: string;
  defaultTimezone: string;
  configureGlobalSettings: string;
  settingsChangeNote: string;
  currencySettingDescription: string;
  timezoneSettingDescription: string;
  languageSettingDescription: string;
  generalSettingsDescription: string;
  currencySettingImpact: string;
  timezoneSettingImpact: string;
  languageSettingImpact: string;
  currencyUsageDescription: string;
  timezoneUsageDescription: string;
  languageUsageDescription: string;
  localTime: string;
  settingsChangeWarning: string;
  saving: string;

  // Additional missing translation keys
  selectCurrency: string;
  selectTimezone: string;
  selectLanguage: string;
  english: string;
  bengali: string;

  // Sales & Inventory
  quantity: string;
  unitPrice: string;
  discount: string;
  totalValue: string;
  packageSales: string;
  refillSales: string;
  cylinder: string;
  cylinders: string;
  product: string;
  products: string;
  cash: string;

  // Dashboard and reports
  cashDepositsByDriver: string;
  includesReceivablePayments: string;
  driverExpense: string;
  loadingData: string;
  noDataAvailable: string;
  tryAgain: string;
  performance: string;
  month: string;
  year: string;
  allDrivers: string;
  totalRevenue: string;
  revenue: string;

  // Receivables page specific
  comingSoon: string;
  exportReport: string;
  exportReportFunctionality: string;

  // Reports page specific
  generateAndViewComprehensiveBusinessReports: string;
  thisWeek: string;
  thisQuarter: string;
  customReport: string;
  revenueExpensesAndProfitAnalysis: string;
  pdf: string;
  excel: string;
  last: string;
  assetsLiabilitiesAndEquityOverview: string;
  cashInflowsAndOutflowsTracking: string;
  detailedSalesPerformanceAnalysis: string;
  stockLevelsAndMovementAnalysis: string;
  individualDriverSalesAndEfficiency: string;
  incomeStatementRealTime: string;
  revenueByTypeDriverWithLiveCalculations: string;
  costOfGoodsSold: string;
  cylinderPurchases: string;
  grossProfit: string;
  operatingExpenses: string;
  otherExpenses: string;
  netIncome: string;
  grossMargin: string;
  balanceSheetAutoValidated: string;
  balanced: string;
  outOfBalance: string;
  currentAssets: string;
  cashBank: string;
  accountsReceivable: string;
  inventoryAutoLinked: string;
  fixedAssets: string;
  buildings: string;
  liabilitiesEquity: string;
  currentLiabilities: string;
  accountsPayable: string;
  shortTermLoans: string;
  longTermLiabilities: string;
  longTermLoans: string;
  ownerEquity: string;
  retainedEarnings: string;
  totalLiabEquity: string;
  balanceCheck: string;
  assetsEqualsLiabilitiesPlusEquity: string;
  passed: string;
  cashFlowStatementRealTime: string;
  operatingInvestingFinancingActivities: string;
  operatingActivities: string;
  changeInReceivables: string;
  changeInInventory: string;
  changeInPayables: string;
  operatingCashFlow: string;
  investingActivities: string;
  vehiclePurchases: string;
  equipmentPurchases: string;
  investingCashFlow: string;
  financingActivities: string;
  ownerDrawings: string;
  loanRepayments: string;
  financingCashFlow: string;
  netChangeInCash: string;
  cashAtBeginningOfPeriod: string;
  cashAtEndOfPeriod: string;
  operatingCashFlowIsPositive: string;
  healthyBusinessOperations: string;

  // Additional missing translations
  incomeStatement: string;
  cashFlowStatement: string;
  salesReport: string;
  inventoryReport: string;
  thisYear: string;
  netProfit: string;

  // Dashboard welcome message
  welcomeBack: string;

  // Dashboard activity messages
  sold: string;
  completedSale: string;
  lowStockAlert: string;
  fullCylindersRemaining: string;
  highReceivablesBalance: string;
  completedSales: string;
  dailyTargetAchieved: string;
  salesMilestone: string;
  hoursAgo: string;
  minutesAgo: string;

  // Reports page hardcoded strings
  customReportBuilderComingSoon: string;
  exportCompleted: string;
  exportFailed: string;
  pleaseRetryAgain: string;
  hasBeenEmailedToConfiguredRecipients: string;
  emailFailed: string;
  pleaseCheckEmailConfiguration: string;
  viewDetailsBelow: string;
  realTime: string;
  autoValidated: string;

  // Financial report terms that were removed but are needed
  salaries: string;
  fuelTransportation: string;
  maintenance: string;
  rent: string;
  utilities: string;

  // Additional missing properties that are used in the codebase
  lpgDistributor: string;
  role: string;

  // Product management page specific translations
  noProductsFound: string;
  noCylinderSizesFound: string;
  cylinderTypeSize: string;
  selectFromAvailableCylinderSizes: string;
  manageCylinderSizes: string;
  threshold: string;
  addCylinderSize: string;
  editCylinderSize: string;
  createCylinderSize: string;
  updateCylinderSize: string;
  deleteCylinderSize: string;
  enterCylinderSizeExample: string;
  createProduct: string;
  updateProduct: string;

  // User management form translations
  addNewUser: string;
  enterFullNamePlaceholder: string;
  enterEmailAddressPlaceholder: string;
  enterPasswordPlaceholder: string;
  pageAccessPermissions: string;
  selectAll: string;
  selectNone: string;
  overview: string;
  finance: string;
  administration: string;

  // Permission selector UI
  pages: string;
  all: string;
  some: string;
  none: string;
  selected: string;
  of: string;

  // Page names for permissions
  dashboardPage: string;
  dailySalesReportPage: string;
  inventoryPage: string;
  analyticsPage: string;
  salesPage: string;
  receivablesPage: string;
  expensesPage: string;
  shipmentsPage: string;
  assetsPage: string;
  driversPage: string;
  productManagementPage: string;
  reportsPage: string;
  usersPage: string;
  userManagementPage: string;
  settingsPage: string;

  // Page descriptions
  mainDashboardOverview: string;
  viewDailySalesReports: string;
  manageInventoryAndStockLevels: string;
  businessAnalyticsAndInsights: string;
  manageSalesTransactions: string;
  trackCustomerReceivables: string;
  manageBusinessExpenses: string;
  trackShipmentsAndDeliveries: string;
  manageCompanyAssets: string;
  manageDriversAndAssignments: string;
  manageProductsAndPricing: string;
  generateBusinessReports: string;
  manageSystemUsers: string;
  systemSettingsAndConfiguration: string;

  // Assets form translations
  addNew: string;
  assetValue: string;
  optionalDescriptionPlaceholder: string;
  enterAssetNamePlaceholder: string;

  // Liability form translations
  liabilityName: string;
  totalAmount: string;
  currentLiability: string;
  longTermLiability: string;
  enterLiabilityNamePlaceholder: string;
  fallbackDriverName1: string;
  fallbackDriverName2: string;
  fallbackDriverName3: string;
  fallbackDriverName4: string;
  salesCount: string;
  unknownError: string;
  unknownCompany: string;
  unknownDriver: string;

  customerRecords: string;
  statusBreakdown: string;
  noCashReceivables: string;
  noCylinderReceivables: string;
  noReceivablesFound: string;
  noChangesRecorded: string;
  receivablesChangesLog: string;

  // Expense form specific
  amountPlaceholder: string;
  enterExpenseDescription: string;
  selectParentCategory: string;
  selectCategory: string;
  expenseDate: string;
  receiptUrl: string;
  receiptUrlPlaceholder: string;
  submitting: string;

  // Common UI elements
  activeDrivers: string;
  activeUsers: string;
  addDriver: string;
  addExpense: string;
  additionalNotesComments: string;
  addNewDriver: string;
  addUser: string;
  administrator: string;
  administrators: string;
  ago: string;
  alerts: string;
  allCalculationsUpdatedRealTime: string;
  allCategories: string;
  allCylinders: string;
  allGood: string;
  allStatus: string;
  approved: string;
  approvedExpenses: string;
  approveExpense: string;
  area: string;
  areYouSureDeleteDriver: string;
  assetsLiabilities: string;
  assignedArea: string;
  balanceSheet: string;
  businessFormulaImplementation: string;
  cashReceivables: string;
  changesLog: string;
  checkStock: string;
  clear: string;
  company: string;
  completeSystemAccessAndUserManagement: string;
  confirmDeleteUser: string;
  contactName: string;
  contactNumber: string;
  create: string;
  criticalAlert: string;
  currency: string;
  currentFullCylinderInventory: string;
  currentStock: string;
  currentStockHealth: string;
  customers: string;
  cylinderReceivables: string;
  cylindersReceived: string;
  cylindersSold: string;
  cylindersSummaryApiError: string;
  cylindersSummaryDataReceived: string;
  cylindersSummaryResponseStatus: string;
  dailyCalculations: string;
  dailyInventoryTracking: string;
  dataSources: string;
  day: string;
  days: string;
  deleteExpense: string;
  deleteUser: string;
  deleting: string;
  details: string;
  driver: string;
  driverAddedSuccessfully: string;
  driverDeletedSuccessfully: string;
  driverDetails: string;
  driverManagement: string;
  driverName: string;
  driverType: string;
  driverUpdatedSuccessfully: string;
  editDriver: string;
  editExpense: string;
  editUser: string;
  emailAddress: string;
  emergencyContact: string;
  emptyCylinderInventoryAvailability: string;
  emptyCylinders: string;
  emptyCylindersBuySell: string;
  emptyCylindersInHand: string;

  // Inventory validation messages
  checkingInventory: string;
  inventoryAvailable: string;
  usingAllAvailable: string;
  only: string;
  availableText: string;
  purchasing: string;
  selling: string;
  emptyCylinderReceivables: string;
  emptyCylindersReceivable: string;
  emptyCylindersInStock: string;
  emptyCylinderInventoryAndReceivables: string;
  ongoingShipments: string;
  outstandingShipments: string;
  noOutstandingOrders: string;
  enterAssignedAreaRoute: string;
  enterEmailAddress: string;
  enterEmergencyContactName: string;
  enterEmergencyContactNumber: string;
  enterFullAddress: string;
  enterFullName: string;
  enterLicenseNumber: string;
  enterPhoneNumber: string;
  error: string;
  errorFetchingCylindersSummaryData: string;
  errorFetchingDailyInventoryData: string;
  errorFetchingInventoryData: string;
  expense: string;
  expenseManagement: string;
  exportFunctionalityComingSoon: string;
  failedToCreateUser: string;
  failedToDeleteDriver: string;
  failedToDeleteUser: string;
  failedToFetchUsers: string;
  failedToLoadInventoryData: string;
  failedToUpdateDriver: string;
  failedToUpdateUser: string;
  fetchingCylindersSummaryData: string;
  filterByDriverType: string;
  fri: string;
  from: string;
  fullAccess: string;
  fullCylinders: string;
  fullName: string;
  generalSettings: string;
  getStartedByAddingFirstExpense: string;
  hour: string;
  hours: string;
  individualDailySalesData: string;
  info: string;
  inventoryManagement: string;
  joiningDate: string;
  justNow: string;
  kPending: string;
  language: string;
  last7Days: string;
  lastMonth: string;
  lastLogin: string;
  lastUpdated: string;
  latest: string;
  licenseNumber: string;
  loadingDailySalesData: string;
  loadingDriverPerformance: string;
  loadingInventoryData: string;
  loadingText: string;
  locationInformation: string;
  login: string;
  lpgDistributorManagementSystem: string;
  manageBudgets: string;
  manageCategories: string;
  manageLiabilities: string;
  manager: string;
  managers: string;
  manageSystemRoles: string;
  manageTeam: string;
  mon: string;
  monitorCylinderStock: string;
  needAdminPrivileges: string;
  never: string;
  newSale: string;
  noActiveDriversFoundForThisPeriod: string;
  noDailyInventoryDataAvailable: string;
  noDailySalesDataFound: string;
  noDataFound: string;
  noEmptyCylindersInInventory: string;
  noFullCylindersInInventory: string;
  notApplicable: string;
  note: string;
  noUsersFound: string;
  operationFailed: string;
  operations: string;
  outstanding: string;
  packagePurchase: string;
  packageRefillPurchase: string;
  packageRefillSales: string;
  packageSale: string;
  packageSalesQty: string;
  parentCategory: string;

  // Category Management
  categoryManagement: string;
  addNewCategory: string;
  parentCategories: string;
  subCategories: string;
  subCategoriesTitle: string;
  noParentCategoriesFound: string;
  noSubCategoriesFound: string;
  editParentCategory: string;
  deleteParentCategory: string;
  editCategory: string;
  deleteCategory: string;
  createCategory: string;
  updateCategory: string;
  updateParentCategory: string;
  budget: string;
  spentThisMonth: string;
  noBudget: string;
  overBudget: string;
  parent: string;
  noParent: string;
  unknownParent: string;
  loadingCategories: string;

  // Category Form
  categoryType: string;
  subCategoryWithBudget: string;
  parentCategoryGroupingOnly: string;
  enterCategoryName: string;
  enterCategoryDescription: string;
  monthlyBudget: string;
  noParentCategory: string;
  leaveEmptyForNoBudgetLimit: string;

  pay: string;
  paymentReceived: string;
  pending: string;
  pendingApproval: string;
  performanceStatistics: string;
  permissions: string;
  personalInformation: string;
  phoneNumber: string;
  pleaseLogInToAccessUserManagement: string;
  producentsWithLowStockWarning: string;
  productsBelowMinimumThreshold: string;
  productsInCriticalStock: string;
  productsInGoodStock: string;
  productsOutOfStock: string;
  purchase: string;
  rahmanSoldCylinders: string;
  realTimeInventoryTracking: string;
  receivableManagement: string;
  receivableRecords: string;
  recentActivity: string;
  recordDailySales: string;
  refillPurchase: string;
  refillSale: string;
  refillSalesQty: string;
  refreshData: string;
  rejectExpense: string;
  reportsAnalytics: string;
  retail: string;
  retailDriver: string;
  sale: string;
  retailDriverDescription: string;
  retailDrivers: string;
  retry: string;
  return: string;
  rolePermissions: string;
  routeArea: string;
  salesInventoryAndDriverManagement: string;
  salesTrend: string;
  salesValue: string;
  sat: string;
  saveError: string;
  saveSuccess: string;
  searchExpenses: string;
  selectDriverType: string;
  selectStatus: string;
  shipment: string;
  shipmentDriverDescription: string;
  shipmentDrivers: string;
  size: string;
  statusAndNotes: string;
  stock: string;
  stockReplenished: string;
  submittedBy: string;
  success: string;
  sumAllDriversSalesForDate: string;
  sumCompletedEmptyCylinderShipments: string;
  sumCompletedShipmentsFromShipmentsPage: string;
  sun: string;
  systemUsers: string;
  tasks: string;
  teamAccess: string;
  thisActionCannotBeUndone: string;
  thisMonth: string;
  thu: string;
  timezone: string;
  to: string;
  today: string;
  todaysEmptyCylinders: string;
  todaysFullCylinders: string;
  todaysPurchases: string;
  todaysSales: string;
  topDriverPerformance: string;
  totalCylinderReceivables: string;
  totalCylinders: string;
  totalCylindersReceivables: string;
  totalReceivables: string;
  totalSales: string;
  totalSalesQty: string;
  totalSalesThisMonth: string;
  totalUsers: string;
  trackCustomerCredits: string;
  trackCustomerPayments: string;
  trackExpenses: string;
  trackExpensesAndManageBudgets: string;
  trackPerformance: string;
  tue: string;
  unknown: string;
  updateDriver: string;
  updateExpense: string;
  updatePayment: string;
  updateUser: string;
  updating: string;
  urgent: string;
  user: string;
  userDetails: string;
  userManagement: string;
  viewDetails: string;
  viewingExpensesFor: string;
  viewReceipt: string;
  viewReports: string;
  warning: string;
  wed: string;
  week: string;
  yesterday: string;
  yesterdaysEmpty: string;
  yesterdaysFull: string;
  fuelExpense: string;
  maintenanceExpense: string;
  officeExpense: string;
  transportExpense: string;
  miscellaneousExpense: string;
  generalExpense: string;
  failedToLoadDailySalesReport: string;
  loadingDailySalesReport: string;
  noReportDataAvailable: string;
  tryAgainOrSelectDate: string;
  comprehensiveDailySalesReport: string;
  totalSalesValue: string;
  totalDeposited: string;
  totalExpenses: string;
  availableCash: string;
  totalCashReceivables: string;
  changeInReceivablesCashCylinders: string;
  dailyDepositsExpenses: string;
  detailedBreakdownDepositsExpenses: string;
  deposits: string;
  particulars: string;
  noDepositsFound: string;
  totalDepositsCalculated: string;
  noExpensesFound: string;
  totalExpensesCalculated: string;
  totalAvailableCash: string;
  totalDepositsIncludingSales: string;

  // Sales and inventory forms
  customerName: string;

  // Sales form specific translations
  selectADriver: string;
  enterCustomerName: string;
  customerNamePlaceholder: string;
  saleItems: string;
  itemNumber: string;
  selectAProduct: string;
  packagePrice: string;
  refillPrice: string;
  itemTotal: string;
  saleSummary: string;
  paymentType: string;
  paymentTypeRequired: string;
  bankTransfer: string;
  mfs: string;
  mobileFinancialService: string;
  credit: string;
  cylinderCredit: string;
  cashDeposited: string;
  cylinderDeposits: string;
  cylinderDepositsBySize: string;
  cylindersDeposited: string;
  maxQuantity: string;
  additionalNotes: string;
  additionalNotesPlaceholder: string;
  totalQuantityLabel: string;
  totalValueLabel: string;
  totalDiscountLabel: string;
  netValueLabel: string;
  cashReceivableWarning: string;
  customerNameRecommended: string;
  cylinderReceivableWarning: string;
  lowStockWarning: string;
  cylindersRemaining: string;
  loadingFormData: string;

  // Form validation messages
  driverRequired: string;
  productRequired: string;
  packageSaleCannotBeNegative: string;
  refillSaleCannotBeNegative: string;
  packagePriceCannotBeNegative: string;
  refillPriceCannotBeNegative: string;
  quantityAndPriceRequired: string;
  atLeastOneSaleItemRequired: string;
  discountCannotBeNegative: string;
  cashDepositedCannotBeNegative: string;
  cylinderDepositsCannotBeNegative: string;
  available: string;
  for: string;

  // Sales page specific translations
  readOnly: string;
  areYouSure: string;
  deleteConfirmation: string;
  salesEntries: string;
  cannotBeUndone: string;
  successfullyDeleted: string;
  on: string;
  thisWillDelete: string;
  failedToLoadDailySalesData: string;
  combinedSaleCreatedSuccessfully: string;
  failedToCreateSale: string;
  failedToLoadEntryDataForEditing: string;
  salesEntryUpdatedSuccessfully: string;
  failedToUpdateSalesEntry: string;
  failedToDeleteSales: string;

  // Settings and admin
  adminPanel: string;
  systemAdministration: string;
  viewDistributorDashboard: string;
  signOut: string;
  lightMode: string;
  darkMode: string;
  systemTheme: string;

  // Shipments and purchase orders
  shipmentsManagement: string;
  trackPurchaseOrdersAndShipments: string;
  newPurchase: string;
  emptyCylinderBuySell: string;
  allShipments: string;
  outstandingOrders: string;
  completedOrders: string;
  allCompanies: string;
  allProducts: string;
  fromDate: string;
  toDate: string;
  clearFilters: string;
  loadingShipments: string;
  noShipmentsFound: string;
  invoice: string;
  units: string;
  gas: string;
  unit: string;
  unitCost: string;
  gasCost: string;
  cylinderCost: string;
  vehicle: string;
  markAsFulfilled: string;
  totalItems: string;
  totalCost: string;
  editPurchaseOrder: string;
  createNewPurchaseOrder: string;
  step: string;
  orderInformation: string;
  selectCompany: string;
  selectACompany: string;
  selectDriver: string;
  shipmentDate: string;
  expectedDeliveryDate: string;
  invoiceNumber: string;
  enterInvoiceNumber: string;
  paymentTerms: string;
  cashOnDelivery: string;
  net30Days: string;
  net60Days: string;
  advancePayment: string;
  priority: string;
  low: string;
  normal: string;
  high: string;
  vehicleNumber: string;
  enterVehicleNumber: string;
  enterAdditionalNotes: string;
  addLineItem: string;
  selectProduct: string;
  selectCompanyFirst: string;
  package: string;
  refill: string;
  gasPrice: string;
  cylinderPrice: string;
  taxRate: string;
  lineTotalPreview: string;
  packageInfo: string;
  refillInfo: string;
  addItem: string;
  purchaseItems: string;
  qty: string;
  lineTotal: string;
  action: string;
  editItem: string;
  removeItem: string;
  remove: string;
  totalPurchaseValue: string;
  orderPreview: string;
  orderSummary: string;
  totalQuantity: string;
  companyRequired: string;
  shipmentDateRequired: string;
  atLeastOneLineItemRequired: string;
  creating: string;
  updatePurchaseOrder: string;
  createPurchaseOrder: string;

  // Empty cylinder transactions
  transactionType: string;
  buyEmptyCylinders: string;
  sellEmptyCylinders: string;
  addEmptyCylindersToInventory: string;
  removeEmptyCylindersFromInventory: string;
  cylinderSize: string;
  selectCylinderSize: string;
  emptyCylindersNote: string;
  transactionDate: string;
  enterTransactionDetails: string;
  buy: string;
  sell: string;
  emptyCylinderTransaction: string;
  directTransaction: string;
  cylinderBuyTransaction: string;
  cylinderSellTransaction: string;

  // Analytics page specific translations
  comprehensiveProfitabilityAnalysis: string;
  visualRepresentationProfitByProduct: string;
  individualDriverPerformanceMetrics: string;
  comparativeAnalysisRevenueByDriver: string;
  monthlyRevenue: string;
  monthlyProfit: string;
  monthlyExpenses: string;
  allExpenses: string;
  totalProfit: string;
  profit: string;
  buyingPrice: string;
  commission: string;
  fixedCost: string;
  breakevenPrice: string;
  sellingPrice: string;
  costPerUnit: string;
  avgCostPerUnit: string;
  failedToLoadData: string;
  errorLoadingData: string;
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;

  // Month names for driver page
  july2025: string;
  june2025: string;
  may2025: string;
  april2025: string;
  march2025: string;
  february2025: string;
  january2025: string;
  december2024: string;
  november2024: string;
  october2024: string;

  // High priority missing keys from audit
  selectTime: string;

  // Dashboard error messages and loading states
  failedToLoadDashboardData: string;
  failedToLoadDashboardDataRefresh: string;
  errorLoadingCombinedDashboardData: string;
  sessionExpiredRedirectingToLogin: string;
  loadingDashboard: string;

  // Mobile dashboard specific
  realTimeOverview: string;
  orders: string;
  stockLevel: string;
  liveActivity: string;
  last15Minutes: string;
  targetProgress: string;
  performanceIndicators: string;
  inventoryHealth: string;
  attentionNeeded: string;
  good: string;
  collectionRate: string;
  profitMargin: string;
  salesDetails: string;
  viewDetailedSalesBreakdown: string;
  salesBreakdown: string;
  detailedSalesAnalytics: string;
  averageOrderValue: string;
  driverPerformance: string;
  topPerformersAndRankings: string;
  driverRankings: string;
  performanceLeaderboard: string;
  detailedViewAndTrends: string;
  vsYesterday: string;

  // Additional dashboard metrics
  revenueAmount: string;
  performancePercentage: string;
  chartDataFallback: string;
  weeklyPerformance: string;
  dailyAverage: string;
  monthlyTarget: string;
  quarterlyGrowth: string;
  driverCompletedSale: string;
  salesTrendUp: string;
  salesTrendDown: string;

  // Driver management interface translations

  // AddDriverForm translations

  // Form validation messages for drivers

  // Driver deletion confirmation

  // Dashboard notifications and alerts

  // Inventory console messages

  // Form validation messages
  addressMustBeAtLeast10Characters: string;
  addressTooLong: string;
  areaMustBeAtLeast2Characters: string;
  areaTooLong: string;
  driverTypeIsRequired: string;
  emergencyContactMustBeAtLeast10Digits: string;
  emergencyContactNameMustBeAtLeast2Characters: string;
  emergencyContactTooLong: string;
  invalidEmailAddress: string;
  licenseNumberMustBeAtLeast5Characters: string;
  licenseNumberTooLong: string;
  nameMustBeAtLeast2Characters: string;
  nameTooLong: string;
  phoneNumberMustBeAtLeast10Digits: string;
  phoneNumberTooLong: string;
  statusIsRequired: string;

  // Language and locale related
  bn: string;
  en: string;
  locale: string;
  key: string;
  value: string;

  // Alert types and notifications
  allAlerts: string;
  critical: string;
  criticalAlerts: string;
  infoAlerts: string;
  warningAlerts: string;
  inventoryAlert: string;
  performanceAlert: string;
  stockAlert: string;
  systemNotification: string;

  // Data and metrics
  completionPercentage: string;
  dashboardDataUpdated: string;
  dataNotFound: string;
  isComplete: string;
  liveDataFeed: string;
  metricsLastUpdated: string;
  missingKeys: string;
  newSalesActivity: string;
  optional: string;
  recentSaleActivity: string;
  totalKeys: string;
  testCredentials: string;
  translatedKeys: string;

  // Inventory and stock statuses
  lowStock: string;
  outOfStock: string;
  overduePayments: string;
  overstock: string;

  // Performance trends
  performanceTrendDown: string;
  performanceTrendStable: string;
  performanceTrendUp: string;
  salesTrendStable: string;
  targetAchieved: string;
  topPerformer: string;

  // Operations and actions
  deleteDriver: string;
  failedToLoadAlerts: string;
  failedToLoadInventoryAlerts: string;
  movementAnomaly: string;
  operationSuccessful: string;

  // Onboarding translations
  welcomeToOnboarding: string;
  setupYourBusinessData: string;
  companyNames: string;
  productSetup: string;
  inventoryQuantities: string;
  driversSetup: string;
  receivablesSetup: string;
  skipOnboarding: string;
  completing: string;
  completeSetup: string;
  setupBusiness: string;

  // Company step
  addCompanyNames: string;
  addCompaniesYouDistributeFor: string;
  addNewCompany: string;
  enterCompanyNamesLikeAygaz: string;
  companyName: string;
  companyCode: string;
  enterCompanyName: string;
  companyNameRequired: string;
  companyAlreadyExists: string;
  addedCompanies: string;
  companiesYouDistributeFor: string;
  noCompaniesAdded: string;
  addAtLeastOneCompany: string;

  // Product step
  setupProductsAndSizes: string;
  configureCylinderSizesAndProducts: string;
  cylinderSizes: string;
  addSizesLike12L20L: string;
  enterSizeLike12L: string;
  addSize: string;
  cylinderSizeRequired: string;
  cylinderSizeAlreadyExists: string;
  enterDescription: string;
  addProduct: string;
  addNewProduct: string;
  addProductsForEachCompany: string;
  productName: string;
  enterProductName: string;
  enterProductNameExample: string;
  currentPrice: string;
  enterPrice: string;
  productNameRequired: string;
  validPriceRequired: string;
  productAlreadyExists: string;
  addedProducts: string;
  addCylinderSizesAndProducts: string;
  bothRequiredToProceed: string;

  // Inventory step
  setInitialInventory: string;
  enterCurrentFullCylinderQuantities: string;
  fullCylinderInventory: string;
  enterQuantityForEachProduct: string;
  noProductsAvailable: string;
  addProductsFirst: string;
  totalProducts: string;
  totalFullCylinders: string;

  // Empty cylinders step
  setEmptyCylinderInventory: string;
  enterCurrentEmptyCylinderQuantities: string;
  emptyCylinderInventory: string;
  enterQuantityForEachSize: string;
  noCylinderSizesAvailable: string;
  addCylinderSizesFirst: string;
  totalSizes: string;
  totalEmptyCylinders: string;
  emptyCylinderNote: string;
  emptyCylinderStockReceivablesNote: string;

  // Drivers step
  addYourDrivers: string;
  addDriversWhoWillSellProducts: string;
  enterDriverInformation: string;
  enterDriverName: string;
  shipmentDriver: string;
  driverNameRequired: string;
  driverAlreadyExists: string;
  addedDrivers: string;
  driversInYourTeam: string;
  noContactInfo: string;
  noDriversAdded: string;
  addAtLeastOneDriver: string;

  // Receivables step
  setupReceivables: string;
  enterCurrentReceivablesForEachDriver: string;
  driverReceivables: string;
  enterCashAndCylinderReceivables: string;
  amountOwedByCustomers: string;
  cylindersOwedByCustomers: string;
  cylindersOwedByCustomersBySize: string;
  noDriversAvailable: string;
  addDriversFirst: string;
  noRetailDriversAvailable: string;
  addRetailDriversFirst: string;
  receivablesSummary: string;

  // Admin onboarding
  manualBusinessOnboarding: string;
  businessInformation: string;
  businessName: string;
  businessNamePlaceholder: string;
  subdomain: string;
  subdomainPlaceholder: string;
  plan: string;
  freemium: string;
  professional: string;
  enterprise: string;
  adminUser: string;
  adminName: string;
  adminNamePlaceholder: string;
  adminEmail: string;
  adminEmailPlaceholder: string;
  adminPassword: string;
  strongPassword: string;
  creatingBusiness: string;
  onboardBusiness: string;
  businessOnboardedSuccessfully: string;
  businessCreatedWithAdmin: string;
  failedToOnboardBusiness: string;
  networkErrorOccurred: string;

  // API errors
  unauthorized: string;
  userNotFound: string;
  onboardingAlreadyCompleted: string;
  failedToCompleteOnboarding: string;
  failedToCheckOnboardingStatus: string;
  failedToLoadAssetsLiabilities: string;
  fixedAsset: string;
  currentAsset: string;
  failedToUpdateAsset: string;
  failedToUpdateLiability: string;
  failedToCreateAsset: string;
  failedToCreateLiability: string;
  areYouSureDeleteAsset: string;
  assetDeletedSuccessfully: string;
  failedToDeleteAsset: string;
  unitValueUpdatedSuccessfully: string;
  failedToUpdateUnitValue: string;
  areYouSureDeleteLiability: string;
  liabilityDeletedSuccessfully: string;
  failedToDeleteLiability: string;
  assetsAndLiabilities: string;
  addAssetsLiabilities: string;
  netWorth: string;
  depreciation: string;
  companyAssets: string;
  assetName: string;
  unitValue: string;
  netValue: string;
  auto: string;
  editAsset: string;
  deleteAsset: string;
  companyLiabilities: string;
  liability: string;
  monthlyPayment: string;
  notAvailable: string;
  failedToSaveCompany: string;
  failedToSaveProduct: string;
  areYouSureDeleteCompany: string;
  areYouSureDeleteProduct: string;
  failedToDeleteProduct: string;
  areYouSureDeleteCylinderSize: string;
  searchCompanies: string;
  addCompany: string;
  editCompany: string;
  createCompany: string;
  updateCompany: string;
  deleteCompany: string;
  activeProducts: string;
  totalStock: string;
  companies: string;
  searchProducts: string;
  created: string;
  full: string;
  empty: string;
  clickToDeactivate: string;
  clickToActivate: string;
  editProduct: string;
  deleteProduct: string;
  searchCylinderSizes: string;
  productNamePlaceholder: string;
  cylinderSizePlaceholder: string;
  optionalDescription: string;
  failedToFetchCylinderSizes: string;
  areYouSureDeleteCustomerReceivable: string;

  // Asset and Receivables translations
  dueDate: string;
  noDate: string;
  invalidDate: string;
  noTimestamp: string;
  invalidTimestamp: string;
  current: string;
  dueSoon: string;
  overdue: string;
  paid: string;
  failedToFetchReceivables: string;
  receivablesRecalculatedSuccessfully: string;
  failedToRecalculateReceivables: string;
  failedToFetchReceivablesChanges: string;
  customerReceivableUpdatedSuccessfully: string;
  customerReceivableAddedSuccessfully: string;
  failedToSaveCustomerReceivable: string;
  customerReceivableDeletedSuccessfully: string;
  failedToDeleteCustomerReceivable: string;
  paymentRecordedSuccessfully: string;
  failedToRecordPayment: string;
  cylinderReturnRecordedSuccessfully: string;
  failedToRecordCylinderReturn: string;
  cylinderReceivable: string;
  enterPaymentAmount: string;
  enterNumberOfCylinders: string;
  recordPayment: string;
  recordCylinderReturn: string;
  recordReturn: string;
  customerReceivablesDontMatch: string;
  editCustomerReceivable: string;
  addCustomerReceivable: string;
  cashReceivable: string;
  driverTotalReceivablesFromSales: string;
  customerReceivableTotalsMustEqual: string;
  cashMismatch: string;
  customerTotal: string;
  salesTotal: string;
  difference: string;
  cylinderMismatch: string;
  customersWithOverduePayments: string;
  requireImmediate: string;
  receivablesManagementSystemRules: string;
  driverTotalReceivables: string;
  automaticallyCalculatedFromSales: string;
  customerReceivablesManuallyManaged: string;
  validation: string;
  customerTotalsMustEqualDriverSales: string;
  payments: string;
  paymentsAutomaticallyAdded: string;
  changesLogAllReceivableActions: string;
  managerAccess: string;
  youCanRecordPayments: string;
  salesCashReceivables: string;
  fromSalesData: string;
  salesCylinderReceivables: string;
  companyCreatedUpdatedSuccessfully: string;
  productCreatedUpdatedSuccessfully: string;
  productDeletedSuccessfully: string;
  refreshingList: string;
  productListRefreshed: string;
  productListRefreshedAfterDeletion: string;
  errorFetchingCompanies: string;
  errorFetchingProducts: string;
  errorFetchingCylinderSizes: string;
  errorSavingCompany: string;
  errorSavingProduct: string;
  errorDeletingCompany: string;
  errorDeletingProduct: string;
  errorDeletingCylinderSize: string;
  errorTogglingProductStatus: string;
  errorSavingCylinderSize: string;
  failedToSaveCylinderSize: string;
  cylinderSizeDeletedSuccessfully: string;
  price: string;
  weight: string;
  fullCylinderWeight: string;
  emptyCylinderWeight: string;
  lowStockThreshold: string;
  assetCreatedSuccessfully: string;
  receivableType: string;
  mobile: string;
  bank: string;
  transfer: string;
  enterAmount: string;
  enterQuantity: string;
  enterNotes: string;
  selectSize: string;
  selectPaymentMethod: string;
  changes: string;
  loadingReceivables: string;
  loadingChanges: string;
  editLiability: string;
  deleteLiability: string;

  // Additional assets page translations
  asset: string;
  liabilityWord: string;
  autoCalculated: string;
  autoCalculatedFromInventory: string;

  setUnitPrice: string;
  editable: string;
  autoCalculatedCurrentAssets: string;
  noAutoCalculatedAssetsFound: string;
  autoCalculatedAssetsDescription: string;
  updated: string;

  successfully: string;
  failedToUpdateCreateEntry: string;
  assetPlaceholder: string;
  realTimeValuesLinkedToBusinessOperations: string;

  // Balance Sheet and Quick Actions
  balanceSheetSummary: string;
  totalAssets: string;
  totalLiabilities: string;
  netEquity: string;
  quickAddAsset: string;
  addNewAssetToPortfolio: string;
  addAsset: string;
  quickAddLiability: string;
  addNewLiabilityToRecords: string;
  addLiability: string;

  // Asset descriptions

  outstandingCashReceivablesFromDrivers: string;

  cashInHand: string;
  availableCashCalculatedFromDeposits: string;

  // Depreciation schedule
  assetDepreciationSchedule: string;
  assetsWithDepreciationRates: string;
  originalCost: string;
  purchaseDate: string;
  depreciationMethod: string;
  annualRate: string;
  yearsOwned: string;
  accumulated: string;
  currentValue: string;
  noAssetsWithDepreciationFound: string;
  addAssetsWithPurchaseDates: string;
  addDepreciableAsset: string;

  // Other missing translations

  loan: string;

  // Asset name translations
  cashReceivablesAsset: string;
  cashInHandAsset: string;

  editAssetTitle: string;

  editLiabilityTitle: string;
  enterAssetName: string;
  enterLiabilityName: string;
  enterValue: string;
  vehicles: string;
  equipment: string;
  property: string;
  assetUpdatedSuccessfully: string;
  liabilityUpdatedSuccessfully: string;
  liabilityCreatedSuccessfully: string;

  depreciationRate: string;
  subCategory: string;

  noAssetsFound: string;
  noLiabilitiesFound: string;

  // Missing inventory page translations
  trackAndManageYourCylinderInventory: string;
  noInventoryDataAvailable: string;
  hideMovements: string;
  showMovements: string;
  fromDrivers: string;
  availableForRefill: string;
  noFullCylindersAvailable: string;
  noEmptyCylindersAvailable: string;
  noEmptyCylindersOfSizeAvailable: string;
  automatedInventoryCalculationsForCylinders: string;
}

const englishTranslations: Translations = {
  // Navigation
  dashboard: 'Dashboard',
  sales: 'Sales',
  drivers: 'Drivers',
  shipments: 'Shipments',
  receivables: 'Receivables',
  assets: 'Assets',
  expenses: 'Expenses',
  settings: 'Settings',
  inventory: 'Inventory',
  users: 'Users',
  reports: 'Reports',
  productManagement: 'Product Management',
  dailySalesReport: 'Daily Sales Report',
  analytics: 'Analytics',

  // Auth Pages
  signInToYourAccount: 'Sign in to your account',
  createYourAccount: 'Create your account',
  signInToExistingAccount: 'sign in to your existing account',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  rememberMe: 'Remember me',
  forgotPassword: 'Forgot your password?',
  resetYourPassword: 'Reset your password',
  enterEmailForPasswordReset:
    "Enter your email address and we'll send you a link to reset your password.",
  passwordResetLinkSent:
    "If an account with that email exists, we've sent a password reset link.",
  sendResetLink: 'Send reset link',
  backToSignIn: 'Back to sign in',
  pleaseEnterYourEmailAddress: 'Please enter your email address',
  pleaseEnterAValidEmailAddress: 'Please enter a valid email address',
  signingIn: 'Signing in...',
  createAccount: 'Create Account',
  termsOfService: 'Terms of Service',
  privacyPolicy: 'Privacy Policy',
  agreeToTerms: 'I agree to the',
  passwordsDontMatch: "Passwords don't match",
  passwordMinLength: 'Password must be at least 8 characters long',
  registrationFailed: 'Registration failed',
  anErrorOccurred: 'An error occurred',
  accountCreatedSuccessfully: 'Account created successfully! Please sign in.',

  // Placeholders
  fullNamePlaceholder: 'e.g., John Doe',
  companyNamePlaceholder: 'e.g., Dhaka Gas Distributors Ltd.',
  passwordPlaceholder: 'At least 8 characters',
  confirmPasswordPlaceholder: 'Confirm your password',

  // Home Page
  manageLpgDistributionBusiness:
    'Manage LPG distribution business with comprehensive tools and analytics',
  salesManagement: 'Sales Management',
  inventoryControl: 'Inventory Control',
  financialReports: 'Financial Reports',
  dailySalesRetailDrivers:
    'Track daily sales, manage drivers, and monitor performance with real-time updates.',
  automatedCalculationsExactFormulas:
    'Automated inventory calculations for full and empty cylinders with exact formulas.',
  viewComprehensiveReports:
    'Comprehensive financial reporting with income statements and balance sheets.',

  adminDashboardTitle: 'Admin Dashboard',
  adminDashboardDescription: 'System overview and metrics',
  companyManagementTitle: 'Company Management',
  companyManagementDescription: 'Manage LPG companies and suppliers',
  productManagementTitle: 'Product Management',
  productManagementDescription: 'Manage product variants and pricing',
  distributorAssignmentsTitle: 'Distributor Assignments',
  distributorAssignmentsDescription:
    'Assign companies/products to distributors',
  pricingManagementTitle: 'Pricing Management',
  pricingManagementDescription: 'Manage pricing tiers and assignments',
  userManagementTitle: 'User Management',
  userManagementDescription: 'Manage system users and permissions',
  systemAnalyticsTitle: 'System Analytics',
  systemAnalyticsDescription: 'Platform usage and performance metrics',
  auditLogsTitle: 'Audit Logs',
  auditLogsDescription: 'View system activity and changes',
  systemSettingsTitle: 'System Settings',
  systemSettingsDescription: 'Configure global system settings',

  // Common Actions
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  search: 'Search',
  filter: 'Filter',
  total: 'Total',
  actions: 'Actions',
  noQuickActionsAvailable: 'No quick actions available',
  noPageAccessPermissions: 'No Page Access Permissions',
  contactAdminForPageAccess:
    'Your administrator needs to assign page permissions to your account. Please contact them to access dashboard pages.',
  active: 'Active',
  inactive: 'Inactive',
  editCompany: 'Edit Company',
  createCompany: 'Create Company',
  updateCompany: 'Update Company',
  deleteCompany: 'Delete Company',
  editProduct: 'Edit Product',
  deleteProduct: 'Delete Product',
  cylinderSizes: 'Cylinder Sizes',
  full: 'Full',
  empty: 'Empty',
  loading: 'Loading...',
  units: 'units',
  clickToDeactivate: 'Click to deactivate',
  clickToActivate: 'Click to activate',
  product: 'product',
  areYouSureDeleteCompany:
    'Are you sure you want to delete this company? This will also delete all associated products.',
  areYouSureDeleteProduct: 'Are you sure you want to delete this product?',
  areYouSureDeleteCylinderSize:
    'Are you sure you want to delete this cylinder size?',
  failedToSaveCompany: 'Failed to save company',
  failedToSaveProduct: 'Failed to save product',
  failedToDeleteProduct: 'Failed to delete product',
  unknownError: 'Unknown error',

  // Product management page specific translations
  noProductsFound: 'No products found',
  noCylinderSizesFound: 'No cylinder sizes found',
  cylinderTypeSize: 'Cylinder Type/Size',
  selectFromAvailableCylinderSizes: 'Select from available cylinder sizes',
  selectCylinderSize: 'Select Cylinder Size',
  manageCylinderSizes: 'Manage cylinder sizes',
  threshold: 'Threshold',
  addCylinderSize: 'Add Cylinder Size',
  editCylinderSize: 'Edit Cylinder Size',
  createCylinderSize: 'Create Cylinder Size',
  updateCylinderSize: 'Update Cylinder Size',
  deleteCylinderSize: 'Delete Cylinder Size',
  enterCylinderSizeExample: 'Enter cylinder size (e.g., 12L, 35L, 5kg, 20L)',
  createProduct: 'Create Product',
  updateProduct: 'Update Product',

  // User management form translations
  addNewUser: 'Add New User',
  enterFullNamePlaceholder: 'Enter full name',
  enterEmailAddressPlaceholder: 'Enter email address',
  enterPasswordPlaceholder: 'Enter password (min 8 characters)',
  pageAccessPermissions: 'Page Access Permissions',
  selectAll: 'Select All',
  selectNone: 'Select None',
  overview: 'Overview',
  finance: 'Finance',
  administration: 'Administration',

  // Permission selector UI
  pages: 'pages',
  all: 'All',
  some: 'Some',
  none: 'None',
  selected: 'Selected:',
  of: 'of',

  // Page names for permissions
  dashboardPage: 'Dashboard',
  dailySalesReportPage: 'Daily Sales Report',
  inventoryPage: 'Inventory',
  analyticsPage: 'Analytics',
  salesPage: 'Sales',
  receivablesPage: 'Receivables',
  expensesPage: 'Expenses',
  shipmentsPage: 'Shipments',
  assetsPage: 'Assets',
  driversPage: 'Drivers',
  productManagementPage: 'Product Management',
  reportsPage: 'Reports',
  usersPage: 'Users',
  userManagementPage: 'User Management',
  settingsPage: 'Settings',

  // Page descriptions
  mainDashboardOverview: 'Main dashboard overview',
  viewDailySalesReports: 'View daily sales reports',
  manageInventoryAndStockLevels: 'Manage inventory and stock levels',
  businessAnalyticsAndInsights: 'Business analytics and insights',
  manageSalesTransactions: 'Manage sales transactions',
  trackCustomerReceivables: 'Track customer receivables',
  manageBusinessExpenses: 'Manage business expenses',
  trackShipmentsAndDeliveries: 'Track shipments and deliveries',
  manageCompanyAssets: 'Manage company assets',
  manageDriversAndAssignments: 'Manage drivers and assignments',
  manageProductsAndPricing: 'Manage products and pricing',
  generateBusinessReports: 'Generate business reports',
  manageSystemUsers: 'Manage system users',
  systemSettingsAndConfiguration: 'System settings and configuration',

  // Assets form translations
  addNew: 'Add New',
  assetValue: 'Asset Value',
  optionalDescriptionPlaceholder: 'Optional description',
  enterAssetNamePlaceholder: 'Enter asset name',
  enterLiabilityNamePlaceholder: 'Enter liability name',

  // Asset translations
  dueDate: 'Due Date',
  noDate: 'No Date',
  invalidDate: 'Invalid Date',
  noTimestamp: 'No Timestamp',
  invalidTimestamp: 'Invalid Timestamp',
  current: 'Current',
  dueSoon: 'Due Soon',
  overdue: 'Overdue',
  paid: 'Paid',

  // Receivables translations
  failedToFetchReceivables: 'Failed to fetch receivables',
  receivablesRecalculatedSuccessfully: 'Receivables recalculated successfully',
  failedToRecalculateReceivables: 'Failed to recalculate receivables',
  failedToFetchReceivablesChanges: 'Failed to fetch receivables changes',
  customerReceivableUpdatedSuccessfully:
    'Customer receivable updated successfully',
  customerReceivableAddedSuccessfully: 'Customer receivable added successfully',
  addCustomerReceivable: 'Add Customer Receivable',
  editCustomerReceivable: 'Edit Customer Receivable',
  customerNamePlaceholder: 'Enter customer name...',
  cashReceivable: 'Cash Receivable',
  cylinderReceivable: 'Cylinder Receivable',
  enterPaymentAmount: 'Enter amount',
  failedToSaveCustomerReceivable: 'Failed to save customer receivable',
  customerReceivableDeletedSuccessfully:
    'Customer receivable deleted successfully',
  failedToDeleteCustomerReceivable: 'Failed to delete customer receivable',
  paymentRecordedSuccessfully: 'Payment recorded successfully',
  failedToRecordPayment: 'Failed to record payment',
  cylinderReturnRecordedSuccessfully: 'Cylinder return recorded successfully',
  failedToRecordCylinderReturn: 'Failed to record cylinder return',
  enterNumberOfCylinders: 'Enter number of cylinders',
  recordPayment: 'Record Payment',
  recordCylinderReturn: 'Record Cylinder Return',
  recordReturn: 'Record Return',
  customerReceivablesDontMatch: "Customer receivables don't match",
  driverTotalReceivablesFromSales: 'Driver Total Receivables (from Sales)',
  customerReceivableTotalsMustEqual: 'Customer Receivable Totals Must Equal',
  cashMismatch: 'Cash Mismatch',
  customerTotal: 'Customer Total',
  salesTotal: 'Sales Total',
  difference: 'Difference',
  cylinderMismatch: 'Cylinder Mismatch',
  customersWithOverduePayments: 'Customers with Overdue Payments',
  requireImmediate: 'Require Immediate',
  receivablesManagementSystemRules: 'Receivables Management System Rules',
  driverTotalReceivables: 'Driver Total Receivables',
  automaticallyCalculatedFromSales: 'Automatically calculated from sales',
  customerReceivablesManuallyManaged: 'Customer receivables manually managed',
  validation: 'Validation',
  customerTotalsMustEqualDriverSales: 'Customer totals must equal driver sales',
  payments: 'Payments',
  paymentsAutomaticallyAdded: 'Payments automatically added',
  changesLogAllReceivableActions: 'Changes log all receivable actions',
  managerAccess: 'Manager Access',
  youCanRecordPayments: 'You can record payments',
  salesCashReceivables: 'Sales Cash Receivables',
  fromSalesData: 'From Sales Data',
  salesCylinderReceivables: 'Sales Cylinder Receivables',

  companyCreatedUpdatedSuccessfully: 'Company created/updated successfully',
  productCreatedUpdatedSuccessfully: 'Product created/updated successfully',
  productDeletedSuccessfully: 'Product deleted successfully',
  refreshingList: 'refreshing list...',
  productListRefreshed: 'Product list refreshed',
  productListRefreshedAfterDeletion: 'Product list refreshed after deletion',
  errorFetchingCompanies: 'Error fetching companies',
  errorFetchingProducts: 'Error fetching products',
  errorFetchingCylinderSizes: 'Error fetching cylinder sizes',
  errorSavingCompany: 'Error saving company',
  errorSavingProduct: 'Error saving product',
  errorDeletingCompany: 'Error deleting company',
  errorDeletingProduct: 'Error deleting product',
  errorDeletingCylinderSize: 'Error deleting cylinder size',
  errorTogglingProductStatus: 'Error toggling product status',
  errorSavingCylinderSize: 'Error saving cylinder size',

  // Additional Product Management translations
  searchCylinderSizes: 'Search cylinder sizes...',
  productNamePlaceholder: 'e.g., LPG Cylinder, Cooking Gas, Industrial Gas',
  cylinderSizePlaceholder: 'e.g., 12L, 35L, 5kg',
  optionalDescription: 'Optional description',
  failedToSaveCylinderSize: 'Failed to save cylinder size',
  price: 'Price',
  weight: 'Weight',
  fullCylinderWeight: 'Full Cylinder Weight',
  emptyCylinderWeight: 'Empty Cylinder Weight',
  lowStockThreshold: 'Low Stock Threshold',

  // Receivables page translations
  areYouSureDeleteCustomerReceivable:
    'Are you sure you want to delete this customer receivable?',
  noCashReceivables: 'No cash receivables',
  noCylinderReceivables: 'No cylinder receivables',
  receivableType: 'Receivable Type',
  mobile: 'Mobile',
  bank: 'Bank',
  transfer: 'Transfer',
  enterAmount: 'Enter amount',
  enterQuantity: 'Enter quantity',
  enterNotes: 'Enter notes',
  selectSize: 'Select size',
  selectPaymentMethod: 'Select payment method',
  changes: 'Changes',
  loadingReceivables: 'Loading receivables...',
  loadingChanges: 'Loading changes...',
  failedToFetchCylinderSizes: 'Failed to fetch cylinder sizes',

  // Assets page translations
  assetsAndLiabilities: 'Assets and Liabilities',
  companyAssets: 'Company Assets',
  companyLiabilities: 'Company Liabilities',
  addAssetsLiabilities: 'Add Assets/Liabilities',
  netWorth: 'Net Worth',
  depreciation: 'Depreciation',
  assetName: 'Asset Name',
  unitValue: 'Unit Value',
  netValue: 'Net Value',
  liability: 'Liability',
  liabilityName: 'Liability Name',
  monthlyPayment: 'মাসিক পরিশোধ',
  fixedAsset: 'Fixed Asset',
  currentAsset: 'Current Asset',
  currentLiability: 'Current Liability',
  longTermLiability: 'Long-term Liability',
  editAsset: 'Edit Asset',
  deleteAsset: 'Delete Asset',
  editLiability: 'Edit Liability',
  deleteLiability: 'Delete Liability',
  assetDeletedSuccessfully: 'Asset deleted successfully!',
  liabilityDeletedSuccessfully: 'Liability deleted successfully!',
  unitValueUpdatedSuccessfully: 'ইউনিট মূল্য সফলভাবে আপডেট হয়েছে!',
  assetCreatedSuccessfully: 'সম্পদ সফলভাবে তৈরি হয়েছে!',
  assetUpdatedSuccessfully: 'সম্পদ সফলভাবে আপডেট হয়েছে!',
  liabilityCreatedSuccessfully: 'দেনা সফলভাবে তৈরি হয়েছে!',
  liabilityUpdatedSuccessfully: 'দেনা সফলভাবে আপডেট হয়েছে!',
  failedToLoadAssetsLiabilities:
    'সম্পদ ও দেনার ডেটা লোড করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToDeleteAsset: 'সম্পদ মুছতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToDeleteLiability: 'দেনা মুছতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToUpdateUnitValue:
    'ইউনিট মূল্য আপডেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToCreateAsset: 'সম্পদ তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToUpdateAsset: 'সম্পদ আপডেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToCreateLiability:
    'দেনা তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToUpdateLiability:
    'দেনা আপডেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  areYouSureDeleteAsset: 'Are you sure you want to delete this asset?',
  areYouSureDeleteLiability: 'Are you sure you want to delete this liability?',
  purchaseDate: 'ক্রয়ের তারিখ',
  depreciationRate: 'অবচয়ের হার',
  subCategory: 'উপ-বিভাগ',
  autoCalculated: 'স্বয়ংক্রিয়ভাবে গণনা করা',
  auto: 'স্বয়ংক্রিয়',
  noAssetsFound:
    'No assets found. Click "Add Assets/Liabilities" to get started.',
  noLiabilitiesFound:
    'No liabilities found. Click "Add Assets/Liabilities" to get started.',
  addAsset: 'সম্পদ যোগ করুন',
  editAssetTitle: 'সম্পদ সম্পাদনা করুন',
  addLiability: 'দেনা যোগ করুন',
  editLiabilityTitle: 'দেনা সম্পাদনা করুন',
  enterAssetName: 'সম্পদের নাম লিখুন',
  enterLiabilityName: 'দেনার নাম লিখুন',
  enterValue: 'মান লিখুন',
  notAvailable: 'প্রযোজ্য নয়',
  vehicles: 'যানবাহন',
  equipment: 'সরঞ্জাম',
  property: 'সম্পত্তি',
  // Auto-generated missing properties
  noData: 'No Data',
  noRecentActivity: 'No recent activity',
  refresh: 'Refresh',
  recalculate: 'Recalculate',
  export: 'Export',
  view: 'View',
  print: 'Print',
  download: 'Download',
  upload: 'Upload',
  submit: 'Submit',
  next: 'Next',
  previous: 'Previous',
  close: 'Close',
  back: 'Back',
  forward: 'Forward',
  confirm: 'Confirm',
  logout: 'Logout',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  code: 'Code',
  description: 'Description',
  amount: 'Amount',
  totalAmount: 'Total Amount',
  date: 'Date',
  saleDate: 'Sale Date',
  fixedToToday: 'Fixed to Today',
  notes: 'Notes',
  status: 'Status',
  type: 'Type',
  category: 'Category',
  quantity: 'Quantity',
  unitPrice: 'Unit Price',
  discount: 'Discount',
  totalValue: 'Total Value',
  packageSales: 'Package Sales',
  refillSales: 'Refill Sales',
  cylinder: 'Cylinder',
  cylinders: 'Cylinders',
  products: 'Products',
  cash: 'Cash',
  cashDepositsByDriver: 'Cash Deposits By Driver',
  includesReceivablePayments: 'Includes Receivable Payments',
  driverExpense: 'Driver Expense',
  loadingData: 'Loading Data',
  noDataAvailable: 'No Data Available',
  tryAgain: 'Try Again',
  performance: 'Performance',
  month: 'Month',
  year: 'Year',
  allDrivers: 'All Drivers',
  totalRevenue: 'Total Revenue',
  revenue: 'Revenue',
  comingSoon: 'Coming Soon',
  exportReport: 'Export Report',
  exportReportFunctionality: 'রিপোর্ট এক্সপোর্ট সুবিধা',

  // Reports page specific
  generateAndViewComprehensiveBusinessReports:
    'Generate and view comprehensive business reports',
  thisWeek: 'This Week',
  thisQuarter: 'This Quarter',
  customReport: 'Custom Report',
  revenueExpensesAndProfitAnalysis: 'Revenue, expenses, and profit analysis',
  pdf: 'PDF',
  excel: 'Excel',
  last: 'Last',
  assetsLiabilitiesAndEquityOverview:
    'Assets, liabilities, and equity overview',
  cashInflowsAndOutflowsTracking: 'Cash inflows and outflows tracking',
  detailedSalesPerformanceAnalysis: 'Detailed sales performance analysis',
  stockLevelsAndMovementAnalysis: 'Stock levels and movement analysis',
  individualDriverSalesAndEfficiency: 'Individual driver sales and efficiency',
  incomeStatementRealTime: 'Income Statement (Real-time)',
  revenueByTypeDriverWithLiveCalculations:
    'Revenue by type/driver with live calculations',
  costOfGoodsSold: 'Cost of Goods Sold',
  cylinderPurchases: 'Cylinder Purchases',
  grossProfit: 'Gross Profit',
  operatingExpenses: 'Operating Expenses',
  fuelTransportation: 'Fuel & Transportation',
  otherExpenses: 'Other Expenses',
  netIncome: 'Net Income',
  grossMargin: 'Gross Margin',
  balanceSheetAutoValidated: 'Balance Sheet (Auto-validated)',
  balanced: 'Balanced',
  outOfBalance: 'Out of Balance',
  currentAssets: 'Current Assets',
  cashBank: 'Cash & Bank',
  inventoryAutoLinked: 'Inventory (Auto-linked)',
  fixedAssets: 'Fixed Assets',
  buildings: 'Buildings',
  liabilitiesEquity: 'Liabilities & Equity',
  currentLiabilities: 'Current Liabilities',
  shortTermLoans: 'Short-term Loans',
  longTermLiabilities: 'Long-term Liabilities',
  longTermLoans: 'Long-term Loans',
  ownerEquity: 'Owner Equity',
  retainedEarnings: 'Retained Earnings',
  totalLiabEquity: 'Total Liab. & Equity',
  balanceCheck: 'Balance Check',
  assetsEqualsLiabilitiesPlusEquity: 'Assets = Liabilities + Equity',
  passed: 'PASSED',
  cashFlowStatementRealTime: 'Cash Flow Statement (Real-time)',
  operatingInvestingFinancingActivities:
    'Operating, Investing & Financing Activities',
  operatingActivities: 'Operating Activities',
  changeInReceivables: 'Change in Receivables',
  changeInInventory: 'Change in Inventory',
  changeInPayables: 'Change in Payables',
  operatingCashFlow: 'Operating Cash Flow',
  investingActivities: 'Investing Activities',
  vehiclePurchases: 'Vehicle Purchases',
  equipmentPurchases: 'Equipment Purchases',
  investingCashFlow: 'Investing Cash Flow',
  financingActivities: 'Financing Activities',
  ownerDrawings: 'Owner Drawings',
  loanRepayments: 'Loan Repayments',
  financingCashFlow: 'Financing Cash Flow',
  netChangeInCash: 'Net Change in Cash',
  cashAtBeginningOfPeriod: 'Cash at Beginning of Period',
  cashAtEndOfPeriod: 'Cash at End of Period',
  operatingCashFlowIsPositive: 'Operating cash flow is positive',
  healthyBusinessOperations: 'healthy business operations',

  // Additional missing translations
  incomeStatement: 'Income Statement',
  cashFlowStatement: 'Cash Flow Statement',
  salesReport: 'Sales Report',
  inventoryReport: 'Inventory Report',
  thisYear: 'This Year',
  netProfit: 'Net Profit',

  // Dashboard welcome message
  welcomeBack: 'Welcome back',

  // Dashboard activity messages
  sold: 'sold',
  completedSale: 'completed sale',
  lowStockAlert: 'Low stock alert',
  fullCylindersRemaining: 'full cylinders remaining',
  highReceivablesBalance: 'High receivables balance of',
  completedSales: 'completed',
  dailyTargetAchieved: 'daily target achieved!',
  salesMilestone: 'sales - daily target achieved!',
  hoursAgo: 'hours ago',
  minutesAgo: 'minutes ago',

  // Reports page hardcoded strings
  customReportBuilderComingSoon: 'Custom Report Builder coming soon!',
  exportCompleted: 'export completed',
  exportFailed: 'Export failed. Please try again.',
  pleaseRetryAgain: 'Please try again',
  hasBeenEmailedToConfiguredRecipients:
    'has been emailed to configured recipients.',
  emailFailed: 'Email failed. Please check email configuration.',
  pleaseCheckEmailConfiguration: 'Please check email configuration',
  viewDetailsBelow: 'View details below',
  realTime: 'Real-time',
  autoValidated: 'Auto-validated',
  salaries: 'Salaries',
  maintenance: 'Maintenance',
  rent: 'Rent',
  utilities: 'Utilities',
  profitMargin: 'Profit Margin',
  accountsReceivable: 'Accounts Receivable',
  totalAssets: 'Total Assets',
  accountsPayable: 'Accounts Payable',

  customerRecords: 'Customer Records',
  statusBreakdown: 'স্ট্যাটাস বিভাজন',
  noReceivablesFound: 'No Receivables Found',
  noChangesRecorded: 'No Changes Recorded',
  receivablesChangesLog: 'Receivables Changes Log',
  amountPlaceholder: 'Enter amount...',
  enterExpenseDescription: 'Enter Expense Description',
  selectParentCategory: 'Select Parent Category',
  selectCategory: 'Select Category',
  expenseDate: 'Expense Date',
  receiptUrl: 'রশিদের ইউআরএল',
  receiptUrlPlaceholder: 'রশিদের ইউআরএল লিখুন...',
  submitting: 'জমা দেওয়া হচ্ছে...',
  activeDrivers: 'সক্রিয় চালকগণ',
  activeUsers: 'সক্রিয় ব্যবহারকারীগণ',
  addDriver: 'Add Driver',
  addExpense: 'Add Expense',
  additionalNotesComments: 'অতিরিক্ত নোট ও মন্তব্য',
  addNewDriver: 'Add New Driver',
  addUser: 'Add User',
  administrator: 'প্রশাসক',
  administrators: 'প্রশাসকগণ',
  ago: 'আগে',
  alerts: 'সতর্কবার্তা',
  allCalculationsUpdatedRealTime: 'সমস্ত গণনা রিয়েল-টাইমে আপডেট করা হয়েছে',
  allCategories: 'All Categories',
  allCylinders: 'সমস্ত সিলিন্ডার',
  allGood: 'All Good',
  allStatus: 'All Status',
  approved: 'Approved',
  approvedExpenses: 'অনুমোদিত খরচ',
  approveExpense: 'Approve Expense',
  area: 'Area',
  areYouSureDeleteDriver: 'আপনি কি নিশ্চিতভাবে এই চালককে মুছে ফেলতে চান?',
  assetsLiabilities: 'সম্পদ ও দেনা',
  assignedArea: 'নির্ধারিত এলাকা',
  balanceSheet: 'ব্যালেন্স শিট',
  businessFormulaImplementation: 'ব্যবসায়িক ফর্মুলা প্রয়োগ',
  cashReceivables: 'নগদ বাকি',
  changesLog: 'Changes Log',
  checkStock: 'Check Stock',
  clear: 'Clear',
  company: 'Company',
  completeSystemAccessAndUserManagement:
    'সম্পূর্ণ সিস্টেম অ্যাক্সেস এবং ব্যবহারকারী ব্যবস্থাপনা',
  confirmDeleteUser: 'ব্যবহারকারী মুছে ফেলা নিশ্চিত করুন',
  contactName: 'Contact Name',
  contactNumber: 'যোগাযোগ নম্বর',
  create: 'Create',
  criticalAlert: 'Critical Alert',
  currency: 'মুদ্রা',
  currentFullCylinderInventory: 'Current Full Cylinder Inventory',
  currentStock: 'Current Stock',
  currentStockHealth: 'বর্তমান স্টক পরিস্থিতি',
  customers: 'গ্রাহকগণ',
  cylinderReceivables: 'Cylinder Receivables',
  cylindersReceived: 'গৃহীত সিলিন্ডার',
  cylindersSold: 'বিক্রি হওয়া সিলিন্ডার',
  cylindersSummaryApiError: 'ত্রুটি: সিলিন্ডার সারাংশ এপিআই',
  cylindersSummaryDataReceived: 'Cylinders Summary Data Received',
  cylindersSummaryResponseStatus: 'সিলিন্ডার সারাংশ প্রতিক্রিয়া স্ট্যাটাস',
  dailyCalculations: 'দৈনিক গণনা',
  dailyInventoryTracking: 'Daily Inventory Tracking',
  dataSources: 'ডেটার উৎস',
  day: 'Day',
  days: 'দিন',
  deleteExpense: 'Delete Expense',
  deleteUser: 'Delete User',
  deleting: 'মুছে ফেলা হচ্ছে...',
  details: 'Details',
  driver: 'Driver',
  driverAddedSuccessfully: 'চালক সফলভাবে যোগ করা হয়েছে।',
  driverDeletedSuccessfully: 'চালক সফলভাবে মুছে ফেলা হয়েছে।',
  driverDetails: 'চালকের বিবরণ',
  driverManagement: 'Driver Management',
  driverName: 'Driver Name',
  driverType: 'Driver Type',
  driverUpdatedSuccessfully: 'চালকের তথ্য সফলভাবে আপডেট করা হয়েছে।',
  editDriver: 'Edit Driver',
  editExpense: 'Edit Expense',
  editUser: 'Edit User',
  emailAddress: 'ই-মেইল ঠিকানা',
  emergencyContact: 'জরুরী যোগাযোগ',
  emptyCylinderInventoryAvailability: 'খালি সিলিন্ডারের মজুদ প্রাপ্যতা',
  emptyCylinders: 'খালি সিলিন্ডার',
  emptyCylindersBuySell: 'খালি সিলিন্ডার ক্রয়/বিক্রয়',
  emptyCylindersInHand: 'স্টকে খালি সিলিন্ডার',

  // Inventory validation messages
  checkingInventory: 'Checking inventory...',
  inventoryAvailable: 'available',
  usingAllAvailable: 'Using all available cylinders',
  only: 'Only',
  availableText: 'available',
  purchasing: 'Purchasing...',
  selling: 'Selling...',
  emptyCylinderReceivables: 'Empty Cylinder Receivables',
  emptyCylindersReceivable: 'Empty Cylinders Receivable',
  emptyCylindersInStock: 'Empty Cylinders In Stock',
  emptyCylinderInventoryAndReceivables:
    'Empty Cylinder Inventory and Receivables',
  ongoingShipments: 'Ongoing Shipments',
  outstandingShipments: 'বকেয়া চালান',
  noOutstandingOrders: 'কোনো বকেয়া অর্ডার নেই।',
  enterAssignedAreaRoute: 'নির্ধারিত এলাকা/রুট লিখুন',
  enterEmailAddress: 'ই-মেইল ঠিকানা লিখুন',
  enterEmergencyContactName: 'Enter Emergency Contact Name',
  enterEmergencyContactNumber: 'Enter Emergency Contact Number',
  enterFullAddress: 'সম্পূর্ণ ঠিকানা লিখুন',
  enterFullName: 'পূর্ণ নাম লিখুন',
  enterLicenseNumber: 'Enter License Number',
  enterPhoneNumber: 'Enter Phone Number',
  error: 'Error',
  errorFetchingCylindersSummaryData: 'Error Fetching Cylinders Summary Data',
  errorFetchingDailyInventoryData: 'Error Fetching Daily Inventory Data',
  errorFetchingInventoryData: 'Error Fetching Inventory Data',
  expense: 'Expense',
  expenseManagement: 'Expense Management',
  exportFunctionalityComingSoon: 'এক্সপোর্ট সুবিধা শীঘ্রই আসছে।',
  failedToCreateUser: 'Failed To Create User',
  failedToDeleteDriver: 'Failed To Delete Driver',
  failedToDeleteUser: 'Failed To Delete User',
  failedToFetchUsers: 'ব্যবহারকারীদের তথ্য আনতে ব্যর্থ।',
  failedToLoadInventoryData: 'Failed To Load Inventory Data',
  failedToUpdateDriver: 'Failed To Update Driver',
  failedToUpdateUser: 'Failed To Update User',
  fetchingCylindersSummaryData: 'Fetching Cylinders Summary Data',
  filterByDriverType: 'চালকের ধরণ অনুযায়ী ফিল্টার করুন',
  fri: 'শুক্র',
  from: 'থেকে',
  fullAccess: 'Full Access',
  fullCylinders: 'ভরা সিলিন্ডার',
  fullName: 'পূর্ণ নাম',
  getStartedByAddingFirstExpense: 'আপনার প্রথম খরচ যোগ করে শুরু করুন।',
  hour: 'Hour',
  hours: 'ঘন্টা',
  individualDailySalesData: 'Individual Daily Sales Data',
  info: 'তথ্য',
  inventoryManagement: 'Inventory Management',
  joiningDate: 'যোগদানের তারিখ',
  justNow: 'এইমাত্র',
  kPending: '{{k}} অপেক্ষারত',
  language: 'ভাষা',
  last7Days: 'শেষ ৭ দিন',
  lastMonth: 'Last Month',
  lastLogin: 'Last Login',
  lastUpdated: 'Last Updated',
  latest: 'Latest',
  licenseNumber: 'License Number',
  loadingDailySalesData: 'Loading Daily Sales Data',
  loadingDriverPerformance: 'Loading Driver Performance',
  loadingInventoryData: 'Loading Inventory Data',
  loadingText: 'Loading Text',
  locationInformation: 'Location Information',
  login: 'Login',
  lpgDistributorManagementSystem: 'Lpg Distributor Management System',
  manageBudgets: 'Manage Budgets',
  manageCategories: 'Manage Categories',
  manageLiabilities: 'Manage Liabilities',
  manager: 'ম্যানেজার',
  managers: 'ম্যানেজারগণ',
  manageSystemRoles: 'Manage System Roles',
  manageTeam: 'Manage Team',
  mon: 'সোম',
  monitorCylinderStock: 'Monitor Cylinder Stock',
  needAdminPrivileges: 'Need Admin Privileges',
  never: 'কখনো না',
  newSale: 'New Sale',
  noActiveDriversFoundForThisPeriod:
    'এই সময়কালে কোনো সক্রিয় চালক পাওয়া যায়নি।',
  noDailyInventoryDataAvailable: 'No Daily Inventory Data Available',
  noDailySalesDataFound: 'No Daily Sales Data Found',
  noDataFound: 'No Data Found',
  noEmptyCylindersInInventory: 'No Empty Cylinders In Inventory',
  noFullCylindersInInventory: 'No Full Cylinders In Inventory',
  notApplicable: 'প্রযোজ্য নয়',
  note: 'Note',
  noUsersFound: 'কোনো ব্যবহারকারী পাওয়া যায়নি।',
  operationFailed: 'অপারেশন ব্যর্থ হয়েছে।',
  operations: 'অপারেশনস',
  outstanding: 'বকেয়া',
  packagePurchase: 'Package Purchase',
  packageRefillPurchase: 'Package Refill Purchase',
  packageRefillSales: 'Package Refill Sales',
  packageSale: 'Package Sale',
  packageSalesQty: 'Package Sales Qty',
  parentCategory: 'Parent Category',

  // Category Management
  categoryManagement: 'Category Management',
  addNewCategory: 'Add New Category',
  parentCategories: 'Parent Categories',
  subCategories: 'sub-categories',
  subCategoriesTitle: 'Sub-Categories',
  noParentCategoriesFound:
    'No parent categories found. Create your first parent category to organize your expenses.',
  noSubCategoriesFound:
    'No sub-categories found. Create your first sub-category to start tracking expenses.',
  editParentCategory: 'Edit parent category',
  deleteParentCategory: 'Delete parent category',
  editCategory: 'Edit category',
  deleteCategory: 'Delete category',
  createCategory: 'Create Category',
  updateCategory: 'Update Category',
  updateParentCategory: 'Update Parent Category',
  budget: 'Budget',
  spentThisMonth: 'Spent This Month',
  noBudget: 'No Budget',
  overBudget: 'Over Budget',
  parent: 'Parent',
  noParent: 'No Parent',
  unknownParent: 'Unknown Parent',
  loadingCategories: 'Loading categories...',

  // Category Form
  categoryType: 'Category Type',
  subCategoryWithBudget: 'Sub-category (with budget)',
  parentCategoryGroupingOnly: 'Parent category (grouping only)',
  enterCategoryName: 'Enter category name',
  enterCategoryDescription: 'Enter category description',
  monthlyBudget: 'Monthly Budget',
  noParentCategory: 'No parent category',
  leaveEmptyForNoBudgetLimit: 'Leave empty for no budget limit',

  pay: 'পরিশোধ',
  paymentReceived: 'Payment Received',
  pending: 'Pending',
  pendingApproval: 'Pending Approval',
  performanceStatistics: 'পারফরম্যান্স পরিসংখ্যান',
  permissions: 'অনুমতিসমূহ',
  personalInformation: 'Personal Information',
  phoneNumber: 'Phone Number',
  pleaseLogInToAccessUserManagement:
    'ব্যবহারকারী ব্যবস্থাপনায় প্রবেশ করতে লগইন করুন।',
  producentsWithLowStockWarning: 'কম স্টকের সতর্কবার্তাসহ পণ্য',
  productsBelowMinimumThreshold: 'ন্যূনতম থ্রেশহোল্ডের নিচের পণ্য',
  productsInCriticalStock: 'গুরুতর কম স্টকযুক্ত পণ্য',
  productsInGoodStock: 'পর্যাপ্ত স্টকযুক্ত পণ্য',
  productsOutOfStock: 'স্টক-আউট পণ্য',
  purchase: 'Purchase',
  rahmanSoldCylinders: '{name} সিলিন্ডার বিক্রি করেছে',
  realTimeInventoryTracking: 'Real Time Inventory Tracking',
  receivableManagement: 'Receivable Management',
  receivableRecords: 'বাকি রেকর্ড',
  recentActivity: 'Recent Activity',
  recordDailySales: 'Record Daily Sales',
  refillPurchase: 'Refill Purchase',
  refillSale: 'Refill Sale',
  refillSalesQty: 'Refill Sales Qty',
  refreshData: 'Refresh Data',
  rejectExpense: 'Reject Expense',
  reportsAnalytics: 'রিপোর্ট ও বিশ্লেষণ',
  retail: 'Retail',
  retailDriver: 'Retail Driver',
  sale: 'বিক্রয়',
  retailDriverDescription: 'Retail Driver Description',
  retailDrivers: 'খুচরা চালক',
  retry: 'পুনরায় চেষ্টা করুন',
  return: 'ফেরত',
  rolePermissions: 'ভূমিকার অনুমতি',
  routeArea: 'Route Area',
  salesInventoryAndDriverManagement: 'Sales Inventory And Driver Management',
  salesTrend: 'Sales Trend',
  salesValue: 'Sales Value',
  sat: 'শনি',
  saveError: 'Error: save',
  saveSuccess: 'Save successful',
  searchExpenses: 'Search Expenses',
  selectDriverType: 'চালকের ধরণ নির্বাচন করুন',
  selectStatus: 'Select Status',
  shipment: 'Shipment',
  shipmentDriverDescription: 'Shipment Driver Description',
  shipmentDrivers: 'চালানের চালক',
  size: 'Size',
  statusAndNotes: 'Status And Notes',
  stock: 'Stock',
  stockReplenished: 'স্টক পুনরায় পূরণ করা হয়েছে',
  submittedBy: 'জমাদানকারী',
  success: 'Success',
  sumAllDriversSalesForDate: 'Sum All Drivers Sales For Date',
  sumCompletedEmptyCylinderShipments: 'Sum Completed Empty Cylinder Shipments',
  sumCompletedShipmentsFromShipmentsPage:
    'চালান পৃষ্ঠা থেকে সম্পন্ন চালানের যোগফল',
  sun: 'রবি',
  systemUsers: 'সিস্টেম ব্যবহারকারীগণ',
  tasks: 'কাজসমূহ',
  teamAccess: 'Team Access',
  thisActionCannotBeUndone: 'এই কাজটি বাতিল করা যাবে না।',
  thisMonth: 'This Month',
  thu: 'বৃহস্পতি',
  timezone: 'সময় অঞ্চল',
  to: 'প্রতি',
  today: 'Today',
  todaysEmptyCylinders: 'আজকের খালি সিলিন্ডার',
  todaysFullCylinders: 'আজকের ভরা সিলিন্ডার',
  todaysPurchases: 'আজকের ক্রয়',
  todaysSales: 'Todays Sales',
  topDriverPerformance: 'Top Driver Performance',
  totalCylinderReceivables: 'Total Cylinder Receivables',
  totalCylinders: 'Total Cylinders',
  totalCylindersReceivables: 'Total Cylinders Receivables',
  totalReceivables: 'Total Receivables',
  totalSales: 'Total Sales',
  totalSalesQty: 'Total Sales Qty',
  totalSalesThisMonth: 'Total Sales This Month',
  totalUsers: 'Total Users',
  trackCustomerCredits: 'গ্রাহক ক্রেডিট ট্র্যাক করুন',
  trackCustomerPayments: 'Track Customer Payments',
  trackExpenses: 'খরচ ট্র্যাক করুন',
  trackExpensesAndManageBudgets: 'খরচ ট্র্যাক ও বাজেট পরিচালনা করুন',
  trackPerformance: 'পারফরম্যান্স ট্র্যাক করুন',
  tue: 'মঙ্গল',
  unknown: 'Unknown',
  updateDriver: 'Update Driver',
  updateExpense: 'Update Expense',
  updatePayment: 'Update Payment',
  updateUser: 'Update User',
  updating: 'আপডেট হচ্ছে...',
  urgent: 'Urgent',
  user: 'User',
  userDetails: 'ব্যবহারকারীর বিবরণ',
  userManagement: 'User Management',
  viewDetails: 'বিবরণ দেখুন',
  viewingExpensesFor: 'এর জন্য খরচ দেখা হচ্ছে',
  viewReceipt: 'রশিদ দেখুন',
  viewReports: 'রিপোর্ট দেখুন',
  warning: 'Warning',
  wed: 'বুধ',
  week: 'Week',
  yesterday: 'Yesterday',
  yesterdaysEmpty: 'Yesterdays Empty',
  yesterdaysFull: 'Yesterdays Full',
  fuelExpense: 'জ্বালানি খরচ',
  maintenanceExpense: 'রক্ষণাবেক্ষণ খরচ',
  officeExpense: 'অফিস খরচ',
  transportExpense: 'পরিবহন খরচ',
  miscellaneousExpense: 'বিবিধ খরচ',
  generalExpense: 'সাধারণ খরচ',
  failedToLoadDailySalesReport: 'Failed To Load Daily Sales Report',
  loadingDailySalesReport: 'দৈনিক বিক্রয় রিপোর্ট লোড হচ্ছে...',
  noReportDataAvailable: 'No Report Data Available',
  tryAgainOrSelectDate: 'পুনরায় চেষ্টা করুন বা একটি তারিখ নির্বাচন করুন।',
  comprehensiveDailySalesReport: 'বিস্তারিত দৈনিক বিক্রয় রিপোর্ট',
  totalSalesValue: 'Total Sales Value',
  totalDeposited: 'মোট জমা',
  totalExpenses: 'Total Expenses',
  availableCash: 'Available Cash',
  totalCashReceivables: 'Total Cash Receivables',
  changeInReceivablesCashCylinders: 'বাকি (নগদ ও সিলিন্ডার) পরিবর্তন',
  dailyDepositsExpenses: 'দৈনিক জমা ও খরচ',
  detailedBreakdownDepositsExpenses: 'জমা ও খরচের বিস্তারিত বিভাজন',
  deposits: 'জমা',
  particulars: 'বিবরণ',
  noDepositsFound: 'কোনো জমা পাওয়া যায়নি।',
  totalDepositsCalculated: 'গণনা করা মোট জমা',
  noExpensesFound: 'কোনো খরচ পাওয়া যায়নি।',
  totalExpensesCalculated: 'Total Expenses Calculated',
  totalAvailableCash: 'Total Available Cash',
  totalDepositsIncludingSales: 'মোট জমা (বিক্রয় সহ)',
  customerName: 'Customer Name',
  selectADriver: 'একজন চালক নির্বাচন করুন',
  enterCustomerName: 'Enter Customer Name',
  saleItems: 'বিক্রয়ের আইটেম',
  itemNumber: 'Item Number',
  selectAProduct: 'একটি পণ্য নির্বাচন করুন',
  packagePrice: 'Package Price',
  refillPrice: 'Refill Price',
  itemTotal: 'Item Total',
  saleSummary: 'Sale Summary',
  paymentType: 'Payment Type',
  paymentTypeRequired: 'Payment Type is required',
  bankTransfer: 'ব্যাংক ট্রান্সফার',
  mfs: 'এমএফএস',
  mobileFinancialService: 'মোবাইল ফিনান্সিয়াল সার্ভিস',
  credit: 'Credit',
  cylinderCredit: 'সিলিন্ডার ক্রেডিট',
  cashDeposited: 'নগদ জমা',
  cylinderDeposits: 'সিলিন্ডার জমা',
  cylinderDepositsBySize: 'মাপ অনুযায়ী সিলিন্ডার জমা',
  cylindersDeposited: 'জমাকৃত সিলিন্ডার',
  maxQuantity: 'সর্বোচ্চ পরিমাণ',
  additionalNotes: 'অতিরিক্ত নোট',
  additionalNotesPlaceholder: 'অতিরিক্ত নোট লিখুন...',
  totalQuantityLabel: 'মোট পরিমাণ',
  totalValueLabel: 'মোট মূল্য',
  totalDiscountLabel: 'মোট ছাড়',
  netValueLabel: 'নেট মূল্য',
  cashReceivableWarning: 'Cash Receivable Warning',
  customerNameRecommended: 'গ্রাহকের নাম (প্রস্তাবিত)',
  cylinderReceivableWarning: 'Cylinder Receivable Warning',
  lowStockWarning: 'Low Stock Warning',
  cylindersRemaining: 'অবশিষ্ট সিলিন্ডার',
  loadingFormData: 'ফর্ম ডেটা লোড হচ্ছে...',
  driverRequired: 'Driver is required',
  productRequired: 'Product is required',
  packageSaleCannotBeNegative: 'প্যাকেজ বিক্রয় ঋণাত্মক হতে পারে না।',
  refillSaleCannotBeNegative: 'রিফিল বিক্রয় ঋণাত্মক হতে পারে না।',
  packagePriceCannotBeNegative: 'প্যাকেজ মূল্য ঋণাত্মক হতে পারে না।',
  refillPriceCannotBeNegative: 'রিফিল মূল্য ঋণাত্মক হতে পারে না।',
  quantityAndPriceRequired: 'Quantity And Price is required',
  atLeastOneSaleItemRequired: 'কমপক্ষে একটি বিক্রয় আইটেম আবশ্যক।',
  discountCannotBeNegative: 'ছাড়ের পরিমাণ ঋণাত্মক হতে পারে না।',
  cashDepositedCannotBeNegative: 'নগদ জমার পরিমাণ ঋণাত্মক হতে পারে না।',
  cylinderDepositsCannotBeNegative:
    'সিলিন্ডার জমার পরিমাণ ঋণাত্মক হতে পারে না।',
  available: 'Available',
  for: 'জন্য',
  readOnly: 'শুধু পঠনযোগ্য',
  areYouSure: 'আপনি কি নিশ্চিত?',
  deleteConfirmation: 'মুছে ফেলার নিশ্চিতকরণ',
  salesEntries: 'বিক্রয় এন্ট্রি',
  cannotBeUndone: 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
  successfullyDeleted: 'সফলভাবে মুছে ফেলা হয়েছে।',
  on: 'চালু',
  thisWillDelete: 'This Will Delete',
  failedToLoadDailySalesData: 'Failed To Load Daily Sales Data',
  combinedSaleCreatedSuccessfully: 'সমন্বিত বিক্রয় সফলভাবে তৈরি হয়েছে।',
  failedToCreateSale: 'Failed To Create Sale',
  failedToLoadEntryDataForEditing:
    'সম্পাদনার জন্য এন্ট্রি ডেটা লোড করতে ব্যর্থ।',
  salesEntryUpdatedSuccessfully: 'বিক্রয় এন্ট্রি সফলভাবে আপডেট করা হয়েছে।',
  failedToUpdateSalesEntry: 'বিক্রয় এন্ট্রি আপডেট করতে ব্যর্থ।',
  failedToDeleteSales: 'Failed To Delete Sales',
  adminPanel: 'অ্যাডমিন প্যানেল',
  systemAdministration: 'সিস্টেম প্রশাসন',
  viewDistributorDashboard: 'পরিবেশক ড্যাশবোর্ড দেখুন',
  signOut: 'Sign Out',
  lightMode: 'লাইট মোড',
  darkMode: 'ডার্ক মোড',
  systemTheme: 'সিস্টেম থিম',
  shipmentsManagement: 'চালান ব্যবস্থাপনা',
  trackPurchaseOrdersAndShipments: 'ক্রয় আদেশ এবং চালান ট্র্যাক করুন',
  newPurchase: 'New Purchase',
  emptyCylinderBuySell: 'খালি সিলিন্ডার ক্রয়/বিক্রয়',
  allShipments: 'সমস্ত চালান',
  outstandingOrders: 'বকেয়া অর্ডার',
  completedOrders: 'সম্পন্ন অর্ডার',
  allCompanies: 'All Companies',
  allProducts: 'সমস্ত পণ্য',
  fromDate: 'From Date',
  toDate: 'To Date',
  clearFilters: 'ফিল্টার পরিষ্কার করুন',
  loadingShipments: 'Loading Shipments',
  noShipmentsFound: 'কোনো চালান পাওয়া যায়নি।',
  invoice: 'Invoice',
  gas: 'Gas',
  unit: 'Unit',
  unitCost: 'Unit Cost',
  gasCost: 'গ্যাস খরচ',
  cylinderCost: 'Cylinder Cost',
  vehicle: 'Vehicle',
  markAsFulfilled: 'সম্পন্ন হিসেবে চিহ্নিত করুন',
  totalItems: 'মোট আইটেম',
  totalCost: 'Total Cost',
  editPurchaseOrder: 'Edit Purchase Order',
  createNewPurchaseOrder: 'Create New Purchase Order',
  step: 'Step',
  orderInformation: 'Order Information',
  selectCompany: 'Select Company',
  selectACompany: 'Select Company',
  selectDriver: 'Select Driver',
  shipmentDate: 'Shipment Date',
  expectedDeliveryDate: 'প্রত্যাশিত ডেলিভারির তারিখ',
  invoiceNumber: 'Invoice Number',
  enterInvoiceNumber: 'চালান নম্বর লিখুন',
  paymentTerms: 'Payment Terms',
  cashOnDelivery: 'ক্যাশ অন ডেলিভারি',
  net30Days: 'নেট ৩০ দিন',
  net60Days: 'নেট ৬০ দিন',
  advancePayment: 'অগ্রিম পরিশোধ',
  priority: 'অগ্রাধিকার',
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  vehicleNumber: 'Vehicle Number',
  enterVehicleNumber: 'গাড়ির নম্বর লিখুন',
  enterAdditionalNotes: 'অতিরিক্ত নোট লিখুন',
  addLineItem: 'লাইন আইটেম যোগ করুন',
  selectProduct: 'Select Product',
  selectCompanyFirst: 'Select Company First',
  package: 'Package',
  refill: 'Refill',
  gasPrice: 'গ্যাসের মূল্য',
  cylinderPrice: 'Cylinder Price',
  taxRate: 'করের হার',
  lineTotalPreview: 'লাইন মোটের প্রিভিউ',
  packageInfo: 'Package Info',
  refillInfo: 'Refill Info',
  addItem: 'আইটেম যোগ করুন',
  purchaseItems: 'ক্রয়কৃত আইটেম',
  qty: 'পরিমাণ',
  lineTotal: 'লাইনের মোট',
  action: 'Action',
  editItem: 'আইটেম সম্পাদনা করুন',
  removeItem: 'আইটেম সরান',
  remove: 'Remove',
  totalPurchaseValue: 'Total Purchase Value',
  orderPreview: 'অর্ডার প্রিভিউ',
  orderSummary: 'Order Summary',
  totalQuantity: 'Total Quantity',
  companyRequired: 'Company is required',
  shipmentDateRequired: 'Shipment Date is required',
  atLeastOneLineItemRequired: 'কমপক্ষে একটি লাইন আইটেম আবশ্যক।',
  creating: 'তৈরি হচ্ছে...',
  updatePurchaseOrder: 'Update Purchase Order',
  createPurchaseOrder: 'Create Purchase Order',
  transactionType: 'লেনদেনের ধরণ',
  buyEmptyCylinders: 'খালি সিলিন্ডার ক্রয় করুন',
  sellEmptyCylinders: 'খালি সিলিন্ডার বিক্রয় করুন',
  addEmptyCylindersToInventory: 'Add Empty Cylinders To Inventory',
  removeEmptyCylindersFromInventory: 'Remove Empty Cylinders From Inventory',
  cylinderSize: 'Cylinder Size',
  emptyCylindersNote: 'খালি সিলিন্ডার নোট',
  transactionDate: 'লেনদেনের তারিখ',
  enterTransactionDetails: 'লেনদেনের বিবরণ লিখুন',
  buy: 'ক্রয়',
  sell: 'বিক্রয়',
  emptyCylinderTransaction: 'খালি সিলিন্ডার লেনদেন',
  directTransaction: 'সরাসরি লেনদেন',
  cylinderBuyTransaction: 'সিলিন্ডার ক্রয় লেনদেন',
  cylinderSellTransaction: 'সিলিন্ডার বিক্রয় লেনদেন',
  comprehensiveProfitabilityAnalysis: 'বিস্তারিত লাভজনকতা বিশ্লেষণ',
  visualRepresentationProfitByProduct:
    'পণ্য অনুযায়ী লাভের ভিজ্যুয়াল উপস্থাপনা',
  individualDriverPerformanceMetrics: 'Individual Driver Performance Metrics',
  comparativeAnalysisRevenueByDriver:
    'চালক অনুযায়ী রাজস্বের তুলনামূলক বিশ্লেষণ',
  monthlyRevenue: 'Monthly Revenue',
  monthlyProfit: 'Monthly Profit',
  monthlyExpenses: 'Monthly Expenses',
  allExpenses: 'সমস্ত খরচ',
  totalProfit: 'মোট লাভ',
  profit: 'Profit',
  buyingPrice: 'ক্রয়মূল্য',
  commission: 'Commission',
  fixedCost: 'Fixed Cost',
  breakevenPrice: 'ব্রেক-ইভেন মূল্য',
  sellingPrice: 'Selling Price',
  costPerUnit: 'ইউনিট প্রতি খরচ',
  avgCostPerUnit: 'ইউনিট প্রতি গড় খরচ',
  failedToLoadData: 'Failed To Load Data',
  errorLoadingData: 'Loading error data...',
  january: 'জানুয়ারি',
  february: 'ফেব্রুয়ারি',
  march: 'মার্চ',
  april: 'এপ্রিল',
  may: 'মে',
  june: 'জুন',
  july: 'জুলাই',
  august: 'আগস্ট',
  september: 'সেপ্টেম্বর',
  october: 'অক্টোবর',
  november: 'নভেম্বর',
  december: 'ডিসেম্বর',
  july2025: 'জুলাই ২০২৫',
  june2025: 'জুন ২০২৫',
  may2025: 'মে ২০২৫',
  april2025: 'এপ্রিল ২০২৫',
  march2025: 'মার্চ ২০২৫',
  february2025: 'ফেব্রুয়ারি ২০২৫',
  january2025: 'জানুয়ারি ২০২৫',
  december2024: 'ডিসেম্বর ২০২৪',
  november2024: 'নভেম্বর ২০২৪',
  october2024: 'অক্টোবর ২০২৪',
  selectTime: 'Select Time',
  failedToLoadDashboardData: 'Failed To Load Dashboard Data',
  failedToLoadDashboardDataRefresh: 'Failed To Load Dashboard Data Refresh',
  errorLoadingCombinedDashboardData:
    'সমন্বিত ড্যাশবোর্ড ডেটা লোড করতে ত্রুটি...',
  sessionExpiredRedirectingToLogin:
    'সেশন শেষ। লগইন পৃষ্ঠায় নিয়ে যাওয়া হচ্ছে...',
  realTimeOverview: 'রিয়েল-টাইম ওভারভিউ',
  orders: 'অর্ডারসমূহ',
  stockLevel: 'স্টকের পরিমাণ',
  liveActivity: 'Live Activity',
  last15Minutes: 'শেষ ১৫ মিনিট',
  targetProgress: 'লক্ষ্যের অগ্রগতি',
  performanceIndicators: 'পারফরম্যান্স সূচক',
  inventoryHealth: 'মজুদ পরিস্থিতি',
  attentionNeeded: 'মনোযোগ প্রয়োজন',
  good: 'Good',
  collectionRate: 'সংগ্রহের হার',
  salesDetails: 'Sales Details',
  viewDetailedSalesBreakdown: 'বিক্রয়ের বিস্তারিত বিভাজন দেখুন',
  salesBreakdown: 'বিক্রয় বিভাজন',
  detailedSalesAnalytics: 'বিস্তারিত বিক্রয় বিশ্লেষণ',
  averageOrderValue: 'গড় অর্ডার মূল্য',
  driverPerformance: 'Driver Performance',
  topPerformersAndRankings: 'শীর্ষ পারফর্মার এবং র‍্যাঙ্কিং',
  driverRankings: 'চালকদের র‍্যাঙ্কিং',
  performanceLeaderboard: 'পারফরম্যান্স লিডারবোর্ড',
  detailedViewAndTrends: 'বিস্তারিত ভিউ এবং ট্রেন্ড',
  vsYesterday: 'গতকালের তুলনায়',
  lpgDistributor: 'এলপিজি পরিবেশক',
  role: 'ভূমিকা',
  loadingDashboard: 'Loading Dashboard',
  fallbackDriverName1: 'ফলব্যাক চালক ১',
  fallbackDriverName2: 'ফলব্যাক চালক ২',
  fallbackDriverName3: 'ফলব্যাক চালক ৩',
  fallbackDriverName4: 'ফলব্যাক চালক ৪',
  salesCount: 'বিক্রয়ের সংখ্যা',
  revenueAmount: 'রাজস্বের পরিমাণ',
  performancePercentage: 'পারফরম্যান্সের হার',
  chartDataFallback: 'চার্টের ডেটা পাওয়া যায়নি।',
  weeklyPerformance: 'সাপ্তাহিক পারফরম্যান্স',
  dailyAverage: 'দৈনিক গড়',
  monthlyTarget: 'মাসিক লক্ষ্য',
  quarterlyGrowth: 'ত্রৈমাসিক বৃদ্ধি',
  unknownDriver: 'Unknown Driver',
  unknownCompany: 'Unknown Company',
  driverCompletedSale: 'Driver Completed Sale',
  salesTrendUp: 'Sales Trend Up',
  salesTrendDown: 'Sales Trend Down',
  addressMustBeAtLeast10Characters: 'ঠিকানা অবশ্যই কমপক্ষে ১০ অক্ষরের হতে হবে',
  addressTooLong: 'ঠিকানাটি খুব দীর্ঘ',
  areaMustBeAtLeast2Characters: 'এলাকা অবশ্যই কমপক্ষে ২ অক্ষরের হতে হবে',
  areaTooLong: 'Area Too Long',
  driverTypeIsRequired: 'Driver Type Is is required',
  emergencyContactMustBeAtLeast10Digits:
    'জরুরী যোগাযোগ নম্বর অবশ্যই কমপক্ষে ১০ সংখ্যার হতে হবে।',
  emergencyContactNameMustBeAtLeast2Characters:
    'জরুরী যোগাযোগের নাম অবশ্যই কমপক্ষে ২ অক্ষরের হতে হবে।',
  emergencyContactTooLong: 'জরুরী যোগাযোগ নম্বরটি খুব দীর্ঘ।',
  invalidEmailAddress: 'অবৈধ ই-মেইল ঠিকানা।',
  licenseNumberMustBeAtLeast5Characters:
    'লাইসেন্স নম্বর অবশ্যই কমপক্ষে ৫ অক্ষরের হতে হবে।',
  licenseNumberTooLong: 'License Number Too Long',
  nameMustBeAtLeast2Characters: 'নাম অবশ্যই কমপক্ষে ২ অক্ষরের হতে হবে।',
  nameTooLong: 'Name Too Long',
  phoneNumberMustBeAtLeast10Digits:
    'ফোন নম্বর অবশ্যই কমপক্ষে ১০ সংখ্যার হতে হবে।',
  phoneNumberTooLong: 'Phone Number Too Long',
  statusIsRequired: 'Status Is is required',
  bn: 'বাংলা',
  en: 'ইংরেজি',
  locale: 'লোকেল',
  key: 'কী',
  value: 'Value',
  allAlerts: 'All Alerts',
  critical: 'Critical',
  criticalAlerts: 'Critical Alerts',
  infoAlerts: 'তথ্যমূলক সতর্কবার্তা',
  warningAlerts: 'সতর্কীকরণ বার্তা',
  inventoryAlert: 'Inventory Alert',
  performanceAlert: 'পারফরম্যান্স সতর্কবার্তা',
  stockAlert: 'Stock Alert',
  systemNotification: 'সিস্টেম নোটিফিকেশন',
  completionPercentage: 'Completion Percentage',
  dashboardDataUpdated: 'ড্যাশবোর্ডের ডেটা আপডেট করা হয়েছে।',
  dataNotFound: 'Data Not Found',
  isComplete: 'Is Complete',
  liveDataFeed: 'Live Data Feed',
  metricsLastUpdated: 'মেট্রিক্স সর্বশেষ আপডেট হয়েছে',
  missingKeys: 'অনুপস্থিত কী',
  newSalesActivity: 'New Sales Activity',
  optional: 'Optional',
  recentSaleActivity: 'Recent Sale Activity',
  totalKeys: 'Total Keys',
  testCredentials: 'Test Credentials',
  translatedKeys: 'অনূদিত কী',
  lowStock: 'Low Stock',
  outOfStock: 'Out Of Stock',
  overduePayments: 'মেয়াদোত্তীর্ণ পেমেন্ট',
  overstock: 'অতিরিক্ত স্টক',
  performanceTrendDown: 'Performance Trend Down',
  performanceTrendStable: 'পারফরম্যান্সের ধারা স্থিতিশীল।',
  performanceTrendUp: 'Performance Trend Up',
  salesTrendStable: 'Sales Trend Stable',
  targetAchieved: 'Target Achieved',
  topPerformer: 'Top Performer',
  deleteDriver: 'Delete Driver',
  failedToLoadAlerts: 'সতর্কবার্তা লোড করতে ব্যর্থ।',
  failedToLoadInventoryAlerts: 'Failed To Load Inventory Alerts',
  movementAnomaly: 'চলাচলে অস্বাভাবিকতা',
  operationSuccessful: 'অপারেশন সফল হয়েছে।',
  welcomeToOnboarding: 'Welcome To Onboarding',
  setupYourBusinessData: 'Setup Your Business Data',
  companyNames: 'কোম্পানির নাম',
  productSetup: 'Product Setup',
  inventoryQuantities: 'Inventory Quantities',
  driversSetup: 'চালক সেটআপ',
  receivablesSetup: 'Receivables Setup',
  skipOnboarding: 'অনবোর্ডিং এড়িয়ে যান',
  completing: 'সম্পন্ন হচ্ছে...',
  completeSetup: 'Complete Setup',
  setupBusiness: 'Setup Business',
  addCompanyNames: 'Add Company Names',
  addCompaniesYouDistributeFor: 'Add Companies You Distribute For',
  addNewCompany: 'Add New Company',
  enterCompanyNamesLikeAygaz: 'কোম্পানির নাম লিখুন (যেমন, আয়গাজ)',
  companyName: 'Company Name',
  companyCode: 'Company Code',
  enterCompanyName: 'Enter Company Name',
  companyNameRequired: 'Company Name is required',
  companyAlreadyExists: 'Company Already Exists',
  addedCompanies: 'যোগ করা কোম্পানিসমূহ',
  companiesYouDistributeFor: 'আপনি যেসব কোম্পানির জন্য বিতরণ করেন',
  noCompaniesAdded: 'কোনো কোম্পানি যোগ করা হয়নি।',
  addAtLeastOneCompany: 'কমপক্ষে একটি কোম্পানি যোগ করুন',
  setupProductsAndSizes: 'পণ্য এবং মাপ সেটআপ করুন',
  configureCylinderSizesAndProducts: 'সিলিন্ডারের মাপ ও পণ্য কনফিগার করুন',
  addSizesLike12L20L: 'মাপ যোগ করুন, যেমন ১২লি ২০লি',
  enterSizeLike12L: 'মাপ লিখুন (যেমন, ১২লি)',
  addSize: 'Add Size',
  cylinderSizeRequired: 'Cylinder Size is required',
  cylinderSizeAlreadyExists: 'Cylinder Size Already Exists',
  enterDescription: 'Enter Description',
  addProduct: 'Add Product',
  addNewProduct: 'Add New Product',
  addProductsForEachCompany: 'Add Products For Each Company',
  productName: 'Product Name',
  enterProductName: 'Enter Product Name',
  enterProductNameExample: 'পণ্যের নাম লিখুন (উদাহরণ...)',
  currentPrice: 'Current Price',
  enterPrice: 'Enter Price',
  productNameRequired: 'Product Name is required',
  validPriceRequired: 'Valid Price is required',
  productAlreadyExists: 'Product Already Exists',
  addedProducts: 'যোগ করা পণ্যসমূহ',
  addCylinderSizesAndProducts: 'Add Cylinder Sizes And Products',
  bothRequiredToProceed: 'Both To Proceed is required',
  setInitialInventory: 'Set Initial Inventory',
  enterCurrentFullCylinderQuantities: 'বর্তমান ভরা সিলিন্ডারের পরিমাণ লিখুন',
  fullCylinderInventory: 'Full Cylinder Inventory',
  enterQuantityForEachProduct: 'Enter Quantity For Each Product',
  noProductsAvailable: 'কোনো পণ্য উপলব্ধ নেই।',
  addProductsFirst: 'Add Products First',
  totalProducts: 'Total Products',
  totalFullCylinders: 'Total Full Cylinders',
  setEmptyCylinderInventory: 'Set Empty Cylinder Inventory',
  enterCurrentEmptyCylinderQuantities: 'বর্তমান খালি সিলিন্ডারের পরিমাণ লিখুন',
  emptyCylinderInventory: 'Empty Cylinder Inventory',
  enterQuantityForEachSize: 'Enter Quantity For Each Size',
  noCylinderSizesAvailable: 'No Cylinder Sizes Available',
  addCylinderSizesFirst: 'Add Cylinder Sizes First',
  totalSizes: 'Total Sizes',
  totalEmptyCylinders: 'Total Empty Cylinders',
  emptyCylinderNote: 'খালি সিলিন্ডার নোট',
  emptyCylinderStockReceivablesNote:
    'The values below should include both cylinders in stock and cylinder receivables.',
  addYourDrivers: 'Add Your Drivers',
  addDriversWhoWillSellProducts: 'Add Drivers Who Will Sell Products',
  enterDriverInformation: 'Enter Driver Information',
  enterDriverName: 'Enter Driver Name',
  shipmentDriver: 'Shipment Driver',
  driverNameRequired: 'Driver Name is required',
  driverAlreadyExists: 'Driver Already Exists',
  addedDrivers: 'যোগ করা চালকগণ',
  driversInYourTeam: 'আপনার দলের চালকগণ',
  noContactInfo: 'No Contact Info',
  noDriversAdded: 'কোনো চালক যোগ করা হয়নি।',
  addAtLeastOneDriver: 'কমপক্ষে একজন চালক যোগ করুন',
  setupReceivables: 'Setup Receivables',
  enterCurrentReceivablesForEachDriver: 'প্রতিটি চালকের বর্তমান বাকি লিখুন',
  driverReceivables: 'Driver Receivables',
  enterCashAndCylinderReceivables: 'Enter Cash And Cylinder Receivables',
  amountOwedByCustomers: 'Amount Owed By Customers',
  cylindersOwedByCustomers: 'গ্রাহকদের কাছে পাওনা সিলিন্ডার',
  cylindersOwedByCustomersBySize: 'মাপ অনুযায়ী গ্রাহকদের কাছে পাওনা সিলিন্ডার',
  noDriversAvailable: 'কোনো চালক উপলব্ধ নেই।',
  addDriversFirst: 'Add Drivers First',
  noRetailDriversAvailable: 'কোনো খুচরা চালক উপলব্ধ নেই।',
  addRetailDriversFirst: 'Add Retail Drivers First',
  receivablesSummary: 'Receivables Summary',
  manualBusinessOnboarding: 'Manual Business Onboarding',
  businessInformation: 'Business Information',
  businessName: 'Business Name',
  businessNamePlaceholder: 'Enter business name...',
  subdomain: 'সাবডোমেইন',
  subdomainPlaceholder: 'Enter subdomain...',
  plan: 'Plan',
  freemium: 'ফ্রিমিয়াম',
  professional: 'Professional',
  enterprise: 'এন্টারপ্রাইজ',
  adminUser: 'Admin User',
  adminName: 'Admin Name',
  adminNamePlaceholder: 'Enter admin name...',
  adminEmail: 'Admin Email',
  adminEmailPlaceholder: 'Enter admin email...',
  adminPassword: 'Admin Password',
  strongPassword: 'Strong Password',
  creatingBusiness: 'Creating Business',
  onboardBusiness: 'Onboard Business',
  businessOnboardedSuccessfully: 'ব্যবসা সফলভাবে অনবোর্ড করা হয়েছে।',
  businessCreatedWithAdmin: 'অ্যাডমিনসহ ব্যবসা তৈরি হয়েছে',
  failedToOnboardBusiness: 'Failed To Onboard Business',
  networkErrorOccurred: 'Error: network occurred',
  unauthorized: 'Unauthorized',
  userNotFound: 'User Not Found',
  onboardingAlreadyCompleted: 'Onboarding Already Completed',
  failedToCompleteOnboarding: 'Failed To Complete Onboarding',
  failedToCheckOnboardingStatus: 'Failed To Check Onboarding Status',
  searchCompanies: 'Search Companies',
  addCompany: 'Add Company',
  activeProducts: 'সক্রিয় পণ্যসমূহ',
  totalStock: 'Total Stock',
  companies: 'কোম্পানিসমূহ',
  searchProducts: 'Search Products',
  created: 'Created',
  cylinderSizeDeletedSuccessfully: 'Cylinder size deleted successfully.',

  // Missing inventory page translations
  trackAndManageYourCylinderInventory:
    'Track and manage your cylinder inventory',
  noInventoryDataAvailable: 'No inventory data available',
  hideMovements: 'Hide Movements',
  showMovements: 'Show Movements',
  fromDrivers: 'From Drivers',
  availableForRefill: 'Available for Refill',
  noFullCylindersAvailable: 'No full cylinders available',
  noEmptyCylindersAvailable: 'No empty cylinders available',
  noEmptyCylindersOfSizeAvailable:
    'No empty cylinders of size {size} available',
  automatedInventoryCalculationsForCylinders:
    'Automated inventory calculations for cylinders',
  asset: 'Asset',
  liabilityWord: 'Liability',
  autoCalculatedFromInventory: 'Auto-calculated from inventory',
  setUnitPrice: 'Set unit price',
  editable: 'Editable',
  autoCalculatedCurrentAssets: 'Auto-Calculated Current Assets',
  noAutoCalculatedAssetsFound: 'No auto-calculated current assets found.',
  autoCalculatedAssetsDescription:
    'Auto-calculated assets like inventory and receivables will appear here.',
  updated: 'updated',
  successfully: 'successfully',
  failedToUpdateCreateEntry: 'Failed to update/create entry',
  assetPlaceholder: 'e.g., Vehicles, Equipment, Inventory',
  realTimeValuesLinkedToBusinessOperations:
    'Real-time values linked to business operations',
  balanceSheetSummary: 'Balance Sheet Summary',
  totalLiabilities: 'Total Liabilities',
  netEquity: 'Net Equity',
  quickAddAsset: 'Quick Add Asset',
  addNewAssetToPortfolio: 'Add a new asset to your company portfolio',
  quickAddLiability: 'Quick Add Liability',
  addNewLiabilityToRecords: 'Add a new liability to your company records',
  cashReceivablesAsset: 'Cash Receivables',
  cashInHandAsset: 'Cash in Hand',
  assetDepreciationSchedule: 'Asset Depreciation Schedule',
  assetsWithDepreciationRates:
    'Assets with depreciation rates and accumulated depreciation',
  originalCost: 'Original Cost',
  depreciationMethod: 'Depreciation Method',
  annualRate: 'Annual Rate',
  yearsOwned: 'Years Owned',
  accumulated: 'Accumulated',
  currentValue: 'Current Value',
  noAssetsWithDepreciationFound: 'No assets with depreciation found.',
  addAssetsWithPurchaseDates:
    'Add assets with purchase dates and depreciation rates to see their depreciation schedule.',
  addDepreciableAsset: 'Add Depreciable Asset',
  loan: 'Loan',
  outstandingCashReceivablesFromDrivers:
    'Outstanding cash receivables from drivers',
  cashInHand: 'Cash in Hand',
  availableCashCalculatedFromDeposits:
    'Available cash calculated from deposits minus expenses',

  // Settings translations
  generalSettings: 'General Settings',
  defaultTimezone: 'Default Timezone',
  configureGlobalSettings:
    'Configure global settings for currency, timezone, and language',
  settingsChangeNote:
    'Note: Changes to these settings will affect all users and financial calculations throughout the system.',
  currencySettingDescription:
    'This will be used for all financial calculations and displays',
  timezoneSettingDescription: 'This affects all timestamps and scheduling',
  languageSettingDescription:
    'This affects the interface language and date/number formats',
  generalSettingsDescription:
    'Configure global settings for currency, timezone and language',
  currencySettingImpact:
    'This will be used for all financial calculations and displays',
  timezoneSettingImpact: 'This affects all timestamps and scheduling',
  languageSettingImpact:
    'This affects the interface language and date/number formats',
  currencyUsageDescription:
    'This will be used for all financial calculations and displays',
  timezoneUsageDescription: 'This affects all timestamps and scheduling',
  languageUsageDescription:
    'This affects the interface language and date/number formats',
  localTime: 'Local time',
  settingsChangeWarning:
    'Changes to these settings will affect all users and financial calculations throughout the system',
  saving: 'Saving',

  // Additional missing translation keys
  selectCurrency: 'Select Currency',
  selectTimezone: 'Select Timezone',
  selectLanguage: 'Select Language',
  english: 'English',
  bengali: 'Bengali',
};

const bengaliTranslations: Translations = {
  // Navigation
  dashboard: 'ড্যাশবোর্ড',
  sales: 'বিক্রয়',
  drivers: 'চালক',
  shipments: 'চালান',

  assets: 'সম্পদ',
  expenses: 'খরচ',
  settings: 'সেটিংস',

  users: 'ব্যবহারকারী',
  reports: 'রিপোর্ট',
  productManagement: 'পণ্য ব্যবস্থাপনা',
  dailySalesReport: 'দৈনিক বিক্রয় রিপোর্ট',
  analytics: 'বিশ্লেষণ',

  // Auth Pages
  signInToYourAccount: 'আপনার অ্যাকাউন্টে সাইন ইন করুন',
  createYourAccount: 'আপনার অ্যাকাউন্ট তৈরি করুন',
  signInToExistingAccount: 'আপনার বিদ্যমান অ্যাকাউন্টে সাইন ইন করুন',
  password: 'পাসওয়ার্ড',
  confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
  rememberMe: 'আমাকে মনে রাখুন',
  forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
  resetYourPassword: 'আপনার পাসওয়ার্ড রিসেট করুন',
  enterEmailForPasswordReset:
    'আপনার ইমেইল ঠিকানা লিখুন এবং আমরা আপনাকে পাসওয়ার্ড রিসেট করার জন্য একটি লিঙ্ক পাঠাবো।',
  passwordResetLinkSent:
    'যদি সেই ইমেইলের সাথে কোনো অ্যাকাউন্ট থাকে, আমরা একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠিয়েছি।',
  sendResetLink: 'রিসেট লিঙ্ক পাঠান',
  backToSignIn: 'সাইন ইনে ফিরে যান',
  pleaseEnterYourEmailAddress: 'অনুগ্রহ করে আপনার ইমেইল ঠিকানা লিখুন',
  pleaseEnterAValidEmailAddress: 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা লিখুন',
  signingIn: 'সাইন ইন হচ্ছে...',
  createAccount: 'অ্যাকাউন্ট তৈরি করুন',
  termsOfService: 'সেবার শর্তাবলী',
  privacyPolicy: 'গোপনীয়তা নীতি',
  agreeToTerms: 'আমি সম্মত',
  passwordsDontMatch: 'পাসওয়ার্ড মিল নেই',
  passwordMinLength: 'পাসওয়ার্ড কমপক্ষে ৮টি অক্ষর হতে হবে',
  registrationFailed: 'নিবন্ধন ব্যর্থ হয়েছে',
  anErrorOccurred: 'একটি ত্রুটি ঘটেছে',
  accountCreatedSuccessfully:
    'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! অনুগ্রহ করে সাইন ইন করুন।',

  // Placeholders
  fullNamePlaceholder: 'যেমন: মোহাম্মদ রহিম উদ্দিন',
  companyNamePlaceholder: 'যেমন: ঢাকা গ্যাস ডিস্ট্রিবিউটর্স লিমিটেড',
  passwordPlaceholder: 'কমপক্ষে ৮টি অক্ষর',
  confirmPasswordPlaceholder: 'আপনার পাসওয়ার্ড নিশ্চিত করুন',

  // Home Page
  manageLpgDistributionBusiness:
    'বিস্তৃত টুল এবং বিশ্লেষণ সহ এলপিজি বিতরণ ব্যবসা পরিচালনা করুন',
  salesManagement: 'বিক্রয় ব্যবস্থাপনা',
  inventoryControl: 'মজুদ নিয়ন্ত্রণ',
  financialReports: 'আর্থিক প্রতিবেদন',
  dailySalesRetailDrivers:
    'দৈনিক বিক্রয় ট্র্যাক করুন, চালক পরিচালনা করুন এবং রিয়েল-টাইম আপডেটের সাথে কর্মক্ষমতা পর্যবেক্ষণ করুন।',
  automatedCalculationsExactFormulas:
    'সঠিক সূত্র সহ পূর্ণ এবং খালি সিলিন্ডারের জন্য স্বয়ংক্রিয় মজুদ গণনা।',
  viewComprehensiveReports:
    'আয়ের বিবৃতি এবং ব্যালেন্স শীট সহ বিস্তৃত আর্থিক প্রতিবেদন।',

  adminDashboardTitle: 'অ্যাডমিন ড্যাশবোর্ড',
  adminDashboardDescription: 'সিস্টেমের ওভারভিউ এবং মেট্রিক্স',
  companyManagementTitle: 'কোম্পানি ব্যবস্থাপনা',
  companyManagementDescription:
    'এলপিজি কোম্পানি এবং সরবরাহকারীদের পরিচালনা করুন',
  productManagementTitle: 'পণ্য ব্যবস্থাপনা',
  productManagementDescription:
    'পণ্যের প্রকার এবং মূল্য নির্ধারণ পরিচালনা করুন',
  distributorAssignmentsTitle: 'পরিবেশক নিয়োগ',
  distributorAssignmentsDescription:
    'পরিবেশকদের কাছে কোম্পানি/পণ্য বরাদ্দ করুন',
  pricingManagementTitle: 'মূল্য নির্ধারণ ব্যবস্থাপনা',
  pricingManagementDescription: 'মূল্য স্তর এবং নিয়োগ পরিচালনা করুন',
  userManagementTitle: 'ব্যবহারকারী ব্যবস্থাপনা',
  userManagementDescription: 'সিস্টেম ব্যবহারকারী এবং অনুমতি পরিচালনা করুন',
  systemAnalyticsTitle: 'সিস্টেম অ্যানালিটিক্স',
  systemAnalyticsDescription: 'প্ল্যাটফর্ম ব্যবহার এবং কর্মক্ষমতা মেট্রিক্স',
  auditLogsTitle: 'অডিট লগ',
  auditLogsDescription: 'সিস্টেমের কার্যকলাপ এবং পরিবর্তনগুলি দেখুন',
  systemSettingsTitle: 'সিস্টেম সেটিংস',
  systemSettingsDescription: 'গ্লোবাল সিস্টেম সেটিংস কনফিগার করুন',

  // Common Actions
  save: 'সংরক্ষণ',
  cancel: 'বাতিল',
  delete: 'মুছুন',
  edit: 'সম্পাদনা',
  add: 'যোগ করুন',
  search: 'অনুসন্ধান',
  filter: 'ফিল্টার',
  total: 'মোট',
  actions: 'কার্য',
  noQuickActionsAvailable: 'কোনো দ্রুত কার্য উপলব্ধ নেই',
  noPageAccessPermissions: 'কোনো পেজ অ্যাক্সেস অনুমতি নেই',
  contactAdminForPageAccess:
    'আপনার প্রশাসক আপনার অ্যাকাউন্টে পেজ অনুমতি নির্ধারণ করতে হবে। ড্যাশবোর্ড পেজ অ্যাক্সেসের জন্য তাদের সাথে যোগাযোগ করুন।',
  loading: 'লোড হচ্ছে',
  noData: 'কোন তথ্য নেই',
  noRecentActivity: 'কোনো সাম্প্রতিক কার্যকলাপ নেই',
  refresh: 'রিফ্রেশ',
  recalculate: 'পুনর্গণনা',
  export: 'এক্সপোর্ট',
  view: 'দেখুন',
  print: 'প্রিন্ট',
  download: 'ডাউনলোড',
  upload: 'আপলোড',
  submit: 'জমা দিন',
  next: 'পরবর্তী',
  previous: 'পূর্ববর্তী',
  close: 'বন্ধ',
  back: 'পিছনে',
  forward: 'এগিয়ে',
  confirm: 'নিশ্চিত করুন',
  logout: 'লগআউট',

  // Forms
  name: 'নাম',
  email: 'ইমেইল',
  phone: 'ফোন',
  address: 'ঠিকানা',
  code: 'কোড',
  description: 'বিবরণ',
  amount: 'পরিমাণ',
  totalAmount: 'মোট পরিমাণ',
  date: 'তারিখ',
  saleDate: 'বিক্রয়ের তারিখ',
  fixedToToday: 'আজকের তারিখে স্থির',
  notes: 'নোট',
  status: 'অবস্থা',
  type: 'ধরন',
  category: 'বিভাগ',

  inactive: 'নিষ্ক্রিয়',
  editCompany: 'কোম্পানি সম্পাদনা',
  createCompany: 'কোম্পানি তৈরি করুন',
  updateCompany: 'কোম্পানি আপডেট করুন',
  deleteCompany: 'কোম্পানি মুছুন',
  editProduct: 'পণ্য সম্পাদনা',
  deleteProduct: 'পণ্য মুছুন',
  cylinderSizes: 'সিলিন্ডারের আকার',
  full: 'পূর্ণ',
  empty: 'খালি',
  units: 'ইউনিট',
  clickToDeactivate: 'নিষ্ক্রিয় করতে ক্লিক করুন',
  clickToActivate: 'সক্রিয় করতে ক্লিক করুন',
  product: 'পণ্য',
  areYouSureDeleteCompany:
    'আপনি কি নিশ্চিত যে এই কোম্পানিটি মুছে ফেলতে চান? এটি সমস্ত সংশ্লিষ্ট পণ্যও মুছে ফেলবে।',
  areYouSureDeleteProduct: 'আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?',
  areYouSureDeleteCylinderSize:
    'আপনি কি নিশ্চিত যে এই সিলিন্ডারের আকারটি মুছে ফেলতে চান?',
  failedToSaveCompany: 'কোম্পানি সংরক্ষণ করতে ব্যর্থ',
  failedToSaveProduct: 'পণ্য সংরক্ষণ করতে ব্যর্থ',
  failedToDeleteProduct: 'পণ্য মুছতে ব্যর্থ',
  unknownError: 'অজানা ত্রুটি',

  // Product management page specific translations
  noProductsFound: 'কোন পণ্য পাওয়া যায়নি',
  noCylinderSizesFound: 'কোন সিলিন্ডার সাইজ পাওয়া যায়নি',
  cylinderTypeSize: 'সিলিন্ডার ধরন/সাইজ',
  selectFromAvailableCylinderSizes: 'উপলব্ধ সিলিন্ডার সাইজ থেকে নির্বাচন করুন',
  selectCylinderSize: 'সিলিন্ডার সাইজ নির্বাচন করুন',
  manageCylinderSizes: 'সিলিন্ডার সাইজ পরিচালনা করুন',
  threshold: 'সীমা',
  addCylinderSize: 'সিলিন্ডার সাইজ যোগ করুন',
  editCylinderSize: 'সিলিন্ডার সাইজ সম্পাদনা করুন',
  createCylinderSize: 'সিলিন্ডার সাইজ তৈরি করুন',
  updateCylinderSize: 'সিলিন্ডার সাইজ আপডেট করুন',
  deleteCylinderSize: 'সিলিন্ডার সাইজ মুছুন',
  enterCylinderSizeExample:
    'সিলিন্ডার সাইজ প্রবেশ করান (যেমন, ১২এল, ৩৫এল, ৫কেজি, ২০এল)',
  createProduct: 'পণ্য তৈরি করুন',
  updateProduct: 'পণ্য আপডেট করুন',

  // User management form translations
  addNewUser: 'নতুন ব্যবহারকারী যোগ করুন',
  enterFullNamePlaceholder: 'পূর্ণ নাম লিখুন',
  enterEmailAddressPlaceholder: 'ই-মেইল ঠিকানা লিখুন',
  enterPasswordPlaceholder: 'পাসওয়ার্ড লিখুন (কমপক্ষে ৮ অক্ষর)',
  pageAccessPermissions: 'পেজ অ্যাক্সেস অনুমতি',
  selectAll: 'সব নির্বাচন করুন',
  selectNone: 'কিছুই নির্বাচন করবেন না',
  overview: 'সংক্ষিপ্ত বিবরণ',
  finance: 'অর্থ',
  administration: 'প্রশাসন',

  // Permission selector UI
  pages: 'পেজ',
  all: 'সব',
  some: 'কিছু',
  none: 'কিছুই না',
  selected: 'নির্বাচিত:',
  of: 'এর মধ্যে',

  // Page names for permissions
  dashboardPage: 'ড্যাশবোর্ড',
  dailySalesReportPage: 'দৈনিক বিক্রয় রিপোর্ট',
  inventoryPage: 'মজুদ',
  analyticsPage: 'অ্যানালিটিক্স',
  salesPage: 'বিক্রয়',
  receivablesPage: 'প্রাপ্য',
  expensesPage: 'খরচ',
  shipmentsPage: 'চালান',
  assetsPage: 'সম্পদ',
  driversPage: 'চালক',
  productManagementPage: 'পণ্য ব্যবস্থাপনা',
  reportsPage: 'রিপোর্ট',
  usersPage: 'ব্যবহারকারী',
  userManagementPage: 'ব্যবহারকারী ব্যবস্থাপনা',
  settingsPage: 'সেটিংস',

  // Page descriptions
  mainDashboardOverview: 'প্রধান ড্যাশবোর্ড সংক্ষিপ্ত বিবরণ',
  viewDailySalesReports: 'দৈনিক বিক্রয় রিপোর্ট দেখুন',
  manageInventoryAndStockLevels: 'মজুদ এবং স্টক স্তর পরিচালনা করুন',
  businessAnalyticsAndInsights: 'ব্যবসায়িক অ্যানালিটিক্স এবং অন্তর্দৃষ্টি',
  manageSalesTransactions: 'বিক্রয় লেনদেন পরিচালনা করুন',
  trackCustomerReceivables: 'গ্রাহক প্রাপ্য ট্র্যাক করুন',
  manageBusinessExpenses: 'ব্যবসায়িক খরচ পরিচালনা করুন',
  trackShipmentsAndDeliveries: 'চালান এবং ডেলিভারি ট্র্যাক করুন',
  manageCompanyAssets: 'কোম্পানির সম্পদ পরিচালনা করুন',
  manageDriversAndAssignments: 'চালক এবং নিয়োগ পরিচালনা করুন',
  manageProductsAndPricing: 'পণ্য এবং মূল্য নির্ধারণ পরিচালনা করুন',
  generateBusinessReports: 'ব্যবসায়িক রিপোর্ট তৈরি করুন',
  manageSystemUsers: 'সিস্টেম ব্যবহারকারী পরিচালনা করুন',
  systemSettingsAndConfiguration: 'সিস্টেম সেটিংস এবং কনফিগারেশন',

  // Assets form translations
  addNew: 'নতুন যোগ করুন',
  assetValue: 'সম্পদের মূল্য',
  optionalDescriptionPlaceholder: 'ঐচ্ছিক বিবরণ',
  enterAssetNamePlaceholder: 'সম্পদের নাম লিখুন',
  enterLiabilityNamePlaceholder: 'দায়ের নাম লিখুন',

  // Asset translations
  dueDate: 'নির্ধারিত তারিখ',
  noDate: 'কোন তারিখ নেই',
  invalidDate: 'অবৈধ তারিখ',
  noTimestamp: 'কোন টাইমস্ট্যাম্প নেই',
  invalidTimestamp: 'অবৈধ টাইমস্ট্যাম্প',
  current: 'বর্তমান',
  dueSoon: 'শীঘ্রই প্রদেয়',
  overdue: 'বকেয়া',
  paid: 'পরিশোধিত',

  // Receivables translations
  failedToFetchReceivables: 'বাকি আনতে ব্যর্থ',
  receivablesRecalculatedSuccessfully: 'বাকি সফলভাবে পুনর্গণনা হয়েছে',
  failedToRecalculateReceivables: 'বাকি পুনর্গণনা করতে ব্যর্থ',
  failedToFetchReceivablesChanges: 'বাকি পরিবর্তন আনতে ব্যর্থ',
  customerReceivableUpdatedSuccessfully: 'গ্রাহকের বাকি সফলভাবে আপডেট হয়েছে',
  customerReceivableAddedSuccessfully: 'গ্রাহকের বাকি সফলভাবে যোগ হয়েছে',
  addCustomerReceivable: 'গ্রাহকের বাকি যোগ করুন',
  editCustomerReceivable: 'গ্রাহকের বাকি সম্পাদনা করুন',
  customerNamePlaceholder: 'গ্রাহকের নাম প্রবেশ করান...',
  cashReceivable: 'নগদ বাকি',
  cylinderReceivable: 'সিলিন্ডার বাকি',
  enterPaymentAmount: 'পরিমাণ প্রবেশ করান',
  failedToSaveCustomerReceivable: 'গ্রাহকের বাকি সংরক্ষণ করতে ব্যর্থ',
  customerReceivableDeletedSuccessfully:
    'গ্রাহকের বাকি সফলভাবে মুছে ফেলা হয়েছে',
  failedToDeleteCustomerReceivable: 'গ্রাহকের বাকি মুছতে ব্যর্থ',
  paymentRecordedSuccessfully: 'পেমেন্ট সফলভাবে রেকর্ড হয়েছে',
  failedToRecordPayment: 'পেমেন্ট রেকর্ড করতে ব্যর্থ',
  cylinderReturnRecordedSuccessfully: 'সিলিন্ডার ফেরত সফলভাবে রেকর্ড হয়েছে',
  failedToRecordCylinderReturn: 'সিলিন্ডার ফেরত রেকর্ড করতে ব্যর্থ',
  enterNumberOfCylinders: 'সিলিন্ডারের সংখ্যা লিখুন',
  recordPayment: 'পেমেন্ট রেকর্ড করুন',
  recordCylinderReturn: 'সিলিন্ডার ফেরত রেকর্ড করুন',
  recordReturn: 'ফেরত রেকর্ড করুন',
  customerReceivablesDontMatch: 'গ্রাহকের বাকি মিলছে না',
  driverTotalReceivablesFromSales: 'ড্রাইভারের মোট বাকি (বিক্রয় থেকে)',
  customerReceivableTotalsMustEqual: 'গ্রাহকের বাকি মোট সমান হতে হবে',
  cashMismatch: 'নগদ অমিল',
  customerTotal: 'গ্রাহকের মোট',
  salesTotal: 'বিক্রয়ের মোট',
  difference: 'পার্থক্য',
  cylinderMismatch: 'সিলিন্ডার অমিল',
  customersWithOverduePayments: 'বকেয়া পেমেন্ট সহ গ্রাহকরা',
  requireImmediate: 'তাৎক্ষণিক প্রয়োজন',
  receivablesManagementSystemRules: 'বাকি ব্যবস্থাপনা সিস্টেম নিয়ম',
  driverTotalReceivables: 'ড্রাইভারের মোট বাকি',
  automaticallyCalculatedFromSales: 'বিক্রয় থেকে স্বয়ংক্রিয়ভাবে গণনা',
  customerReceivablesManuallyManaged: 'গ্রাহকের বাকি ম্যানুয়ালি পরিচালিত',
  validation: 'বৈধতা',
  customerTotalsMustEqualDriverSales:
    'গ্রাহকের মোট ড্রাইভার বিক্রয়ের সমান হতে হবে',
  payments: 'পেমেন্ট',
  paymentsAutomaticallyAdded: 'পেমেন্ট স্বয়ংক্রিয়ভাবে যোগ',
  changesLogAllReceivableActions: 'সমস্ত বাকি কার্যক্রম লগ পরিবর্তন',
  managerAccess: 'ম্যানেজার অ্যাক্সেস',
  youCanRecordPayments: 'আপনি পেমেন্ট রেকর্ড করতে পারেন',
  salesCashReceivables: 'বিক্রয় নগদ বাকি',
  fromSalesData: 'বিক্রয় ডেটা থেকে',
  salesCylinderReceivables: 'বিক্রয় সিলিন্ডার বাকি',

  companyCreatedUpdatedSuccessfully: 'কোম্পানি সফলভাবে তৈরি/আপডেট হয়েছে',
  productCreatedUpdatedSuccessfully: 'পণ্য সফলভাবে তৈরি/আপডেট হয়েছে',
  productDeletedSuccessfully: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে',
  refreshingList: 'তালিকা রিফ্রেশ করা হচ্ছে...',
  productListRefreshed: 'পণ্যের তালিকা রিফ্রেশ হয়েছে',
  productListRefreshedAfterDeletion:
    'মুছে ফেলার পর পণ্যের তালিকা রিফ্রেশ হয়েছে',
  errorFetchingCompanies: 'কোম্পানি আনতে ত্রুটি',
  errorFetchingProducts: 'পণ্য আনতে ত্রুটি',
  errorFetchingCylinderSizes: 'সিলিন্ডারের আকার আনতে ত্রুটি',
  errorSavingCompany: 'কোম্পানি সংরক্ষণে ত্রুটি',
  errorSavingProduct: 'পণ্য সংরক্ষণে ত্রুটি',
  errorDeletingCompany: 'কোম্পানি মুছতে ত্রুটি',
  errorDeletingProduct: 'পণ্য মুছতে ত্রুটি',
  errorDeletingCylinderSize: 'সিলিন্ডারের আকার মুছতে ত্রুটি',
  errorTogglingProductStatus: 'পণ্যের স্থিতি পরিবর্তনে ত্রুটি',
  errorSavingCylinderSize: 'সিলিন্ডারের আকার সংরক্ষণে ত্রুটি',

  searchCylinderSizes: 'সিলিন্ডারের আকার অনুসন্ধান করুন',
  productNamePlaceholder: 'পণ্যের নাম লিখুন',
  cylinderSizePlaceholder: 'সিলিন্ডারের আকার লিখুন',
  optionalDescription: 'ঐচ্ছিক বিবরণ',
  failedToSaveCylinderSize: 'সিলিন্ডারের আকার সংরক্ষণ ব্যর্থ',
  price: 'দাম',
  weight: 'ওজন',
  fullCylinderWeight: 'পূর্ণ সিলিন্ডারের ওজন',
  emptyCylinderWeight: 'খালি সিলিন্ডারের ওজন',
  lowStockThreshold: 'কম স্টকের সীমা',
  areYouSureDeleteCustomerReceivable:
    'আপনি কি নিশ্চিত যে এই গ্রাহক বাকি মুছে ফেলতে চান?',
  noCashReceivables: 'কোনো নগদ বাকি নেই',
  noCylinderReceivables: 'কোনো সিলিন্ডার বাকি নেই',
  receivableType: 'বাকির ধরন',
  mobile: 'মোবাইল',
  bank: 'ব্যাংক',
  transfer: 'স্থানান্তর',
  enterAmount: 'পরিমাণ লিখুন',
  enterQuantity: 'পরিমাণ লিখুন',
  enterNotes: 'নোট লিখুন',
  selectSize: 'আকার নির্বাচন করুন',
  selectPaymentMethod: 'পেমেন্ট পদ্ধতি নির্বাচন করুন',
  changes: 'পরিবর্তন',
  loadingReceivables: 'বাকি লোড হচ্ছে',
  loadingChanges: 'পরিবর্তন লোড হচ্ছে',
  failedToFetchCylinderSizes: 'সিলিন্ডারের আকার আনতে ব্যর্থ',
  assetsAndLiabilities: 'সম্পদ এবং দায়',
  companyAssets: 'কোম্পানির সম্পদ',
  companyLiabilities: 'কোম্পানির দায়',
  addAssetsLiabilities: 'সম্পদ/দায় যোগ করুন',
  netWorth: 'নেট মূল্য',
  depreciation: 'অবচয়',
  assetName: 'সম্পদের নাম',
  unitValue: 'একক মূল্য',
  netValue: 'নেট মূল্য',
  liability: 'দায়',
  liabilityName: 'দায় নাম',

  fixedAsset: 'স্থায়ী সম্পদ',
  currentAsset: 'চলতি সম্পদ',
  currentLiability: 'চলতি দায়',
  longTermLiability: 'দীর্ঘমেয়াদী দায়',
  editAsset: 'সম্পদ সম্পাদনা',
  deleteAsset: 'সম্পদ মুছুন',
  editLiability: 'দায় সম্পাদনা',
  deleteLiability: 'দায় মুছুন',

  // Additional assets page translations
  asset: 'সম্পদ',
  liabilityWord: 'দায়',

  autoCalculatedFromInventory: 'মজুদ থেকে স্বয়ংক্রিয় গণনা',

  setUnitPrice: 'একক মূল্য নির্ধারণ করুন',
  editable: 'সম্পাদনাযোগ্য',
  autoCalculatedCurrentAssets: 'স্বয়ংক্রিয় গণনাকৃত চলতি সম্পদ',
  noAutoCalculatedAssetsFound: 'কোনো স্বয়ংক্রিয় গণনাকৃত সম্পদ পাওয়া যায়নি।',
  autoCalculatedAssetsDescription:
    'মজুদ এবং প্রাপ্যের মতো স্বয়ংক্রিয় গণনাকৃত সম্পদ এখানে প্রদর্শিত হবে।',
  updated: 'আপডেট করা হয়েছে',

  successfully: 'সফলভাবে',
  failedToUpdateCreateEntry: 'এন্ট্রি আপডেট/তৈরি করতে ব্যর্থ',
  assetPlaceholder: 'যেমন, যানবাহন, সরঞ্জাম, মজুদ',
  realTimeValuesLinkedToBusinessOperations:
    'ব্যবসায়িক কার্যক্রমের সাথে সংযুক্ত রিয়েল-টাইম মান',

  // Balance Sheet and Quick Actions
  balanceSheetSummary: 'ব্যালেন্স শীট সারাংশ',
  totalAssets: 'মোট সম্পদ',
  totalLiabilities: 'মোট দায়',
  netEquity: 'নেট ইক্যুইটি',
  quickAddAsset: 'দ্রুত সম্পদ যোগ',
  addNewAssetToPortfolio:
    'আপনার কোম্পানির পোর্টফোলিওতে একটি নতুন সম্পদ যোগ করুন',

  quickAddLiability: 'দ্রুত দায় যোগ',
  addNewLiabilityToRecords: 'আপনার কোম্পানির রেকর্ডে একটি নতুন দায় যোগ করুন',

  // Asset descriptions

  cashInHand: 'হাতে নগদ',

  // Depreciation schedule
  assetDepreciationSchedule: 'সম্পদ অবচয় তালিকা',
  assetsWithDepreciationRates: 'অবচয় হার এবং সঞ্চিত অবচয় সহ সম্পদ',
  originalCost: 'মূল খরচ',

  depreciationMethod: 'অবচয় পদ্ধতি',
  annualRate: 'বার্ষিক হার',
  yearsOwned: 'মালিকানার বছর',
  accumulated: 'সঞ্চিত',
  currentValue: 'বর্তমান মূল্য',
  noAssetsWithDepreciationFound: 'অবচয় সহ কোনো সম্পদ পাওয়া যায়নি।',
  addAssetsWithPurchaseDates:
    'তাদের অবচয় তালিকা দেখতে ক্রয়ের তারিখ এবং অবচয় হার সহ সম্পদ যোগ করুন।',
  addDepreciableAsset: 'অবচয়যোগ্য সম্পদ যোগ করুন',

  // Other missing translations

  loan: 'ঋণ',

  // Asset name translations
  cashReceivablesAsset: 'নগদ বাকি',
  cashInHandAsset: 'হাতে নগদ',

  assetDeletedSuccessfully: 'সম্পদ সফলভাবে মুছে ফেলা হয়েছে!',
  liabilityDeletedSuccessfully: 'দায় সফলভাবে মুছে ফেলা হয়েছে!',
  unitValueUpdatedSuccessfully: 'ইউনিট মূল্য সফলভাবে আপডেট হয়েছে!',
  assetCreatedSuccessfully: 'সম্পদ সফলভাবে তৈরি হয়েছে!',
  assetUpdatedSuccessfully: 'সম্পদ সফলভাবে আপডেট হয়েছে!',
  liabilityCreatedSuccessfully: 'দেনা সফলভাবে তৈরি হয়েছে!',
  liabilityUpdatedSuccessfully: 'দেনা সফলভাবে আপডেট হয়েছে!',
  failedToLoadAssetsLiabilities:
    'সম্পদ ও দেনার ডেটা লোড করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToDeleteAsset: 'সম্পদ মুছতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToDeleteLiability: 'দেনা মুছতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToUpdateUnitValue:
    'ইউনিট মূল্য আপডেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToCreateAsset: 'সম্পদ তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToUpdateAsset: 'সম্পদ আপডেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToCreateLiability:
    'দেনা তৈরি করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  failedToUpdateLiability:
    'দেনা আপডেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।',
  areYouSureDeleteAsset: 'আপনি কি নিশ্চিত যে এই সম্পদটি মুছে ফেলতে চান?',
  areYouSureDeleteLiability: 'আপনি কি নিশ্চিত যে এই দায়টি মুছে ফেলতে চান?',

  depreciationRate: 'অবচয়ের হার',
  subCategory: 'উপ-বিভাগ',

  auto: 'স্বয়ংক্রিয়',
  noAssetsFound:
    'কোনো সম্পদ পাওয়া যায়নি। শুরু করতে "সম্পদ/দায় যোগ করুন" ক্লিক করুন।',
  noLiabilitiesFound:
    'কোনো দায় পাওয়া যায়নি। শুরু করতে "সম্পদ/দায় যোগ করুন" ক্লিক করুন।',

  editAssetTitle: 'সম্পদ সম্পাদনা করুন',

  editLiabilityTitle: 'দেনা সম্পাদনা করুন',
  enterAssetName: 'সম্পদের নাম লিখুন',
  enterLiabilityName: 'দেনার নাম লিখুন',
  enterValue: 'মান লিখুন',
  notAvailable: 'প্রযোজ্য নয়',
  vehicles: 'যানবাহন',
  equipment: 'সরঞ্জাম',
  property: 'সম্পত্তি',
  // Auto-generated missing properties (need Bengali translation)
  quantity: 'পরিমাণ',
  unitPrice: 'একক দাম',
  discount: 'ছাড়',
  totalValue: 'মোট মূল্য',
  packageSales: 'প্যাকেজ বিক্রয়',
  refillSales: 'রিফিল বিক্রয়',
  cylinder: 'সিলিন্ডার',
  cylinders: 'সিলিন্ডার',
  products: 'পণ্য',

  cashDepositsByDriver: 'চালক অনুযায়ী নগদ জমা',
  includesReceivablePayments: 'বাকি পেমেন্ট অন্তর্ভুক্ত',
  driverExpense: 'চালক খরচ',
  loadingData: 'লোড হচ্ছে তথ্য',
  noDataAvailable: 'কোন তথ্য উপলব্ধ',
  tryAgain: 'আবার চেষ্টা করুন',
  performance: 'কর্মক্ষমতা',
  month: 'মাস',
  year: 'বছর',
  allDrivers: 'সব চালক',
  totalRevenue: 'মোট আয়',
  revenue: 'আয়',
  comingSoon: 'শীঘ্রই আসছে',
  exportReport: 'রিপোর্ট এক্সপোর্ট',
  exportReportFunctionality: 'রিপোর্ট এক্সপোর্ট সুবিধা',

  // Reports page specific
  generateAndViewComprehensiveBusinessReports:
    'ব্যাপক ব্যবসায়িক প্রতিবেদন তৈরি এবং দেখুন',
  thisWeek: 'এই সপ্তাহ',
  thisQuarter: 'এই ত্রৈমাসিক',
  customReport: 'কাস্টম রিপোর্ট',
  revenueExpensesAndProfitAnalysis: 'আয়, খরচ এবং লাভ বিশ্লেষণ',
  pdf: 'পিডিএফ',
  excel: 'এক্সেল',
  last: 'শেষ',
  assetsLiabilitiesAndEquityOverview: 'সম্পদ, দায় এবং ইক্যুইটি ওভারভিউ',
  cashInflowsAndOutflowsTracking: 'নগদ আগমন এবং বহির্গমন ট্র্যাকিং',
  detailedSalesPerformanceAnalysis: 'বিস্তারিত বিক্রয় কর্মক্ষমতা বিশ্লেষণ',
  stockLevelsAndMovementAnalysis: 'স্টক স্তর এবং চলাচল বিশ্লেষণ',
  individualDriverSalesAndEfficiency: 'ব্যক্তিগত চালক বিক্রয় এবং দক্ষতা',
  incomeStatementRealTime: 'আয় বিবৃতি (রিয়েল-টাইম)',
  revenueByTypeDriverWithLiveCalculations: 'লাইভ গণনা সহ ধরন/চালক অনুযায়ী আয়',
  costOfGoodsSold: 'বিক্রীত পণ্যের খরচ',
  cylinderPurchases: 'সিলিন্ডার ক্রয়',
  grossProfit: 'মোট লাভ',
  operatingExpenses: 'পরিচালনা খরচ',
  fuelTransportation: 'জ্বালানি ও পরিবহন',
  otherExpenses: 'অন্যান্য খরচ',
  netIncome: 'নিট আয়',
  grossMargin: 'মোট মার্জিন',
  balanceSheetAutoValidated: 'ব্যালেন্স শীট (স্বয়ংক্রিয় যাচাই)',
  balanced: 'সুষম',
  outOfBalance: 'ভারসাম্যহীন',
  currentAssets: 'চলতি সম্পদ',
  cashBank: 'নগদ ও ব্যাংক',
  inventoryAutoLinked: 'মজুদ (স্বয়ংক্রিয় লিঙ্ক)',
  fixedAssets: 'স্থায়ী সম্পদ',
  buildings: 'ভবন',
  liabilitiesEquity: 'দায় ও ইক্যুইটি',
  currentLiabilities: 'চলতি দায়',
  shortTermLoans: 'স্বল্পমেয়াদী ঋণ',
  longTermLiabilities: 'দীর্ঘমেয়াদী দায়',
  longTermLoans: 'দীর্ঘমেয়াদী ঋণ',
  ownerEquity: 'মালিকের ইক্যুইটি',
  retainedEarnings: 'সঞ্চিত আয়',
  totalLiabEquity: 'মোট দায় ও ইক্যুইটি',
  balanceCheck: 'ব্যালেন্স চেক',
  assetsEqualsLiabilitiesPlusEquity: 'সম্পদ = দায় + ইক্যুইটি',
  passed: 'পাস',
  cashFlowStatementRealTime: 'নগদ প্রবাহ বিবৃতি (রিয়েল-টাইম)',
  operatingInvestingFinancingActivities:
    'পরিচালনা, বিনিয়োগ ও অর্থায়ন কার্যক্রম',
  operatingActivities: 'পরিচালনা কার্যক্রম',
  changeInReceivables: 'বাকিের পরিবর্তন',
  changeInInventory: 'মজুদের পরিবর্তন',
  changeInPayables: 'প্রদেয়ের পরিবর্তন',
  operatingCashFlow: 'পরিচালনা নগদ প্রবাহ',
  investingActivities: 'বিনিয়োগ কার্যক্রম',
  vehiclePurchases: 'যানবাহন ক্রয়',
  equipmentPurchases: 'সরঞ্জাম ক্রয়',
  investingCashFlow: 'বিনিয়োগ নগদ প্রবাহ',
  financingActivities: 'অর্থায়ন কার্যক্রম',
  ownerDrawings: 'মালিকের উত্তোলন',
  loanRepayments: 'ঋণ পরিশোধ',
  financingCashFlow: 'অর্থায়ন নগদ প্রবাহ',
  netChangeInCash: 'নগদের নিট পরিবর্তন',
  cashAtBeginningOfPeriod: 'মেয়াদের শুরুতে নগদ',
  cashAtEndOfPeriod: 'মেয়াদের শেষে নগদ',
  operatingCashFlowIsPositive: 'পরিচালনা নগদ প্রবাহ ইতিবাচক',
  healthyBusinessOperations: 'সুস্থ ব্যবসায়িক কার্যক্রম',

  // Additional missing translations
  incomeStatement: 'আয় বিবৃতি',
  cashFlowStatement: 'নগদ প্রবাহ বিবৃতি',
  salesReport: 'বিক্রয় প্রতিবেদন',
  inventoryReport: 'মজুদ প্রতিবেদন',
  thisYear: 'এই বছর',
  netProfit: 'নিট লাভ',

  // Dashboard welcome message
  welcomeBack: 'স্বাগতম',

  // Dashboard activity messages
  sold: 'বিক্রি করেছেন',
  completedSale: 'বিক্রয় সম্পন্ন',
  lowStockAlert: 'কম স্টক সতর্কতা',
  fullCylindersRemaining: 'পূর্ণ সিলিন্ডার অবশিষ্ট',
  highReceivablesBalance: 'উচ্চ বাকি ব্যালেন্স',
  completedSales: 'সম্পন্ন',
  dailyTargetAchieved: 'দৈনিক লক্ষ্য অর্জিত!',
  salesMilestone: 'বিক্রয় - দৈনিক লক্ষ্য অর্জিত!',
  hoursAgo: 'ঘন্টা আগে',
  minutesAgo: 'মিনিট আগে',

  // Reports page hardcoded strings
  customReportBuilderComingSoon: 'কাস্টম রিপোর্ট বিল্ডার শীঘ্রই আসছে!',
  exportCompleted: 'এক্সপোর্ট সম্পন্ন',
  exportFailed: 'এক্সপোর্ট ব্যর্থ। আবার চেষ্টা করুন।',
  pleaseRetryAgain: 'আবার চেষ্টা করুন',
  hasBeenEmailedToConfiguredRecipients:
    'কনফিগার করা প্রাপকদের কাছে ইমেইল করা হয়েছে।',
  emailFailed: 'ইমেইল ব্যর্থ। ইমেইল কনফিগারেশন চেক করুন।',
  pleaseCheckEmailConfiguration: 'ইমেইল কনফিগারেশন চেক করুন',
  viewDetailsBelow: 'নিচে বিস্তারিত দেখুন',
  realTime: 'রিয়েল-টাইম',
  autoValidated: 'স্বয়ংক্রিয় যাচাই',
  salaries: 'বেতন',
  maintenance: 'রক্ষণাবেক্ষণ',
  rent: 'ভাড়া',
  utilities: 'ইউটিলিটি',
  profitMargin: 'লাভের মার্জিন',
  accountsReceivable: 'বাকি হিসাব',
  accountsPayable: 'প্রদেয় হিসাব',

  customerRecords: 'গ্রাহক রেকর্ড',
  statusBreakdown: 'স্ট্যাটাস বিভাজন',
  noReceivablesFound: 'না বাকি পাওয়া গেছে',
  noChangesRecorded: 'না পরিবর্তন রেকর্ড',
  receivablesChangesLog: 'বাকি পরিবর্তন লগ',
  amountPlaceholder: 'প্রবেশ করান পরিমাণ...',
  enterExpenseDescription: 'প্রবেশ করান খরচ বিবরণ',
  selectParentCategory: 'নির্বাচন করুন প্যারেন্ট বিভাগ',
  selectCategory: 'নির্বাচন করুন বিভাগ',
  expenseDate: 'খরচ তারিখ',
  receiptUrl: 'রশিদের ইউআরএল',
  receiptUrlPlaceholder: 'রশিদের ইউআরএল লিখুন...',
  submitting: 'জমা দেওয়া হচ্ছে...',
  activeDrivers: 'সক্রিয় চালকগণ',
  activeUsers: 'সক্রিয় ব্যবহারকারীগণ',
  addDriver: 'চালক যোগ করুন',
  addExpense: 'খরচ যোগ করুন',
  additionalNotesComments: 'অতিরিক্ত নোট ও মন্তব্য',
  addNewDriver: 'যোগ করুন নতুন চালক',
  addUser: 'যোগ করুন ব্যবহারকারী',
  administrator: 'প্রশাসক',
  administrators: 'প্রশাসকগণ',
  ago: 'আগে',
  alerts: 'সতর্কবার্তা',
  allCalculationsUpdatedRealTime: 'সমস্ত গণনা রিয়েল-টাইমে আপডেট করা হয়েছে',
  allCategories: 'সব বিভাগ',
  allCylinders: 'সমস্ত সিলিন্ডার',
  allGood: 'সব ভাল',
  allStatus: 'সব অবস্থা',
  approved: 'অনুমোদিত',
  approvedExpenses: 'অনুমোদিত খরচ',
  approveExpense: 'অনুমোদন খরচ',
  area: 'এলাকা',
  areYouSureDeleteDriver: 'আপনি কি নিশ্চিতভাবে এই চালককে মুছে ফেলতে চান?',
  assetsLiabilities: 'সম্পদ ও দেনা',
  assignedArea: 'নির্ধারিত এলাকা',
  balanceSheet: 'ব্যালেন্স শিট',
  businessFormulaImplementation: 'ব্যবসায়িক ফর্মুলা প্রয়োগ',

  changesLog: 'পরিবর্তন লগ',
  checkStock: 'চেক স্টক',
  clear: 'পরিষ্কার',
  company: 'কোম্পানি',
  completeSystemAccessAndUserManagement:
    'সম্পূর্ণ সিস্টেম অ্যাক্সেস এবং ব্যবহারকারী ব্যবস্থাপনা',
  confirmDeleteUser: 'ব্যবহারকারী মুছে ফেলা নিশ্চিত করুন',
  contactName: 'যোগাযোগ নাম',
  contactNumber: 'যোগাযোগ নম্বর',
  create: 'তৈরি করুন',
  criticalAlert: 'সমালোচনামূলক সতর্কতা',
  currency: 'মুদ্রা',
  defaultTimezone: 'ডিফল্ট টাইমজোন',
  configureGlobalSettings: 'গ্লোবাল সেটিংস কনফিগার করুন',
  settingsChangeNote:
    'নোট: এই সেটিংসের পরিবর্তন সিস্টেমের সমস্ত ব্যবহারকারী এবং আর্থিক গণনাকে প্রভাবিত করবে।',
  currencySettingDescription:
    'এটি সমস্ত আর্থিক গণনা এবং ডিসপ্লের জন্য ব্যবহৃত হবে',
  timezoneSettingDescription:
    'এটি সমস্ত টাইমস্ট্যাম্প এবং সময়সূচীকে প্রভাবিত করবে',
  languageSettingDescription:
    'এটি ইন্টারফেস ভাষা এবং তারিখ/সংখ্যা ফরম্যাটকে প্রভাবিত করবে',
  generalSettingsDescription:
    'মুদ্রা, টাইমজোন এবং ভাষার জন্য গ্লোবাল সেটিংস কনফিগার করুন',
  currencySettingImpact: 'এটি সমস্ত আর্থিক গণনা এবং ডিসপ্লের জন্য ব্যবহৃত হবে',
  timezoneSettingImpact: 'এটি সমস্ত টাইমস্ট্যাম্প এবং সময়সূচীকে প্রভাবিত করবে',
  languageSettingImpact:
    'এটি ইন্টারফেস ভাষা এবং তারিখ/সংখ্যা ফরম্যাটকে প্রভাবিত করবে',
  currencyUsageDescription:
    'এটি সমস্ত আর্থিক গণনা এবং ডিসপ্লের জন্য ব্যবহৃত হবে',
  timezoneUsageDescription:
    'এটি সমস্ত টাইমস্ট্যাম্প এবং সময়সূচীকে প্রভাবিত করবে',
  languageUsageDescription:
    'এটি ইন্টারফেস ভাষা এবং তারিখ/সংখ্যা ফরম্যাটকে প্রভাবিত করবে',
  localTime: 'স্থানীয় সময়',
  settingsChangeWarning:
    'এই সেটিংসের পরিবর্তন সিস্টেমের সমস্ত ব্যবহারকারী এবং আর্থিক গণনাকে প্রভাবিত করবে',
  saving: 'সংরক্ষণ করা হচ্ছে',
  currentFullCylinderInventory: 'বর্তমান পূর্ণ সিলিন্ডার মজুদ',
  currentStock: 'বর্তমান স্টক',
  currentStockHealth: 'বর্তমান স্টক পরিস্থিতি',
  customers: 'গ্রাহকগণ',
  cylinderReceivables: 'সিলিন্ডার বাকি',
  cylindersReceived: 'গৃহীত সিলিন্ডার',
  cylindersSold: 'বিক্রি হওয়া সিলিন্ডার',
  cylindersSummaryApiError: 'ত্রুটি: সিলিন্ডার সারাংশ এপিআই',
  cylindersSummaryDataReceived: 'সিলিন্ডার সারসংক্ষেপ তথ্য প্রাপ্ত',
  cylindersSummaryResponseStatus: 'সিলিন্ডার সারাংশ প্রতিক্রিয়া স্ট্যাটাস',
  dailyCalculations: 'দৈনিক গণনা',
  dailyInventoryTracking: 'দৈনিক মজুদ ট্র্যাক',
  dataSources: 'ডেটার উৎস',
  day: 'দিন',
  days: 'দিন',
  deleteExpense: 'মুছুন খরচ',
  deleteUser: 'মুছুন ব্যবহারকারী',
  deleting: 'মুছে ফেলা হচ্ছে...',
  details: 'বিস্তারিত',
  driver: 'চালক',
  driverAddedSuccessfully: 'চালক সফলভাবে যোগ করা হয়েছে।',
  driverDeletedSuccessfully: 'চালক সফলভাবে মুছে ফেলা হয়েছে।',
  driverDetails: 'চালকের বিবরণ',
  driverManagement: 'চালক ব্যবস্থাপনা',
  driverName: 'চালকের নাম',
  driverType: 'চালকের ধরন',
  driverUpdatedSuccessfully: 'চালকের তথ্য সফলভাবে আপডেট করা হয়েছে।',
  editDriver: 'সম্পাদনা চালক',
  editExpense: 'সম্পাদনা খরচ',
  editUser: 'সম্পাদনা ব্যবহারকারী',
  emailAddress: 'ই-মেইল ঠিকানা',
  emergencyContact: 'জরুরী যোগাযোগ',
  emptyCylinderInventoryAvailability: 'খালি সিলিন্ডারের মজুদ প্রাপ্যতা',

  emptyCylindersBuySell: 'খালি সিলিন্ডার ক্রয়/বিক্রয়',
  emptyCylindersInHand: 'স্টকে খালি সিলিন্ডার',
  emptyCylinderReceivables: 'খালি সিলিন্ডার বাকি',
  emptyCylindersReceivable: 'খালি সিলিন্ডার বাকি',
  emptyCylindersInStock: 'স্টকে খালি সিলিন্ডার',
  emptyCylinderInventoryAndReceivables: 'খালি সিলিন্ডার মজুদ এবং বাকি',
  ongoingShipments: 'চলমান চালান',
  outstandingShipments: 'বকেয়া চালান',
  noOutstandingOrders: 'কোনো বকেয়া অর্ডার নেই।',
  enterAssignedAreaRoute: 'নির্ধারিত এলাকা/রুট লিখুন',
  enterEmailAddress: 'ই-মেইল ঠিকানা লিখুন',
  enterEmergencyContactName: 'প্রবেশ করান জরুরি যোগাযোগ নাম',
  enterEmergencyContactNumber: 'প্রবেশ করান জরুরি যোগাযোগ নম্বর',
  enterFullAddress: 'সম্পূর্ণ ঠিকানা লিখুন',
  enterFullName: 'প্রবেশ করান পূর্ণ নাম',
  enterLicenseNumber: 'প্রবেশ করান লাইসেন্স নম্বর',
  enterPhoneNumber: 'প্রবেশ করান ফোন নম্বর',
  error: 'ত্রুটি',
  errorFetchingCylindersSummaryData:
    'ত্রুটি আনা হচ্ছে সিলিন্ডার সারসংক্ষেপ তথ্য',
  errorFetchingDailyInventoryData: 'ত্রুটি আনা হচ্ছে দৈনিক মজুদ তথ্য',
  errorFetchingInventoryData: 'ত্রুটি আনা হচ্ছে মজুদ তথ্য',
  expense: 'খরচ',
  expenseManagement: 'খরচ ব্যবস্থাপনা',
  exportFunctionalityComingSoon: 'এক্সপোর্ট সুবিধা শীঘ্রই আসছে।',
  failedToCreateUser: 'ব্যর্থ করতে তৈরি করুন ব্যবহারকারী',
  failedToDeleteDriver: 'ব্যর্থ করতে মুছুন চালক',
  failedToDeleteUser: 'ব্যর্থ করতে মুছুন ব্যবহারকারী',
  failedToFetchUsers: 'ব্যবহারকারীদের তথ্য আনতে ব্যর্থ।',
  failedToLoadInventoryData: 'ব্যর্থ করতে লোড মজুদ তথ্য',
  failedToUpdateDriver: 'ব্যর্থ করতে আপডেট চালক',
  failedToUpdateUser: 'ব্যর্থ করতে আপডেট ব্যবহারকারী',
  fetchingCylindersSummaryData: 'আনা হচ্ছে সিলিন্ডার সারসংক্ষেপ তথ্য',
  filterByDriverType: 'চালকের ধরণ অনুযায়ী ফিল্টার করুন',
  fri: 'শুক্র',
  from: 'থেকে',
  fullAccess: 'পূর্ণ অ্যাক্সেস',

  fullName: 'পূর্ণ নাম',
  generalSettings: 'সাধারণ সেটিংস',
  getStartedByAddingFirstExpense: 'আপনার প্রথম খরচ যোগ করে শুরু করুন।',
  hour: 'ঘন্টা',
  hours: 'ঘন্টা',
  individualDailySalesData: 'ব্যক্তিগত দৈনিক বিক্রয় তথ্য',
  info: 'তথ্য',
  inventoryManagement: 'মজুদ ব্যবস্থাপনা',
  joiningDate: 'যোগদানের তারিখ',
  justNow: 'এইমাত্র',
  kPending: '{{k}} অপেক্ষারত',
  language: 'ভাষা',
  last7Days: 'শেষ ৭ দিন',
  lastMonth: 'শেষ মাস',
  lastLogin: 'শেষ লগইন',
  lastUpdated: 'শেষ আপডেট',
  latest: 'সর্বশেষ',
  licenseNumber: 'লাইসেন্স নম্বর',
  loadingDailySalesData: 'দৈনিক বিক্রয় তথ্য লোড হচ্ছে',
  loadingDriverPerformance: 'চালকের কর্মক্ষমতা লোড হচ্ছে',
  loadingInventoryData: 'মজুদ তথ্য লোড হচ্ছে',
  loadingText: 'টেক্সট লোড হচ্ছে',
  locationInformation: 'অবস্থানের তথ্য',
  login: 'লগইন',
  lpgDistributorManagementSystem: 'এলপিজি পরিবেশক ব্যবস্থাপনা সিস্টেম',
  manageBudgets: 'বাজেট পরিচালনা',
  manageCategories: 'বিভাগ পরিচালনা',
  manageLiabilities: 'দায় পরিচালনা',
  manager: 'ম্যানেজার',
  managers: 'ম্যানেজারগণ',
  manageSystemRoles: 'সিস্টেম ভূমিকা পরিচালনা',
  manageTeam: 'দল পরিচালনা',
  mon: 'সোম',
  monitorCylinderStock: 'সিলিন্ডার স্টক পর্যবেক্ষণ',
  needAdminPrivileges: 'প্রয়োজন অ্যাডমিন অধিকার',
  never: 'কখনো না',
  newSale: 'নতুন বিক্রয়',
  noActiveDriversFoundForThisPeriod:
    'এই সময়কালে কোনো সক্রিয় চালক পাওয়া যায়নি।',
  noDailyInventoryDataAvailable: 'কোন দৈনিক মজুদ তথ্য উপলব্ধ',
  noDailySalesDataFound: 'কোন দৈনিক বিক্রয় তথ্য পাওয়া গেছে',
  noDataFound: 'কোন তথ্য পাওয়া গেছে',
  noEmptyCylindersInInventory: 'কোন খালি সিলিন্ডার মধ্যে মজুদ',
  noFullCylindersInInventory: 'কোন পূর্ণ সিলিন্ডার মধ্যে মজুদ',
  notApplicable: 'প্রযোজ্য নয়',
  note: 'নোট',
  noUsersFound: 'কোনো ব্যবহারকারী পাওয়া যায়নি।',
  operationFailed: 'অপারেশন ব্যর্থ হয়েছে।',
  operations: 'অপারেশনস',
  outstanding: 'বকেয়া',
  packagePurchase: 'প্যাকেজ ক্রয়',
  packageRefillPurchase: 'প্যাকেজ রিফিল ক্রয়',
  packageRefillSales: 'প্যাকেজ রিফিল বিক্রয়',
  packageSale: 'প্যাকেজ বিক্রয়',
  packageSalesQty: 'প্যাকেজ বিক্রয় পরিমাণ',
  parentCategory: 'প্যারেন্ট বিভাগ',

  // Category Management
  categoryManagement: 'ক্যাটাগরি ব্যবস্থাপনা',
  addNewCategory: 'নতুন ক্যাটাগরি যোগ করুন',
  parentCategories: 'প্যারেন্ট ক্যাটাগরি',
  subCategories: 'সাব-ক্যাটাগরি',
  subCategoriesTitle: 'সাব-ক্যাটাগরি',
  noParentCategoriesFound:
    'কোনো প্যারেন্ট ক্যাটাগরি পাওয়া যায়নি। আপনার খরচ সংগঠিত করার জন্য প্রথম প্যারেন্ট ক্যাটাগরি তৈরি করুন।',
  noSubCategoriesFound:
    'কোনো সাব-ক্যাটাগরি পাওয়া যায়নি। খরচ ট্র্যাক করা শুরু করতে প্রথম সাব-ক্যাটাগরি তৈরি করুন।',
  editParentCategory: 'প্যারেন্ট ক্যাটাগরি সম্পাদনা',
  deleteParentCategory: 'প্যারেন্ট ক্যাটাগরি মুছুন',
  editCategory: 'ক্যাটাগরি সম্পাদনা',
  deleteCategory: 'ক্যাটাগরি মুছুন',
  createCategory: 'ক্যাটাগরি তৈরি করুন',
  updateCategory: 'ক্যাটাগরি আপডেট করুন',
  updateParentCategory: 'প্যারেন্ট ক্যাটাগরি আপডেট করুন',
  budget: 'বাজেট',
  spentThisMonth: 'এই মাসে খরচ',
  noBudget: 'কোনো বাজেট নেই',
  overBudget: 'বাজেট অতিক্রম',
  parent: 'প্যারেন্ট',
  noParent: 'কোনো প্যারেন্ট নেই',
  unknownParent: 'অজানা প্যারেন্ট',
  loadingCategories: 'ক্যাটাগরি লোড হচ্ছে...',

  // Category Form
  categoryType: 'ক্যাটাগরির ধরন',
  subCategoryWithBudget: 'সাব-ক্যাটাগরি (বাজেট সহ)',
  parentCategoryGroupingOnly: 'প্যারেন্ট ক্যাটাগরি (শুধু গ্রুপিং)',
  enterCategoryName: 'ক্যাটাগরির নাম লিখুন',
  enterCategoryDescription: 'ক্যাটাগরির বিবরণ লিখুন',
  monthlyBudget: 'মাসিক বাজেট',
  noParentCategory: 'কোনো প্যারেন্ট ক্যাটাগরি নেই',
  leaveEmptyForNoBudgetLimit: 'বাজেট সীমা না রাখতে খালি রাখুন',

  pay: 'পরিশোধ',
  paymentReceived: 'পেমেন্ট প্রাপ্ত',
  pending: 'অপেক্ষমাণ',
  pendingApproval: 'অপেক্ষমাণ অনুমোদন',
  performanceStatistics: 'পারফরম্যান্স পরিসংখ্যান',
  permissions: 'অনুমতিসমূহ',
  personalInformation: 'ব্যক্তিগত তথ্য',
  phoneNumber: 'ফোন নম্বর',
  pleaseLogInToAccessUserManagement:
    'ব্যবহারকারী ব্যবস্থাপনায় প্রবেশ করতে লগইন করুন।',
  producentsWithLowStockWarning: 'কম স্টকের সতর্কবার্তাসহ পণ্য',
  productsBelowMinimumThreshold: 'ন্যূনতম থ্রেশহোল্ডের নিচের পণ্য',
  productsInCriticalStock: 'গুরুতর কম স্টকযুক্ত পণ্য',
  productsInGoodStock: 'পর্যাপ্ত স্টকযুক্ত পণ্য',
  productsOutOfStock: 'স্টক-আউট পণ্য',
  purchase: 'ক্রয়',
  rahmanSoldCylinders: '{name} সিলিন্ডার বিক্রি করেছে',
  realTimeInventoryTracking: 'রিয়েল সময় মজুদ ট্র্যাক',
  receivableManagement: 'বাকি ব্যবস্থাপনা',
  receivableRecords: 'বাকি রেকর্ড',
  recentActivity: 'সাম্প্রতিক কার্যকলাপ',
  recordDailySales: 'রেকর্ড দৈনিক বিক্রয়',
  refillPurchase: 'রিফিল ক্রয়',
  refillSale: 'রিফিল বিক্রয়',
  refillSalesQty: 'রিফিল বিক্রয় পরিমাণ',
  refreshData: 'রিফ্রেশ তথ্য',
  rejectExpense: 'প্রত্যাখ্যান খরচ',
  reportsAnalytics: 'রিপোর্ট ও বিশ্লেষণ',
  retail: 'খুচরা',
  retailDriver: 'খুচরা চালক',
  sale: 'বিক্রয়',
  retailDriverDescription: 'খুচরা চালক বিবরণ',
  retailDrivers: 'খুচরা চালক',
  retry: 'পুনরায় চেষ্টা করুন',
  return: 'ফেরত',
  rolePermissions: 'ভূমিকার অনুমতি',
  routeArea: 'রুট এলাকা',
  salesInventoryAndDriverManagement: 'বিক্রয় মজুদ এবং চালক ব্যবস্থাপনা',
  salesTrend: 'বিক্রয় ট্রেন্ড',
  salesValue: 'বিক্রয় মূল্য',
  sat: 'শনি',
  saveError: 'error: সংরক্ষণ',
  saveSuccess: 'সংরক্ষণ সফল',
  searchExpenses: 'অনুসন্ধান খরচ',
  selectDriverType: 'চালকের ধরণ নির্বাচন করুন',
  selectStatus: 'নির্বাচন করুন অবস্থা',
  shipment: 'চালান',
  shipmentDriverDescription: 'চালান চালক বিবরণ',
  shipmentDrivers: 'চালানের চালক',
  size: 'আকার',
  statusAndNotes: 'অবস্থা এবং নোট',
  stock: 'স্টক',
  stockReplenished: 'স্টক পুনরায় পূরণ করা হয়েছে',
  submittedBy: 'জমাদানকারী',
  success: 'সাফল্য',
  sumAllDriversSalesForDate: 'যোগফল সব চালক বিক্রয় জন্য তারিখ',
  sumCompletedEmptyCylinderShipments: 'যোগফল সম্পন্ন খালি সিলিন্ডার চালান',
  sumCompletedShipmentsFromShipmentsPage:
    'চালান পৃষ্ঠা থেকে সম্পন্ন চালানের যোগফল',
  sun: 'রবি',
  systemUsers: 'সিস্টেম ব্যবহারকারীগণ',
  tasks: 'কাজসমূহ',
  teamAccess: 'দল অ্যাক্সেস',
  thisActionCannotBeUndone: 'এই কাজটি বাতিল করা যাবে না।',
  thisMonth: 'এই মাস',
  thu: 'বৃহস্পতি',
  timezone: 'সময় অঞ্চল',
  to: 'প্রতি',
  today: 'আজ',
  todaysEmptyCylinders: 'আজকের খালি সিলিন্ডার',
  todaysFullCylinders: 'আজকের ভরা সিলিন্ডার',
  todaysPurchases: 'আজকের ক্রয়',
  todaysSales: 'আজ বিক্রয়',
  topDriverPerformance: 'শীর্ষ চালক কর্মক্ষমতা',
  totalCylinderReceivables: 'মোট সিলিন্ডার বাকি',
  totalCylinders: 'মোট সিলিন্ডার',
  totalCylindersReceivables: 'মোট সিলিন্ডার বাকি',
  totalReceivables: 'মোট বাকি',
  totalSales: 'মোট বিক্রয়',
  totalSalesQty: 'মোট বিক্রয় পরিমাণ',
  totalSalesThisMonth: 'মোট বিক্রয় এই মাস',
  totalUsers: 'মোট ব্যবহারকারী',
  trackCustomerCredits: 'গ্রাহক ক্রেডিট ট্র্যাক করুন',
  trackCustomerPayments: 'ট্র্যাক গ্রাহক পেমেন্ট',
  trackExpenses: 'খরচ ট্র্যাক করুন',
  trackExpensesAndManageBudgets: 'খরচ ট্র্যাক ও বাজেট পরিচালনা করুন',
  trackPerformance: 'পারফরম্যান্স ট্র্যাক করুন',
  tue: 'মঙ্গল',
  unknown: 'অজানা',
  updateDriver: 'আপডেট চালক',
  updateExpense: 'আপডেট খরচ',
  updatePayment: 'আপডেট পেমেন্ট',
  updateUser: 'আপডেট ব্যবহারকারী',
  updating: 'আপডেট হচ্ছে...',
  urgent: 'জরুরি',
  user: 'ব্যবহারকারী',
  userDetails: 'ব্যবহারকারীর বিবরণ',
  userManagement: 'ব্যবহারকারী ব্যবস্থাপনা',
  viewDetails: 'বিবরণ দেখুন',
  viewingExpensesFor: 'এর জন্য খরচ দেখা হচ্ছে',
  viewReceipt: 'রশিদ দেখুন',
  viewReports: 'রিপোর্ট দেখুন',
  warning: 'সতর্কবাণী',
  wed: 'বুধ',
  week: 'সপ্তাহ',
  yesterday: 'গতকাল',
  yesterdaysEmpty: 'গতকাল খালি',
  yesterdaysFull: 'গতকাল পূর্ণ',
  fuelExpense: 'জ্বালানি খরচ',
  maintenanceExpense: 'রক্ষণাবেক্ষণ খরচ',
  officeExpense: 'অফিস খরচ',
  transportExpense: 'পরিবহন খরচ',
  miscellaneousExpense: 'বিবিধ খরচ',
  generalExpense: 'সাধারণ খরচ',
  failedToLoadDailySalesReport: 'ব্যর্থ করতে লোড দৈনিক বিক্রয় রিপোর্ট',
  loadingDailySalesReport: 'দৈনিক বিক্রয় রিপোর্ট লোড হচ্ছে...',
  noReportDataAvailable: 'কোন রিপোর্ট তথ্য উপলব্ধ',
  tryAgainOrSelectDate: 'পুনরায় চেষ্টা করুন বা একটি তারিখ নির্বাচন করুন।',
  comprehensiveDailySalesReport: 'বিস্তারিত দৈনিক বিক্রয় রিপোর্ট',
  totalSalesValue: 'মোট বিক্রয় মূল্য',
  totalDeposited: 'মোট জমা',
  totalExpenses: 'মোট খরচ',
  availableCash: 'উপলব্ধ নগদ',
  totalCashReceivables: 'মোট নগদ বাকি',
  changeInReceivablesCashCylinders: 'বাকি (নগদ ও সিলিন্ডার) পরিবর্তন',
  dailyDepositsExpenses: 'দৈনিক জমা ও খরচ',
  detailedBreakdownDepositsExpenses: 'জমা ও খরচের বিস্তারিত বিভাজন',
  deposits: 'জমা',
  particulars: 'বিবরণ',
  noDepositsFound: 'কোনো জমা পাওয়া যায়নি।',
  totalDepositsCalculated: 'মোট জমা',
  noExpensesFound: 'কোনো খরচ পাওয়া যায়নি।',
  totalExpensesCalculated: 'মোট খরচ',
  totalAvailableCash: 'মোট উপলব্ধ নগদ',
  totalDepositsIncludingSales: 'মোট জমা (বিক্রয় সহ)',
  customerName: 'গ্রাহক নাম',
  selectADriver: 'একজন চালক নির্বাচন করুন',
  enterCustomerName: 'প্রবেশ করান গ্রাহক নাম',
  saleItems: 'বিক্রয়ের আইটেম',
  itemNumber: 'আইটেম নম্বর',
  selectAProduct: 'একটি পণ্য নির্বাচন করুন',
  packagePrice: 'প্যাকেজ দাম',
  refillPrice: 'রিফিল দাম',
  itemTotal: 'আইটেমের মোট',
  saleSummary: 'বিক্রয় সারসংক্ষেপ',
  paymentType: 'পেমেন্ট ধরন',
  paymentTypeRequired: 'পেমেন্ট ধরন হয় প্রয়োজনীয়',
  bankTransfer: 'ব্যাংক ট্রান্সফার',
  mfs: 'এমএফএস',
  mobileFinancialService: 'মোবাইল ফিনান্সিয়াল সার্ভিস',
  credit: 'ক্রেডিট',
  cylinderCredit: 'সিলিন্ডার ক্রেডিট',
  cashDeposited: 'নগদ জমা',
  cylinderDeposits: 'সিলিন্ডার জমা',
  cylinderDepositsBySize: 'মাপ অনুযায়ী সিলিন্ডার জমা',
  cylindersDeposited: 'জমাকৃত সিলিন্ডার',
  maxQuantity: 'সর্বোচ্চ পরিমাণ',
  additionalNotes: 'অতিরিক্ত নোট',
  additionalNotesPlaceholder: 'অতিরিক্ত নোট লিখুন...',
  totalQuantityLabel: 'মোট পরিমাণ',
  totalValueLabel: 'মোট মূল্য',
  totalDiscountLabel: 'মোট ছাড়',
  netValueLabel: 'নেট মূল্য',
  cashReceivableWarning: 'নগদ বাকি সতর্কবাণী',
  customerNameRecommended: 'গ্রাহকের নাম (প্রস্তাবিত)',
  cylinderReceivableWarning: 'সিলিন্ডার বাকি সতর্কবাণী',
  lowStockWarning: 'কম স্টক সতর্কবাণী',
  cylindersRemaining: 'অবশিষ্ট সিলিন্ডার',
  loadingFormData: 'ফর্ম ডেটা লোড হচ্ছে...',
  driverRequired: 'চালক হয় প্রয়োজনীয়',
  productRequired: 'পণ্য হয় প্রয়োজনীয়',
  packageSaleCannotBeNegative: 'প্যাকেজ বিক্রয় ঋণাত্মক হতে পারে না।',
  refillSaleCannotBeNegative: 'রিফিল বিক্রয় ঋণাত্মক হতে পারে না।',
  packagePriceCannotBeNegative: 'প্যাকেজ মূল্য ঋণাত্মক হতে পারে না।',
  refillPriceCannotBeNegative: 'রিফিল মূল্য ঋণাত্মক হতে পারে না।',
  quantityAndPriceRequired: 'পরিমাণ এবং দাম হয় প্রয়োজনীয়',
  atLeastOneSaleItemRequired: 'কমপক্ষে একটি বিক্রয় আইটেম আবশ্যক।',
  discountCannotBeNegative: 'ছাড়ের পরিমাণ ঋণাত্মক হতে পারে না।',
  cashDepositedCannotBeNegative: 'নগদ জমার পরিমাণ ঋণাত্মক হতে পারে না।',
  cylinderDepositsCannotBeNegative:
    'সিলিন্ডার জমার পরিমাণ ঋণাত্মক হতে পারে না।',
  available: 'উপলব্ধ',
  for: 'জন্য',
  readOnly: 'শুধু পঠনযোগ্য',
  areYouSure: 'আপনি কি নিশ্চিত?',
  deleteConfirmation: 'মুছে ফেলার নিশ্চিতকরণ',
  salesEntries: 'বিক্রয় এন্ট্রি',
  cannotBeUndone: 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
  successfullyDeleted: 'সফলভাবে মুছে ফেলা হয়েছে।',
  on: 'চালু',
  thisWillDelete: 'এই করবে মুছুন',
  failedToLoadDailySalesData: 'ব্যর্থ করতে লোড দৈনিক বিক্রয় তথ্য',
  combinedSaleCreatedSuccessfully: 'সমন্বিত বিক্রয় সফলভাবে তৈরি হয়েছে।',
  failedToCreateSale: 'ব্যর্থ করতে তৈরি করুন বিক্রয়',
  failedToLoadEntryDataForEditing:
    'সম্পাদনার জন্য এন্ট্রি ডেটা লোড করতে ব্যর্থ।',
  salesEntryUpdatedSuccessfully: 'বিক্রয় এন্ট্রি সফলভাবে আপডেট করা হয়েছে।',
  failedToUpdateSalesEntry: 'বিক্রয় এন্ট্রি আপডেট করতে ব্যর্থ।',
  failedToDeleteSales: 'ব্যর্থ করতে মুছুন বিক্রয়',
  adminPanel: 'অ্যাডমিন প্যানেল',
  systemAdministration: 'সিস্টেম প্রশাসন',
  viewDistributorDashboard: 'পরিবেশক ড্যাশবোর্ড দেখুন',
  signOut: 'চিহ্ন শেষ',
  lightMode: 'লাইট মোড',
  darkMode: 'ডার্ক মোড',
  systemTheme: 'সিস্টেম থিম',
  shipmentsManagement: 'চালান ব্যবস্থাপনা',
  trackPurchaseOrdersAndShipments: 'ক্রয় আদেশ এবং চালান ট্র্যাক করুন',
  newPurchase: 'নতুন ক্রয়',
  emptyCylinderBuySell: 'খালি সিলিন্ডার ক্রয়/বিক্রয়',
  allShipments: 'সমস্ত চালান',
  outstandingOrders: 'বকেয়া অর্ডার',
  completedOrders: 'সম্পন্ন অর্ডার',
  allCompanies: 'সব কোম্পানি',
  allProducts: 'সমস্ত পণ্য',
  fromDate: 'থেকে তারিখ',
  toDate: 'করতে তারিখ',
  clearFilters: 'ফিল্টার পরিষ্কার করুন',
  loadingShipments: 'লোড হচ্ছে চালান',
  noShipmentsFound: 'কোনো চালান পাওয়া যায়নি।',
  invoice: 'চালান',
  gas: 'গ্যাস',
  unit: 'ইউনিট',
  unitCost: 'একক খরচ',
  gasCost: 'গ্যাস খরচ',
  cylinderCost: 'সিলিন্ডার খরচ',
  vehicle: 'যানবাহন',
  markAsFulfilled: 'সম্পন্ন হিসেবে চিহ্নিত করুন',
  totalItems: 'মোট আইটেম',
  totalCost: 'মোট খরচ',
  editPurchaseOrder: 'সম্পাদনা ক্রয় অর্ডার',
  createNewPurchaseOrder: 'তৈরি করুন নতুন ক্রয় অর্ডার',
  step: 'ধাপ',
  orderInformation: 'আদেশ তথ্য',
  selectCompany: 'নির্বাচন করুন কোম্পানি',
  selectACompany: 'কোম্পানি নির্বাচন করুন',
  selectDriver: 'নির্বাচন করুন চালক',
  shipmentDate: 'চালান তারিখ',
  expectedDeliveryDate: 'প্রত্যাশিত ডেলিভারির তারিখ',
  invoiceNumber: 'চালান নম্বর',
  enterInvoiceNumber: 'চালান নম্বর লিখুন',
  paymentTerms: 'পেমেন্ট মেয়াদ',
  cashOnDelivery: 'ক্যাশ অন ডেলিভারি',
  net30Days: 'নেট ৩০ দিন',
  net60Days: 'নেট ৬০ দিন',
  advancePayment: 'অগ্রিম পরিশোধ',
  priority: 'অগ্রাধিকার',
  low: 'নিম্ন',
  normal: 'স্বাভাবিক',
  high: 'উচ্চ',
  vehicleNumber: 'যানবাহন নম্বর',
  enterVehicleNumber: 'গাড়ির নম্বর লিখুন',
  enterAdditionalNotes: 'অতিরিক্ত নোট লিখুন',
  addLineItem: 'লাইন আইটেম যোগ করুন',
  selectProduct: 'নির্বাচন করুন পণ্য',
  selectCompanyFirst: 'নির্বাচন করুন কোম্পানি প্রথম',
  package: 'প্যাকেজ',
  refill: 'রিফিল',
  gasPrice: 'গ্যাসের মূল্য',
  cylinderPrice: 'সিলিন্ডার দাম',
  taxRate: 'করের হার',
  lineTotalPreview: 'লাইন মোটের প্রিভিউ',
  packageInfo: 'প্যাকেজ তথ্য',
  refillInfo: 'রিফিল তথ্য',
  addItem: 'আইটেম যোগ করুন',
  purchaseItems: 'ক্রয়কৃত আইটেম',
  qty: 'পরিমাণ',
  lineTotal: 'লাইনের মোট',
  action: 'কর্ম',
  editItem: 'আইটেম সম্পাদনা করুন',
  removeItem: 'আইটেম সরান',
  remove: 'সরান',
  totalPurchaseValue: 'মোট ক্রয় মূল্য',
  orderPreview: 'অর্ডার প্রিভিউ',
  orderSummary: 'আদেশ সারসংক্ষেপ',
  totalQuantity: 'মোট পরিমাণ',
  companyRequired: 'কোম্পানি হয় প্রয়োজনীয়',
  shipmentDateRequired: 'চালান তারিখ হয় প্রয়োজনীয়',
  atLeastOneLineItemRequired: 'কমপক্ষে একটি লাইন আইটেম আবশ্যক।',
  creating: 'তৈরি হচ্ছে...',
  updatePurchaseOrder: 'আপডেট ক্রয় অর্ডার',
  createPurchaseOrder: 'তৈরি করুন ক্রয় অর্ডার',
  transactionType: 'লেনদেনের ধরণ',
  buyEmptyCylinders: 'খালি সিলিন্ডার ক্রয় করুন',
  sellEmptyCylinders: 'খালি সিলিন্ডার বিক্রয় করুন',
  addEmptyCylindersToInventory: 'যোগ করুন খালি সিলিন্ডার করতে মজুদ',
  removeEmptyCylindersFromInventory: 'সরান খালি সিলিন্ডার থেকে মজুদ',
  cylinderSize: 'সিলিন্ডার আকার',
  emptyCylindersNote: 'খালি সিলিন্ডার নোট',
  transactionDate: 'লেনদেনের তারিখ',
  enterTransactionDetails: 'লেনদেনের বিবরণ লিখুন',
  buy: 'ক্রয়',
  sell: 'বিক্রয়',
  emptyCylinderTransaction: 'খালি সিলিন্ডার লেনদেন',
  directTransaction: 'সরাসরি লেনদেন',
  cylinderBuyTransaction: 'সিলিন্ডার ক্রয় লেনদেন',
  cylinderSellTransaction: 'সিলিন্ডার বিক্রয় লেনদেন',
  comprehensiveProfitabilityAnalysis: 'বিস্তারিত লাভজনকতা বিশ্লেষণ',
  visualRepresentationProfitByProduct:
    'পণ্য অনুযায়ী লাভের ভিজ্যুয়াল উপস্থাপনা',
  individualDriverPerformanceMetrics: 'ব্যক্তিগত চালক কর্মক্ষমতা মেট্রিক্স',
  comparativeAnalysisRevenueByDriver:
    'চালক অনুযায়ী রাজস্বের তুলনামূলক বিশ্লেষণ',
  monthlyRevenue: 'মাসিক আয়',
  monthlyProfit: 'মাসিক লাভ',
  monthlyExpenses: 'মাসিক খরচ',
  allExpenses: 'সমস্ত খরচ',
  totalProfit: 'মোট লাভ',
  profit: 'লাভ',
  buyingPrice: 'ক্রয়মূল্য',
  commission: 'কমিশন',
  fixedCost: 'স্থির খরচ',
  breakevenPrice: 'ব্রেক-ইভেন মূল্য',
  sellingPrice: 'বিক্রয় দাম',
  costPerUnit: 'ইউনিট প্রতি খরচ',
  avgCostPerUnit: 'ইউনিট প্রতি গড় খরচ',
  failedToLoadData: 'ব্যর্থ করতে লোড তথ্য',
  errorLoadingData: 'লোড হচ্ছে ত্রুটি তথ্য...',
  january: 'জানুয়ারি',
  february: 'ফেব্রুয়ারি',
  march: 'মার্চ',
  april: 'এপ্রিল',
  may: 'মে',
  june: 'জুন',
  july: 'জুলাই',
  august: 'আগস্ট',
  september: 'সেপ্টেম্বর',
  october: 'অক্টোবর',
  november: 'নভেম্বর',
  december: 'ডিসেম্বর',
  july2025: 'জুলাই ২০২৫',
  june2025: 'জুন ২০২৫',
  may2025: 'মে ২০২৫',
  april2025: 'এপ্রিল ২০২৫',
  march2025: 'মার্চ ২০২৫',
  february2025: 'ফেব্রুয়ারি ২০২৫',
  january2025: 'জানুয়ারি ২০২৫',
  december2024: 'ডিসেম্বর ২০২৪',
  november2024: 'নভেম্বর ২০২৪',
  october2024: 'অক্টোবর ২০২৪',
  selectTime: 'নির্বাচন করুন টাইম',
  failedToLoadDashboardData: 'ব্যর্থ করতে লোড ড্যাশবোর্ড তথ্য',
  failedToLoadDashboardDataRefresh: 'ব্যর্থ করতে লোড ড্যাশবোর্ড তথ্য রিফ্রেশ',
  errorLoadingCombinedDashboardData:
    'সমন্বিত ড্যাশবোর্ড ডেটা লোড করতে ত্রুটি...',
  sessionExpiredRedirectingToLogin:
    'সেশন শেষ। লগইন পৃষ্ঠায় নিয়ে যাওয়া হচ্ছে...',
  realTimeOverview: 'রিয়েল-টাইম ওভারভিউ',
  orders: 'অর্ডারসমূহ',
  stockLevel: 'স্টকের পরিমাণ',
  liveActivity: 'লাইভ কার্যকলাপ',
  last15Minutes: 'শেষ ১৫ মিনিট',
  targetProgress: 'লক্ষ্যের অগ্রগতি',
  performanceIndicators: 'পারফরম্যান্স সূচক',
  inventoryHealth: 'মজুদ পরিস্থিতি',
  attentionNeeded: 'মনোযোগ প্রয়োজন',
  good: 'ভাল',
  collectionRate: 'সংগ্রহের হার',
  salesDetails: 'বিক্রয় বিস্তারিত',
  viewDetailedSalesBreakdown: 'বিক্রয়ের বিস্তারিত বিভাজন দেখুন',
  salesBreakdown: 'বিক্রয় বিভাজন',
  detailedSalesAnalytics: 'বিস্তারিত বিক্রয় বিশ্লেষণ',
  averageOrderValue: 'গড় অর্ডার মূল্য',
  driverPerformance: 'চালক কর্মক্ষমতা',
  topPerformersAndRankings: 'শীর্ষ পারফর্মার এবং র‍্যাঙ্কিং',
  driverRankings: 'চালকদের র‍্যাঙ্কিং',
  performanceLeaderboard: 'পারফরম্যান্স লিডারবোর্ড',
  detailedViewAndTrends: 'বিস্তারিত ভিউ এবং ট্রেন্ড',
  vsYesterday: 'গতকালের তুলনায়',
  lpgDistributor: 'এলপিজি পরিবেশক',
  role: 'ভূমিকা',
  loadingDashboard: 'লোড হচ্ছে ড্যাশবোর্ড',
  fallbackDriverName1: 'ফলব্যাক চালক ১',
  fallbackDriverName2: 'ফলব্যাক চালক ২',
  fallbackDriverName3: 'ফলব্যাক চালক ৩',
  fallbackDriverName4: 'ফলব্যাক চালক ৪',
  salesCount: 'বিক্রয়ের সংখ্যা',
  revenueAmount: 'রাজস্বের পরিমাণ',
  performancePercentage: 'পারফরম্যান্সের হার',
  chartDataFallback: 'চার্টের ডেটা পাওয়া যায়নি।',
  weeklyPerformance: 'সাপ্তাহিক পারফরম্যান্স',
  dailyAverage: 'দৈনিক গড়',
  monthlyTarget: 'মাসিক লক্ষ্য',
  quarterlyGrowth: 'ত্রৈমাসিক বৃদ্ধি',
  unknownDriver: 'অজানা চালক',
  unknownCompany: 'অজানা কোম্পানি',
  driverCompletedSale: 'চালক সম্পন্ন বিক্রয়',
  salesTrendUp: 'বিক্রয় ট্রেন্ড উপরে',
  salesTrendDown: 'বিক্রয় ট্রেন্ড নিচে',
  addressMustBeAtLeast10Characters: 'ঠিকানা অবশ্যই কমপক্ষে ১০ অক্ষরের হতে হবে',
  addressTooLong: 'ঠিকানাটি খুব দীর্ঘ',
  areaMustBeAtLeast2Characters: 'এলাকা অবশ্যই কমপক্ষে ২ অক্ষরের হতে হবে',
  areaTooLong: 'এলাকা খুব দীর্ঘ',
  driverTypeIsRequired: 'চালক ধরন হয় হয় প্রয়োজনীয়',
  emergencyContactMustBeAtLeast10Digits:
    'জরুরী যোগাযোগ নম্বর অবশ্যই কমপক্ষে ১০ সংখ্যার হতে হবে।',
  emergencyContactNameMustBeAtLeast2Characters:
    'জরুরী যোগাযোগের নাম অবশ্যই কমপক্ষে ২ অক্ষরের হতে হবে।',
  emergencyContactTooLong: 'জরুরী যোগাযোগ নম্বরটি খুব দীর্ঘ।',
  invalidEmailAddress: 'অবৈধ ই-মেইল ঠিকানা।',
  licenseNumberMustBeAtLeast5Characters:
    'লাইসেন্স নম্বর অবশ্যই কমপক্ষে ৫ অক্ষরের হতে হবে।',
  licenseNumberTooLong: 'লাইসেন্স সংখ্যা খুব দীর্ঘ',
  nameMustBeAtLeast2Characters: 'নাম অবশ্যই কমপক্ষে ২ অক্ষরের হতে হবে।',
  nameTooLong: 'নাম খুব দীর্ঘ',
  phoneNumberMustBeAtLeast10Digits:
    'ফোন নম্বর অবশ্যই কমপক্ষে ১০ সংখ্যার হতে হবে।',
  phoneNumberTooLong: 'ফোন নম্বর খুব দীর্ঘ',
  statusIsRequired: 'অবস্থা হয় হয় প্রয়োজনীয়',
  bn: 'বাংলা',
  en: 'ইংরেজি',
  locale: 'লোকেল',
  key: 'কী',
  value: 'মান',
  allAlerts: 'সব সতর্কতা',
  critical: 'সমালোচনামূলক',
  criticalAlerts: 'সমালোচনামূলক সতর্কতা',
  infoAlerts: 'তথ্যমূলক সতর্কবার্তা',
  warningAlerts: 'সতর্কীকরণ বার্তা',
  inventoryAlert: 'মজুদ সতর্কতা',
  performanceAlert: 'পারফরম্যান্স সতর্কবার্তা',
  stockAlert: 'স্টক সতর্কতা',
  systemNotification: 'সিস্টেম নোটিফিকেশন',
  completionPercentage: 'সমাপ্তি শতাংশ',
  dashboardDataUpdated: 'ড্যাশবোর্ডের ডেটা আপডেট করা হয়েছে।',
  dataNotFound: 'তথ্য না পাওয়া গেছে',
  isComplete: 'হয় সম্পূর্ণ',
  liveDataFeed: 'লাইভ তথ্য ফিড',
  metricsLastUpdated: 'মেট্রিক্স সর্বশেষ আপডেট হয়েছে',
  missingKeys: 'অনুপস্থিত কী',
  newSalesActivity: 'নতুন বিক্রয় কার্যকলাপ',
  optional: 'ঐচ্ছিক',
  recentSaleActivity: 'সাম্প্রতিক বিক্রয় কার্যকলাপ',
  totalKeys: 'মোট কী',
  testCredentials: 'পরীক্ষা শংসাপত্র',
  translatedKeys: 'অনূদিত কী',
  lowStock: 'কম স্টক',
  outOfStock: 'শেষ এর স্টক',
  overduePayments: 'মেয়াদোত্তীর্ণ পেমেন্ট',
  overstock: 'অতিরিক্ত স্টক',
  performanceTrendDown: 'কর্মক্ষমতা ট্রেন্ড নিচে',
  performanceTrendStable: 'পারফরম্যান্সের ধারা স্থিতিশীল।',
  performanceTrendUp: 'কর্মক্ষমতা ট্রেন্ড উপরে',
  salesTrendStable: 'বিক্রয় ট্রেন্ড স্থিতিশীল',
  targetAchieved: 'লক্ষ্য অর্জিত',
  topPerformer: 'শীর্ষ পারফরমার',
  deleteDriver: 'মুছুন চালক',
  failedToLoadAlerts: 'সতর্কবার্তা লোড করতে ব্যর্থ।',
  failedToLoadInventoryAlerts: 'ব্যর্থ করতে লোড মজুদ সতর্কতা',
  movementAnomaly: 'চলাচলে অস্বাভাবিকতা',
  operationSuccessful: 'অপারেশন সফল হয়েছে।',
  welcomeToOnboarding: 'অনবোর্ডিং করতে স্বাগতম',
  setupYourBusinessData: 'আপনার ব্যবসায়িক তথ্য সেটআপ করুন',
  companyNames: 'কোম্পানির নাম',
  productSetup: 'পণ্য সেটআপ',
  inventoryQuantities: 'মজুদ পরিমাণ',
  driversSetup: 'চালক সেটআপ',
  receivablesSetup: 'বাকি সেট করুন',
  skipOnboarding: 'অনবোর্ডিং এড়িয়ে যান',
  completing: 'সম্পন্ন হচ্ছে...',
  completeSetup: 'সম্পূর্ণ সেট করুন',
  setupBusiness: 'সেটআপ ব্যবসায়িক',
  addCompanyNames: 'কোম্পানির নাম যোগ করুন',
  addCompaniesYouDistributeFor: 'বিতরণের জন্য কোম্পানি যোগ করুন',
  addNewCompany: 'নতুন কোম্পানি যোগ করুন',
  enterCompanyNamesLikeAygaz: 'কোম্পানির নাম লিখুন (যেমন, অ্যাইগ্যাস)',
  companyName: 'কোম্পানির নাম',
  companyCode: 'কোম্পানি কোড',
  enterCompanyName: 'কোম্পানির নাম প্রবেশ করান',
  companyNameRequired: 'কোম্পানির নাম প্রয়োজনীয়',
  companyAlreadyExists: 'কোম্পানি ইতিমধ্যে বিদ্যমান',
  addedCompanies: 'যোগ করা কোম্পানিসমূহ',
  companiesYouDistributeFor: 'আপনি যেসব কোম্পানির জন্য বিতরণ করেন',
  noCompaniesAdded: 'কোনো কোম্পানি যোগ করা হয়নি।',
  addAtLeastOneCompany: 'কমপক্ষে একটি কোম্পানি যোগ করুন',
  setupProductsAndSizes: 'পণ্য এবং মাপ সেটআপ করুন',
  configureCylinderSizesAndProducts: 'সিলিন্ডারের মাপ ও পণ্য কনফিগার করুন',
  addSizesLike12L20L: 'মাপ যোগ করুন, যেমন ১২লি ২০লি',
  enterSizeLike12L: 'মাপ লিখুন (যেমন, ১২লি)',
  addSize: 'আকার যোগ করুন',
  cylinderSizeRequired: 'সিলিন্ডার আকার প্রয়োজনীয়',
  cylinderSizeAlreadyExists: 'সিলিন্ডার আকার ইতিমধ্যে বিদ্যমান',
  enterDescription: 'বিবরণ প্রবেশ করান',
  addProduct: 'পণ্য যোগ করুন',
  addNewProduct: 'নতুন পণ্য যোগ করুন',
  addProductsForEachCompany: 'প্রতিটি কোম্পানির জন্য পণ্য যোগ করুন',
  productName: 'পণ্যের নাম',
  enterProductName: 'পণ্যের নাম লিখুন',
  enterProductNameExample: 'পণ্যের নাম লিখুন (উদাহরণ...)',
  currentPrice: 'বর্তমান দাম',
  enterPrice: 'দাম প্রবেশ করান',
  productNameRequired: 'পণ্যের নাম প্রয়োজনীয়',
  validPriceRequired: 'বৈধ দাম প্রয়োজনীয়',
  productAlreadyExists: 'পণ্য ইতিমধ্যে বিদ্যমান',
  addedProducts: 'যোগ করা পণ্যসমূহ',
  addCylinderSizesAndProducts: 'যোগ করুন সিলিন্ডার আকার এবং পণ্য',
  bothRequiredToProceed: 'এগিয়ে যাওয়ার জন্য উভয়ই প্রয়োজনীয়',
  setInitialInventory: 'সেট করুন প্রাথমিক মজুদ',
  enterCurrentFullCylinderQuantities: 'বর্তমান ভরা সিলিন্ডারের পরিমাণ লিখুন',
  fullCylinderInventory: 'পূর্ণ সিলিন্ডার মজুদ',
  enterQuantityForEachProduct: 'প্রতিটি পণ্যের পরিমাণ লিখুন',
  noProductsAvailable: 'কোনো পণ্য উপলব্ধ নেই।',
  addProductsFirst: 'প্রথম পণ্য যোগ করুন',
  totalProducts: 'মোট পণ্য',
  totalFullCylinders: 'মোট পূর্ণ সিলিন্ডার',
  setEmptyCylinderInventory: 'সেট করুন খালি সিলিন্ডার মজুদ',
  enterCurrentEmptyCylinderQuantities: 'বর্তমান খালি সিলিন্ডারের পরিমাণ লিখুন',
  emptyCylinderInventory: 'খালি সিলিন্ডার মজুদ',
  enterQuantityForEachSize: 'প্রতিটি আকারের পরিমাণ লিখুন',
  noCylinderSizesAvailable: 'কোন সিলিন্ডার আকার উপলব্ধ',
  addCylinderSizesFirst: 'প্রথমে সিলিন্ডারের আকার যোগ করুন',
  totalSizes: 'মোট আকার',
  totalEmptyCylinders: 'মোট খালি সিলিন্ডার',
  emptyCylinderNote: 'খালি সিলিন্ডার নোট',
  emptyCylinderStockReceivablesNote:
    'নিচের মানগুলিতে স্টকে থাকা সিলিন্ডার এবং প্রাপ্য সিলিন্ডার উভয়ই অন্তর্ভুক্ত করুন',
  addYourDrivers: 'আপনার চালক যোগ করুন',
  addDriversWhoWillSellProducts: 'বিক্রয়ের জন্য চালক যোগ করুন',
  enterDriverInformation: 'চালকের তথ্য লিখুন',
  enterDriverName: 'চালকের নাম লিখুন',
  shipmentDriver: 'চালান চালক',
  driverNameRequired: 'চালক নাম প্রয়োজনীয়',
  driverAlreadyExists: 'চালক ইতিমধ্যে বিদ্যমান',
  addedDrivers: 'যোগ করা চালকগণ',
  driversInYourTeam: 'আপনার দলের চালকগণ',
  noContactInfo: 'যোগাযোগের তথ্য নেই',
  noDriversAdded: 'কোনো চালক যোগ করা হয়নি।',
  addAtLeastOneDriver: 'কমপক্ষে একজন চালক যোগ করুন',
  setupReceivables: 'বাকি সেট করুন',
  enterCurrentReceivablesForEachDriver: 'প্রতিটি চালকের বর্তমান বাকি লিখুন',
  driverReceivables: 'চালক বাকি',
  enterCashAndCylinderReceivables: 'প্রবেশ করান নগদ এবং সিলিন্ডার বাকি',
  amountOwedByCustomers: 'গ্রাহকদের কাছে মোট পাওনা',
  cylindersOwedByCustomers: 'গ্রাহকদের কাছে পাওনা সিলিন্ডার',
  cylindersOwedByCustomersBySize: 'মাপ অনুযায়ী গ্রাহকদের কাছে পাওনা সিলিন্ডার',
  noDriversAvailable: 'কোনো চালক উপলব্ধ নেই।',
  addDriversFirst: 'প্রথমে চালক যোগ করুন',
  noRetailDriversAvailable: 'কোনো খুচরা চালক উপলব্ধ নেই।',
  addRetailDriversFirst: 'প্রথমে খুচরা চালক যোগ করুন',
  receivablesSummary: 'বাকি সারসংক্ষেপ',
  manualBusinessOnboarding: 'ম্যানুয়াল ব্যবসায়িক অনবোর্ডিং',
  businessInformation: 'ব্যবসায়িক তথ্য',
  businessName: 'ব্যবসা নাম',
  businessNamePlaceholder: 'প্রবেশ করান ব্যবসা নাম...',
  subdomain: 'সাবডোমেইন',
  subdomainPlaceholder: 'প্রবেশ করান সাবডোমেইন...',
  plan: 'পরিকল্পনা',
  freemium: 'ফ্রিমিয়াম',
  professional: 'পেশাদার',
  enterprise: 'এন্টারপ্রাইজ',
  adminUser: 'অ্যাডমিন ব্যবহারকারী',
  adminName: 'অ্যাডমিন নাম',
  adminNamePlaceholder: 'প্রবেশ করান অ্যাডমিন নাম...',
  adminEmail: 'অ্যাডমিন ইমেইল',
  adminEmailPlaceholder: 'প্রবেশ করান অ্যাডমিন ইমেইল...',
  adminPassword: 'অ্যাডমিন পাসওয়ার্ড',
  strongPassword: 'শক্তিশালী পাসওয়ার্ড',
  creatingBusiness: 'তৈরি করা হচ্ছে ব্যবসায়িক',
  onboardBusiness: 'অনবোর্ড ব্যবসায়িক',
  businessOnboardedSuccessfully: 'ব্যবসা সফলভাবে অনবোর্ড করা হয়েছে।',
  businessCreatedWithAdmin: 'অ্যাডমিনসহ ব্যবসা তৈরি হয়েছে',
  failedToOnboardBusiness: 'ব্যর্থ করতে অনবোর্ড ব্যবসায়িক',
  networkErrorOccurred: 'ত্রুটি: network occurred',
  unauthorized: 'অননুমোদিত',
  userNotFound: 'ব্যবহারকারী না পাওয়া গেছে',
  onboardingAlreadyCompleted: 'অনবোর্ডিং ইতিমধ্যে সম্পন্ন',
  failedToCompleteOnboarding: 'ব্যর্থ করতে সম্পূর্ণ অনবোর্ডিং',
  failedToCheckOnboardingStatus: 'ব্যর্থ করতে চেক অনবোর্ডিং অবস্থা',
  searchCompanies: 'অনুসন্ধান কোম্পানি',
  addCompany: 'যোগ করুন কোম্পানি',
  activeProducts: 'সক্রিয় পণ্যসমূহ',
  totalStock: 'মোট স্টক',
  companies: 'কোম্পানিসমূহ',
  searchProducts: 'অনুসন্ধান পণ্য',

  cylinderSizeDeletedSuccessfully: 'সিলিন্ডারের মাপ সফলভাবে মুছে ফেলা হয়েছে।',

  // Missing inventory page translations
  trackAndManageYourCylinderInventory:
    'আপনার সিলিন্ডার মজুদ ট্র্যাক এবং পরিচালনা করুন',
  noInventoryDataAvailable: 'কোনো মজুদ ডেটা উপলব্ধ নেই',
  hideMovements: 'মুভমেন্ট লুকান',
  showMovements: 'মুভমেন্ট দেখান',
  fromDrivers: 'চালকদের থেকে',
  availableForRefill: 'রিফিলের জন্য উপলব্ধ',
  noFullCylindersAvailable: 'কোনো পূর্ণ সিলিন্ডার উপলব্ধ নেই',
  noEmptyCylindersAvailable: 'কোনো খালি সিলিন্ডার উপলব্ধ নেই',
  noEmptyCylindersOfSizeAvailable:
    '{size} সাইজের কোনো খালি সিলিন্ডার উপলব্ধ নেই',
  automatedInventoryCalculationsForCylinders:
    'সিলিন্ডারের জন্য স্বয়ংক্রিয় মজুদ গণনা',

  // Missing asset-related keys
  receivables: 'বাকি',
  inventory: 'মজুদ',
  active: 'সক্রিয়',
  cash: 'নগদ',
  cashReceivables: 'নগদ বাকি',
  created: 'তৈরি করা হয়েছে',
  autoCalculated: 'স্বয়ংক্রিয় গণনা',
  addAsset: 'সম্পদ যোগ করুন',
  addLiability: 'দায় যোগ করুন',
  purchaseDate: 'ক্রয়ের তারিখ',
  monthlyPayment: 'মাসিক পরিশোধ',
  outstandingCashReceivablesFromDrivers: 'চালকদের কাছ থেকে বকেয়া নগদ বাকি',
  availableCashCalculatedFromDeposits:
    'জমা থেকে খরচ বিয়োগ করে গণনা করা উপলব্ধ নগদ',
  emptyCylinders: 'খালি সিলিন্ডার',
  fullCylinders: 'পূর্ণ সিলিন্ডার',

  // Inventory validation messages
  checkingInventory: 'স্টক পরীক্ষা করা হচ্ছে...',
  inventoryAvailable: 'উপলব্ধ',
  usingAllAvailable: 'সব উপলব্ধ সিলিন্ডার ব্যবহার করা হবে',
  only: 'মাত্র',
  availableText: 'উপলব্ধ',
  purchasing: 'ক্রয় করা হচ্ছে...',
  selling: 'বিক্রয় করা হচ্ছে...',

  // Additional missing translation keys that weren't already present
  selectCurrency: 'মুদ্রা নির্বাচন করুন',
  selectTimezone: 'টাইমজোন নির্বাচন করুন',
  selectLanguage: 'ভাষা নির্বাচন করুন',
  english: 'ইংরেজি',
  bengali: 'বাংলা',
};

const translationMap: Record<string, Translations> = {
  en: englishTranslations,
  bn: bengaliTranslations,
  'en-US': englishTranslations,
  'bn-BD': bengaliTranslations,
};

// Initialize enhanced translation system
export const translationValidator = new TranslationValidator(
  translationMap,
  'en'
);
export const translationFallbackSystem = new TranslationFallbackSystem(
  translationMap,
  ['en', 'bn']
);

// Enhanced translation function with comprehensive validation and fallback
export function getTranslation(
  language: string,
  key: keyof Translations,
  component?: string
): string {
  return translationFallbackSystem.getTranslation(key, language, component);
}

// Enhanced t function with better error handling
export function t(key: keyof Translations): string {
  return translationFallbackSystem.getTranslation(key, 'en');
}

// Enhanced translation validation functions using the new system
export function validateTranslationKey(key: string): boolean {
  return translationValidator.validateKey(key);
}

export function validateTranslationCompleteness(language: string): {
  isComplete: boolean;
  missingKeys: string[];
  totalKeys: number;
  translatedKeys: number;
  completionPercentage: number;
} {
  const missingKeys = translationValidator.generateMissingKeys(language);
  const allKeys = Object.keys(englishTranslations);
  const translatedKeys = allKeys.length - missingKeys.length;

  return {
    isComplete: missingKeys.length === 0,
    missingKeys,
    totalKeys: allKeys.length,
    translatedKeys,
    completionPercentage: Math.round((translatedKeys / allKeys.length) * 100),
  };
}

// New enhanced validation functions
export function validateTranslation(
  key: string,
  value: string,
  locale: string
): ValidationResult {
  return translationValidator.validateTranslation(key, value, locale);
}

export function checkTranslationConsistency(): ConsistencyReport {
  return translationValidator.checkConsistency();
}

export function getTranslationErrors(): TranslationError[] {
  return translationLogger.getErrors();
}

export function getTranslationErrorStats(): Record<
  TranslationErrorType,
  number
> {
  return translationLogger.getErrorStats();
}

export function clearTranslationErrors(): void {
  translationLogger.clearErrors();
}

export function generateMissingTranslationKeys(targetLocale: string): string[] {
  return translationValidator.generateMissingKeys(targetLocale);
}

// Get available languages
export function getAvailableLanguages(): string[] {
  return Object.keys(translationMap);
}

// Get translation statistics for all languages
export function getTranslationStats(): Record<
  string,
  {
    isComplete: boolean;
    totalKeys: number;
    translatedKeys: number;
    completionPercentage: number;
    missingKeys: string[];
  }
> {
  const stats: Record<string, any> = {};

  Object.keys(translationMap).forEach((language) => {
    stats[language] = validateTranslationCompleteness(language);
  });

  return stats;
}

// Export enhanced translation system components
export {
  TranslationValidator,
  TranslationFallbackSystem,
  translationLogger,
  TranslationErrorType,
} from './translation-validator';

export type {
  TranslationError,
  ValidationResult,
  ConsistencyReport,
} from './translation-validator';

// Export default translations for backward compatibility
export const translations = englishTranslations;
