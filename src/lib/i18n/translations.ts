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
  loading: string;
  noData: string;
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
  description: string;
  amount: string;
  date: string;
  notes: string;
  status: string;
  type: string;
  category: string;
  active: string;
  inactive: string;

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
  emptyCylinderReceivables: string;
  emptyCylindersInStock: string;
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
  manageCompanyAssets: string;
  manageDriversAndAssignments: string;
  manageLiabilities: string;
  manager: string;
  managers: string;
  manageSystemRoles: string;
  manageSystemUsers: string;
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
  lowStockAlert: string;
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
  of: string;
  orderInformation: string;
  selectCompany: string;
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
  allExpenses: string;
  totalProfit: string;
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

  // Dashboard layout specific
  lpgDistributor: string;
  welcomeBack: string;
  role: string;
  loadingDashboard: string;

  // Dashboard fallback data and performance metrics
  fallbackDriverName1: string;
  fallbackDriverName2: string;
  fallbackDriverName3: string;
  fallbackDriverName4: string;
  salesCount: string;
  revenueAmount: string;
  performancePercentage: string;
  chartDataFallback: string;
  weeklyPerformance: string;
  dailyAverage: string;
  monthlyTarget: string;
  quarterlyGrowth: string;

  // Dashboard API and activity messages
  unknownDriver: string;
  unknownCompany: string;
  unknownError: string;
  completedSale: string;
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
  all: string;
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
  addCylinderSize: string;
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
  editCylinderSize: string;
  deleteCylinderSize: string;
  failedToSaveCylinderSize: string;
  cylinderSizeDeletedSuccessfully: string;
  code: string;
  price: string;
  threshold: string;
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
  currentLiability: string;
  longTermLiability: string;
  editLiability: string;
  deleteLiability: string;
  editAssetTitle: string;
  addLiability: string;
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
  purchaseDate: string;
  depreciationRate: string;
  subCategory: string;
  autoCalculated: string;
  noAssetsFound: string;
  noLiabilitiesFound: string;
  addAsset: string;
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
  active: 'Active',
  inactive: 'Inactive',
  editCompany: 'Edit Company',
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
  failedToSaveCustomerReceivable: 'Failed to save customer receivable',
  customerReceivableDeletedSuccessfully:
    'Customer receivable deleted successfully',
  failedToDeleteCustomerReceivable: 'Failed to delete customer receivable',
  paymentRecordedSuccessfully: 'Payment recorded successfully',
  failedToRecordPayment: 'Failed to record payment',
  cylinderReturnRecordedSuccessfully: 'Cylinder return recorded successfully',
  failedToRecordCylinderReturn: 'Failed to record cylinder return',
  cylinderReceivable: 'Cylinder Receivable',
  enterPaymentAmount: 'Enter payment amount',
  enterNumberOfCylinders: 'Enter number of cylinders',
  recordPayment: 'Record Payment',
  recordCylinderReturn: 'Record Cylinder Return',
  recordReturn: 'Record Return',
  customerReceivablesDontMatch: "Customer receivables don't match",
  editCustomerReceivable: 'Edit Customer Receivable',
  addCustomerReceivable: 'Add Customer Receivable',
  cashReceivable: 'Cash Receivable',
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
  editCylinderSize: 'Edit Cylinder Size',
  deleteCylinderSize: 'Delete Cylinder Size',
  failedToSaveCylinderSize: 'Failed to save cylinder size',
  code: 'Code',
  price: 'Price',
  threshold: 'Threshold',
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
  monthlyPayment: 'Monthly Payment',
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
  unitValueUpdatedSuccessfully: 'Unit value updated successfully!',
  assetCreatedSuccessfully: 'Asset created successfully!',
  assetUpdatedSuccessfully: 'Asset updated successfully!',
  liabilityCreatedSuccessfully: 'Liability created successfully!',
  liabilityUpdatedSuccessfully: 'Liability updated successfully!',
  failedToLoadAssetsLiabilities:
    'Failed to load assets and liabilities data. Please try again.',
  failedToDeleteAsset: 'Failed to delete asset. Please try again.',
  failedToDeleteLiability: 'Failed to delete liability. Please try again.',
  failedToUpdateUnitValue: 'Failed to update unit value. Please try again.',
  failedToCreateAsset: 'Failed to create asset. Please try again.',
  failedToUpdateAsset: 'Failed to update asset. Please try again.',
  failedToCreateLiability: 'Failed to create liability. Please try again.',
  failedToUpdateLiability: 'Failed to update liability. Please try again.',
  areYouSureDeleteAsset: 'Are you sure you want to delete this asset?',
  areYouSureDeleteLiability: 'Are you sure you want to delete this liability?',
  purchaseDate: 'Purchase Date',
  depreciationRate: 'Depreciation Rate',
  subCategory: 'Sub Category',
  autoCalculated: 'Auto-calculated',
  auto: 'Auto',
  noAssetsFound:
    'No assets found. Click "Add Assets/Liabilities" to get started.',
  noLiabilitiesFound:
    'No liabilities found. Click "Add Assets/Liabilities" to get started.',
  addAsset: 'Add Asset',
  editAssetTitle: 'Edit Asset',
  addLiability: 'Add Liability',
  editLiabilityTitle: 'Edit Liability',
  enterAssetName: 'Enter asset name',
  enterLiabilityName: 'Enter liability name',
  enterValue: 'Enter value',
  notAvailable: 'N/A',
  vehicles: 'Vehicles',
  equipment: 'Equipment',
  property: 'Property',
  // Auto-generated missing properties
  noData: 'No Data',
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
  description: 'Description',
  amount: 'Amount',
  date: 'Date',
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
  exportReportFunctionality: 'Export Report Functionality',
  customerRecords: 'Customer Records',
  statusBreakdown: 'Status Breakdown',
  noReceivablesFound: 'No Receivables Found',
  noChangesRecorded: 'No Changes Recorded',
  receivablesChangesLog: 'Receivables Changes Log',
  amountPlaceholder: 'Enter amount...',
  enterExpenseDescription: 'Enter Expense Description',
  selectParentCategory: 'Select Parent Category',
  selectCategory: 'Select Category',
  expenseDate: 'Expense Date',
  receiptUrl: 'Receipt Url',
  receiptUrlPlaceholder: 'Enter receipt url...',
  submitting: 'Submitting',
  activeDrivers: 'Active Drivers',
  activeUsers: 'Active Users',
  addDriver: 'Add Driver',
  addExpense: 'Add Expense',
  additionalNotesComments: 'Additional Notes Comments',
  addNewDriver: 'Add New Driver',
  addUser: 'Add User',
  administrator: 'Administrator',
  administrators: 'Administrators',
  ago: 'Ago',
  alerts: 'Alerts',
  allCalculationsUpdatedRealTime: 'All Calculations Updated Real Time',
  allCategories: 'All Categories',
  allCylinders: 'All Cylinders',
  allGood: 'All Good',
  allStatus: 'All Status',
  approved: 'Approved',
  approvedExpenses: 'Approved Expenses',
  approveExpense: 'Approve Expense',
  area: 'Area',
  areYouSureDeleteDriver: 'Are You Sure Delete Driver',
  assetsLiabilities: 'Assets Liabilities',
  assignedArea: 'Assigned Area',
  balanceSheet: 'Balance Sheet',
  businessFormulaImplementation: 'Business Formula Implementation',
  cashReceivables: 'Cash Receivables',
  changesLog: 'Changes Log',
  checkStock: 'Check Stock',
  clear: 'Clear',
  company: 'Company',
  completeSystemAccessAndUserManagement:
    'Complete System Access And User Management',
  confirmDeleteUser: 'Confirm Delete User',
  contactName: 'Contact Name',
  contactNumber: 'Contact Number',
  create: 'Create',
  criticalAlert: 'Critical Alert',
  currency: 'Currency',
  currentFullCylinderInventory: 'Current Full Cylinder Inventory',
  currentStock: 'Current Stock',
  currentStockHealth: 'Current Stock Health',
  customers: 'Customers',
  cylinderReceivables: 'Cylinder Receivables',
  cylindersReceived: 'Cylinders Received',
  cylindersSold: 'Cylinders Sold',
  cylindersSummaryApiError: 'Error: cylinders summary api',
  cylindersSummaryDataReceived: 'Cylinders Summary Data Received',
  cylindersSummaryResponseStatus: 'Cylinders Summary Response Status',
  dailyCalculations: 'Daily Calculations',
  dailyInventoryTracking: 'Daily Inventory Tracking',
  dataSources: 'Data Sources',
  day: 'Day',
  days: 'Days',
  deleteExpense: 'Delete Expense',
  deleteUser: 'Delete User',
  deleting: 'Deleting',
  details: 'Details',
  driver: 'Driver',
  driverAddedSuccessfully: 'Driver Addedfully successful',
  driverDeletedSuccessfully: 'Driver Deletedfully successful',
  driverDetails: 'Driver Details',
  driverManagement: 'Driver Management',
  driverName: 'Driver Name',
  driverType: 'Driver Type',
  driverUpdatedSuccessfully: 'Driver Updatedfully successful',
  editDriver: 'Edit Driver',
  editExpense: 'Edit Expense',
  editUser: 'Edit User',
  emailAddress: 'Email Address',
  emergencyContact: 'Emergency Contact',
  emptyCylinderInventoryAvailability: 'Empty Cylinder Inventory Availability',
  emptyCylinders: 'Empty Cylinders',
  emptyCylindersBuySell: 'Empty Cylinders Buy Sell',
  emptyCylindersInHand: 'Empty Cylinders In Hand',
  emptyCylinderReceivables: 'Empty Cylinder Receivables',
  emptyCylindersInStock: 'Empty Cylinders In Stock',
  outstandingShipments: 'Outstanding Shipments',
  noOutstandingOrders: 'No Outstanding Orders',
  enterAssignedAreaRoute: 'Enter Assigned Area Route',
  enterEmailAddress: 'Enter Email Address',
  enterEmergencyContactName: 'Enter Emergency Contact Name',
  enterEmergencyContactNumber: 'Enter Emergency Contact Number',
  enterFullAddress: 'Enter Full Address',
  enterFullName: 'Enter Full Name',
  enterLicenseNumber: 'Enter License Number',
  enterPhoneNumber: 'Enter Phone Number',
  error: 'Error',
  errorFetchingCylindersSummaryData: 'Error Fetching Cylinders Summary Data',
  errorFetchingDailyInventoryData: 'Error Fetching Daily Inventory Data',
  errorFetchingInventoryData: 'Error Fetching Inventory Data',
  expense: 'Expense',
  expenseManagement: 'Expense Management',
  exportFunctionalityComingSoon: 'Export Functionality Coming Soon',
  failedToCreateUser: 'Failed To Create User',
  failedToDeleteDriver: 'Failed To Delete Driver',
  failedToDeleteUser: 'Failed To Delete User',
  failedToFetchUsers: 'Failed To Fetch Users',
  failedToLoadInventoryData: 'Failed To Load Inventory Data',
  failedToUpdateDriver: 'Failed To Update Driver',
  failedToUpdateUser: 'Failed To Update User',
  fetchingCylindersSummaryData: 'Fetching Cylinders Summary Data',
  filterByDriverType: 'Filter By Driver Type',
  fri: 'Fri',
  from: 'From',
  fullAccess: 'Full Access',
  fullCylinders: 'Full Cylinders',
  fullName: 'Full Name',
  generalSettings: 'General Settings',
  getStartedByAddingFirstExpense: 'Get Started By Adding First Expense',
  hour: 'Hour',
  hours: 'Hours',
  individualDailySalesData: 'Individual Daily Sales Data',
  info: 'Info',
  inventoryManagement: 'Inventory Management',
  joiningDate: 'Joining Date',
  justNow: 'Just Now',
  kPending: 'K Pending',
  language: 'Language',
  last7Days: 'Last7 Days',
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
  manageCompanyAssets: 'Manage Company Assets',
  manageDriversAndAssignments: 'Manage Drivers And Assignments',
  manageLiabilities: 'Manage Liabilities',
  manager: 'Manager',
  managers: 'Managers',
  manageSystemRoles: 'Manage System Roles',
  manageSystemUsers: 'Manage System Users',
  manageTeam: 'Manage Team',
  mon: 'Mon',
  monitorCylinderStock: 'Monitor Cylinder Stock',
  needAdminPrivileges: 'Need Admin Privileges',
  never: 'Never',
  newSale: 'New Sale',
  noActiveDriversFoundForThisPeriod: 'No Active Drivers Found For This Period',
  noDailyInventoryDataAvailable: 'No Daily Inventory Data Available',
  noDailySalesDataFound: 'No Daily Sales Data Found',
  noDataFound: 'No Data Found',
  noEmptyCylindersInInventory: 'No Empty Cylinders In Inventory',
  noFullCylindersInInventory: 'No Full Cylinders In Inventory',
  notApplicable: 'Not Applicable',
  note: 'Note',
  noUsersFound: 'No Users Found',
  operationFailed: 'Failed to operation failed',
  operations: 'Operations',
  outstanding: 'Outstanding',
  packagePurchase: 'Package Purchase',
  packageRefillPurchase: 'Package Refill Purchase',
  packageRefillSales: 'Package Refill Sales',
  packageSale: 'Package Sale',
  packageSalesQty: 'Package Sales Qty',
  parentCategory: 'Parent Category',
  pay: 'Pay',
  paymentReceived: 'Payment Received',
  pending: 'Pending',
  pendingApproval: 'Pending Approval',
  performanceStatistics: 'Performance Statistics',
  permissions: 'Permissions',
  personalInformation: 'Personal Information',
  phoneNumber: 'Phone Number',
  pleaseLogInToAccessUserManagement: 'Please Log In To Access User Management',
  producentsWithLowStockWarning: 'Producents With Low Stock Warning',
  productsBelowMinimumThreshold: 'Products Below Minimum Threshold',
  productsInCriticalStock: 'Products In Critical Stock',
  productsInGoodStock: 'Products In Good Stock',
  productsOutOfStock: 'Products Out Of Stock',
  purchase: 'Purchase',
  rahmanSoldCylinders: 'Rahman Sold Cylinders',
  realTimeInventoryTracking: 'Real Time Inventory Tracking',
  receivableManagement: 'Receivable Management',
  receivableRecords: 'Receivable Records',
  recentActivity: 'Recent Activity',
  recordDailySales: 'Record Daily Sales',
  refillPurchase: 'Refill Purchase',
  refillSale: 'Refill Sale',
  refillSalesQty: 'Refill Sales Qty',
  refreshData: 'Refresh Data',
  rejectExpense: 'Reject Expense',
  reportsAnalytics: 'Reports Analytics',
  retail: 'Retail',
  retailDriver: 'Retail Driver',
  sale: 'Sale',
  retailDriverDescription: 'Retail Driver Description',
  retailDrivers: 'Retail Drivers',
  retry: 'Retry',
  return: 'Return',
  rolePermissions: 'Role Permissions',
  routeArea: 'Route Area',
  salesInventoryAndDriverManagement: 'Sales Inventory And Driver Management',
  salesTrend: 'Sales Trend',
  salesValue: 'Sales Value',
  sat: 'Sat',
  saveError: 'Error: save',
  saveSuccess: 'Save successful',
  searchExpenses: 'Search Expenses',
  selectDriverType: 'Select Driver Type',
  selectStatus: 'Select Status',
  shipment: 'Shipment',
  shipmentDriverDescription: 'Shipment Driver Description',
  shipmentDrivers: 'Shipment Drivers',
  size: 'Size',
  statusAndNotes: 'Status And Notes',
  stock: 'Stock',
  stockReplenished: 'Stock Replenished',
  submittedBy: 'Submitted By',
  success: 'Success',
  sumAllDriversSalesForDate: 'Sum All Drivers Sales For Date',
  sumCompletedEmptyCylinderShipments: 'Sum Completed Empty Cylinder Shipments',
  sumCompletedShipmentsFromShipmentsPage:
    'Sum Completed Shipments From Shipments Page',
  sun: 'Sun',
  systemUsers: 'System Users',
  tasks: 'Tasks',
  teamAccess: 'Team Access',
  thisActionCannotBeUndone: 'This Action Cannot Be Undone',
  thisMonth: 'This Month',
  thu: 'Thu',
  timezone: 'Timezone',
  to: 'To',
  today: 'Today',
  todaysEmptyCylinders: 'Todays Empty Cylinders',
  todaysFullCylinders: 'Todays Full Cylinders',
  todaysPurchases: 'Todays Purchases',
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
  trackCustomerCredits: 'Track Customer Credits',
  trackCustomerPayments: 'Track Customer Payments',
  trackExpenses: 'Track Expenses',
  trackExpensesAndManageBudgets: 'Track Expenses And Manage Budgets',
  trackPerformance: 'Track Performance',
  tue: 'Tue',
  unknown: 'Unknown',
  updateDriver: 'Update Driver',
  updateExpense: 'Update Expense',
  updatePayment: 'Update Payment',
  updateUser: 'Update User',
  updating: 'Updating',
  urgent: 'Urgent',
  user: 'User',
  userDetails: 'User Details',
  userManagement: 'User Management',
  viewDetails: 'View Details',
  viewingExpensesFor: 'Viewing Expenses For',
  viewReceipt: 'View Receipt',
  viewReports: 'View Reports',
  warning: 'Warning',
  wed: 'Wed',
  week: 'Week',
  yesterday: 'Yesterday',
  yesterdaysEmpty: 'Yesterdays Empty',
  yesterdaysFull: 'Yesterdays Full',
  fuelExpense: 'Fuel Expense',
  maintenanceExpense: 'Maintenance Expense',
  officeExpense: 'Office Expense',
  transportExpense: 'Transport Expense',
  miscellaneousExpense: 'Miscellaneous Expense',
  generalExpense: 'General Expense',
  failedToLoadDailySalesReport: 'Failed To Load Daily Sales Report',
  loadingDailySalesReport: 'Loading Daily Sales Report',
  noReportDataAvailable: 'No Report Data Available',
  tryAgainOrSelectDate: 'Try Again Or Select Date',
  comprehensiveDailySalesReport: 'Comprehensive Daily Sales Report',
  totalSalesValue: 'Total Sales Value',
  totalDeposited: 'Total Deposited',
  totalExpenses: 'Total Expenses',
  availableCash: 'Available Cash',
  totalCashReceivables: 'Total Cash Receivables',
  changeInReceivablesCashCylinders: 'Change In Receivables Cash Cylinders',
  dailyDepositsExpenses: 'Daily Deposits Expenses',
  detailedBreakdownDepositsExpenses: 'Detailed Breakdown Deposits Expenses',
  deposits: 'Deposits',
  particulars: 'Particulars',
  noDepositsFound: 'No Deposits Found',
  totalDepositsCalculated: 'Total Deposits Calculated',
  noExpensesFound: 'No Expenses Found',
  totalExpensesCalculated: 'Total Expenses Calculated',
  totalAvailableCash: 'Total Available Cash',
  totalDepositsIncludingSales: 'Total Deposits Including Sales',
  customerName: 'Customer Name',
  selectADriver: 'Select A Driver',
  enterCustomerName: 'Enter Customer Name',
  customerNamePlaceholder: 'Enter customer name...',
  saleItems: 'Sale Items',
  itemNumber: 'Item Number',
  selectAProduct: 'Select A Product',
  packagePrice: 'Package Price',
  refillPrice: 'Refill Price',
  itemTotal: 'Item Total',
  saleSummary: 'Sale Summary',
  paymentType: 'Payment Type',
  paymentTypeRequired: 'Payment Type is required',
  bankTransfer: 'Bank Transfer',
  mfs: 'Mfs',
  mobileFinancialService: 'Mobile Financial Service',
  credit: 'Credit',
  cylinderCredit: 'Cylinder Credit',
  cashDeposited: 'Cash Deposited',
  cylinderDeposits: 'Cylinder Deposits',
  cylinderDepositsBySize: 'Cylinder Deposits By Size',
  cylindersDeposited: 'Cylinders Deposited',
  maxQuantity: 'Max Quantity',
  additionalNotes: 'Additional Notes',
  additionalNotesPlaceholder: 'Enter additional notes...',
  totalQuantityLabel: 'Total Quantity Label',
  totalValueLabel: 'Total Value Label',
  totalDiscountLabel: 'Total Discount Label',
  netValueLabel: 'Net Value Label',
  cashReceivableWarning: 'Cash Receivable Warning',
  customerNameRecommended: 'Customer Name Recommended',
  cylinderReceivableWarning: 'Cylinder Receivable Warning',
  lowStockWarning: 'Low Stock Warning',
  cylindersRemaining: 'Cylinders Remaining',
  lowStockAlert: 'Low Stock Alert',
  loadingFormData: 'Loading Form Data',
  driverRequired: 'Driver is required',
  productRequired: 'Product is required',
  packageSaleCannotBeNegative: 'Package Sale Cannot Be Negative',
  refillSaleCannotBeNegative: 'Refill Sale Cannot Be Negative',
  packagePriceCannotBeNegative: 'Package Price Cannot Be Negative',
  refillPriceCannotBeNegative: 'Refill Price Cannot Be Negative',
  quantityAndPriceRequired: 'Quantity And Price is required',
  atLeastOneSaleItemRequired: 'At Least One Sale Item is required',
  discountCannotBeNegative: 'Discount Cannot Be Negative',
  cashDepositedCannotBeNegative: 'Cash Deposited Cannot Be Negative',
  cylinderDepositsCannotBeNegative: 'Cylinder Deposits Cannot Be Negative',
  available: 'Available',
  for: 'For',
  readOnly: 'Read Only',
  areYouSure: 'Are You Sure',
  deleteConfirmation: 'Delete Confirmation',
  salesEntries: 'Sales Entries',
  cannotBeUndone: 'Cannot Be Undone',
  successfullyDeleted: 'Successfully Deleted',
  on: 'On',
  thisWillDelete: 'This Will Delete',
  failedToLoadDailySalesData: 'Failed To Load Daily Sales Data',
  combinedSaleCreatedSuccessfully: 'Combined Sale Createdfully successful',
  failedToCreateSale: 'Failed To Create Sale',
  failedToLoadEntryDataForEditing: 'Failed To Load Entry Data For Editing',
  salesEntryUpdatedSuccessfully: 'Sales Entry Updatedfully successful',
  failedToUpdateSalesEntry: 'Failed To Update Sales Entry',
  failedToDeleteSales: 'Failed To Delete Sales',
  adminPanel: 'Admin Panel',
  systemAdministration: 'System Administration',
  viewDistributorDashboard: 'View Distributor Dashboard',
  signOut: 'Sign Out',
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode',
  systemTheme: 'System Theme',
  shipmentsManagement: 'Shipments Management',
  trackPurchaseOrdersAndShipments: 'Track Purchase Orders And Shipments',
  newPurchase: 'New Purchase',
  emptyCylinderBuySell: 'Empty Cylinder Buy Sell',
  allShipments: 'All Shipments',
  outstandingOrders: 'Outstanding Orders',
  completedOrders: 'Completed Orders',
  allCompanies: 'All Companies',
  allProducts: 'All Products',
  fromDate: 'From Date',
  toDate: 'To Date',
  clearFilters: 'Clear Filters',
  loadingShipments: 'Loading Shipments',
  noShipmentsFound: 'No Shipments Found',
  invoice: 'Invoice',
  gas: 'Gas',
  unit: 'Unit',
  unitCost: 'Unit Cost',
  gasCost: 'Gas Cost',
  cylinderCost: 'Cylinder Cost',
  vehicle: 'Vehicle',
  markAsFulfilled: 'Mark As Fulfilled',
  totalItems: 'Total Items',
  totalCost: 'Total Cost',
  editPurchaseOrder: 'Edit Purchase Order',
  createNewPurchaseOrder: 'Create New Purchase Order',
  step: 'Step',
  of: 'Of',
  orderInformation: 'Order Information',
  selectCompany: 'Select Company',
  selectDriver: 'Select Driver',
  shipmentDate: 'Shipment Date',
  expectedDeliveryDate: 'Expected Delivery Date',
  invoiceNumber: 'Invoice Number',
  enterInvoiceNumber: 'Enter Invoice Number',
  paymentTerms: 'Payment Terms',
  cashOnDelivery: 'Cash On Delivery',
  net30Days: 'Net30 Days',
  net60Days: 'Net60 Days',
  advancePayment: 'Advance Payment',
  priority: 'Priority',
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  vehicleNumber: 'Vehicle Number',
  enterVehicleNumber: 'Enter Vehicle Number',
  enterAdditionalNotes: 'Enter Additional Notes',
  addLineItem: 'Add Line Item',
  selectProduct: 'Select Product',
  selectCompanyFirst: 'Select Company First',
  package: 'Package',
  refill: 'Refill',
  gasPrice: 'Gas Price',
  cylinderPrice: 'Cylinder Price',
  taxRate: 'Tax Rate',
  lineTotalPreview: 'Line Total Preview',
  packageInfo: 'Package Info',
  refillInfo: 'Refill Info',
  addItem: 'Add Item',
  purchaseItems: 'Purchase Items',
  qty: 'Qty',
  lineTotal: 'Line Total',
  action: 'Action',
  editItem: 'Edit Item',
  removeItem: 'Remove Item',
  remove: 'Remove',
  totalPurchaseValue: 'Total Purchase Value',
  orderPreview: 'Order Preview',
  orderSummary: 'Order Summary',
  totalQuantity: 'Total Quantity',
  companyRequired: 'Company is required',
  shipmentDateRequired: 'Shipment Date is required',
  atLeastOneLineItemRequired: 'At Least One Line Item is required',
  creating: 'Creating',
  updatePurchaseOrder: 'Update Purchase Order',
  createPurchaseOrder: 'Create Purchase Order',
  transactionType: 'Transaction Type',
  buyEmptyCylinders: 'Buy Empty Cylinders',
  sellEmptyCylinders: 'Sell Empty Cylinders',
  addEmptyCylindersToInventory: 'Add Empty Cylinders To Inventory',
  removeEmptyCylindersFromInventory: 'Remove Empty Cylinders From Inventory',
  cylinderSize: 'Cylinder Size',
  selectCylinderSize: 'Select Cylinder Size',
  emptyCylindersNote: 'Empty Cylinders Note',
  transactionDate: 'Transaction Date',
  enterTransactionDetails: 'Enter Transaction Details',
  buy: 'Buy',
  sell: 'Sell',
  emptyCylinderTransaction: 'Empty Cylinder Transaction',
  directTransaction: 'Direct Transaction',
  cylinderBuyTransaction: 'Cylinder Buy Transaction',
  cylinderSellTransaction: 'Cylinder Sell Transaction',
  comprehensiveProfitabilityAnalysis: 'Comprehensive Profitability Analysis',
  visualRepresentationProfitByProduct:
    'Visual Representation Profit By Product',
  individualDriverPerformanceMetrics: 'Individual Driver Performance Metrics',
  comparativeAnalysisRevenueByDriver: 'Comparative Analysis Revenue By Driver',
  monthlyRevenue: 'Monthly Revenue',
  allExpenses: 'All Expenses',
  totalProfit: 'Total Profit',
  buyingPrice: 'Buying Price',
  commission: 'Commission',
  fixedCost: 'Fixed Cost',
  breakevenPrice: 'Breakeven Price',
  sellingPrice: 'Selling Price',
  costPerUnit: 'Cost Per Unit',
  avgCostPerUnit: 'Avg Cost Per Unit',
  failedToLoadData: 'Failed To Load Data',
  errorLoadingData: 'Loading error data...',
  january: 'January',
  february: 'February',
  march: 'March',
  april: 'April',
  may: 'May',
  june: 'June',
  july: 'July',
  august: 'August',
  september: 'September',
  october: 'October',
  november: 'November',
  december: 'December',
  july2025: 'July2025',
  june2025: 'June2025',
  may2025: 'May2025',
  april2025: 'April2025',
  march2025: 'March2025',
  february2025: 'February2025',
  january2025: 'January2025',
  december2024: 'December2024',
  november2024: 'November2024',
  october2024: 'October2024',
  selectTime: 'Select Time',
  failedToLoadDashboardData: 'Failed To Load Dashboard Data',
  failedToLoadDashboardDataRefresh: 'Failed To Load Dashboard Data Refresh',
  errorLoadingCombinedDashboardData: 'Loading error combined dashboard data...',
  sessionExpiredRedirectingToLogin: 'Session Expired Redirecting To Login',
  realTimeOverview: 'Real Time Overview',
  orders: 'Orders',
  stockLevel: 'Stock Level',
  liveActivity: 'Live Activity',
  last15Minutes: 'Last15 Minutes',
  targetProgress: 'Target Progress',
  performanceIndicators: 'Performance Indicators',
  inventoryHealth: 'Inventory Health',
  attentionNeeded: 'Attention Needed',
  good: 'Good',
  collectionRate: 'Collection Rate',
  profitMargin: 'Profit Margin',
  salesDetails: 'Sales Details',
  viewDetailedSalesBreakdown: 'View Detailed Sales Breakdown',
  salesBreakdown: 'Sales Breakdown',
  detailedSalesAnalytics: 'Detailed Sales Analytics',
  averageOrderValue: 'Average Order Value',
  driverPerformance: 'Driver Performance',
  topPerformersAndRankings: 'Top Performers And Rankings',
  driverRankings: 'Driver Rankings',
  performanceLeaderboard: 'Performance Leaderboard',
  detailedViewAndTrends: 'Detailed View And Trends',
  vsYesterday: 'Vs Yesterday',
  lpgDistributor: 'Lpg Distributor',
  welcomeBack: 'Welcome Back',
  role: 'Role',
  loadingDashboard: 'Loading Dashboard',
  fallbackDriverName1: 'Fallback Driver Name1',
  fallbackDriverName2: 'Fallback Driver Name2',
  fallbackDriverName3: 'Fallback Driver Name3',
  fallbackDriverName4: 'Fallback Driver Name4',
  salesCount: 'Sales Count',
  revenueAmount: 'Revenue Amount',
  performancePercentage: 'Performance Percentage',
  chartDataFallback: 'Chart Data Fallback',
  weeklyPerformance: 'Weekly Performance',
  dailyAverage: 'Daily Average',
  monthlyTarget: 'Monthly Target',
  quarterlyGrowth: 'Quarterly Growth',
  unknownDriver: 'Unknown Driver',
  unknownCompany: 'Unknown Company',
  completedSale: 'Completed Sale',
  driverCompletedSale: 'Driver Completed Sale',
  salesTrendUp: 'Sales Trend Up',
  salesTrendDown: 'Sales Trend Down',
  addressMustBeAtLeast10Characters: 'Address Must Be At Least10 Characters',
  addressTooLong: 'Address Too Long',
  areaMustBeAtLeast2Characters: 'Area Must Be At Least2 Characters',
  areaTooLong: 'Area Too Long',
  driverTypeIsRequired: 'Driver Type Is is required',
  emergencyContactMustBeAtLeast10Digits:
    'Emergency Contact Must Be At Least10 Digits',
  emergencyContactNameMustBeAtLeast2Characters:
    'Emergency Contact Name Must Be At Least2 Characters',
  emergencyContactTooLong: 'Emergency Contact Too Long',
  invalidEmailAddress: 'Invalid Email Address',
  licenseNumberMustBeAtLeast5Characters:
    'License Number Must Be At Least5 Characters',
  licenseNumberTooLong: 'License Number Too Long',
  nameMustBeAtLeast2Characters: 'Name Must Be At Least2 Characters',
  nameTooLong: 'Name Too Long',
  phoneNumberMustBeAtLeast10Digits: 'Phone Number Must Be At Least10 Digits',
  phoneNumberTooLong: 'Phone Number Too Long',
  statusIsRequired: 'Status Is is required',
  all: 'All',
  bn: 'Bn',
  en: 'En',
  locale: 'Locale',
  key: 'Key',
  value: 'Value',
  allAlerts: 'All Alerts',
  critical: 'Critical',
  criticalAlerts: 'Critical Alerts',
  infoAlerts: 'Info Alerts',
  warningAlerts: 'Warning Alerts',
  inventoryAlert: 'Inventory Alert',
  performanceAlert: 'Performance Alert',
  stockAlert: 'Stock Alert',
  systemNotification: 'System Notification',
  completionPercentage: 'Completion Percentage',
  dashboardDataUpdated: 'Dashboard Data Updated',
  dataNotFound: 'Data Not Found',
  isComplete: 'Is Complete',
  liveDataFeed: 'Live Data Feed',
  metricsLastUpdated: 'Metrics Last Updated',
  missingKeys: 'Missing Keys',
  newSalesActivity: 'New Sales Activity',
  optional: 'Optional',
  recentSaleActivity: 'Recent Sale Activity',
  totalKeys: 'Total Keys',
  testCredentials: 'Test Credentials',
  translatedKeys: 'Translated Keys',
  lowStock: 'Low Stock',
  outOfStock: 'Out Of Stock',
  overduePayments: 'Overdue Payments',
  overstock: 'Overstock',
  performanceTrendDown: 'Performance Trend Down',
  performanceTrendStable: 'Performance Trend Stable',
  performanceTrendUp: 'Performance Trend Up',
  salesTrendStable: 'Sales Trend Stable',
  targetAchieved: 'Target Achieved',
  topPerformer: 'Top Performer',
  deleteDriver: 'Delete Driver',
  failedToLoadAlerts: 'Failed To Load Alerts',
  failedToLoadInventoryAlerts: 'Failed To Load Inventory Alerts',
  movementAnomaly: 'Movement Anomaly',
  operationSuccessful: 'Operationful successful',
  welcomeToOnboarding: 'Welcome To Onboarding',
  setupYourBusinessData: 'Setup Your Business Data',
  companyNames: 'Company Names',
  productSetup: 'Product Setup',
  inventoryQuantities: 'Inventory Quantities',
  driversSetup: 'Drivers Setup',
  receivablesSetup: 'Receivables Setup',
  skipOnboarding: 'Skip Onboarding',
  completing: 'Completing',
  completeSetup: 'Complete Setup',
  setupBusiness: 'Setup Business',
  addCompanyNames: 'Add Company Names',
  addCompaniesYouDistributeFor: 'Add Companies You Distribute For',
  addNewCompany: 'Add New Company',
  enterCompanyNamesLikeAygaz: 'Enter Company Names Like Aygaz',
  companyName: 'Company Name',
  enterCompanyName: 'Enter Company Name',
  companyNameRequired: 'Company Name is required',
  companyAlreadyExists: 'Company Already Exists',
  addedCompanies: 'Added Companies',
  companiesYouDistributeFor: 'Companies You Distribute For',
  noCompaniesAdded: 'No Companies Added',
  addAtLeastOneCompany: 'Add At Least One Company',
  setupProductsAndSizes: 'Setup Products And Sizes',
  configureCylinderSizesAndProducts: 'Configure Cylinder Sizes And Products',
  addCylinderSize: 'Add Cylinder Size',
  addSizesLike12L20L: 'Add Sizes Like12 L20 L',
  enterSizeLike12L: 'Enter Size Like12 L',
  addSize: 'Add Size',
  cylinderSizeRequired: 'Cylinder Size is required',
  cylinderSizeAlreadyExists: 'Cylinder Size Already Exists',
  enterDescription: 'Enter Description',
  addProduct: 'Add Product',
  addNewProduct: 'Add New Product',
  addProductsForEachCompany: 'Add Products For Each Company',
  productName: 'Product Name',
  enterProductName: 'Enter Product Name',
  enterProductNameExample: 'Enter Product Name Example',
  currentPrice: 'Current Price',
  enterPrice: 'Enter Price',
  productNameRequired: 'Product Name is required',
  validPriceRequired: 'Valid Price is required',
  productAlreadyExists: 'Product Already Exists',
  addedProducts: 'Added Products',
  addCylinderSizesAndProducts: 'Add Cylinder Sizes And Products',
  bothRequiredToProceed: 'Both To Proceed is required',
  setInitialInventory: 'Set Initial Inventory',
  enterCurrentFullCylinderQuantities: 'Enter Current Full Cylinder Quantities',
  fullCylinderInventory: 'Full Cylinder Inventory',
  enterQuantityForEachProduct: 'Enter Quantity For Each Product',
  noProductsAvailable: 'No Products Available',
  addProductsFirst: 'Add Products First',
  totalProducts: 'Total Products',
  totalFullCylinders: 'Total Full Cylinders',
  setEmptyCylinderInventory: 'Set Empty Cylinder Inventory',
  enterCurrentEmptyCylinderQuantities:
    'Enter Current Empty Cylinder Quantities',
  emptyCylinderInventory: 'Empty Cylinder Inventory',
  enterQuantityForEachSize: 'Enter Quantity For Each Size',
  noCylinderSizesAvailable: 'No Cylinder Sizes Available',
  addCylinderSizesFirst: 'Add Cylinder Sizes First',
  totalSizes: 'Total Sizes',
  totalEmptyCylinders: 'Total Empty Cylinders',
  emptyCylinderNote: 'Empty Cylinder Note',
  addYourDrivers: 'Add Your Drivers',
  addDriversWhoWillSellProducts: 'Add Drivers Who Will Sell Products',
  enterDriverInformation: 'Enter Driver Information',
  enterDriverName: 'Enter Driver Name',
  shipmentDriver: 'Shipment Driver',
  driverNameRequired: 'Driver Name is required',
  driverAlreadyExists: 'Driver Already Exists',
  addedDrivers: 'Added Drivers',
  driversInYourTeam: 'Drivers In Your Team',
  noContactInfo: 'No Contact Info',
  noDriversAdded: 'No Drivers Added',
  addAtLeastOneDriver: 'Add At Least One Driver',
  setupReceivables: 'Setup Receivables',
  enterCurrentReceivablesForEachDriver:
    'Enter Current Receivables For Each Driver',
  driverReceivables: 'Driver Receivables',
  enterCashAndCylinderReceivables: 'Enter Cash And Cylinder Receivables',
  amountOwedByCustomers: 'Amount Owed By Customers',
  cylindersOwedByCustomers: 'Cylinders Owed By Customers',
  cylindersOwedByCustomersBySize: 'Cylinders Owed By Customers By Size',
  noDriversAvailable: 'No Drivers Available',
  addDriversFirst: 'Add Drivers First',
  noRetailDriversAvailable: 'No Retail Drivers Available',
  addRetailDriversFirst: 'Add Retail Drivers First',
  receivablesSummary: 'Receivables Summary',
  manualBusinessOnboarding: 'Manual Business Onboarding',
  businessInformation: 'Business Information',
  businessName: 'Business Name',
  businessNamePlaceholder: 'Enter business name...',
  subdomain: 'Subdomain',
  subdomainPlaceholder: 'Enter subdomain...',
  plan: 'Plan',
  freemium: 'Freemium',
  professional: 'Professional',
  enterprise: 'Enterprise',
  adminUser: 'Admin User',
  adminName: 'Admin Name',
  adminNamePlaceholder: 'Enter admin name...',
  adminEmail: 'Admin Email',
  adminEmailPlaceholder: 'Enter admin email...',
  adminPassword: 'Admin Password',
  strongPassword: 'Strong Password',
  creatingBusiness: 'Creating Business',
  onboardBusiness: 'Onboard Business',
  businessOnboardedSuccessfully: 'Business Onboardedfully successful',
  businessCreatedWithAdmin: 'Business Created With Admin',
  failedToOnboardBusiness: 'Failed To Onboard Business',
  networkErrorOccurred: 'Error: network occurred',
  unauthorized: 'Unauthorized',
  userNotFound: 'User Not Found',
  onboardingAlreadyCompleted: 'Onboarding Already Completed',
  failedToCompleteOnboarding: 'Failed To Complete Onboarding',
  failedToCheckOnboardingStatus: 'Failed To Check Onboarding Status',
  searchCompanies: 'Search Companies',
  addCompany: 'Add Company',
  activeProducts: 'Active Products',
  totalStock: 'Total Stock',
  companies: 'Companies',
  searchProducts: 'Search Products',
  created: 'Created',
  cylinderSizeDeletedSuccessfully: 'Cylinder Size Deletedfully successful',
};

