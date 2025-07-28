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
  customerReceivableUpdatedSuccessfully: 'Customer receivable updated successfully',
  customerReceivableAddedSuccessfully: 'Customer receivable added successfully',
  failedToSaveCustomerReceivable: 'Failed to save customer receivable',
  customerReceivableDeletedSuccessfully: 'Customer receivable deleted successfully',
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
  customerReceivablesDontMatch: 'Customer receivables don\'t match',
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
  completeSystemAccessAndUserManagement: 'Complete System Access And User Management',
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
  sumCompletedShipmentsFromShipmentsPage: 'Sum Completed Shipments From Shipments Page',
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
  visualRepresentationProfitByProduct: 'Visual Representation Profit By Product',
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
  emergencyContactMustBeAtLeast10Digits: 'Emergency Contact Must Be At Least10 Digits',
  emergencyContactNameMustBeAtLeast2Characters: 'Emergency Contact Name Must Be At Least2 Characters',
  emergencyContactTooLong: 'Emergency Contact Too Long',
  invalidEmailAddress: 'Invalid Email Address',
  licenseNumberMustBeAtLeast5Characters: 'License Number Must Be At Least5 Characters',
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
  enterCurrentEmptyCylinderQuantities: 'Enter Current Empty Cylinder Quantities',
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
  enterCurrentReceivablesForEachDriver: 'Enter Current Receivables For Each Driver',
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
  customerReceivableUpdatedSuccessfully: 'গ্রাহকের প্রাপ্য সফলভাবে আপডেট হয়েছে',
  customerReceivableAddedSuccessfully: 'গ্রাহকের প্রাপ্য সফলভাবে যোগ হয়েছে',
  failedToSaveCustomerReceivable: 'গ্রাহকের প্রাপ্য সংরক্ষণ করতে ব্যর্থ',
  customerReceivableDeletedSuccessfully: 'গ্রাহকের প্রাপ্য সফলভাবে মুছে ফেলা হয়েছে',
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
  customerTotalsMustEqualDriverSales: 'গ্রাহকের মোট ড্রাইভার বিক্রয়ের সমান হতে হবে',
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
  quantity: 'quantity_bn', // TODO: Add Bengali translation
  unitPrice: 'unitPrice_bn', // TODO: Add Bengali translation
  discount: 'discount_bn', // TODO: Add Bengali translation
  totalValue: 'totalValue_bn', // TODO: Add Bengali translation
  packageSales: 'packageSales_bn', // TODO: Add Bengali translation
  refillSales: 'refillSales_bn', // TODO: Add Bengali translation
  cylinder: 'cylinder_bn', // TODO: Add Bengali translation
  cylinders: 'cylinders_bn', // TODO: Add Bengali translation
  products: 'products_bn', // TODO: Add Bengali translation
  cash: 'cash_bn', // TODO: Add Bengali translation
  cashDepositsByDriver: 'cashDepositsByDriver_bn', // TODO: Add Bengali translation
  includesReceivablePayments: 'includesReceivablePayments_bn', // TODO: Add Bengali translation
  driverExpense: 'driverExpense_bn', // TODO: Add Bengali translation
  loadingData: 'loadingData_bn', // TODO: Add Bengali translation
  noDataAvailable: 'noDataAvailable_bn', // TODO: Add Bengali translation
  tryAgain: 'tryAgain_bn', // TODO: Add Bengali translation
  performance: 'performance_bn', // TODO: Add Bengali translation
  month: 'month_bn', // TODO: Add Bengali translation
  year: 'year_bn', // TODO: Add Bengali translation
  allDrivers: 'allDrivers_bn', // TODO: Add Bengali translation
  totalRevenue: 'totalRevenue_bn', // TODO: Add Bengali translation
  revenue: 'revenue_bn', // TODO: Add Bengali translation
  comingSoon: 'comingSoon_bn', // TODO: Add Bengali translation
  exportReport: 'exportReport_bn', // TODO: Add Bengali translation
  exportReportFunctionality: 'exportReportFunctionality_bn', // TODO: Add Bengali translation
  customerRecords: 'customerRecords_bn', // TODO: Add Bengali translation
  statusBreakdown: 'statusBreakdown_bn', // TODO: Add Bengali translation
  noReceivablesFound: 'noReceivablesFound_bn', // TODO: Add Bengali translation
  noChangesRecorded: 'noChangesRecorded_bn', // TODO: Add Bengali translation
  receivablesChangesLog: 'receivablesChangesLog_bn', // TODO: Add Bengali translation
  amountPlaceholder: 'amountPlaceholder_bn', // TODO: Add Bengali translation
  enterExpenseDescription: 'enterExpenseDescription_bn', // TODO: Add Bengali translation
  selectParentCategory: 'selectParentCategory_bn', // TODO: Add Bengali translation
  selectCategory: 'selectCategory_bn', // TODO: Add Bengali translation
  expenseDate: 'expenseDate_bn', // TODO: Add Bengali translation
  receiptUrl: 'receiptUrl_bn', // TODO: Add Bengali translation
  receiptUrlPlaceholder: 'receiptUrlPlaceholder_bn', // TODO: Add Bengali translation
  submitting: 'submitting_bn', // TODO: Add Bengali translation
  activeDrivers: 'activeDrivers_bn', // TODO: Add Bengali translation
  activeUsers: 'activeUsers_bn', // TODO: Add Bengali translation
  addDriver: 'addDriver_bn', // TODO: Add Bengali translation
  addExpense: 'addExpense_bn', // TODO: Add Bengali translation
  additionalNotesComments: 'additionalNotesComments_bn', // TODO: Add Bengali translation
  addNewDriver: 'addNewDriver_bn', // TODO: Add Bengali translation
  addUser: 'addUser_bn', // TODO: Add Bengali translation
  administrator: 'administrator_bn', // TODO: Add Bengali translation
  administrators: 'administrators_bn', // TODO: Add Bengali translation
  ago: 'ago_bn', // TODO: Add Bengali translation
  alerts: 'alerts_bn', // TODO: Add Bengali translation
  allCalculationsUpdatedRealTime: 'allCalculationsUpdatedRealTime_bn', // TODO: Add Bengali translation
  allCategories: 'allCategories_bn', // TODO: Add Bengali translation
  allCylinders: 'allCylinders_bn', // TODO: Add Bengali translation
  allGood: 'allGood_bn', // TODO: Add Bengali translation
  allStatus: 'allStatus_bn', // TODO: Add Bengali translation
  approved: 'approved_bn', // TODO: Add Bengali translation
  approvedExpenses: 'approvedExpenses_bn', // TODO: Add Bengali translation
  approveExpense: 'approveExpense_bn', // TODO: Add Bengali translation
  area: 'area_bn', // TODO: Add Bengali translation
  areYouSureDeleteDriver: 'areYouSureDeleteDriver_bn', // TODO: Add Bengali translation
  assetsLiabilities: 'assetsLiabilities_bn', // TODO: Add Bengali translation
  assignedArea: 'assignedArea_bn', // TODO: Add Bengali translation
  balanceSheet: 'balanceSheet_bn', // TODO: Add Bengali translation
  businessFormulaImplementation: 'businessFormulaImplementation_bn', // TODO: Add Bengali translation
  cashReceivables: 'cashReceivables_bn', // TODO: Add Bengali translation
  changesLog: 'changesLog_bn', // TODO: Add Bengali translation
  checkStock: 'checkStock_bn', // TODO: Add Bengali translation
  clear: 'clear_bn', // TODO: Add Bengali translation
  company: 'company_bn', // TODO: Add Bengali translation
  completeSystemAccessAndUserManagement: 'completeSystemAccessAndUserManagement_bn', // TODO: Add Bengali translation
  confirmDeleteUser: 'confirmDeleteUser_bn', // TODO: Add Bengali translation
  contactName: 'contactName_bn', // TODO: Add Bengali translation
  contactNumber: 'contactNumber_bn', // TODO: Add Bengali translation
  create: 'create_bn', // TODO: Add Bengali translation
  criticalAlert: 'criticalAlert_bn', // TODO: Add Bengali translation
  currency: 'currency_bn', // TODO: Add Bengali translation
  currentFullCylinderInventory: 'currentFullCylinderInventory_bn', // TODO: Add Bengali translation
  currentStock: 'currentStock_bn', // TODO: Add Bengali translation
  currentStockHealth: 'currentStockHealth_bn', // TODO: Add Bengali translation
  customers: 'customers_bn', // TODO: Add Bengali translation
  cylinderReceivables: 'cylinderReceivables_bn', // TODO: Add Bengali translation
  cylindersReceived: 'cylindersReceived_bn', // TODO: Add Bengali translation
  cylindersSold: 'cylindersSold_bn', // TODO: Add Bengali translation
  cylindersSummaryApiError: 'cylindersSummaryApiError_bn', // TODO: Add Bengali translation
  cylindersSummaryDataReceived: 'cylindersSummaryDataReceived_bn', // TODO: Add Bengali translation
  cylindersSummaryResponseStatus: 'cylindersSummaryResponseStatus_bn', // TODO: Add Bengali translation
  dailyCalculations: 'dailyCalculations_bn', // TODO: Add Bengali translation
  dailyInventoryTracking: 'dailyInventoryTracking_bn', // TODO: Add Bengali translation
  dataSources: 'dataSources_bn', // TODO: Add Bengali translation
  day: 'day_bn', // TODO: Add Bengali translation
  days: 'days_bn', // TODO: Add Bengali translation
  deleteExpense: 'deleteExpense_bn', // TODO: Add Bengali translation
  deleteUser: 'deleteUser_bn', // TODO: Add Bengali translation
  deleting: 'deleting_bn', // TODO: Add Bengali translation
  details: 'details_bn', // TODO: Add Bengali translation
  driver: 'driver_bn', // TODO: Add Bengali translation
  driverAddedSuccessfully: 'driverAddedSuccessfully_bn', // TODO: Add Bengali translation
  driverDeletedSuccessfully: 'driverDeletedSuccessfully_bn', // TODO: Add Bengali translation
  driverDetails: 'driverDetails_bn', // TODO: Add Bengali translation
  driverManagement: 'driverManagement_bn', // TODO: Add Bengali translation
  driverName: 'driverName_bn', // TODO: Add Bengali translation
  driverType: 'driverType_bn', // TODO: Add Bengali translation
  driverUpdatedSuccessfully: 'driverUpdatedSuccessfully_bn', // TODO: Add Bengali translation
  editDriver: 'editDriver_bn', // TODO: Add Bengali translation
  editExpense: 'editExpense_bn', // TODO: Add Bengali translation
  editUser: 'editUser_bn', // TODO: Add Bengali translation
  emailAddress: 'emailAddress_bn', // TODO: Add Bengali translation
  emergencyContact: 'emergencyContact_bn', // TODO: Add Bengali translation
  emptyCylinderInventoryAvailability: 'emptyCylinderInventoryAvailability_bn', // TODO: Add Bengali translation
  emptyCylinders: 'emptyCylinders_bn', // TODO: Add Bengali translation
  emptyCylindersBuySell: 'emptyCylindersBuySell_bn', // TODO: Add Bengali translation
  emptyCylindersInHand: 'emptyCylindersInHand_bn', // TODO: Add Bengali translation
  emptyCylinderReceivables: 'emptyCylinderReceivables_bn', // TODO: Add Bengali translation
  emptyCylindersInStock: 'emptyCylindersInStock_bn', // TODO: Add Bengali translation
  outstandingShipments: 'outstandingShipments_bn', // TODO: Add Bengali translation
  noOutstandingOrders: 'noOutstandingOrders_bn', // TODO: Add Bengali translation
  enterAssignedAreaRoute: 'enterAssignedAreaRoute_bn', // TODO: Add Bengali translation
  enterEmailAddress: 'enterEmailAddress_bn', // TODO: Add Bengali translation
  enterEmergencyContactName: 'enterEmergencyContactName_bn', // TODO: Add Bengali translation
  enterEmergencyContactNumber: 'enterEmergencyContactNumber_bn', // TODO: Add Bengali translation
  enterFullAddress: 'enterFullAddress_bn', // TODO: Add Bengali translation
  enterFullName: 'enterFullName_bn', // TODO: Add Bengali translation
  enterLicenseNumber: 'enterLicenseNumber_bn', // TODO: Add Bengali translation
  enterPhoneNumber: 'enterPhoneNumber_bn', // TODO: Add Bengali translation
  error: 'error_bn', // TODO: Add Bengali translation
  errorFetchingCylindersSummaryData: 'errorFetchingCylindersSummaryData_bn', // TODO: Add Bengali translation
  errorFetchingDailyInventoryData: 'errorFetchingDailyInventoryData_bn', // TODO: Add Bengali translation
  errorFetchingInventoryData: 'errorFetchingInventoryData_bn', // TODO: Add Bengali translation
  expense: 'expense_bn', // TODO: Add Bengali translation
  expenseManagement: 'expenseManagement_bn', // TODO: Add Bengali translation
  exportFunctionalityComingSoon: 'exportFunctionalityComingSoon_bn', // TODO: Add Bengali translation
  failedToCreateUser: 'failedToCreateUser_bn', // TODO: Add Bengali translation
  failedToDeleteDriver: 'failedToDeleteDriver_bn', // TODO: Add Bengali translation
  failedToDeleteUser: 'failedToDeleteUser_bn', // TODO: Add Bengali translation
  failedToFetchUsers: 'failedToFetchUsers_bn', // TODO: Add Bengali translation
  failedToLoadInventoryData: 'failedToLoadInventoryData_bn', // TODO: Add Bengali translation
  failedToUpdateDriver: 'failedToUpdateDriver_bn', // TODO: Add Bengali translation
  failedToUpdateUser: 'failedToUpdateUser_bn', // TODO: Add Bengali translation
  fetchingCylindersSummaryData: 'fetchingCylindersSummaryData_bn', // TODO: Add Bengali translation
  filterByDriverType: 'filterByDriverType_bn', // TODO: Add Bengali translation
  fri: 'fri_bn', // TODO: Add Bengali translation
  from: 'from_bn', // TODO: Add Bengali translation
  fullAccess: 'fullAccess_bn', // TODO: Add Bengali translation
  fullCylinders: 'fullCylinders_bn', // TODO: Add Bengali translation
  fullName: 'fullName_bn', // TODO: Add Bengali translation
  generalSettings: 'generalSettings_bn', // TODO: Add Bengali translation
  getStartedByAddingFirstExpense: 'getStartedByAddingFirstExpense_bn', // TODO: Add Bengali translation
  hour: 'hour_bn', // TODO: Add Bengali translation
  hours: 'hours_bn', // TODO: Add Bengali translation
  individualDailySalesData: 'individualDailySalesData_bn', // TODO: Add Bengali translation
  info: 'info_bn', // TODO: Add Bengali translation
  inventoryManagement: 'inventoryManagement_bn', // TODO: Add Bengali translation
  joiningDate: 'joiningDate_bn', // TODO: Add Bengali translation
  justNow: 'justNow_bn', // TODO: Add Bengali translation
  kPending: 'kPending_bn', // TODO: Add Bengali translation
  language: 'language_bn', // TODO: Add Bengali translation
  last7Days: 'last7Days_bn', // TODO: Add Bengali translation
  lastMonth: 'lastMonth_bn', // TODO: Add Bengali translation
  lastLogin: 'lastLogin_bn', // TODO: Add Bengali translation
  lastUpdated: 'lastUpdated_bn', // TODO: Add Bengali translation
  latest: 'latest_bn', // TODO: Add Bengali translation
  licenseNumber: 'licenseNumber_bn', // TODO: Add Bengali translation
  loadingDailySalesData: 'loadingDailySalesData_bn', // TODO: Add Bengali translation
  loadingDriverPerformance: 'loadingDriverPerformance_bn', // TODO: Add Bengali translation
  loadingInventoryData: 'loadingInventoryData_bn', // TODO: Add Bengali translation
  loadingText: 'loadingText_bn', // TODO: Add Bengali translation
  locationInformation: 'locationInformation_bn', // TODO: Add Bengali translation
  login: 'login_bn', // TODO: Add Bengali translation
  lpgDistributorManagementSystem: 'lpgDistributorManagementSystem_bn', // TODO: Add Bengali translation
  manageBudgets: 'manageBudgets_bn', // TODO: Add Bengali translation
  manageCategories: 'manageCategories_bn', // TODO: Add Bengali translation
  manageCompanyAssets: 'manageCompanyAssets_bn', // TODO: Add Bengali translation
  manageDriversAndAssignments: 'manageDriversAndAssignments_bn', // TODO: Add Bengali translation
  manageLiabilities: 'manageLiabilities_bn', // TODO: Add Bengali translation
  manager: 'manager_bn', // TODO: Add Bengali translation
  managers: 'managers_bn', // TODO: Add Bengali translation
  manageSystemRoles: 'manageSystemRoles_bn', // TODO: Add Bengali translation
  manageSystemUsers: 'manageSystemUsers_bn', // TODO: Add Bengali translation
  manageTeam: 'manageTeam_bn', // TODO: Add Bengali translation
  mon: 'mon_bn', // TODO: Add Bengali translation
  monitorCylinderStock: 'monitorCylinderStock_bn', // TODO: Add Bengali translation
  needAdminPrivileges: 'needAdminPrivileges_bn', // TODO: Add Bengali translation
  never: 'never_bn', // TODO: Add Bengali translation
  newSale: 'newSale_bn', // TODO: Add Bengali translation
  noActiveDriversFoundForThisPeriod: 'noActiveDriversFoundForThisPeriod_bn', // TODO: Add Bengali translation
  noDailyInventoryDataAvailable: 'noDailyInventoryDataAvailable_bn', // TODO: Add Bengali translation
  noDailySalesDataFound: 'noDailySalesDataFound_bn', // TODO: Add Bengali translation
  noDataFound: 'noDataFound_bn', // TODO: Add Bengali translation
  noEmptyCylindersInInventory: 'noEmptyCylindersInInventory_bn', // TODO: Add Bengali translation
  noFullCylindersInInventory: 'noFullCylindersInInventory_bn', // TODO: Add Bengali translation
  notApplicable: 'notApplicable_bn', // TODO: Add Bengali translation
  note: 'note_bn', // TODO: Add Bengali translation
  noUsersFound: 'noUsersFound_bn', // TODO: Add Bengali translation
  operationFailed: 'operationFailed_bn', // TODO: Add Bengali translation
  operations: 'operations_bn', // TODO: Add Bengali translation
  outstanding: 'outstanding_bn', // TODO: Add Bengali translation
  packagePurchase: 'packagePurchase_bn', // TODO: Add Bengali translation
  packageRefillPurchase: 'packageRefillPurchase_bn', // TODO: Add Bengali translation
  packageRefillSales: 'packageRefillSales_bn', // TODO: Add Bengali translation
  packageSale: 'packageSale_bn', // TODO: Add Bengali translation
  packageSalesQty: 'packageSalesQty_bn', // TODO: Add Bengali translation
  parentCategory: 'parentCategory_bn', // TODO: Add Bengali translation
  pay: 'pay_bn', // TODO: Add Bengali translation
  paymentReceived: 'paymentReceived_bn', // TODO: Add Bengali translation
  pending: 'pending_bn', // TODO: Add Bengali translation
  pendingApproval: 'pendingApproval_bn', // TODO: Add Bengali translation
  performanceStatistics: 'performanceStatistics_bn', // TODO: Add Bengali translation
  permissions: 'permissions_bn', // TODO: Add Bengali translation
  personalInformation: 'personalInformation_bn', // TODO: Add Bengali translation
  phoneNumber: 'phoneNumber_bn', // TODO: Add Bengali translation
  pleaseLogInToAccessUserManagement: 'pleaseLogInToAccessUserManagement_bn', // TODO: Add Bengali translation
  producentsWithLowStockWarning: 'producentsWithLowStockWarning_bn', // TODO: Add Bengali translation
  productsBelowMinimumThreshold: 'productsBelowMinimumThreshold_bn', // TODO: Add Bengali translation
  productsInCriticalStock: 'productsInCriticalStock_bn', // TODO: Add Bengali translation
  productsInGoodStock: 'productsInGoodStock_bn', // TODO: Add Bengali translation
  productsOutOfStock: 'productsOutOfStock_bn', // TODO: Add Bengali translation
  purchase: 'purchase_bn', // TODO: Add Bengali translation
  rahmanSoldCylinders: 'rahmanSoldCylinders_bn', // TODO: Add Bengali translation
  realTimeInventoryTracking: 'realTimeInventoryTracking_bn', // TODO: Add Bengali translation
  receivableManagement: 'receivableManagement_bn', // TODO: Add Bengali translation
  receivableRecords: 'receivableRecords_bn', // TODO: Add Bengali translation
  recentActivity: 'recentActivity_bn', // TODO: Add Bengali translation
  recordDailySales: 'recordDailySales_bn', // TODO: Add Bengali translation
  refillPurchase: 'refillPurchase_bn', // TODO: Add Bengali translation
  refillSale: 'refillSale_bn', // TODO: Add Bengali translation
  refillSalesQty: 'refillSalesQty_bn', // TODO: Add Bengali translation
  refreshData: 'refreshData_bn', // TODO: Add Bengali translation
  rejectExpense: 'rejectExpense_bn', // TODO: Add Bengali translation
  reportsAnalytics: 'reportsAnalytics_bn', // TODO: Add Bengali translation
  retail: 'retail_bn', // TODO: Add Bengali translation
  retailDriver: 'retailDriver_bn', // TODO: Add Bengali translation
  sale: 'sale_bn', // TODO: Add Bengali translation
  retailDriverDescription: 'retailDriverDescription_bn', // TODO: Add Bengali translation
  retailDrivers: 'retailDrivers_bn', // TODO: Add Bengali translation
  retry: 'retry_bn', // TODO: Add Bengali translation
  return: 'return_bn', // TODO: Add Bengali translation
  rolePermissions: 'rolePermissions_bn', // TODO: Add Bengali translation
  routeArea: 'routeArea_bn', // TODO: Add Bengali translation
  salesInventoryAndDriverManagement: 'salesInventoryAndDriverManagement_bn', // TODO: Add Bengali translation
  salesTrend: 'salesTrend_bn', // TODO: Add Bengali translation
  salesValue: 'salesValue_bn', // TODO: Add Bengali translation
  sat: 'sat_bn', // TODO: Add Bengali translation
  saveError: 'saveError_bn', // TODO: Add Bengali translation
  saveSuccess: 'saveSuccess_bn', // TODO: Add Bengali translation
  searchExpenses: 'searchExpenses_bn', // TODO: Add Bengali translation
  selectDriverType: 'selectDriverType_bn', // TODO: Add Bengali translation
  selectStatus: 'selectStatus_bn', // TODO: Add Bengali translation
  shipment: 'shipment_bn', // TODO: Add Bengali translation
  shipmentDriverDescription: 'shipmentDriverDescription_bn', // TODO: Add Bengali translation
  shipmentDrivers: 'shipmentDrivers_bn', // TODO: Add Bengali translation
  size: 'size_bn', // TODO: Add Bengali translation
  statusAndNotes: 'statusAndNotes_bn', // TODO: Add Bengali translation
  stock: 'stock_bn', // TODO: Add Bengali translation
  stockReplenished: 'stockReplenished_bn', // TODO: Add Bengali translation
  submittedBy: 'submittedBy_bn', // TODO: Add Bengali translation
  success: 'success_bn', // TODO: Add Bengali translation
  sumAllDriversSalesForDate: 'sumAllDriversSalesForDate_bn', // TODO: Add Bengali translation
  sumCompletedEmptyCylinderShipments: 'sumCompletedEmptyCylinderShipments_bn', // TODO: Add Bengali translation
  sumCompletedShipmentsFromShipmentsPage: 'sumCompletedShipmentsFromShipmentsPage_bn', // TODO: Add Bengali translation
  sun: 'sun_bn', // TODO: Add Bengali translation
  systemUsers: 'systemUsers_bn', // TODO: Add Bengali translation
  tasks: 'tasks_bn', // TODO: Add Bengali translation
  teamAccess: 'teamAccess_bn', // TODO: Add Bengali translation
  thisActionCannotBeUndone: 'thisActionCannotBeUndone_bn', // TODO: Add Bengali translation
  thisMonth: 'thisMonth_bn', // TODO: Add Bengali translation
  thu: 'thu_bn', // TODO: Add Bengali translation
  timezone: 'timezone_bn', // TODO: Add Bengali translation
  to: 'to_bn', // TODO: Add Bengali translation
  today: 'today_bn', // TODO: Add Bengali translation
  todaysEmptyCylinders: 'todaysEmptyCylinders_bn', // TODO: Add Bengali translation
  todaysFullCylinders: 'todaysFullCylinders_bn', // TODO: Add Bengali translation
  todaysPurchases: 'todaysPurchases_bn', // TODO: Add Bengali translation
  todaysSales: 'todaysSales_bn', // TODO: Add Bengali translation
  topDriverPerformance: 'topDriverPerformance_bn', // TODO: Add Bengali translation
  totalCylinderReceivables: 'totalCylinderReceivables_bn', // TODO: Add Bengali translation
  totalCylinders: 'totalCylinders_bn', // TODO: Add Bengali translation
  totalCylindersReceivables: 'totalCylindersReceivables_bn', // TODO: Add Bengali translation
  totalReceivables: 'totalReceivables_bn', // TODO: Add Bengali translation
  totalSales: 'totalSales_bn', // TODO: Add Bengali translation
  totalSalesQty: 'totalSalesQty_bn', // TODO: Add Bengali translation
  totalSalesThisMonth: 'totalSalesThisMonth_bn', // TODO: Add Bengali translation
  totalUsers: 'totalUsers_bn', // TODO: Add Bengali translation
  trackCustomerCredits: 'trackCustomerCredits_bn', // TODO: Add Bengali translation
  trackCustomerPayments: 'trackCustomerPayments_bn', // TODO: Add Bengali translation
  trackExpenses: 'trackExpenses_bn', // TODO: Add Bengali translation
  trackExpensesAndManageBudgets: 'trackExpensesAndManageBudgets_bn', // TODO: Add Bengali translation
  trackPerformance: 'trackPerformance_bn', // TODO: Add Bengali translation
  tue: 'tue_bn', // TODO: Add Bengali translation
  unknown: 'unknown_bn', // TODO: Add Bengali translation
  updateDriver: 'updateDriver_bn', // TODO: Add Bengali translation
  updateExpense: 'updateExpense_bn', // TODO: Add Bengali translation
  updatePayment: 'updatePayment_bn', // TODO: Add Bengali translation
  updateUser: 'updateUser_bn', // TODO: Add Bengali translation
  updating: 'updating_bn', // TODO: Add Bengali translation
  urgent: 'urgent_bn', // TODO: Add Bengali translation
  user: 'user_bn', // TODO: Add Bengali translation
  userDetails: 'userDetails_bn', // TODO: Add Bengali translation
  userManagement: 'userManagement_bn', // TODO: Add Bengali translation
  viewDetails: 'viewDetails_bn', // TODO: Add Bengali translation
  viewingExpensesFor: 'viewingExpensesFor_bn', // TODO: Add Bengali translation
  viewReceipt: 'viewReceipt_bn', // TODO: Add Bengali translation
  viewReports: 'viewReports_bn', // TODO: Add Bengali translation
  warning: 'warning_bn', // TODO: Add Bengali translation
  wed: 'wed_bn', // TODO: Add Bengali translation
  week: 'week_bn', // TODO: Add Bengali translation
  yesterday: 'yesterday_bn', // TODO: Add Bengali translation
  yesterdaysEmpty: 'yesterdaysEmpty_bn', // TODO: Add Bengali translation
  yesterdaysFull: 'yesterdaysFull_bn', // TODO: Add Bengali translation
  fuelExpense: 'fuelExpense_bn', // TODO: Add Bengali translation
  maintenanceExpense: 'maintenanceExpense_bn', // TODO: Add Bengali translation
  officeExpense: 'officeExpense_bn', // TODO: Add Bengali translation
  transportExpense: 'transportExpense_bn', // TODO: Add Bengali translation
  miscellaneousExpense: 'miscellaneousExpense_bn', // TODO: Add Bengali translation
  generalExpense: 'generalExpense_bn', // TODO: Add Bengali translation
  failedToLoadDailySalesReport: 'failedToLoadDailySalesReport_bn', // TODO: Add Bengali translation
  loadingDailySalesReport: 'loadingDailySalesReport_bn', // TODO: Add Bengali translation
  noReportDataAvailable: 'noReportDataAvailable_bn', // TODO: Add Bengali translation
  tryAgainOrSelectDate: 'tryAgainOrSelectDate_bn', // TODO: Add Bengali translation
  comprehensiveDailySalesReport: 'comprehensiveDailySalesReport_bn', // TODO: Add Bengali translation
  totalSalesValue: 'totalSalesValue_bn', // TODO: Add Bengali translation
  totalDeposited: 'totalDeposited_bn', // TODO: Add Bengali translation
  totalExpenses: 'totalExpenses_bn', // TODO: Add Bengali translation
  availableCash: 'availableCash_bn', // TODO: Add Bengali translation
  totalCashReceivables: 'totalCashReceivables_bn', // TODO: Add Bengali translation
  changeInReceivablesCashCylinders: 'changeInReceivablesCashCylinders_bn', // TODO: Add Bengali translation
  dailyDepositsExpenses: 'dailyDepositsExpenses_bn', // TODO: Add Bengali translation
  detailedBreakdownDepositsExpenses: 'detailedBreakdownDepositsExpenses_bn', // TODO: Add Bengali translation
  deposits: 'deposits_bn', // TODO: Add Bengali translation
  particulars: 'particulars_bn', // TODO: Add Bengali translation
  noDepositsFound: 'noDepositsFound_bn', // TODO: Add Bengali translation
  totalDepositsCalculated: 'totalDepositsCalculated_bn', // TODO: Add Bengali translation
  noExpensesFound: 'noExpensesFound_bn', // TODO: Add Bengali translation
  totalExpensesCalculated: 'totalExpensesCalculated_bn', // TODO: Add Bengali translation
  totalAvailableCash: 'totalAvailableCash_bn', // TODO: Add Bengali translation
  totalDepositsIncludingSales: 'totalDepositsIncludingSales_bn', // TODO: Add Bengali translation
  customerName: 'customerName_bn', // TODO: Add Bengali translation
  selectADriver: 'selectADriver_bn', // TODO: Add Bengali translation
  enterCustomerName: 'enterCustomerName_bn', // TODO: Add Bengali translation
  customerNamePlaceholder: 'customerNamePlaceholder_bn', // TODO: Add Bengali translation
  saleItems: 'saleItems_bn', // TODO: Add Bengali translation
  itemNumber: 'itemNumber_bn', // TODO: Add Bengali translation
  selectAProduct: 'selectAProduct_bn', // TODO: Add Bengali translation
  packagePrice: 'packagePrice_bn', // TODO: Add Bengali translation
  refillPrice: 'refillPrice_bn', // TODO: Add Bengali translation
  itemTotal: 'itemTotal_bn', // TODO: Add Bengali translation
  saleSummary: 'saleSummary_bn', // TODO: Add Bengali translation
  paymentType: 'paymentType_bn', // TODO: Add Bengali translation
  paymentTypeRequired: 'paymentTypeRequired_bn', // TODO: Add Bengali translation
  bankTransfer: 'bankTransfer_bn', // TODO: Add Bengali translation
  mfs: 'mfs_bn', // TODO: Add Bengali translation
  mobileFinancialService: 'mobileFinancialService_bn', // TODO: Add Bengali translation
  credit: 'credit_bn', // TODO: Add Bengali translation
  cylinderCredit: 'cylinderCredit_bn', // TODO: Add Bengali translation
  cashDeposited: 'cashDeposited_bn', // TODO: Add Bengali translation
  cylinderDeposits: 'cylinderDeposits_bn', // TODO: Add Bengali translation
  cylinderDepositsBySize: 'cylinderDepositsBySize_bn', // TODO: Add Bengali translation
  cylindersDeposited: 'cylindersDeposited_bn', // TODO: Add Bengali translation
  maxQuantity: 'maxQuantity_bn', // TODO: Add Bengali translation
  additionalNotes: 'additionalNotes_bn', // TODO: Add Bengali translation
  additionalNotesPlaceholder: 'additionalNotesPlaceholder_bn', // TODO: Add Bengali translation
  totalQuantityLabel: 'totalQuantityLabel_bn', // TODO: Add Bengali translation
  totalValueLabel: 'totalValueLabel_bn', // TODO: Add Bengali translation
  totalDiscountLabel: 'totalDiscountLabel_bn', // TODO: Add Bengali translation
  netValueLabel: 'netValueLabel_bn', // TODO: Add Bengali translation
  cashReceivableWarning: 'cashReceivableWarning_bn', // TODO: Add Bengali translation
  customerNameRecommended: 'customerNameRecommended_bn', // TODO: Add Bengali translation
  cylinderReceivableWarning: 'cylinderReceivableWarning_bn', // TODO: Add Bengali translation
  lowStockWarning: 'lowStockWarning_bn', // TODO: Add Bengali translation
  cylindersRemaining: 'cylindersRemaining_bn', // TODO: Add Bengali translation
  lowStockAlert: 'lowStockAlert_bn', // TODO: Add Bengali translation
  loadingFormData: 'loadingFormData_bn', // TODO: Add Bengali translation
  driverRequired: 'driverRequired_bn', // TODO: Add Bengali translation
  productRequired: 'productRequired_bn', // TODO: Add Bengali translation
  packageSaleCannotBeNegative: 'packageSaleCannotBeNegative_bn', // TODO: Add Bengali translation
  refillSaleCannotBeNegative: 'refillSaleCannotBeNegative_bn', // TODO: Add Bengali translation
  packagePriceCannotBeNegative: 'packagePriceCannotBeNegative_bn', // TODO: Add Bengali translation
  refillPriceCannotBeNegative: 'refillPriceCannotBeNegative_bn', // TODO: Add Bengali translation
  quantityAndPriceRequired: 'quantityAndPriceRequired_bn', // TODO: Add Bengali translation
  atLeastOneSaleItemRequired: 'atLeastOneSaleItemRequired_bn', // TODO: Add Bengali translation
  discountCannotBeNegative: 'discountCannotBeNegative_bn', // TODO: Add Bengali translation
  cashDepositedCannotBeNegative: 'cashDepositedCannotBeNegative_bn', // TODO: Add Bengali translation
  cylinderDepositsCannotBeNegative: 'cylinderDepositsCannotBeNegative_bn', // TODO: Add Bengali translation
  available: 'available_bn', // TODO: Add Bengali translation
  for: 'for_bn', // TODO: Add Bengali translation
  readOnly: 'readOnly_bn', // TODO: Add Bengali translation
  areYouSure: 'areYouSure_bn', // TODO: Add Bengali translation
  deleteConfirmation: 'deleteConfirmation_bn', // TODO: Add Bengali translation
  salesEntries: 'salesEntries_bn', // TODO: Add Bengali translation
  cannotBeUndone: 'cannotBeUndone_bn', // TODO: Add Bengali translation
  successfullyDeleted: 'successfullyDeleted_bn', // TODO: Add Bengali translation
  on: 'on_bn', // TODO: Add Bengali translation
  thisWillDelete: 'thisWillDelete_bn', // TODO: Add Bengali translation
  failedToLoadDailySalesData: 'failedToLoadDailySalesData_bn', // TODO: Add Bengali translation
  combinedSaleCreatedSuccessfully: 'combinedSaleCreatedSuccessfully_bn', // TODO: Add Bengali translation
  failedToCreateSale: 'failedToCreateSale_bn', // TODO: Add Bengali translation
  failedToLoadEntryDataForEditing: 'failedToLoadEntryDataForEditing_bn', // TODO: Add Bengali translation
  salesEntryUpdatedSuccessfully: 'salesEntryUpdatedSuccessfully_bn', // TODO: Add Bengali translation
  failedToUpdateSalesEntry: 'failedToUpdateSalesEntry_bn', // TODO: Add Bengali translation
  failedToDeleteSales: 'failedToDeleteSales_bn', // TODO: Add Bengali translation
  adminPanel: 'adminPanel_bn', // TODO: Add Bengali translation
  systemAdministration: 'systemAdministration_bn', // TODO: Add Bengali translation
  viewDistributorDashboard: 'viewDistributorDashboard_bn', // TODO: Add Bengali translation
  signOut: 'signOut_bn', // TODO: Add Bengali translation
  lightMode: 'lightMode_bn', // TODO: Add Bengali translation
  darkMode: 'darkMode_bn', // TODO: Add Bengali translation
  systemTheme: 'systemTheme_bn', // TODO: Add Bengali translation
  shipmentsManagement: 'shipmentsManagement_bn', // TODO: Add Bengali translation
  trackPurchaseOrdersAndShipments: 'trackPurchaseOrdersAndShipments_bn', // TODO: Add Bengali translation
  newPurchase: 'newPurchase_bn', // TODO: Add Bengali translation
  emptyCylinderBuySell: 'emptyCylinderBuySell_bn', // TODO: Add Bengali translation
  allShipments: 'allShipments_bn', // TODO: Add Bengali translation
  outstandingOrders: 'outstandingOrders_bn', // TODO: Add Bengali translation
  completedOrders: 'completedOrders_bn', // TODO: Add Bengali translation
  allCompanies: 'allCompanies_bn', // TODO: Add Bengali translation
  allProducts: 'allProducts_bn', // TODO: Add Bengali translation
  fromDate: 'fromDate_bn', // TODO: Add Bengali translation
  toDate: 'toDate_bn', // TODO: Add Bengali translation
  clearFilters: 'clearFilters_bn', // TODO: Add Bengali translation
  loadingShipments: 'loadingShipments_bn', // TODO: Add Bengali translation
  noShipmentsFound: 'noShipmentsFound_bn', // TODO: Add Bengali translation
  invoice: 'invoice_bn', // TODO: Add Bengali translation
  gas: 'gas_bn', // TODO: Add Bengali translation
  unit: 'unit_bn', // TODO: Add Bengali translation
  unitCost: 'unitCost_bn', // TODO: Add Bengali translation
  gasCost: 'gasCost_bn', // TODO: Add Bengali translation
  cylinderCost: 'cylinderCost_bn', // TODO: Add Bengali translation
  vehicle: 'vehicle_bn', // TODO: Add Bengali translation
  markAsFulfilled: 'markAsFulfilled_bn', // TODO: Add Bengali translation
  totalItems: 'totalItems_bn', // TODO: Add Bengali translation
  totalCost: 'totalCost_bn', // TODO: Add Bengali translation
  editPurchaseOrder: 'editPurchaseOrder_bn', // TODO: Add Bengali translation
  createNewPurchaseOrder: 'createNewPurchaseOrder_bn', // TODO: Add Bengali translation
  step: 'step_bn', // TODO: Add Bengali translation
  of: 'of_bn', // TODO: Add Bengali translation
  orderInformation: 'orderInformation_bn', // TODO: Add Bengali translation
  selectCompany: 'selectCompany_bn', // TODO: Add Bengali translation
  selectDriver: 'selectDriver_bn', // TODO: Add Bengali translation
  shipmentDate: 'shipmentDate_bn', // TODO: Add Bengali translation
  expectedDeliveryDate: 'expectedDeliveryDate_bn', // TODO: Add Bengali translation
  invoiceNumber: 'invoiceNumber_bn', // TODO: Add Bengali translation
  enterInvoiceNumber: 'enterInvoiceNumber_bn', // TODO: Add Bengali translation
  paymentTerms: 'paymentTerms_bn', // TODO: Add Bengali translation
  cashOnDelivery: 'cashOnDelivery_bn', // TODO: Add Bengali translation
  net30Days: 'net30Days_bn', // TODO: Add Bengali translation
  net60Days: 'net60Days_bn', // TODO: Add Bengali translation
  advancePayment: 'advancePayment_bn', // TODO: Add Bengali translation
  priority: 'priority_bn', // TODO: Add Bengali translation
  low: 'low_bn', // TODO: Add Bengali translation
  normal: 'normal_bn', // TODO: Add Bengali translation
  high: 'high_bn', // TODO: Add Bengali translation
  vehicleNumber: 'vehicleNumber_bn', // TODO: Add Bengali translation
  enterVehicleNumber: 'enterVehicleNumber_bn', // TODO: Add Bengali translation
  enterAdditionalNotes: 'enterAdditionalNotes_bn', // TODO: Add Bengali translation
  addLineItem: 'addLineItem_bn', // TODO: Add Bengali translation
  selectProduct: 'selectProduct_bn', // TODO: Add Bengali translation
  selectCompanyFirst: 'selectCompanyFirst_bn', // TODO: Add Bengali translation
  package: 'package_bn', // TODO: Add Bengali translation
  refill: 'refill_bn', // TODO: Add Bengali translation
  gasPrice: 'gasPrice_bn', // TODO: Add Bengali translation
  cylinderPrice: 'cylinderPrice_bn', // TODO: Add Bengali translation
  taxRate: 'taxRate_bn', // TODO: Add Bengali translation
  lineTotalPreview: 'lineTotalPreview_bn', // TODO: Add Bengali translation
  packageInfo: 'packageInfo_bn', // TODO: Add Bengali translation
  refillInfo: 'refillInfo_bn', // TODO: Add Bengali translation
  addItem: 'addItem_bn', // TODO: Add Bengali translation
  purchaseItems: 'purchaseItems_bn', // TODO: Add Bengali translation
  qty: 'qty_bn', // TODO: Add Bengali translation
  lineTotal: 'lineTotal_bn', // TODO: Add Bengali translation
  action: 'action_bn', // TODO: Add Bengali translation
  editItem: 'editItem_bn', // TODO: Add Bengali translation
  removeItem: 'removeItem_bn', // TODO: Add Bengali translation
  remove: 'remove_bn', // TODO: Add Bengali translation
  totalPurchaseValue: 'totalPurchaseValue_bn', // TODO: Add Bengali translation
  orderPreview: 'orderPreview_bn', // TODO: Add Bengali translation
  orderSummary: 'orderSummary_bn', // TODO: Add Bengali translation
  totalQuantity: 'totalQuantity_bn', // TODO: Add Bengali translation
  companyRequired: 'companyRequired_bn', // TODO: Add Bengali translation
  shipmentDateRequired: 'shipmentDateRequired_bn', // TODO: Add Bengali translation
  atLeastOneLineItemRequired: 'atLeastOneLineItemRequired_bn', // TODO: Add Bengali translation
  creating: 'creating_bn', // TODO: Add Bengali translation
  updatePurchaseOrder: 'updatePurchaseOrder_bn', // TODO: Add Bengali translation
  createPurchaseOrder: 'createPurchaseOrder_bn', // TODO: Add Bengali translation
  transactionType: 'transactionType_bn', // TODO: Add Bengali translation
  buyEmptyCylinders: 'buyEmptyCylinders_bn', // TODO: Add Bengali translation
  sellEmptyCylinders: 'sellEmptyCylinders_bn', // TODO: Add Bengali translation
  addEmptyCylindersToInventory: 'addEmptyCylindersToInventory_bn', // TODO: Add Bengali translation
  removeEmptyCylindersFromInventory: 'removeEmptyCylindersFromInventory_bn', // TODO: Add Bengali translation
  cylinderSize: 'cylinderSize_bn', // TODO: Add Bengali translation
  selectCylinderSize: 'selectCylinderSize_bn', // TODO: Add Bengali translation
  emptyCylindersNote: 'emptyCylindersNote_bn', // TODO: Add Bengali translation
  transactionDate: 'transactionDate_bn', // TODO: Add Bengali translation
  enterTransactionDetails: 'enterTransactionDetails_bn', // TODO: Add Bengali translation
  buy: 'buy_bn', // TODO: Add Bengali translation
  sell: 'sell_bn', // TODO: Add Bengali translation
  emptyCylinderTransaction: 'emptyCylinderTransaction_bn', // TODO: Add Bengali translation
  directTransaction: 'directTransaction_bn', // TODO: Add Bengali translation
  cylinderBuyTransaction: 'cylinderBuyTransaction_bn', // TODO: Add Bengali translation
  cylinderSellTransaction: 'cylinderSellTransaction_bn', // TODO: Add Bengali translation
  comprehensiveProfitabilityAnalysis: 'comprehensiveProfitabilityAnalysis_bn', // TODO: Add Bengali translation
  visualRepresentationProfitByProduct: 'visualRepresentationProfitByProduct_bn', // TODO: Add Bengali translation
  individualDriverPerformanceMetrics: 'individualDriverPerformanceMetrics_bn', // TODO: Add Bengali translation
  comparativeAnalysisRevenueByDriver: 'comparativeAnalysisRevenueByDriver_bn', // TODO: Add Bengali translation
  monthlyRevenue: 'monthlyRevenue_bn', // TODO: Add Bengali translation
  allExpenses: 'allExpenses_bn', // TODO: Add Bengali translation
  totalProfit: 'totalProfit_bn', // TODO: Add Bengali translation
  buyingPrice: 'buyingPrice_bn', // TODO: Add Bengali translation
  commission: 'commission_bn', // TODO: Add Bengali translation
  fixedCost: 'fixedCost_bn', // TODO: Add Bengali translation
  breakevenPrice: 'breakevenPrice_bn', // TODO: Add Bengali translation
  sellingPrice: 'sellingPrice_bn', // TODO: Add Bengali translation
  costPerUnit: 'costPerUnit_bn', // TODO: Add Bengali translation
  avgCostPerUnit: 'avgCostPerUnit_bn', // TODO: Add Bengali translation
  failedToLoadData: 'failedToLoadData_bn', // TODO: Add Bengali translation
  errorLoadingData: 'errorLoadingData_bn', // TODO: Add Bengali translation
  january: 'january_bn', // TODO: Add Bengali translation
  february: 'february_bn', // TODO: Add Bengali translation
  march: 'march_bn', // TODO: Add Bengali translation
  april: 'april_bn', // TODO: Add Bengali translation
  may: 'may_bn', // TODO: Add Bengali translation
  june: 'june_bn', // TODO: Add Bengali translation
  july: 'july_bn', // TODO: Add Bengali translation
  august: 'august_bn', // TODO: Add Bengali translation
  september: 'september_bn', // TODO: Add Bengali translation
  october: 'october_bn', // TODO: Add Bengali translation
  november: 'november_bn', // TODO: Add Bengali translation
  december: 'december_bn', // TODO: Add Bengali translation
  july2025: 'july2025_bn', // TODO: Add Bengali translation
  june2025: 'june2025_bn', // TODO: Add Bengali translation
  may2025: 'may2025_bn', // TODO: Add Bengali translation
  april2025: 'april2025_bn', // TODO: Add Bengali translation
  march2025: 'march2025_bn', // TODO: Add Bengali translation
  february2025: 'february2025_bn', // TODO: Add Bengali translation
  january2025: 'january2025_bn', // TODO: Add Bengali translation
  december2024: 'december2024_bn', // TODO: Add Bengali translation
  november2024: 'november2024_bn', // TODO: Add Bengali translation
  october2024: 'october2024_bn', // TODO: Add Bengali translation
  selectTime: 'selectTime_bn', // TODO: Add Bengali translation
  failedToLoadDashboardData: 'failedToLoadDashboardData_bn', // TODO: Add Bengali translation
  failedToLoadDashboardDataRefresh: 'failedToLoadDashboardDataRefresh_bn', // TODO: Add Bengali translation
  errorLoadingCombinedDashboardData: 'errorLoadingCombinedDashboardData_bn', // TODO: Add Bengali translation
  sessionExpiredRedirectingToLogin: 'sessionExpiredRedirectingToLogin_bn', // TODO: Add Bengali translation
  realTimeOverview: 'realTimeOverview_bn', // TODO: Add Bengali translation
  orders: 'orders_bn', // TODO: Add Bengali translation
  stockLevel: 'stockLevel_bn', // TODO: Add Bengali translation
  liveActivity: 'liveActivity_bn', // TODO: Add Bengali translation
  last15Minutes: 'last15Minutes_bn', // TODO: Add Bengali translation
  targetProgress: 'targetProgress_bn', // TODO: Add Bengali translation
  performanceIndicators: 'performanceIndicators_bn', // TODO: Add Bengali translation
  inventoryHealth: 'inventoryHealth_bn', // TODO: Add Bengali translation
  attentionNeeded: 'attentionNeeded_bn', // TODO: Add Bengali translation
  good: 'good_bn', // TODO: Add Bengali translation
  collectionRate: 'collectionRate_bn', // TODO: Add Bengali translation
  profitMargin: 'profitMargin_bn', // TODO: Add Bengali translation
  salesDetails: 'salesDetails_bn', // TODO: Add Bengali translation
  viewDetailedSalesBreakdown: 'viewDetailedSalesBreakdown_bn', // TODO: Add Bengali translation
  salesBreakdown: 'salesBreakdown_bn', // TODO: Add Bengali translation
  detailedSalesAnalytics: 'detailedSalesAnalytics_bn', // TODO: Add Bengali translation
  averageOrderValue: 'averageOrderValue_bn', // TODO: Add Bengali translation
  driverPerformance: 'driverPerformance_bn', // TODO: Add Bengali translation
  topPerformersAndRankings: 'topPerformersAndRankings_bn', // TODO: Add Bengali translation
  driverRankings: 'driverRankings_bn', // TODO: Add Bengali translation
  performanceLeaderboard: 'performanceLeaderboard_bn', // TODO: Add Bengali translation
  detailedViewAndTrends: 'detailedViewAndTrends_bn', // TODO: Add Bengali translation
  vsYesterday: 'vsYesterday_bn', // TODO: Add Bengali translation
  lpgDistributor: 'lpgDistributor_bn', // TODO: Add Bengali translation
  welcomeBack: 'welcomeBack_bn', // TODO: Add Bengali translation
  role: 'role_bn', // TODO: Add Bengali translation
  loadingDashboard: 'loadingDashboard_bn', // TODO: Add Bengali translation
  fallbackDriverName1: 'fallbackDriverName1_bn', // TODO: Add Bengali translation
  fallbackDriverName2: 'fallbackDriverName2_bn', // TODO: Add Bengali translation
  fallbackDriverName3: 'fallbackDriverName3_bn', // TODO: Add Bengali translation
  fallbackDriverName4: 'fallbackDriverName4_bn', // TODO: Add Bengali translation
  salesCount: 'salesCount_bn', // TODO: Add Bengali translation
  revenueAmount: 'revenueAmount_bn', // TODO: Add Bengali translation
  performancePercentage: 'performancePercentage_bn', // TODO: Add Bengali translation
  chartDataFallback: 'chartDataFallback_bn', // TODO: Add Bengali translation
  weeklyPerformance: 'weeklyPerformance_bn', // TODO: Add Bengali translation
  dailyAverage: 'dailyAverage_bn', // TODO: Add Bengali translation
  monthlyTarget: 'monthlyTarget_bn', // TODO: Add Bengali translation
  quarterlyGrowth: 'quarterlyGrowth_bn', // TODO: Add Bengali translation
  unknownDriver: 'unknownDriver_bn', // TODO: Add Bengali translation
  unknownCompany: 'unknownCompany_bn', // TODO: Add Bengali translation
  completedSale: 'completedSale_bn', // TODO: Add Bengali translation
  driverCompletedSale: 'driverCompletedSale_bn', // TODO: Add Bengali translation
  salesTrendUp: 'salesTrendUp_bn', // TODO: Add Bengali translation
  salesTrendDown: 'salesTrendDown_bn', // TODO: Add Bengali translation
  addressMustBeAtLeast10Characters: 'addressMustBeAtLeast10Characters_bn', // TODO: Add Bengali translation
  addressTooLong: 'addressTooLong_bn', // TODO: Add Bengali translation
  areaMustBeAtLeast2Characters: 'areaMustBeAtLeast2Characters_bn', // TODO: Add Bengali translation
  areaTooLong: 'areaTooLong_bn', // TODO: Add Bengali translation
  driverTypeIsRequired: 'driverTypeIsRequired_bn', // TODO: Add Bengali translation
  emergencyContactMustBeAtLeast10Digits: 'emergencyContactMustBeAtLeast10Digits_bn', // TODO: Add Bengali translation
  emergencyContactNameMustBeAtLeast2Characters: 'emergencyContactNameMustBeAtLeast2Characters_bn', // TODO: Add Bengali translation
  emergencyContactTooLong: 'emergencyContactTooLong_bn', // TODO: Add Bengali translation
  invalidEmailAddress: 'invalidEmailAddress_bn', // TODO: Add Bengali translation
  licenseNumberMustBeAtLeast5Characters: 'licenseNumberMustBeAtLeast5Characters_bn', // TODO: Add Bengali translation
  licenseNumberTooLong: 'licenseNumberTooLong_bn', // TODO: Add Bengali translation
  nameMustBeAtLeast2Characters: 'nameMustBeAtLeast2Characters_bn', // TODO: Add Bengali translation
  nameTooLong: 'nameTooLong_bn', // TODO: Add Bengali translation
  phoneNumberMustBeAtLeast10Digits: 'phoneNumberMustBeAtLeast10Digits_bn', // TODO: Add Bengali translation
  phoneNumberTooLong: 'phoneNumberTooLong_bn', // TODO: Add Bengali translation
  statusIsRequired: 'statusIsRequired_bn', // TODO: Add Bengali translation
  all: 'all_bn', // TODO: Add Bengali translation
  bn: 'bn_bn', // TODO: Add Bengali translation
  en: 'en_bn', // TODO: Add Bengali translation
  locale: 'locale_bn', // TODO: Add Bengali translation
  key: 'key_bn', // TODO: Add Bengali translation
  value: 'value_bn', // TODO: Add Bengali translation
  allAlerts: 'allAlerts_bn', // TODO: Add Bengali translation
  critical: 'critical_bn', // TODO: Add Bengali translation
  criticalAlerts: 'criticalAlerts_bn', // TODO: Add Bengali translation
  infoAlerts: 'infoAlerts_bn', // TODO: Add Bengali translation
  warningAlerts: 'warningAlerts_bn', // TODO: Add Bengali translation
  inventoryAlert: 'inventoryAlert_bn', // TODO: Add Bengali translation
  performanceAlert: 'performanceAlert_bn', // TODO: Add Bengali translation
  stockAlert: 'stockAlert_bn', // TODO: Add Bengali translation
  systemNotification: 'systemNotification_bn', // TODO: Add Bengali translation
  completionPercentage: 'completionPercentage_bn', // TODO: Add Bengali translation
  dashboardDataUpdated: 'dashboardDataUpdated_bn', // TODO: Add Bengali translation
  dataNotFound: 'dataNotFound_bn', // TODO: Add Bengali translation
  isComplete: 'isComplete_bn', // TODO: Add Bengali translation
  liveDataFeed: 'liveDataFeed_bn', // TODO: Add Bengali translation
  metricsLastUpdated: 'metricsLastUpdated_bn', // TODO: Add Bengali translation
  missingKeys: 'missingKeys_bn', // TODO: Add Bengali translation
  newSalesActivity: 'newSalesActivity_bn', // TODO: Add Bengali translation
  optional: 'optional_bn', // TODO: Add Bengali translation
  recentSaleActivity: 'recentSaleActivity_bn', // TODO: Add Bengali translation
  totalKeys: 'totalKeys_bn', // TODO: Add Bengali translation
  testCredentials: 'testCredentials_bn', // TODO: Add Bengali translation
  translatedKeys: 'translatedKeys_bn', // TODO: Add Bengali translation
  lowStock: 'lowStock_bn', // TODO: Add Bengali translation
  outOfStock: 'outOfStock_bn', // TODO: Add Bengali translation
  overduePayments: 'overduePayments_bn', // TODO: Add Bengali translation
  overstock: 'overstock_bn', // TODO: Add Bengali translation
  performanceTrendDown: 'performanceTrendDown_bn', // TODO: Add Bengali translation
  performanceTrendStable: 'performanceTrendStable_bn', // TODO: Add Bengali translation
  performanceTrendUp: 'performanceTrendUp_bn', // TODO: Add Bengali translation
  salesTrendStable: 'salesTrendStable_bn', // TODO: Add Bengali translation
  targetAchieved: 'targetAchieved_bn', // TODO: Add Bengali translation
  topPerformer: 'topPerformer_bn', // TODO: Add Bengali translation
  deleteDriver: 'deleteDriver_bn', // TODO: Add Bengali translation
  failedToLoadAlerts: 'failedToLoadAlerts_bn', // TODO: Add Bengali translation
  failedToLoadInventoryAlerts: 'failedToLoadInventoryAlerts_bn', // TODO: Add Bengali translation
  movementAnomaly: 'movementAnomaly_bn', // TODO: Add Bengali translation
  operationSuccessful: 'operationSuccessful_bn', // TODO: Add Bengali translation
  welcomeToOnboarding: 'welcomeToOnboarding_bn', // TODO: Add Bengali translation
  setupYourBusinessData: 'setupYourBusinessData_bn', // TODO: Add Bengali translation
  companyNames: 'companyNames_bn', // TODO: Add Bengali translation
  productSetup: 'productSetup_bn', // TODO: Add Bengali translation
  inventoryQuantities: 'inventoryQuantities_bn', // TODO: Add Bengali translation
  driversSetup: 'driversSetup_bn', // TODO: Add Bengali translation
  receivablesSetup: 'receivablesSetup_bn', // TODO: Add Bengali translation
  skipOnboarding: 'skipOnboarding_bn', // TODO: Add Bengali translation
  completing: 'completing_bn', // TODO: Add Bengali translation
  completeSetup: 'completeSetup_bn', // TODO: Add Bengali translation
  setupBusiness: 'setupBusiness_bn', // TODO: Add Bengali translation
  addCompanyNames: 'addCompanyNames_bn', // TODO: Add Bengali translation
  addCompaniesYouDistributeFor: 'addCompaniesYouDistributeFor_bn', // TODO: Add Bengali translation
  addNewCompany: 'addNewCompany_bn', // TODO: Add Bengali translation
  enterCompanyNamesLikeAygaz: 'enterCompanyNamesLikeAygaz_bn', // TODO: Add Bengali translation
  companyName: 'companyName_bn', // TODO: Add Bengali translation
  enterCompanyName: 'enterCompanyName_bn', // TODO: Add Bengali translation
  companyNameRequired: 'companyNameRequired_bn', // TODO: Add Bengali translation
  companyAlreadyExists: 'companyAlreadyExists_bn', // TODO: Add Bengali translation
  addedCompanies: 'addedCompanies_bn', // TODO: Add Bengali translation
  companiesYouDistributeFor: 'companiesYouDistributeFor_bn', // TODO: Add Bengali translation
  noCompaniesAdded: 'noCompaniesAdded_bn', // TODO: Add Bengali translation
  addAtLeastOneCompany: 'addAtLeastOneCompany_bn', // TODO: Add Bengali translation
  setupProductsAndSizes: 'setupProductsAndSizes_bn', // TODO: Add Bengali translation
  configureCylinderSizesAndProducts: 'configureCylinderSizesAndProducts_bn', // TODO: Add Bengali translation
  addCylinderSize: 'addCylinderSize_bn', // TODO: Add Bengali translation
  addSizesLike12L20L: 'addSizesLike12L20L_bn', // TODO: Add Bengali translation
  enterSizeLike12L: 'enterSizeLike12L_bn', // TODO: Add Bengali translation
  addSize: 'addSize_bn', // TODO: Add Bengali translation
  cylinderSizeRequired: 'cylinderSizeRequired_bn', // TODO: Add Bengali translation
  cylinderSizeAlreadyExists: 'cylinderSizeAlreadyExists_bn', // TODO: Add Bengali translation
  enterDescription: 'enterDescription_bn', // TODO: Add Bengali translation
  addProduct: 'addProduct_bn', // TODO: Add Bengali translation
  addNewProduct: 'addNewProduct_bn', // TODO: Add Bengali translation
  addProductsForEachCompany: 'addProductsForEachCompany_bn', // TODO: Add Bengali translation
  productName: 'productName_bn', // TODO: Add Bengali translation
  enterProductName: 'enterProductName_bn', // TODO: Add Bengali translation
  enterProductNameExample: 'enterProductNameExample_bn', // TODO: Add Bengali translation
  currentPrice: 'currentPrice_bn', // TODO: Add Bengali translation
  enterPrice: 'enterPrice_bn', // TODO: Add Bengali translation
  productNameRequired: 'productNameRequired_bn', // TODO: Add Bengali translation
  validPriceRequired: 'validPriceRequired_bn', // TODO: Add Bengali translation
  productAlreadyExists: 'productAlreadyExists_bn', // TODO: Add Bengali translation
  addedProducts: 'addedProducts_bn', // TODO: Add Bengali translation
  addCylinderSizesAndProducts: 'addCylinderSizesAndProducts_bn', // TODO: Add Bengali translation
  bothRequiredToProceed: 'bothRequiredToProceed_bn', // TODO: Add Bengali translation
  setInitialInventory: 'setInitialInventory_bn', // TODO: Add Bengali translation
  enterCurrentFullCylinderQuantities: 'enterCurrentFullCylinderQuantities_bn', // TODO: Add Bengali translation
  fullCylinderInventory: 'fullCylinderInventory_bn', // TODO: Add Bengali translation
  enterQuantityForEachProduct: 'enterQuantityForEachProduct_bn', // TODO: Add Bengali translation
  noProductsAvailable: 'noProductsAvailable_bn', // TODO: Add Bengali translation
  addProductsFirst: 'addProductsFirst_bn', // TODO: Add Bengali translation
  totalProducts: 'totalProducts_bn', // TODO: Add Bengali translation
  totalFullCylinders: 'totalFullCylinders_bn', // TODO: Add Bengali translation
  setEmptyCylinderInventory: 'setEmptyCylinderInventory_bn', // TODO: Add Bengali translation
  enterCurrentEmptyCylinderQuantities: 'enterCurrentEmptyCylinderQuantities_bn', // TODO: Add Bengali translation
  emptyCylinderInventory: 'emptyCylinderInventory_bn', // TODO: Add Bengali translation
  enterQuantityForEachSize: 'enterQuantityForEachSize_bn', // TODO: Add Bengali translation
  noCylinderSizesAvailable: 'noCylinderSizesAvailable_bn', // TODO: Add Bengali translation
  addCylinderSizesFirst: 'addCylinderSizesFirst_bn', // TODO: Add Bengali translation
  totalSizes: 'totalSizes_bn', // TODO: Add Bengali translation
  totalEmptyCylinders: 'totalEmptyCylinders_bn', // TODO: Add Bengali translation
  emptyCylinderNote: 'emptyCylinderNote_bn', // TODO: Add Bengali translation
  addYourDrivers: 'addYourDrivers_bn', // TODO: Add Bengali translation
  addDriversWhoWillSellProducts: 'addDriversWhoWillSellProducts_bn', // TODO: Add Bengali translation
  enterDriverInformation: 'enterDriverInformation_bn', // TODO: Add Bengali translation
  enterDriverName: 'enterDriverName_bn', // TODO: Add Bengali translation
  shipmentDriver: 'shipmentDriver_bn', // TODO: Add Bengali translation
  driverNameRequired: 'driverNameRequired_bn', // TODO: Add Bengali translation
  driverAlreadyExists: 'driverAlreadyExists_bn', // TODO: Add Bengali translation
  addedDrivers: 'addedDrivers_bn', // TODO: Add Bengali translation
  driversInYourTeam: 'driversInYourTeam_bn', // TODO: Add Bengali translation
  noContactInfo: 'noContactInfo_bn', // TODO: Add Bengali translation
  noDriversAdded: 'noDriversAdded_bn', // TODO: Add Bengali translation
  addAtLeastOneDriver: 'addAtLeastOneDriver_bn', // TODO: Add Bengali translation
  setupReceivables: 'setupReceivables_bn', // TODO: Add Bengali translation
  enterCurrentReceivablesForEachDriver: 'enterCurrentReceivablesForEachDriver_bn', // TODO: Add Bengali translation
  driverReceivables: 'driverReceivables_bn', // TODO: Add Bengali translation
  enterCashAndCylinderReceivables: 'enterCashAndCylinderReceivables_bn', // TODO: Add Bengali translation
  amountOwedByCustomers: 'amountOwedByCustomers_bn', // TODO: Add Bengali translation
  cylindersOwedByCustomers: 'cylindersOwedByCustomers_bn', // TODO: Add Bengali translation
  cylindersOwedByCustomersBySize: 'cylindersOwedByCustomersBySize_bn', // TODO: Add Bengali translation
  noDriversAvailable: 'noDriversAvailable_bn', // TODO: Add Bengali translation
  addDriversFirst: 'addDriversFirst_bn', // TODO: Add Bengali translation
  noRetailDriversAvailable: 'noRetailDriversAvailable_bn', // TODO: Add Bengali translation
  addRetailDriversFirst: 'addRetailDriversFirst_bn', // TODO: Add Bengali translation
  receivablesSummary: 'receivablesSummary_bn', // TODO: Add Bengali translation
  manualBusinessOnboarding: 'manualBusinessOnboarding_bn', // TODO: Add Bengali translation
  businessInformation: 'businessInformation_bn', // TODO: Add Bengali translation
  businessName: 'businessName_bn', // TODO: Add Bengali translation
  businessNamePlaceholder: 'businessNamePlaceholder_bn', // TODO: Add Bengali translation
  subdomain: 'subdomain_bn', // TODO: Add Bengali translation
  subdomainPlaceholder: 'subdomainPlaceholder_bn', // TODO: Add Bengali translation
  plan: 'plan_bn', // TODO: Add Bengali translation
  freemium: 'freemium_bn', // TODO: Add Bengali translation
  professional: 'professional_bn', // TODO: Add Bengali translation
  enterprise: 'enterprise_bn', // TODO: Add Bengali translation
  adminUser: 'adminUser_bn', // TODO: Add Bengali translation
  adminName: 'adminName_bn', // TODO: Add Bengali translation
  adminNamePlaceholder: 'adminNamePlaceholder_bn', // TODO: Add Bengali translation
  adminEmail: 'adminEmail_bn', // TODO: Add Bengali translation
  adminEmailPlaceholder: 'adminEmailPlaceholder_bn', // TODO: Add Bengali translation
  adminPassword: 'adminPassword_bn', // TODO: Add Bengali translation
  strongPassword: 'strongPassword_bn', // TODO: Add Bengali translation
  creatingBusiness: 'creatingBusiness_bn', // TODO: Add Bengali translation
  onboardBusiness: 'onboardBusiness_bn', // TODO: Add Bengali translation
  businessOnboardedSuccessfully: 'businessOnboardedSuccessfully_bn', // TODO: Add Bengali translation
  businessCreatedWithAdmin: 'businessCreatedWithAdmin_bn', // TODO: Add Bengali translation
  failedToOnboardBusiness: 'failedToOnboardBusiness_bn', // TODO: Add Bengali translation
  networkErrorOccurred: 'networkErrorOccurred_bn', // TODO: Add Bengali translation
  unauthorized: 'unauthorized_bn', // TODO: Add Bengali translation
  userNotFound: 'userNotFound_bn', // TODO: Add Bengali translation
  onboardingAlreadyCompleted: 'onboardingAlreadyCompleted_bn', // TODO: Add Bengali translation
  failedToCompleteOnboarding: 'failedToCompleteOnboarding_bn', // TODO: Add Bengali translation
  failedToCheckOnboardingStatus: 'failedToCheckOnboardingStatus_bn', // TODO: Add Bengali translation
  searchCompanies: 'searchCompanies_bn', // TODO: Add Bengali translation
  addCompany: 'addCompany_bn', // TODO: Add Bengali translation
  activeProducts: 'activeProducts_bn', // TODO: Add Bengali translation
  totalStock: 'totalStock_bn', // TODO: Add Bengali translation
  companies: 'companies_bn', // TODO: Add Bengali translation
  searchProducts: 'searchProducts_bn', // TODO: Add Bengali translation
  created: 'created_bn', // TODO: Add Bengali translation
  cylinderSizeDeletedSuccessfully: 'cylinderSizeDeletedSuccessfully_bn', // TODO: Add Bengali translation

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