const bengaliTranslations: Translations = {
  // Navigation
  dashboard: 'ড্যাশবোর্ড',
  sales: 'বিক্রয়',
  drivers: 'চালক',
  shipments: 'চালান',
  receivables: 'বাকি',
  assets: 'সম্পদ',
  expenses: 'খরচ',
  settings: 'সেটিংস',
  inventory: 'মজুদ',
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
  loading: 'লোড হচ্ছে',
  noData: 'কোন তথ্য নেই',
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
  description: 'বিবরণ',
  amount: 'পরিমাণ',
  date: 'তারিখ',
  notes: 'নোট',
  status: 'অবস্থা',
  type: 'ধরন',
  category: 'বিভাগ',
  active: 'সক্রিয়',
  inactive: 'নিষ্ক্রিয়',
  editCompany: 'কোম্পানি সম্পাদনা',
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
  failedToFetchReceivables: 'প্রাপ্য আনতে ব্যর্থ',
  receivablesRecalculatedSuccessfully: 'প্রাপ্য সফলভাবে পুনর্গণনা হয়েছে',
  failedToRecalculateReceivables: 'প্রাপ্য পুনর্গণনা করতে ব্যর্থ',
  failedToFetchReceivablesChanges: 'প্রাপ্য পরিবর্তন আনতে ব্যর্থ',
  customerReceivableUpdatedSuccessfully:
    'গ্রাহকের প্রাপ্য সফলভাবে আপডেট হয়েছে',
  customerReceivableAddedSuccessfully: 'গ্রাহকের প্রাপ্য সফলভাবে যোগ হয়েছে',
  failedToSaveCustomerReceivable: 'গ্রাহকের প্রাপ্য সংরক্ষণ করতে ব্যর্থ',
  customerReceivableDeletedSuccessfully:
    'গ্রাহকের প্রাপ্য সফলভাবে মুছে ফেলা হয়েছে',
  failedToDeleteCustomerReceivable: 'গ্রাহকের প্রাপ্য মুছতে ব্যর্থ',
  paymentRecordedSuccessfully: 'পেমেন্ট সফলভাবে রেকর্ড হয়েছে',
  failedToRecordPayment: 'পেমেন্ট রেকর্ড করতে ব্যর্থ',
  cylinderReturnRecordedSuccessfully: 'সিলিন্ডার ফেরত সফলভাবে রেকর্ড হয়েছে',
  failedToRecordCylinderReturn: 'সিলিন্ডার ফেরত রেকর্ড করতে ব্যর্থ',
  cylinderReceivable: 'সিলিন্ডার প্রাপ্য',
  enterPaymentAmount: 'পেমেন্টের পরিমাণ লিখুন',
  enterNumberOfCylinders: 'সিলিন্ডারের সংখ্যা লিখুন',
  recordPayment: 'পেমেন্ট রেকর্ড করুন',
  recordCylinderReturn: 'সিলিন্ডার ফেরত রেকর্ড করুন',
  recordReturn: 'ফেরত রেকর্ড করুন',
  customerReceivablesDontMatch: 'গ্রাহকের প্রাপ্য মিলছে না',
  editCustomerReceivable: 'গ্রাহকের প্রাপ্য সম্পাদনা',
  addCustomerReceivable: 'গ্রাহকের প্রাপ্য যোগ করুন',
  cashReceivable: 'নগদ প্রাপ্য',
  driverTotalReceivablesFromSales: 'ড্রাইভারের মোট প্রাপ্য (বিক্রয় থেকে)',
  customerReceivableTotalsMustEqual: 'গ্রাহকের প্রাপ্য মোট সমান হতে হবে',
  cashMismatch: 'নগদ অমিল',
  customerTotal: 'গ্রাহকের মোট',
  salesTotal: 'বিক্রয়ের মোট',
  difference: 'পার্থক্য',
  cylinderMismatch: 'সিলিন্ডার অমিল',
  customersWithOverduePayments: 'বকেয়া পেমেন্ট সহ গ্রাহকরা',
  requireImmediate: 'তাৎক্ষণিক প্রয়োজন',
  receivablesManagementSystemRules: 'প্রাপ্য ব্যবস্থাপনা সিস্টেম নিয়ম',
  driverTotalReceivables: 'ড্রাইভারের মোট প্রাপ্য',
  automaticallyCalculatedFromSales: 'বিক্রয় থেকে স্বয়ংক্রিয়ভাবে গণনা',
  customerReceivablesManuallyManaged: 'গ্রাহকের প্রাপ্য ম্যানুয়ালি পরিচালিত',
  validation: 'বৈধতা',
  customerTotalsMustEqualDriverSales:
    'গ্রাহকের মোট ড্রাইভার বিক্রয়ের সমান হতে হবে',
  payments: 'পেমেন্ট',
  paymentsAutomaticallyAdded: 'পেমেন্ট স্বয়ংক্রিয়ভাবে যোগ',
  changesLogAllReceivableActions: 'সমস্ত প্রাপ্য কার্যক্রম লগ পরিবর্তন',
  managerAccess: 'ম্যানেজার অ্যাক্সেস',
  youCanRecordPayments: 'আপনি পেমেন্ট রেকর্ড করতে পারেন',
  salesCashReceivables: 'বিক্রয় নগদ প্রাপ্য',
  fromSalesData: 'বিক্রয় ডেটা থেকে',
  salesCylinderReceivables: 'বিক্রয় সিলিন্ডার প্রাপ্য',

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

  searchCylinderSizes: 'searchCylinderSizes', // TODO: Add Bengali translation
  productNamePlaceholder: 'productNamePlaceholder', // TODO: Add Bengali translation
  cylinderSizePlaceholder: 'cylinderSizePlaceholder', // TODO: Add Bengali translation
  optionalDescription: 'optionalDescription', // TODO: Add Bengali translation
  editCylinderSize: 'editCylinderSize', // TODO: Add Bengali translation
  deleteCylinderSize: 'deleteCylinderSize', // TODO: Add Bengali translation
  failedToSaveCylinderSize: 'failedToSaveCylinderSize', // TODO: Add Bengali translation
  code: 'code', // TODO: Add Bengali translation
  price: 'price', // TODO: Add Bengali translation
  threshold: 'threshold', // TODO: Add Bengali translation
  weight: 'weight', // TODO: Add Bengali translation
  fullCylinderWeight: 'fullCylinderWeight', // TODO: Add Bengali translation
  emptyCylinderWeight: 'emptyCylinderWeight', // TODO: Add Bengali translation
  lowStockThreshold: 'lowStockThreshold', // TODO: Add Bengali translation
  areYouSureDeleteCustomerReceivable:
    'আপনি কি নিশ্চিত যে এই গ্রাহক বাকি মুছে ফেলতে চান?',
  noCashReceivables: 'কোনো নগদ বাকি নেই',
  noCylinderReceivables: 'কোনো সিলিন্ডার বাকি নেই',
  receivableType: 'বাকির ধরন',
  mobile: 'মোবাইল',
  bank: 'ব্যাংক',
  transfer: 'transfer', // TODO: Add Bengali translation
  enterAmount: 'enterAmount', // TODO: Add Bengali translation
  enterQuantity: 'enterQuantity', // TODO: Add Bengali translation
  enterNotes: 'enterNotes', // TODO: Add Bengali translation
  selectSize: 'selectSize', // TODO: Add Bengali translation
  selectPaymentMethod: 'selectPaymentMethod', // TODO: Add Bengali translation
  changes: 'পরিবর্তন',
  loadingReceivables: 'loadingReceivables', // TODO: Add Bengali translation
  loadingChanges: 'loadingChanges', // TODO: Add Bengali translation
  failedToFetchCylinderSizes: 'failedToFetchCylinderSizes', // TODO: Add Bengali translation
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
  monthlyPayment: 'monthlyPayment', // TODO: Add Bengali translation
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
  unitValueUpdatedSuccessfully: 'unitValueUpdatedSuccessfully', // TODO: Add Bengali translation
  assetCreatedSuccessfully: 'assetCreatedSuccessfully', // TODO: Add Bengali translation
  assetUpdatedSuccessfully: 'assetUpdatedSuccessfully', // TODO: Add Bengali translation
  liabilityCreatedSuccessfully: 'liabilityCreatedSuccessfully', // TODO: Add Bengali translation
  liabilityUpdatedSuccessfully: 'liabilityUpdatedSuccessfully', // TODO: Add Bengali translation
  failedToLoadAssetsLiabilities: 'failedToLoadAssetsLiabilities', // TODO: Add Bengali translation
  failedToDeleteAsset: 'failedToDeleteAsset', // TODO: Add Bengali translation
  failedToDeleteLiability: 'failedToDeleteLiability', // TODO: Add Bengali translation
  failedToUpdateUnitValue: 'failedToUpdateUnitValue', // TODO: Add Bengali translation
  failedToCreateAsset: 'failedToCreateAsset', // TODO: Add Bengali translation
  failedToUpdateAsset: 'failedToUpdateAsset', // TODO: Add Bengali translation
  failedToCreateLiability: 'failedToCreateLiability', // TODO: Add Bengali translation
  failedToUpdateLiability: 'failedToUpdateLiability', // TODO: Add Bengali translation
  areYouSureDeleteAsset: 'আপনি কি নিশ্চিত যে এই সম্পদটি মুছে ফেলতে চান?',
  areYouSureDeleteLiability: 'আপনি কি নিশ্চিত যে এই দায়টি মুছে ফেলতে চান?',
  purchaseDate: 'purchaseDate', // TODO: Add Bengali translation
  depreciationRate: 'depreciationRate', // TODO: Add Bengali translation
  subCategory: 'subCategory', // TODO: Add Bengali translation
  autoCalculated: 'autoCalculated', // TODO: Add Bengali translation
  auto: 'auto', // TODO: Add Bengali translation
  noAssetsFound:
    'কোনো সম্পদ পাওয়া যায়নি। শুরু করতে "সম্পদ/দায় যোগ করুন" ক্লিক করুন।',
  noLiabilitiesFound:
    'কোনো দায় পাওয়া যায়নি। শুরু করতে "সম্পদ/দায় যোগ করুন" ক্লিক করুন।',
  addAsset: 'addAsset', // TODO: Add Bengali translation
  editAssetTitle: 'editAssetTitle', // TODO: Add Bengali translation
  addLiability: 'addLiability', // TODO: Add Bengali translation
  editLiabilityTitle: 'editLiabilityTitle', // TODO: Add Bengali translation
  enterAssetName: 'enterAssetName', // TODO: Add Bengali translation
  enterLiabilityName: 'enterLiabilityName', // TODO: Add Bengali translation
  enterValue: 'enterValue', // TODO: Add Bengali translation
  notAvailable: 'notAvailable', // TODO: Add Bengali translation
  vehicles: 'vehicles', // TODO: Add Bengali translation
  equipment: 'equipment', // TODO: Add Bengali translation
  property: 'property', // TODO: Add Bengali translation
  // Auto-generated missing properties (need Bengali translation)
  quantity: 'পরিমাণ',
  unitPrice: 'unit দাম',
  discount: 'ছাড়',
  totalValue: 'মোট value',
  packageSales: 'package বিক্রয়',
  refillSales: 'refill বিক্রয়',
  cylinder: 'সিলিন্ডার',
  cylinders: 'সিলিন্ডারs',
  products: 'পণ্যs',
  cash: 'Cash (বাংলা অনুবাদ প্রয়োজন)',
  cashDepositsByDriver: 'cash deposits by চালক',
  includesReceivablePayments: 'includes receivable পেমেন্টs',
  driverExpense: 'চালক expense',
  loadingData: 'লোড হচ্ছে data',
  noDataAvailable: 'no তথ্য available',
  tryAgain: 'চেষ্টা again',
  performance: 'perফর্মance',
  month: 'মাস',
  year: 'বছর',
  allDrivers: 'all চালকs',
  totalRevenue: 'মোট revenue',
  revenue: 'আয়',
  comingSoon: 'coming শীঘ্রই',
  exportReport: 'এক্সপোর্ট report',
  exportReportFunctionality: 'এক্সপোর্ট report functionality',
  customerRecords: 'গ্রাহক records',
  statusBreakdown: 'অবস্থা breakdown',
  noReceivablesFound: 'না receivables found',
  noChangesRecorded: 'না changes recorded',
  receivablesChangesLog: 'receivables changes লগ',
  amountPlaceholder: 'প্রবেশ করান amount...',
  enterExpenseDescription: 'প্রবেশ করান expense description',
  selectParentCategory: 'নির্বাচন করুন parent category',
  selectCategory: 'নির্বাচন করুন category',
  expenseDate: 'expense তারিখ',
  receiptUrl: 'রসিদ url',
  receiptUrlPlaceholder: 'প্রবেশ করান receipt url...',
  submitting: 'জমা দিনting',
  activeDrivers: 'active চালকs',
  activeUsers: 'active ব্যবহারকারীs',
  addDriver: 'যোগ করুন driver',
  addExpense: 'যোগ করুন expense',
  additionalNotesComments: 'যোগ করুনitional notes comments',
  addNewDriver: 'যোগ করুন new driver',
  addUser: 'যোগ করুন user',
  administrator: 'অ্যাডমিনistrator',
  administrators: 'অ্যাডমিনistrators',
  ago: 'Ago (বাংলা অনুবাদ প্রয়োজন)',
  alerts: 'সতর্কs',
  allCalculationsUpdatedRealTime: 'all calculations আপডেটd real time',
  allCategories: 'সব categories',
  allCylinders: 'all সিলিন্ডারs',
  allGood: 'all ভাল',
  allStatus: 'all অবস্থা',
  approved: 'অনুমোদিত',
  approvedExpenses: 'অনুমোদনd expenses',
  approveExpense: 'অনুমোদন expense',
  area: 'এলাকা',
  areYouSureDeleteDriver: 'are you sure মুছুন driver',
  assetsLiabilities: 'Assets Liabilities (বাংলা অনুবাদ প্রয়োজন)',
  assignedArea: 'assigned এলাকা',
  balanceSheet: 'ভারসাম্য sheet',
  businessFormulaImplementation: 'ব্যবসায়িক formula implementation',
  cashReceivables: 'Cash Receivables (বাংলা অনুবাদ প্রয়োজন)',
  changesLog: 'changes লগ',
  checkStock: 'check স্টক',
  clear: 'পরিষ্কার',
  company: 'কোম্পানি',
  completeSystemAccessAndUserManagement: 'complete system access and ব্যবহারকারী management',
  confirmDeleteUser: 'confirm মুছুন user',
  contactName: 'contact নাম',
  contactNumber: 'বিপক্ষেtact number',
  create: 'তৈরি করুন',
  criticalAlert: 'সমালোচনামূলক alert',
  currency: 'Currency (বাংলা অনুবাদ প্রয়োজন)',
  currentFullCylinderInventory: 'current full cylinder মজুদ',
  currentStock: 'current স্টক',
  currentStockHealth: 'current স্টক health',
  customers: 'গ্রাহকs',
  cylinderReceivables: 'সিলিন্ডার receivables',
  cylindersReceived: 'সিলিন্ডারs received',
  cylindersSold: 'সিলিন্ডারs sold',
  cylindersSummaryApiError: 'error: cylinders সারসংক্ষেপ api',
  cylindersSummaryDataReceived: 'cylinders summary তথ্য received',
  cylindersSummaryResponseStatus: 'cylinders summary response অবস্থা',
  dailyCalculations: 'daily গণনাs',
  dailyInventoryTracking: 'daily মজুদ tracking',
  dataSources: 'তথ্য sources',
  day: 'দিন',
  days: 'দিনs',
  deleteExpense: 'মুছুন expense',
  deleteUser: 'মুছুন user',
  deleting: 'Deleting (বাংলা অনুবাদ প্রয়োজন)',
  details: 'বিস্তারিত',
  driver: 'চালক',
  driverAddedSuccessfully: 'driver যোগ করুনedfully successful',
  driverDeletedSuccessfully: 'driver মুছুনdfully successful',
  driverDetails: 'চালক details',
  driverManagement: 'চালক management',
  driverName: 'driver নাম',
  driverType: 'driver ধরন',
  driverUpdatedSuccessfully: 'driver আপডেটdfully successful',
  editDriver: 'সম্পাদনা driver',
  editExpense: 'সম্পাদনা expense',
  editUser: 'সম্পাদনা user',
  emailAddress: 'email যোগ করুনress',
  emergencyContact: 'emergency বিপক্ষেtact',
  emptyCylinderInventoryAvailability: 'empty cylinder মজুদ availability',
  emptyCylinders: 'empty সিলিন্ডারs',
  emptyCylindersBuySell: 'empty সিলিন্ডারs buy sell',
  emptyCylindersInHand: 'empty সিলিন্ডারs in hand',
  emptyCylinderReceivables: 'empty সিলিন্ডার receivables',
  emptyCylindersInStock: 'empty cylinders in স্টক',
  outstandingShipments: 'outstanding চালানs',
  noOutstandingOrders: 'no outstanding আদেশs',
  enterAssignedAreaRoute: 'প্রবেশ করান assigned area route',
  enterEmailAddress: 'enter email যোগ করুনress',
  enterEmergencyContactName: 'প্রবেশ করান emergency contact name',
  enterEmergencyContactNumber: 'প্রবেশ করান emergency contact number',
  enterFullAddress: 'enter full যোগ করুনress',
  enterFullName: 'প্রবেশ করান full name',
  enterLicenseNumber: 'প্রবেশ করান license number',
  enterPhoneNumber: 'প্রবেশ করান phone number',
  error: 'ত্রুটি',
  errorFetchingCylindersSummaryData: 'error fetching cylinders summary তথ্য',
  errorFetchingDailyInventoryData: 'error fetching daily inventory তথ্য',
  errorFetchingInventoryData: 'error fetching inventory তথ্য',
  expense: 'খরচ',
  expenseManagement: 'খরচ management',
  exportFunctionalityComingSoon: 'এক্সপোর্ট functionality coming soon',
  failedToCreateUser: 'failed to তৈরি করুন user',
  failedToDeleteDriver: 'failed to মুছুন driver',
  failedToDeleteUser: 'failed to মুছুন user',
  failedToFetchUsers: 'failed to fetch ব্যবহারকারীs',
  failedToLoadInventoryData: 'failed to load inventory তথ্য',
  failedToUpdateDriver: 'failed to আপডেট driver',
  failedToUpdateUser: 'failed to আপডেট user',
  fetchingCylindersSummaryData: 'fetching cylinders summary তথ্য',
  filterByDriverType: 'ফিল্টার by driver type',
  fri: 'Fri (বাংলা অনুবাদ প্রয়োজন)',
  from: 'From (বাংলা অনুবাদ প্রয়োজন)',
  fullAccess: 'পূর্ণ access',
  fullCylinders: 'full সিলিন্ডারs',
  fullName: 'full নাম',
  generalSettings: 'general সেটিংস',
  getStartedByAddingFirstExpense: 'get started by যোগ করুনing first expense',
  hour: 'ঘন্টা',
  hours: 'ঘন্টাs',
  individualDailySalesData: 'individual daily sales তথ্য',
  info: 'Info (বাংলা অনুবাদ প্রয়োজন)',
  inventoryManagement: 'মজুদ management',
  joiningDate: 'joining তারিখ',
  justNow: 'just এখন',
  kPending: 'k অপেক্ষমাণ',
  language: 'Language (বাংলা অনুবাদ প্রয়োজন)',
  last7Days: 'last7 দিনs',
  lastMonth: 'last মাস',
  lastLogin: 'last লগইন',
  lastUpdated: 'last আপডেটd',
  latest: 'সর্বশেষ',
  licenseNumber: 'license সংখ্যা',
  loadingDailySalesData: 'লোড হচ্ছে daily sales data',
  loadingDriverPerformance: 'লোড হচ্ছে driver performance',
  loadingInventoryData: 'লোড হচ্ছে inventory data',
  loadingText: 'লোড হচ্ছে text',
  locationInformation: 'location তথ্য',
  login: 'লগইন',
  lpgDistributorManagementSystem: 'lpg পরিবেশক management system',
  manageBudgets: 'manage বাজেটs',
  manageCategories: 'Manage Categories (বাংলা অনুবাদ প্রয়োজন)',
  manageCompanyAssets: 'manage কোম্পানি assets',
  manageDriversAndAssignments: 'manage চালকs and assignments',
  manageLiabilities: 'Manage Liabilities (বাংলা অনুবাদ প্রয়োজন)',
  manager: 'ম্যানেজার',
  managers: 'ম্যানেজারs',
  manageSystemRoles: 'manage সিস্টেম roles',
  manageSystemUsers: 'manage system ব্যবহারকারীs',
  manageTeam: 'manage দল',
  mon: 'Mon (বাংলা অনুবাদ প্রয়োজন)',
  monitorCylinderStock: 'monitor cylinder স্টক',
  needAdminPrivileges: 'need অ্যাডমিন privileges',
  never: 'Never (বাংলা অনুবাদ প্রয়োজন)',
  newSale: 'নতুন sale',
  noActiveDriversFoundForThisPeriod: 'no active চালকs found for this period',
  noDailyInventoryDataAvailable: 'no daily inventory তথ্য available',
  noDailySalesDataFound: 'no daily sales তথ্য found',
  noDataFound: 'no তথ্য found',
  noEmptyCylindersInInventory: 'no empty cylinders in মজুদ',
  noFullCylindersInInventory: 'no full cylinders in মজুদ',
  notApplicable: 'নাt applicable',
  note: 'নোট',
  noUsersFound: 'no ব্যবহারকারীs found',
  operationFailed: 'failed to opeঅনুপাতn failed',
  operations: 'opeঅনুপাতns',
  outstanding: 'Outstanding (বাংলা অনুবাদ প্রয়োজন)',
  packagePurchase: 'package ক্রয়',
  packageRefillPurchase: 'package refill ক্রয়',
  packageRefillSales: 'package refill বিক্রয়',
  packageSale: 'প্যাকেজ sale',
  packageSalesQty: 'package বিক্রয় qty',
  parentCategory: 'parent বিভাগ',
  pay: 'Pay (বাংলা অনুবাদ প্রয়োজন)',
  paymentReceived: 'পেমেন্ট received',
  pending: 'অপেক্ষমাণ',
  pendingApproval: 'অপেক্ষমাণ approval',
  performanceStatistics: 'perফর্মance statistics',
  permissions: 'Permissions (বাংলা অনুবাদ প্রয়োজন)',
  personalInformation: 'personal তথ্য',
  phoneNumber: 'ফোন number',
  pleaseLogInToAccessUserManagement: 'please log in to access ব্যবহারকারী management',
  producentsWithLowStockWarning: 'producents with low স্টক warning',
  productsBelowMinimumThreshold: 'পণ্যs below minimum threshold',
  productsInCriticalStock: 'পণ্যs in critical stock',
  productsInGoodStock: 'পণ্যs in good stock',
  productsOutOfStock: 'পণ্যs out of stock',
  purchase: 'ক্রয়',
  rahmanSoldCylinders: 'rahman sold সিলিন্ডারs',
  realTimeInventoryTracking: 'real সময় inventory tracking',
  receivableManagement: 'receivable ব্যবস্থাপনা',
  receivableRecords: 'receivable রেকর্ডs',
  recentActivity: 'সাম্প্রতিক activity',
  recordDailySales: 'record daily বিক্রয়',
  refillPurchase: 'refill ক্রয়',
  refillSale: 'রিফিল sale',
  refillSalesQty: 'refill বিক্রয় qty',
  refreshData: 'রিফ্রেশ data',
  rejectExpense: 'প্রত্যাখ্যান expense',
  reportsAnalytics: 'রিপোর্টs analytics',
  retail: 'খুচরা',
  retailDriver: 'retail চালক',
  sale: 'Sale (বাংলা অনুবাদ প্রয়োজন)',
  retailDriverDescription: 'retail driver বিবরণ',
  retailDrivers: 'retail চালকs',
  retry: 'reচেষ্টা',
  return: 'Return (বাংলা অনুবাদ প্রয়োজন)',
  rolePermissions: 'Role Permissions (বাংলা অনুবাদ প্রয়োজন)',
  routeArea: 'রুট area',
  salesInventoryAndDriverManagement: 'sales inventory and চালক management',
  salesTrend: 'বিক্রয় trend',
  salesValue: 'বিক্রয় value',
  sat: 'Sat (বাংলা অনুবাদ প্রয়োজন)',
  saveError: 'error: সংরক্ষণ',
  saveSuccess: 'সংরক্ষণ successful',
  searchExpenses: 'অনুসন্ধান expenses',
  selectDriverType: 'নির্বাচন করুন driver type',
  selectStatus: 'নির্বাচন করুন status',
  shipment: 'চালান',
  shipmentDriverDescription: 'shipment driver বিবরণ',
  shipmentDrivers: 'shipment চালকs',
  size: 'আকার',
  statusAndNotes: 'অবস্থা and notes',
  stock: 'স্টক',
  stockReplenished: 'স্টক replenished',
  submittedBy: 'জমা দিনted by',
  success: 'সাফল্য',
  sumAllDriversSalesForDate: 'sum all drivers sales for তারিখ',
  sumCompletedEmptyCylinderShipments: 'sum completed empty সিলিন্ডার shipments',
  sumCompletedShipmentsFromShipmentsPage: 'sum completed চালানs from চালানs page',
  sun: 'Sun (বাংলা অনুবাদ প্রয়োজন)',
  systemUsers: 'system ব্যবহারকারীs',
  tasks: 'কাজs',
  teamAccess: 'দল access',
  thisActionCannotBeUndone: 'this action cannot be পূর্বাবস্থায় ফিরুনne',
  thisMonth: 'this মাস',
  thu: 'Thu (বাংলা অনুবাদ প্রয়োজন)',
  timezone: 'সময়zone',
  to: 'To (বাংলা অনুবাদ প্রয়োজন)',
  today: 'আজ',
  todaysEmptyCylinders: 'todays empty সিলিন্ডারs',
  todaysFullCylinders: 'todays full সিলিন্ডারs',
  todaysPurchases: 'todays ক্রয়s',
  todaysSales: 'todays বিক্রয়',
  topDriverPerformance: 'top চালক performance',
  totalCylinderReceivables: 'মোট cylinder receivables',
  totalCylinders: 'মোট cylinders',
  totalCylindersReceivables: 'মোট cylinders receivables',
  totalReceivables: 'মোট receivables',
  totalSales: 'মোট sales',
  totalSalesQty: 'মোট sales qty',
  totalSalesThisMonth: 'মোট sales this month',
  totalUsers: 'মোট users',
  trackCustomerCredits: 'track customer crসম্পাদনাs',
  trackCustomerPayments: 'track গ্রাহক payments',
  trackExpenses: 'track খরচs',
  trackExpensesAndManageBudgets: 'track খরচs and manage budgets',
  trackPerformance: 'track perফর্মance',
  tue: 'Tue (বাংলা অনুবাদ প্রয়োজন)',
  unknown: 'অজানা',
  updateDriver: 'আপডেট driver',
  updateExpense: 'আপডেট expense',
  updatePayment: 'আপডেট payment',
  updateUser: 'আপডেট user',
  updating: 'উপরেdating',
  urgent: 'জরুরি',
  user: 'ব্যবহারকারী',
  userDetails: 'ব্যবহারকারী details',
  userManagement: 'ব্যবহারকারী management',
  viewDetails: 'দৃষ্টিভঙ্গি details',
  viewingExpensesFor: 'দৃষ্টিভঙ্গিing expenses for',
  viewReceipt: 'দৃষ্টিভঙ্গি receipt',
  viewReports: 'দৃষ্টিভঙ্গি reports',
  warning: 'সতর্কবাণী',
  wed: 'Wed (বাংলা অনুবাদ প্রয়োজন)',
  week: 'সপ্তাহ',
  yesterday: 'গতকাল',
  yesterdaysEmpty: 'yesterdays খালি',
  yesterdaysFull: 'yesterdays পূর্ণ',
  fuelExpense: 'fuel খরচ',
  maintenanceExpense: 'maintenance খরচ',
  officeExpense: 'office খরচ',
  transportExpense: 'transport খরচ',
  miscellaneousExpense: 'miscellaneous খরচ',
  generalExpense: 'general খরচ',
  failedToLoadDailySalesReport: 'failed to load daily sales রিপোর্ট',
  loadingDailySalesReport: 'লোড হচ্ছে daily sales report',
  noReportDataAvailable: 'no রিপোর্ট data available',
  tryAgainOrSelectDate: 'try again or নির্বাচন করুন date',
  comprehensiveDailySalesReport: 'comprehensive daily sales রিপোর্ট',
  totalSalesValue: 'মোট sales value',
  totalDeposited: 'মোট deposited',
  totalExpenses: 'মোট expenses',
  availableCash: 'উপলব্ধ cash',
  totalCashReceivables: 'মোট cash receivables',
  changeInReceivablesCashCylinders: 'change in receivables cash সিলিন্ডারs',
  dailyDepositsExpenses: 'daily deposits খরচs',
  detailedBreakdownDepositsExpenses: 'detailed breakdown deposits খরচs',
  deposits: 'Deposits (বাংলা অনুবাদ প্রয়োজন)',
  particulars: 'অংশiculars',
  noDepositsFound: 'না deposits found',
  totalDepositsCalculated: 'মোট deposits calculated',
  noExpensesFound: 'no খরচs found',
  totalExpensesCalculated: 'মোট expenses calculated',
  totalAvailableCash: 'মোট available cash',
  totalDepositsIncludingSales: 'মোট deposits including sales',
  customerName: 'customer নাম',
  selectADriver: 'নির্বাচন করুন a driver',
  enterCustomerName: 'প্রবেশ করান customer name',
  customerNamePlaceholder: 'প্রবেশ করান customer name...',
  saleItems: 'sale আইটেমs',
  itemNumber: 'আইটেম number',
  selectAProduct: 'নির্বাচন করুন a product',
  packagePrice: 'package দাম',
  refillPrice: 'refill দাম',
  itemTotal: 'item মোট',
  saleSummary: 'sale সারসংক্ষেপ',
  paymentType: 'payment ধরন',
  paymentTypeRequired: 'payment ধরন is required',
  bankTransfer: 'Bank Transfer (বাংলা অনুবাদ প্রয়োজন)',
  mfs: 'Mfs (বাংলা অনুবাদ প্রয়োজন)',
  mobileFinancialService: 'mobile financial সেবা',
  credit: 'ক্রেডিট',
  cylinderCredit: 'cylinder crসম্পাদনা',
  cashDeposited: 'cash depoসাইটd',
  cylinderDeposits: 'সিলিন্ডার deposits',
  cylinderDepositsBySize: 'সিলিন্ডার deposits by size',
  cylindersDeposited: 'সিলিন্ডারs deposited',
  maxQuantity: 'max পরিমাণ',
  additionalNotes: 'যোগ করুনitional notes',
  additionalNotesPlaceholder: 'enter যোগ করুনitional notes...',
  totalQuantityLabel: 'total পরিমাণ label',
  totalValueLabel: 'মোট value label',
  totalDiscountLabel: 'মোট discount label',
  netValueLabel: 'net মান label',
  cashReceivableWarning: 'cash receivable সতর্কবাণী',
  customerNameRecommended: 'customer নাম recommended',
  cylinderReceivableWarning: 'সিলিন্ডার receivable warning',
  lowStockWarning: 'low স্টক warning',
  cylindersRemaining: 'সিলিন্ডারs remaining',
  lowStockAlert: 'low স্টক alert',
  loadingFormData: 'লোড হচ্ছে form data',
  driverRequired: 'চালক is required',
  productRequired: 'পণ্য is required',
  packageSaleCannotBeNegative: 'প্যাকেজ sale cannot be negative',
  refillSaleCannotBeNegative: 'রিফিল sale cannot be negative',
  packagePriceCannotBeNegative: 'package দাম cannot be negative',
  refillPriceCannotBeNegative: 'refill দাম cannot be negative',
  quantityAndPriceRequired: 'পরিমাণ and price is required',
  atLeastOneSaleItemRequired: 'at সবচেয়ে কম one sale item is required',
  discountCannotBeNegative: 'ছাড় cannot be negative',
  cashDepositedCannotBeNegative: 'cash deposited canনাt be negative',
  cylinderDepositsCannotBeNegative: 'সিলিন্ডার deposits cannot be negative',
  available: 'উপলব্ধ',
  for: 'For (বাংলা অনুবাদ প্রয়োজন)',
  readOnly: 'Read Only (বাংলা অনুবাদ প্রয়োজন)',
  areYouSure: 'are you নিশ্চিত',
  deleteConfirmation: 'মুছুন confirmation',
  salesEntries: 'বিক্রয় entries',
  cannotBeUndone: 'cannot be পূর্বাবস্থায় ফিরুনne',
  successfullyDeleted: 'successfully মুছুনd',
  on: 'system overদৃষ্টিভঙ্গি and metrics',
  thisWillDelete: 'this will মুছুন',
  failedToLoadDailySalesData: 'failed to load daily sales তথ্য',
  combinedSaleCreatedSuccessfully: 'combined sale তৈরি করুনdfully successful',
  failedToCreateSale: 'failed to তৈরি করুন sale',
  failedToLoadEntryDataForEditing: 'failed to load entry data for সম্পাদনাing',
  salesEntryUpdatedSuccessfully: 'sales entry আপডেটdfully successful',
  failedToUpdateSalesEntry: 'failed to আপডেট sales entry',
  failedToDeleteSales: 'failed to মুছুন sales',
  adminPanel: 'অ্যাডমিন panel',
  systemAdministration: 'সিস্টেম administration',
  viewDistributorDashboard: 'দৃষ্টিভঙ্গি distributor dashboard',
  signOut: 'চিহ্ন out',
  lightMode: 'Light Mode (বাংলা অনুবাদ প্রয়োজন)',
  darkMode: 'Dark Mode (বাংলা অনুবাদ প্রয়োজন)',
  systemTheme: 'সিস্টেম theme',
  shipmentsManagement: 'চালানs management',
  trackPurchaseOrdersAndShipments: 'track purchase আদেশs and shipments',
  newPurchase: 'new ক্রয়',
  emptyCylinderBuySell: 'empty সিলিন্ডার buy sell',
  allShipments: 'all চালানs',
  outstandingOrders: 'outstanding আদেশs',
  completedOrders: 'completed আদেশs',
  allCompanies: 'সব companies',
  allProducts: 'all পণ্যs',
  fromDate: 'from তারিখ',
  toDate: 'to তারিখ',
  clearFilters: 'clear ফিল্টারs',
  loadingShipments: 'লোড হচ্ছে shipments',
  noShipmentsFound: 'no চালানs found',
  invoice: 'চালান',
  gas: 'গ্যাস',
  unit: 'ইউনিট',
  unitCost: 'unit খরচ',
  gasCost: 'gas খরচ',
  cylinderCost: 'cylinder খরচ',
  vehicle: 'যানবাহন',
  markAsFulfilled: 'চিহ্ন as fulfilled',
  totalItems: 'মোট items',
  totalCost: 'total খরচ',
  editPurchaseOrder: 'সম্পাদনা purchase order',
  createNewPurchaseOrder: 'তৈরি করুন new purchase order',
  step: 'ধাপ',
  of: 'Of (বাংলা অনুবাদ প্রয়োজন)',
  orderInformation: 'আদেশ information',
  selectCompany: 'নির্বাচন করুন company',
  selectDriver: 'নির্বাচন করুন driver',
  shipmentDate: 'shipment তারিখ',
  expectedDeliveryDate: 'expected delivery তারিখ',
  invoiceNumber: 'চালান number',
  enterInvoiceNumber: 'প্রবেশ করান invoice number',
  paymentTerms: 'পেমেন্ট terms',
  cashOnDelivery: 'cash on ডেলিভারি',
  net30Days: 'net30 দিনs',
  net60Days: 'net60 দিনs',
  advancePayment: 'advance পেমেন্ট',
  priority: 'Priority (বাংলা অনুবাদ প্রয়োজন)',
  low: 'নিম্ন',
  normal: 'স্বাভাবিক',
  high: 'উচ্চ',
  vehicleNumber: 'যানবাহন number',
  enterVehicleNumber: 'প্রবেশ করান vehicle number',
  enterAdditionalNotes: 'enter যোগ করুনitional notes',
  addLineItem: 'যোগ করুন line item',
  selectProduct: 'নির্বাচন করুন product',
  selectCompanyFirst: 'নির্বাচন করুন company first',
  package: 'প্যাকেজ',
  refill: 'রিফিল',
  gasPrice: 'gas দাম',
  cylinderPrice: 'cylinder দাম',
  taxRate: 'কর rate',
  lineTotalPreview: 'line total preদৃষ্টিভঙ্গি',
  packageInfo: 'প্যাকেজ info',
  refillInfo: 'রিফিল info',
  addItem: 'যোগ করুন item',
  purchaseItems: 'ক্রয় items',
  qty: 'Qty (বাংলা অনুবাদ প্রয়োজন)',
  lineTotal: 'line মোট',
  action: 'কর্ম',
  editItem: 'সম্পাদনা item',
  removeItem: 'সরান item',
  remove: 'সরান',
  totalPurchaseValue: 'মোট purchase value',
  orderPreview: 'order preদৃষ্টিভঙ্গি',
  orderSummary: 'আদেশ summary',
  totalQuantity: 'total পরিমাণ',
  companyRequired: 'কোম্পানি is required',
  shipmentDateRequired: 'shipment তারিখ is required',
  atLeastOneLineItemRequired: 'at সবচেয়ে কম one line item is required',
  creating: 'Creating (বাংলা অনুবাদ প্রয়োজন)',
  updatePurchaseOrder: 'আপডেট purchase order',
  createPurchaseOrder: 'তৈরি করুন purchase order',
  transactionType: 'transaction ধরন',
  buyEmptyCylinders: 'buy empty সিলিন্ডারs',
  sellEmptyCylinders: 'sell empty সিলিন্ডারs',
  addEmptyCylindersToInventory: 'যোগ করুন empty cylinders to inventory',
  removeEmptyCylindersFromInventory: 'সরান empty cylinders from inventory',
  cylinderSize: 'সিলিন্ডার size',
  selectCylinderSize: 'নির্বাচন করুন cylinder size',
  emptyCylindersNote: 'empty সিলিন্ডারs note',
  transactionDate: 'transaction তারিখ',
  enterTransactionDetails: 'প্রবেশ করান transaction details',
  buy: 'Buy (বাংলা অনুবাদ প্রয়োজন)',
  sell: 'Sell (বাংলা অনুবাদ প্রয়োজন)',
  emptyCylinderTransaction: 'empty সিলিন্ডার transaction',
  directTransaction: 'direct transকর্ম',
  cylinderBuyTransaction: 'সিলিন্ডার buy transaction',
  cylinderSellTransaction: 'সিলিন্ডার sell transaction',
  comprehensiveProfitabilityAnalysis: 'comprehensive লাভability analysis',
  visualRepresentationProfitByProduct: 'visual representation profit by পণ্য',
  individualDriverPerformanceMetrics: 'individual চালক performance metrics',
  comparativeAnalysisRevenueByDriver: 'comparative analysis revenue by চালক',
  monthlyRevenue: 'monthly আয়',
  allExpenses: 'all খরচs',
  totalProfit: 'মোট profit',
  buyingPrice: 'buying দাম',
  commission: 'কমিশন',
  fixedCost: 'fixed খরচ',
  breakevenPrice: 'breakeven দাম',
  sellingPrice: 'selling দাম',
  costPerUnit: 'খরচ per unit',
  avgCostPerUnit: 'avg খরচ per unit',
  failedToLoadData: 'failed to load তথ্য',
  errorLoadingData: 'লোড হচ্ছে error data...',
  january: 'January (বাংলা অনুবাদ প্রয়োজন)',
  february: 'February (বাংলা অনুবাদ প্রয়োজন)',
  march: 'March (বাংলা অনুবাদ প্রয়োজন)',
  april: 'April (বাংলা অনুবাদ প্রয়োজন)',
  may: 'May (বাংলা অনুবাদ প্রয়োজন)',
  june: 'June (বাংলা অনুবাদ প্রয়োজন)',
  july: 'July (বাংলা অনুবাদ প্রয়োজন)',
  august: 'August (বাংলা অনুবাদ প্রয়োজন)',
  september: 'September (বাংলা অনুবাদ প্রয়োজন)',
  october: 'October (বাংলা অনুবাদ প্রয়োজন)',
  november: 'নাvember',
  december: 'December (বাংলা অনুবাদ প্রয়োজন)',
  july2025: 'July2025 (বাংলা অনুবাদ প্রয়োজন)',
  june2025: 'June2025 (বাংলা অনুবাদ প্রয়োজন)',
  may2025: 'May2025 (বাংলা অনুবাদ প্রয়োজন)',
  april2025: 'April2025 (বাংলা অনুবাদ প্রয়োজন)',
  march2025: 'March2025 (বাংলা অনুবাদ প্রয়োজন)',
  february2025: 'February2025 (বাংলা অনুবাদ প্রয়োজন)',
  january2025: 'January2025 (বাংলা অনুবাদ প্রয়োজন)',
  december2024: 'December2024 (বাংলা অনুবাদ প্রয়োজন)',
  november2024: 'নাvember2024',
  october2024: 'October2024 (বাংলা অনুবাদ প্রয়োজন)',
  selectTime: 'নির্বাচন করুন time',
  failedToLoadDashboardData: 'failed to load dashboard তথ্য',
  failedToLoadDashboardDataRefresh: 'failed to load dashboard data রিফ্রেশ',
  errorLoadingCombinedDashboardData: 'লোড হচ্ছে error combined dashboard data...',
  sessionExpiredRedirectingToLogin: 'session expired redirecting to লগইন',
  realTimeOverview: 'real time overদৃষ্টিভঙ্গি',
  orders: 'আদেশs',
  stockLevel: 'স্টক level',
  liveActivity: 'live কার্যকলাপ',
  last15Minutes: 'last15 মিনিটs',
  targetProgress: 'target পক্ষেgress',
  performanceIndicators: 'perফর্মance indicators',
  inventoryHealth: 'মজুদ health',
  attentionNeeded: 'attention প্রয়োজনed',
  good: 'ভাল',
  collectionRate: 'Collection Rate (বাংলা অনুবাদ প্রয়োজন)',
  profitMargin: 'লাভ margin',
  salesDetails: 'sales বিস্তারিত',
  viewDetailedSalesBreakdown: 'দৃষ্টিভঙ্গি detailed sales breakdown',
  salesBreakdown: 'বিক্রয় breakdown',
  detailedSalesAnalytics: 'detailed বিক্রয় analytics',
  averageOrderValue: 'average আদেশ value',
  driverPerformance: 'চালক performance',
  topPerformersAndRankings: 'শীর্ষ performers and rankings',
  driverRankings: 'চালক rankings',
  performanceLeaderboard: 'perফর্মance leaderboard',
  detailedViewAndTrends: 'detailed দৃষ্টিভঙ্গি and trends',
  vsYesterday: 'vs গতকাল',
  lpgDistributor: 'lpg পরিবেশক',
  welcomeBack: 'welcome পিছনে',
  role: 'Role (বাংলা অনুবাদ প্রয়োজন)',
  loadingDashboard: 'লোড হচ্ছে dashboard',
  fallbackDriverName1: 'fallপিছনে driver name1',
  fallbackDriverName2: 'fallপিছনে driver name2',
  fallbackDriverName3: 'fallপিছনে driver name3',
  fallbackDriverName4: 'fallপিছনে driver name4',
  salesCount: 'বিক্রয় count',
  revenueAmount: 'revenue পরিমাণ',
  performancePercentage: 'perফর্মance percentage',
  chartDataFallback: 'chart data fallপিছনে',
  weeklyPerformance: 'সপ্তাহly performance',
  dailyAverage: 'Daily Average (বাংলা অনুবাদ প্রয়োজন)',
  monthlyTarget: 'মাসly target',
  quarterlyGrowth: 'Quarterly Growth (বাংলা অনুবাদ প্রয়োজন)',
  unknownDriver: 'unknown চালক',
  unknownCompany: 'unknown কোম্পানি',
  completedSale: 'সম্পন্ন sale',
  driverCompletedSale: 'চালক completed sale',
  salesTrendUp: 'বিক্রয় trend up',
  salesTrendDown: 'বিক্রয় trend down',
  addressMustBeAtLeast10Characters: 'যোগ করুনress must be at least10 characters',
  addressTooLong: 'যোগ করুনress too long',
  areaMustBeAtLeast2Characters: 'এলাকা must be at least2 characters',
  areaTooLong: 'এলাকা too long',
  driverTypeIsRequired: 'driver ধরন is is required',
  emergencyContactMustBeAtLeast10Digits: 'emergency contact must be at সবচেয়ে কম10 digits',
  emergencyContactNameMustBeAtLeast2Characters: 'emergency contact নাম must be at least2 characters',
  emergencyContactTooLong: 'emergency বিপক্ষেtact too long',
  invalidEmailAddress: 'invalid email যোগ করুনress',
  licenseNumberMustBeAtLeast5Characters: 'license number must be at সবচেয়ে কম5 characters',
  licenseNumberTooLong: 'license সংখ্যা too long',
  nameMustBeAtLeast2Characters: 'নাম must be at least2 characters',
  nameTooLong: 'নাম too long',
  phoneNumberMustBeAtLeast10Digits: 'ফোন number must be at least10 digits',
  phoneNumberTooLong: 'ফোন number too long',
  statusIsRequired: 'অবস্থা is is required',
  all: 'সব',
  bn: 'Bn (বাংলা অনুবাদ প্রয়োজন)',
  en: 'En (বাংলা অনুবাদ প্রয়োজন)',
  locale: 'স্থানীয়e',
  key: 'Key (বাংলা অনুবাদ প্রয়োজন)',
  value: 'মান',
  allAlerts: 'সব alerts',
  critical: 'সমালোচনামূলক',
  criticalAlerts: 'সমালোচনামূলক alerts',
  infoAlerts: 'info সতর্কs',
  warningAlerts: 'warning সতর্কs',
  inventoryAlert: 'মজুদ alert',
  performanceAlert: 'perফর্মance alert',
  stockAlert: 'স্টক alert',
  systemNotification: 'system নাtification',
  completionPercentage: 'completion শতাংশ',
  dashboardDataUpdated: 'dashboard data আপডেটd',
  dataNotFound: 'তথ্য not found',
  isComplete: 'is সম্পূর্ণ',
  liveDataFeed: 'live তথ্য feed',
  metricsLastUpdated: 'metrics last আপডেটd',
  missingKeys: 'Missing Keys (বাংলা অনুবাদ প্রয়োজন)',
  newSalesActivity: 'new বিক্রয় activity',
  optional: 'ঐচ্ছিক',
  recentSaleActivity: 'সাম্প্রতিক sale activity',
  totalKeys: 'মোট keys',
  testCredentials: 'পরীক্ষা credentials',
  translatedKeys: 'Translated Keys (বাংলা অনুবাদ প্রয়োজন)',
  lowStock: 'low স্টক',
  outOfStock: 'out of স্টক',
  overduePayments: 'overdue পেমেন্টs',
  overstock: 'overস্টক',
  performanceTrendDown: 'performance trend নিচে',
  performanceTrendStable: 'performance trend sট্যাবle',
  performanceTrendUp: 'performance trend উপরে',
  salesTrendStable: 'বিক্রয় trend stable',
  targetAchieved: 'লক্ষ্য achieved',
  topPerformer: 'শীর্ষ performer',
  deleteDriver: 'মুছুন driver',
  failedToLoadAlerts: 'failed to load সতর্কs',
  failedToLoadInventoryAlerts: 'failed to load মজুদ alerts',
  movementAnomaly: 'movement aনাmaly',
  operationSuccessful: 'opeঅনুপাতnful successful',
  welcomeToOnboarding: 'স্বাগতম to onboarding',
  setupYourBusinessData: 'setup your ব্যবসায়িক data',
  companyNames: 'company নামs',
  productSetup: 'পণ্য setup',
  inventoryQuantities: 'মজুদ quantities',
  driversSetup: 'চালকs setup',
  receivablesSetup: 'receivables setউপরে',
  skipOnboarding: 'Skip Onboarding (বাংলা অনুবাদ প্রয়োজন)',
  completing: 'Completing (বাংলা অনুবাদ প্রয়োজন)',
  completeSetup: 'complete setউপরে',
  setupBusiness: 'setup ব্যবসায়িক',
  addCompanyNames: 'যোগ করুন company names',
  addCompaniesYouDistributeFor: 'যোগ করুন companies you distribute for',
  addNewCompany: 'যোগ করুন new company',
  enterCompanyNamesLikeAygaz: 'প্রবেশ করান company names like aygaz',
  companyName: 'company নাম',
  enterCompanyName: 'প্রবেশ করান company name',
  companyNameRequired: 'company নাম is required',
  companyAlreadyExists: 'কোম্পানি already exists',
  addedCompanies: 'যোগ করুনed companies',
  companiesYouDistributeFor: 'Companies You Distribute For (বাংলা অনুবাদ প্রয়োজন)',
  noCompaniesAdded: 'no companies যোগ করুনed',
  addAtLeastOneCompany: 'যোগ করুন at least one company',
  setupProductsAndSizes: 'setup পণ্যs and sizes',
  configureCylinderSizesAndProducts: 'configure cylinder sizes and পণ্যs',
  addCylinderSize: 'যোগ করুন cylinder size',
  addSizesLike12L20L: 'যোগ করুন sizes like12 l20 l',
  enterSizeLike12L: 'প্রবেশ করান size like12 l',
  addSize: 'যোগ করুন size',
  cylinderSizeRequired: 'সিলিন্ডার size is required',
  cylinderSizeAlreadyExists: 'সিলিন্ডার size already exists',
  enterDescription: 'প্রবেশ করান description',
  addProduct: 'যোগ করুন product',
  addNewProduct: 'যোগ করুন new product',
  addProductsForEachCompany: 'যোগ করুন products for each company',
  productName: 'product নাম',
  enterProductName: 'প্রবেশ করান product name',
  enterProductNameExample: 'প্রবেশ করান product name example',
  currentPrice: 'current দাম',
  enterPrice: 'প্রবেশ করান price',
  productNameRequired: 'product নাম is required',
  validPriceRequired: 'valid দাম is required',
  productAlreadyExists: 'পণ্য already exists',
  addedProducts: 'যোগ করুনed products',
  addCylinderSizesAndProducts: 'যোগ করুন cylinder sizes and products',
  bothRequiredToProceed: 'উভয় to proceed is required',
  setInitialInventory: 'set initial মজুদ',
  enterCurrentFullCylinderQuantities: 'প্রবেশ করান current full cylinder quantities',
  fullCylinderInventory: 'full cylinder মজুদ',
  enterQuantityForEachProduct: 'প্রবেশ করান quantity for each product',
  noProductsAvailable: 'no পণ্যs available',
  addProductsFirst: 'যোগ করুন products first',
  totalProducts: 'মোট products',
  totalFullCylinders: 'মোট full cylinders',
  setEmptyCylinderInventory: 'set empty cylinder মজুদ',
  enterCurrentEmptyCylinderQuantities: 'প্রবেশ করান current empty cylinder quantities',
  emptyCylinderInventory: 'empty cylinder মজুদ',
  enterQuantityForEachSize: 'প্রবেশ করান quantity for each size',
  noCylinderSizesAvailable: 'no সিলিন্ডার sizes available',
  addCylinderSizesFirst: 'যোগ করুন cylinder sizes first',
  totalSizes: 'মোট sizes',
  totalEmptyCylinders: 'মোট empty cylinders',
  emptyCylinderNote: 'empty সিলিন্ডার note',
  addYourDrivers: 'যোগ করুন your drivers',
  addDriversWhoWillSellProducts: 'যোগ করুন drivers who will sell products',
  enterDriverInformation: 'প্রবেশ করান driver information',
  enterDriverName: 'প্রবেশ করান driver name',
  shipmentDriver: 'shipment চালক',
  driverNameRequired: 'driver নাম is required',
  driverAlreadyExists: 'চালক already exists',
  addedDrivers: 'যোগ করুনed drivers',
  driversInYourTeam: 'চালকs in your team',
  noContactInfo: 'না contact info',
  noDriversAdded: 'no drivers যোগ করুনed',
  addAtLeastOneDriver: 'যোগ করুন at least one driver',
  setupReceivables: 'setউপরে receivables',
  enterCurrentReceivablesForEachDriver: 'প্রবেশ করান current receivables for each driver',
  driverReceivables: 'চালক receivables',
  enterCashAndCylinderReceivables: 'প্রবেশ করান cash and cylinder receivables',
  amountOwedByCustomers: 'পরিমাণ owed by customers',
  cylindersOwedByCustomers: 'cylinders owed by গ্রাহকs',
  cylindersOwedByCustomersBySize: 'cylinders owed by গ্রাহকs by size',
  noDriversAvailable: 'no চালকs available',
  addDriversFirst: 'যোগ করুন drivers first',
  noRetailDriversAvailable: 'no retail চালকs available',
  addRetailDriversFirst: 'যোগ করুন retail drivers first',
  receivablesSummary: 'receivables সারসংক্ষেপ',
  manualBusinessOnboarding: 'manual ব্যবসায়িক onboarding',
  businessInformation: 'ব্যবসায়িক information',
  businessName: 'business নাম',
  businessNamePlaceholder: 'প্রবেশ করান business name...',
  subdomain: 'Subdomain (বাংলা অনুবাদ প্রয়োজন)',
  subdomainPlaceholder: 'প্রবেশ করান subdomain...',
  plan: 'পরিকল্পনা',
  freemium: 'বিনামূল্যেmium',
  professional: 'পেশাদার',
  enterprise: 'প্রবেশ করানprise',
  adminUser: 'admin ব্যবহারকারী',
  adminName: 'admin নাম',
  adminNamePlaceholder: 'প্রবেশ করান admin name...',
  adminEmail: 'admin ইমেইল',
  adminEmailPlaceholder: 'প্রবেশ করান admin email...',
  adminPassword: 'admin পাসওয়ার্ড',
  strongPassword: 'strong পাসওয়ার্ড',
  creatingBusiness: 'creating ব্যবসায়িক',
  onboardBusiness: 'onboard ব্যবসায়িক',
  businessOnboardedSuccessfully: 'ব্যবসায়িক onboardedfully successful',
  businessCreatedWithAdmin: 'business তৈরি করুনd with admin',
  failedToOnboardBusiness: 'failed to onboard ব্যবসায়িক',
  networkErrorOccurred: 'ত্রুটি: network occurred',
  unauthorized: 'অননুমোদিত',
  userNotFound: 'ব্যবহারকারী not found',
  onboardingAlreadyCompleted: 'onboarding already সম্পন্ন',
  failedToCompleteOnboarding: 'failed to সম্পূর্ণ onboarding',
  failedToCheckOnboardingStatus: 'failed to check onboarding অবস্থা',
  searchCompanies: 'অনুসন্ধান companies',
  addCompany: 'যোগ করুন company',
  activeProducts: 'active পণ্যs',
  totalStock: 'মোট stock',
  companies: 'Companies (বাংলা অনুবাদ প্রয়োজন)',
  searchProducts: 'অনুসন্ধান products',
  created: 'তৈরি করুনd',
  cylinderSizeDeletedSuccessfully: 'cylinder size মুছুনdfully successful',
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
