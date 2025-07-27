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
  current: string;
  dueSoon: string;
  overdue: string;
  paid: string;
  noDate: string;
  invalidDate: string;
  noTimestamp: string;
  invalidTimestamp: string;
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
  editCustomerReceivable: string;
  addCustomerReceivable: string;
  cashReceivable: string;
  cylinderReceivable: string;
  enterNumberOfCylinders: string;
  recordPayment: string;
  recordCylinderReturn: string;
  paymentAmount: string;
  enterPaymentAmount: string;
  paymentMethod: string;
  cylindersReturned: string;
  recordReturn: string;
  validationError: string;
  customerReceivablesDontMatch: string;
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
  addProductsForEachCompany: string;
  productName: string;
  enterProductName: string;
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
  loading: 'Loading',
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

  // Forms
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
  active: 'Active',
  inactive: 'Inactive',

  // Sales & Inventory
  quantity: 'Quantity',
  unitPrice: 'Unit Price',
  discount: 'Discount',
  totalValue: 'Total Value',
  packageSales: 'Package Sales',
  refillSales: 'Refill Sales',
  cylinder: 'Cylinder',
  cylinders: 'Cylinders',
  product: 'Product',
  products: 'Products',
  fullCylinders: 'Full Cylinders',
  emptyCylinders: 'Empty Cylinders',
  stock: 'Stock',
  purchase: 'Purchase',
  sale: 'Sale',
  retailDriver: 'Retail Driver',
  shipmentDrivers: 'Shipment Drivers',
  retailDrivers: 'Retail Drivers',

  // Financial
  cash: 'Cash',
  totalSales: 'Total Sales',
  totalRevenue: 'Total Revenue',
  revenue: 'Revenue',

  // Receivables page specific
  comingSoon: 'Coming Soon',
  exportReport: 'Export Report',
  exportReportFunctionality: 'Export Report functionality is under development',
  current: 'Current',
  dueSoon: 'Due Soon',
  overdue: 'Overdue',
  paid: 'Paid',
  noDate: 'No date',
  invalidDate: 'Invalid date',
  noTimestamp: 'No timestamp',
  invalidTimestamp: 'Invalid timestamp',
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
  editCustomerReceivable: 'Edit Customer Receivable',
  addCustomerReceivable: 'Add Customer Receivable',
  cashReceivable: 'Cash Receivable',
  cylinderReceivable: 'Cylinder Receivable',
  enterNumberOfCylinders: 'Enter number of cylinders',
  recordPayment: 'Record Payment',
  recordCylinderReturn: 'Record Cylinder Return',
  paymentAmount: 'Payment Amount',
  enterPaymentAmount: 'Enter payment amount',
  paymentMethod: 'Payment Method',
  cylindersReturned: 'Cylinders Returned',
  recordReturn: 'Record Return',
  validationError: 'Validation Error',
  customerReceivablesDontMatch: "Customer receivables don't match",
  driverTotalReceivablesFromSales:
    'Driver total receivables come from sales data and cannot be edited',
  customerReceivableTotalsMustEqual:
    'Customer receivable totals must equal the sales totals for each driver',
  cashMismatch: 'Cash Mismatch',
  customerTotal: 'Customer Total',
  salesTotal: 'Sales Total',
  difference: 'Difference',
  cylinderMismatch: 'Cylinder Mismatch',
  customersWithOverduePayments: 'customer(s) with overdue payments',
  requireImmediate: 'require immediate',
  receivablesManagementSystemRules: 'Receivables Management System Rules',
  driverTotalReceivables: 'Driver Total Receivables',
  automaticallyCalculatedFromSales:
    'Automatically calculated from sales data (non-editable)',
  customerReceivablesManuallyManaged:
    'Manually managed by administrators under each driver',
  validation: 'Validation',
  customerTotalsMustEqualDriverSales:
    'Customer totals must equal driver sales totals',
  payments: 'Payments',
  paymentsAutomaticallyAdded:
    'Automatically added to daily deposits when recorded',
  changesLogAllReceivableActions:
    'All receivable actions are tracked in the Changes tab',
  managerAccess: 'Manager Access',
  youCanRecordPayments: 'You can record payments and',
  salesCashReceivables: 'Sales Cash Receivables',
  fromSalesData: 'From Sales Data',
  salesCylinderReceivables: 'Sales Cylinder Receivables',
  noReceivablesFound: 'No receivables found',
  noChangesRecorded: 'No changes recorded',
  receivablesChangesLog: 'Receivables Changes Log',

  // Expense form specific
  amountPlaceholder: '0.00',
  enterExpenseDescription: 'Enter expense description',
  selectParentCategory: 'Select a parent category',
  selectCategory: 'Select a category',
  expenseDate: 'Expense Date',
  receiptUrl: 'Receipt URL',
  receiptUrlPlaceholder: 'https://example.com/receipt.pdf',
  submitting: 'Submitting...',

  loadingData: 'Loading data...',
  noDataAvailable: 'No data available',
  tryAgain: 'Try again',
  performance: 'Performance',
  allDrivers: 'All Drivers',
  totalReceivables: 'Total Receivables',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Week',
  month: 'Month',
  year: 'Year',

  // Messages
  error: 'Error',
  success: 'Success',
  warning: 'Warning',

  // Onboarding translations
  welcomeToOnboarding: 'Welcome to Setup',
  setupYourBusinessData: 'Set up your business data to get started',
  companyNames: 'Company Names',
  productSetup: 'Product Setup',
  inventoryQuantities: 'Inventory Quantities',
  driversSetup: 'Drivers Setup',
  receivablesSetup: 'Receivables Setup',
  of: 'of',
  skipOnboarding: 'Skip Setup',
  completing: 'Completing...',
  completeSetup: 'Complete Setup',
  setupBusiness: 'Setup Business',

  // Company step
  addCompanyNames: 'Add Company Names',
  addCompaniesYouDistributeFor: 'Add the companies you distribute products for',
  addNewCompany: 'Add New Company',
  enterCompanyNamesLikeAygaz: 'Enter company names like Aygaz, Jamuna, etc.',
  companyName: 'Company Name',
  enterCompanyName: 'Enter company name',
  companyNameRequired: 'Company name is required',
  companyAlreadyExists: 'Company already exists',
  addedCompanies: 'Added Companies',
  companiesYouDistributeFor: 'Companies you distribute for',
  noCompaniesAdded: 'No companies added yet',
  addAtLeastOneCompany: 'Add at least one company to continue',

  // Product step
  setupProductsAndSizes: 'Setup Products & Sizes',
  configureCylinderSizesAndProducts:
    'Configure cylinder sizes and products for each company',
  cylinderSizes: 'Cylinder Sizes',
  addCylinderSize: 'Add Cylinder Size',
  addSizesLike12L20L: 'Add sizes like 12L, 20L, 5kg, etc.',
  size: 'Size',
  optional: 'Optional',
  enterSizeLike12L: 'Enter size like 12L',
  enterDescription: 'Enter description',
  addSize: 'Add Size',
  cylinderSizeRequired: 'Cylinder size is required',
  cylinderSizeAlreadyExists: 'Cylinder size already exists',
  addProduct: 'Add Product',
  addProductsForEachCompany: 'Add products for each company and cylinder size',
  productName: 'Product Name',
  enterProductName: 'Enter product name',
  selectCompany: 'Select company',
  selectCylinderSize: 'Select cylinder size',
  currentPrice: 'Current Price',
  enterPrice: 'Enter price',
  productNameRequired: 'Product name is required',
  companyRequired: 'Company is required',
  validPriceRequired: 'Valid price is required',
  productAlreadyExists: 'Product already exists',
  addedProducts: 'Added Products',
  addCylinderSizesAndProducts: 'Add cylinder sizes and products to continue',
  bothRequiredToProceed: 'Both are required to proceed',

  // Inventory step
  setInitialInventory: 'Set Initial Inventory',
  enterCurrentFullCylinderQuantities:
    'Enter your current full cylinder quantities',
  fullCylinderInventory: 'Full Cylinder Inventory',
  enterQuantityForEachProduct: 'Enter quantity for each product',
  noProductsAvailable: 'No products available',
  addProductsFirst: 'Add products first',
  totalProducts: 'Total Products',
  totalFullCylinders: 'Total Full Cylinders',

  // Empty cylinders step
  setEmptyCylinderInventory: 'Set Empty Cylinder Inventory',
  enterCurrentEmptyCylinderQuantities:
    'Enter your current empty cylinder quantities (including receivables)',
  emptyCylinderInventory: 'Empty Cylinder Inventory',
  enterQuantityForEachSize:
    'Enter total quantity for each cylinder size (including those from receivables)',
  noCylinderSizesAvailable: 'No cylinder sizes available',
  addCylinderSizesFirst: 'Add cylinder sizes first',
  totalSizes: 'Total Sizes',
  totalEmptyCylinders: 'Total Empty Cylinders',

  // Drivers step
  addYourDrivers: 'Add Your Drivers',
  addDriversWhoWillSellProducts: 'Add drivers who will sell your products',
  addNewDriver: 'Add New Driver',
  enterDriverInformation: 'Enter driver information',
  driverName: 'Driver Name',
  enterDriverName: 'Enter driver name',
  enterPhoneNumber: 'Enter phone number',
  driverType: 'Driver Type',
  selectDriverType: 'Select driver type',
  shipmentDriver: 'Shipment Driver',
  driverNameRequired: 'Driver name is required',
  driverAlreadyExists: 'Driver already exists',
  addedDrivers: 'Added Drivers',
  driversInYourTeam: 'Drivers in your team',
  noContactInfo: 'No contact info',
  noDriversAdded: 'No drivers added yet',
  addAtLeastOneDriver: 'Add at least one driver to continue',

  // Receivables step
  setupReceivables: 'Setup Receivables',
  enterCurrentReceivablesForEachDriver:
    'Enter current receivables for each driver',
  driverReceivables: 'Driver Receivables',
  enterCashAndCylinderReceivables: 'Enter cash and cylinder receivables',
  currency: 'Currency',
  amountOwedByCustomers: 'Amount owed by customers',
  cylindersOwedByCustomers: 'Cylinders owed by customers',
  cylindersOwedByCustomersBySize: 'Cylinders owed by customers (by size)',
  noDriversAvailable: 'No drivers available',
  addDriversFirst: 'Please add drivers first',
  noRetailDriversAvailable: 'No retail drivers available',
  addRetailDriversFirst: 'Please add retail drivers first',
  receivablesSummary: 'Receivables Summary',
  totalCashReceivables: 'Total Cash Receivables',
  totalCylinderReceivables: 'Total Cylinder Receivables',

  // Admin onboarding
  manualBusinessOnboarding: 'Manual Business Onboarding',
  businessInformation: 'Business Information',
  businessName: 'Business Name',
  businessNamePlaceholder: 'ABC LPG Distributors',
  subdomain: 'Subdomain',
  subdomainPlaceholder: 'abc-lpg',
  timezone: 'Timezone',
  plan: 'Plan',
  freemium: 'Freemium',
  professional: 'Professional',
  enterprise: 'Enterprise',
  adminUser: 'Admin User',
  adminName: 'Admin Name',
  adminNamePlaceholder: 'John Doe',
  adminEmail: 'Admin Email',
  adminEmailPlaceholder: 'admin@abclpg.com',
  adminPassword: 'Admin Password',
  strongPassword: 'Strong password',
  creatingBusiness: 'Creating Business...',
  onboardBusiness: 'Onboard Business',
  businessOnboardedSuccessfully: 'Business Onboarded Successfully',
  businessCreatedWithAdmin:
    '{tenantName} has been created with admin user {userEmail}',
  failedToOnboardBusiness: 'Failed to onboard business',
  networkErrorOccurred: 'Network error occurred',

  // API errors
  unauthorized: 'Unauthorized',
  userNotFound: 'User not found',
  onboardingAlreadyCompleted: 'Onboarding already completed',
  failedToCompleteOnboarding: 'Failed to complete onboarding',
  failedToCheckOnboardingStatus: 'Failed to check onboarding status',

  // All missing translation keys - English
  activeDrivers: 'Active Drivers',
  activeUsers: 'Active Users',
  addDriver: 'Add Driver',
  addExpense: 'Add Expense',
  additionalNotesComments: 'Additional Notes/Comments',
  addUser: 'Add User',
  administrator: 'Administrator',
  administrators: 'Administrators',
  ago: 'ago',
  alerts: 'Alerts',
  allCalculationsUpdatedRealTime: 'All calculations updated in real-time',
  allCategories: 'All Categories',
  allCylinders: 'All Cylinders',
  allGood: 'All Good',
  allStatus: 'All Status',
  approved: 'Approved',
  approvedExpenses: 'Approved Expenses',
  approveExpense: 'Approve Expense',
  area: 'Area',
  areYouSureDeleteDriver: 'Are you sure you want to delete this driver?',
  assetsLiabilities: 'Assets & Liabilities',
  assignedArea: 'Assigned Area',
  balanceSheet: 'Balance Sheet',
  businessFormulaImplementation: 'Business formula implementation',
  cashReceivables: 'Cash Receivables',
  changesLog: 'Changes Log',
  checkStock: 'Check Stock',
  clear: 'Clear',
  company: 'Company',
  completeSystemAccessAndUserManagement:
    'Complete system access and user management',
  confirmDeleteUser: 'Confirm Delete User',
  contactName: 'Contact Name',
  contactNumber: 'Contact Number',
  create: 'Create',
  criticalAlert: 'Critical Alert',
  currentFullCylinderInventory: 'Current Full Cylinder Inventory',
  currentStock: 'Current Stock',
  currentStockHealth: 'Current Stock Health',
  customers: 'Customers',
  cylinderReceivables: 'Cylinder Receivables',
  cylindersReceived: 'Cylinders Received',
  cylindersSold: 'Cylinders Sold',
  cylindersSummaryApiError: 'Cylinders summary API error',
  cylindersSummaryDataReceived: 'Cylinders summary data received',
  cylindersSummaryResponseStatus: 'Cylinders summary response status',
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
  driverAddedSuccessfully: 'Driver added successfully',
  driverDeletedSuccessfully: 'Driver deleted successfully',
  driverDetails: 'Driver Details',
  driverManagement: 'Driver Management',
  driverUpdatedSuccessfully: 'Driver updated successfully',
  editDriver: 'Edit Driver',
  editExpense: 'Edit Expense',
  editUser: 'Edit User',
  emailAddress: 'Email Address',
  emergencyContact: 'Emergency Contact',
  emptyCylinderInventoryAvailability: 'Empty Cylinder Inventory Availability',
  emptyCylindersBuySell: 'Empty Cylinders Buy/Sell',
  emptyCylindersInHand: 'Empty Cylinders in Hand',
  emptyCylinderReceivables: 'Empty Cylinder Receivables',
  emptyCylindersInStock: 'Empty Cylinders in Stock',
  outstandingShipments: 'Outstanding Shipments',
  noOutstandingOrders: 'No outstanding orders',
  enterAssignedAreaRoute: 'Enter assigned area/route',
  enterEmailAddress: 'Enter email address',
  enterEmergencyContactName: 'Enter emergency contact name',
  enterEmergencyContactNumber: 'Enter emergency contact number',
  enterFullAddress: 'Enter full address',
  enterFullName: 'Enter full name',
  enterLicenseNumber: 'Enter license number',
  errorFetchingCylindersSummaryData: 'Error fetching cylinders summary data',
  errorFetchingDailyInventoryData: 'Error fetching daily inventory data',
  errorFetchingInventoryData: 'Error fetching inventory data',
  expense: 'Expense',
  expenseManagement: 'Expense Management',
  exportFunctionalityComingSoon: 'Export functionality coming soon',
  failedToCreateUser: 'Failed to create user',
  failedToDeleteDriver: 'Failed to delete driver',
  failedToDeleteUser: 'Failed to delete user',
  failedToFetchUsers: 'Failed to fetch users',
  failedToLoadInventoryData: 'Failed to load inventory data',
  failedToUpdateDriver: 'Failed to update driver',
  failedToUpdateUser: 'Failed to update user',
  fetchingCylindersSummaryData: 'Fetching cylinders summary data',
  filterByDriverType: 'Filter by driver type',
  fri: 'Fri',
  from: 'From',
  fullAccess: 'Full Access',
  fullName: 'Full Name',
  generalSettings: 'General Settings',
  getStartedByAddingFirstExpense: 'Get started by adding your first expense',
  hour: 'Hour',
  hours: 'Hours',
  individualDailySalesData: 'Individual daily sales data',
  inventoryManagement: 'Inventory Management',
  joiningDate: 'Joining Date',
  justNow: 'Just now',
  kPending: 'Pending',
  language: 'Language',
  last7Days: 'Last 7 Days',
  lastLogin: 'Last Login',
  lastUpdated: 'Last Updated',
  latest: 'Latest',
  licenseNumber: 'License Number',
  loadingDailySalesData: 'Loading daily sales data',
  loadingDriverPerformance: 'Loading driver performance',
  loadingInventoryData: 'Loading inventory data',
  loadingText: 'Loading...',
  locationInformation: 'Location Information',
  login: 'Login',
  testCredentials: 'Test Credentials',
  lpgDistributorManagementSystem: 'LPG Distributor Management System',
  manageBudgets: 'Manage Budgets',
  manageCategories: 'Manage Categories',
  manageCompanyAssets: 'Manage Company Assets',
  manageDriversAndAssignments: 'Manage Drivers and Assignments',
  manageLiabilities: 'Manage Liabilities',
  manager: 'Manager',
  managers: 'Managers',
  manageSystemRoles: 'Manage System Roles',
  manageSystemUsers: 'Manage System Users',
  manageTeam: 'Manage Team',
  mon: 'Mon',
  monitorCylinderStock: 'Monitor cylinder stock',
  needAdminPrivileges: 'Need admin privileges',
  never: 'Never',
  newSale: 'New Sale',
  noActiveDriversFoundForThisPeriod: 'No active drivers found for this period',
  noDailyInventoryDataAvailable: 'No daily inventory data available',
  noDailySalesDataFound: 'No daily sales data found',
  noDataFound: 'No data found',
  noEmptyCylindersInInventory: 'No empty cylinders in inventory',
  noFullCylindersInInventory: 'No full cylinders in inventory',
  notApplicable: 'Not Applicable',
  note: 'Note',
  noUsersFound: 'No users found',
  operationFailed: 'Operation failed',
  operations: 'Operations',
  outstanding: 'Outstanding',
  packagePurchase: 'Package Purchase',
  packageRefillPurchase: 'Package + Refill Purchase',
  packageRefillSales: 'Package + Refill Sales',
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
  pleaseLogInToAccessUserManagement: 'Please log in to access user management',
  producentsWithLowStockWarning: 'Products with low stock warning',
  productsBelowMinimumThreshold: 'Products below minimum threshold',
  productsInCriticalStock: 'Products in critical stock',
  productsInGoodStock: 'Products in good stock',
  productsOutOfStock: 'Products out of stock',
  rahmanSoldCylinders: 'Rahman sold cylinders',
  realTimeInventoryTracking: 'Real-time inventory tracking',
  receivableManagement: 'Receivable Management',
  receivableRecords: 'Receivable Records',
  recentActivity: 'Recent Activity',
  recordDailySales: 'Record daily sales',
  refillPurchase: 'Refill Purchase',
  refillSale: 'Refill Sale',
  refillSalesQty: 'Refill Sales Qty',
  refreshData: 'Refresh Data',
  rejectExpense: 'Reject Expense',
  reportsAnalytics: 'Reports & Analytics',
  retail: 'Retail',
  retailDriverDescription: 'Manages daily sales and customer deliveries',
  retry: 'Retry',
  rolePermissions: 'Role & Permissions',
  routeArea: 'Route/Area',
  salesInventoryAndDriverManagement: 'Sales, inventory, and driver management',
  salesTrend: 'Sales Trend',
  salesValue: 'Sales Value',
  sat: 'Sat',
  saveError: 'Save Error',
  saveSuccess: 'Save Success',
  searchExpenses: 'Search expenses',
  selectStatus: 'Select status',
  shipment: 'Shipment',
  shipmentDriverDescription: 'Handles bulk deliveries and transfers',
  statusAndNotes: 'Status and Notes',
  stockReplenished: 'Stock replenished',
  submittedBy: 'Submitted by',
  sumAllDriversSalesForDate: 'Sum all drivers sales for date',
  sumCompletedEmptyCylinderShipments: 'Sum completed empty cylinder shipments',
  sumCompletedShipmentsFromShipmentsPage:
    'Sum completed shipments from shipments page',
  sun: 'Sun',
  systemUsers: 'System Users',
  tasks: 'Tasks',
  teamAccess: 'Team Access',
  thisActionCannotBeUndone: 'This action cannot be undone',
  thu: 'Thu',
  to: 'To',
  todaysEmptyCylinders: "Today's Empty Cylinders",
  todaysFullCylinders: "Today's Full Cylinders",
  todaysPurchases: "Today's Purchases",
  todaysSales: "Today's Sales",
  topDriverPerformance: 'Top Driver Performance',
  totalCylinders: 'Total Cylinders',
  totalCylindersReceivables: 'Total Cylinders Receivables',
  totalSalesQty: 'Total Sales Qty',
  totalSalesThisMonth: 'Total Sales This Month',
  totalUsers: 'Total Users',
  trackCustomerCredits: 'Track customer credits',
  trackCustomerPayments: 'Track customer payments',
  trackExpenses: 'Track expenses',
  trackExpensesAndManageBudgets: 'Track expenses and manage budgets',
  trackPerformance: 'Track performance',
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
  viewingExpensesFor: 'Viewing expenses for',
  viewReceipt: 'View Receipt',
  viewReports: 'View Reports',
  wed: 'Wed',
  yesterdaysEmpty: "Yesterday's Empty",
  yesterdaysFull: "Yesterday's Full",
  info: 'Information',

  // Missing properties from interface
  cashDepositsByDriver: 'Cash Deposits by Driver',
  includesReceivablePayments: '(includes receivable payments)',
  driverExpense: 'Driver Expense',
  return: 'Return',
  fuelExpense: 'Fuel Expense',
  maintenanceExpense: 'Maintenance Expense',
  officeExpense: 'Office Expense',
  transportExpense: 'Transport Expense',
  miscellaneousExpense: 'Miscellaneous Expense',
  generalExpense: 'General Expense',

  // Form validation messages
  addressMustBeAtLeast10Characters: 'Address must be at least 10 characters',
  addressTooLong: 'Address is too long',
  areaMustBeAtLeast2Characters: 'Area must be at least 2 characters',
  areaTooLong: 'Area is too long',
  driverTypeIsRequired: 'Driver type is required',
  emergencyContactMustBeAtLeast10Digits:
    'Emergency contact must be at least 10 digits',
  emergencyContactNameMustBeAtLeast2Characters:
    'Emergency contact name must be at least 2 characters',
  emergencyContactTooLong: 'Emergency contact is too long',
  invalidEmailAddress: 'Invalid email address',
  licenseNumberMustBeAtLeast5Characters:
    'License number must be at least 5 characters',
  licenseNumberTooLong: 'License number is too long',
  nameMustBeAtLeast2Characters: 'Name must be at least 2 characters',
  nameTooLong: 'Name is too long',
  phoneNumberMustBeAtLeast10Digits: 'Phone number must be at least 10 digits',
  phoneNumberTooLong: 'Phone number is too long',
  statusIsRequired: 'Status is required',

  // Language and locale related
  all: 'All',
  bn: 'Bengali',
  en: 'English',
  locale: 'Locale',
  key: 'Key',
  value: 'Value',

  // Alert types and notifications
  allAlerts: 'All Alerts',
  critical: 'Critical',
  criticalAlerts: 'Critical Alerts',
  infoAlerts: 'Information Alerts',
  warningAlerts: 'Warning Alerts',
  inventoryAlert: 'Inventory Alert',
  performanceAlert: 'Performance Alert',
  stockAlert: 'Stock Alert',
  systemNotification: 'System Notification',

  // Data and metrics
  completionPercentage: 'Completion Percentage',
  dashboardDataUpdated: 'Dashboard Data Updated',
  dataNotFound: 'Data Not Found',
  isComplete: 'Is Complete',
  liveDataFeed: 'Live Data Feed',
  metricsLastUpdated: 'Metrics Last Updated',
  missingKeys: 'Missing Keys',
  newSalesActivity: 'New Sales Activity',
  recentSaleActivity: 'Recent Sale Activity',
  totalKeys: 'Total Keys',
  translatedKeys: 'Translated Keys',

  // Inventory and stock statuses
  lowStock: 'Low Stock',
  outOfStock: 'Out of Stock',
  overduePayments: 'Overdue Payments',
  overstock: 'Overstock',

  // Performance trends
  performanceTrendDown: 'Performance Trend Down',
  performanceTrendStable: 'Performance Trend Stable',
  performanceTrendUp: 'Performance Trend Up',
  salesTrendStable: 'Sales Trend Stable',
  targetAchieved: 'Target Achieved',
  topPerformer: 'Top Performer',

  // Operations and actions
  deleteDriver: 'Delete Driver',
  failedToLoadAlerts: 'Failed To Load Alerts',
  failedToLoadInventoryAlerts: 'Failed To Load Inventory Alerts',
  movementAnomaly: 'Movement Anomaly',
  operationSuccessful: 'Operation Successful',

  // Report related
  failedToLoadDailySalesReport: 'Failed to load daily sales report',
  loadingDailySalesReport: 'Loading daily sales report',
  noReportDataAvailable: 'No report data available',
  tryAgainOrSelectDate: 'Try again or select date',
  comprehensiveDailySalesReport: 'Comprehensive Daily Sales Report',
  totalSalesValue: 'Total Sales Value',
  totalDeposited: 'Total Deposited',
  totalExpenses: 'Total Expenses',
  availableCash: 'Available Cash',
  changeInReceivablesCashCylinders: 'Change in Receivables (Cash & Cylinders)',
  dailyDepositsExpenses: 'Daily Deposits & Expenses',
  detailedBreakdownDepositsExpenses: 'Detailed Breakdown - Deposits & Expenses',
  deposits: 'Deposits',
  particulars: 'Particulars',
  noDepositsFound: 'No deposits found',
  totalDepositsCalculated: 'Total deposits calculated',
  noExpensesFound: 'No expenses found',
  totalExpensesCalculated: 'Total expenses calculated',
  totalAvailableCash: 'Total Available Cash',
  totalDepositsIncludingSales: 'Total Deposits (Including Sales)',

  // Sales form related
  customerName: 'Customer Name',
  selectADriver: 'Select a Driver',
  enterCustomerName: 'Enter Customer Name',
  customerNamePlaceholder: 'Enter customer name (optional)',
  saleItems: 'Sale Items',
  itemNumber: 'Item Number',
  selectAProduct: 'Select a Product',
  packagePrice: 'Package Price',
  refillPrice: 'Refill Price',
  itemTotal: 'Item Total',
  saleSummary: 'Sale Summary',
  paymentType: 'Payment Type',
  paymentTypeRequired: 'Payment type is required',
  bankTransfer: 'Bank Transfer',
  mfs: 'MFS',
  mobileFinancialService: 'Mobile Financial Service',
  credit: 'Credit',
  cylinderCredit: 'Cylinder Credit',
  cashDeposited: 'Cash Deposited',
  cylinderDeposits: 'Cylinder Deposits',
  cylinderDepositsBySize: 'Cylinder Deposits by Size',
  cylindersDeposited: 'Cylinders Deposited',
  maxQuantity: 'Max Quantity',
  additionalNotes: 'Additional Notes',
  additionalNotesPlaceholder: 'Enter any additional notes or comments',
  totalQuantityLabel: 'Total Quantity',
  totalValueLabel: 'Total Value',
  totalDiscountLabel: 'Total Discount',
  netValueLabel: 'Net Value',
  cashReceivableWarning: 'Cash receivable will increase',
  customerNameRecommended: 'Customer name is recommended for credit sales',
  cylinderReceivableWarning: 'Cylinder receivable will increase',
  lowStockWarning: 'Low stock warning',
  cylindersRemaining: 'cylinders remaining',
  lowStockAlert: 'Low Stock Alert',
  loadingFormData: 'Loading form data',
  driverRequired: 'Driver is required',
  productRequired: 'Product is required',
  packageSaleCannotBeNegative: 'Package sale cannot be negative',
  refillSaleCannotBeNegative: 'Refill sale cannot be negative',
  packagePriceCannotBeNegative: 'Package price cannot be negative',
  refillPriceCannotBeNegative: 'Refill price cannot be negative',
  quantityAndPriceRequired: 'Quantity and price are required',
  atLeastOneSaleItemRequired: 'At least one sale item is required',
  discountCannotBeNegative: 'Discount cannot be negative',
  cashDepositedCannotBeNegative: 'Cash deposited cannot be negative',
  cylinderDepositsCannotBeNegative: 'Cylinder deposits cannot be negative',
  available: 'Available',
  for: 'for',
  readOnly: 'Read Only',
  areYouSure: 'Are you sure?',
  deleteConfirmation: 'Delete Confirmation',
  salesEntries: 'Sales Entries',
  cannotBeUndone: 'This action cannot be undone',
  successfullyDeleted: 'Successfully deleted',
  on: 'on',
  thisWillDelete: 'This will delete',
  failedToLoadDailySalesData: 'Failed to load daily sales data',
  combinedSaleCreatedSuccessfully: 'Combined sale created successfully',
  failedToCreateSale: 'Failed to create sale',
  failedToLoadEntryDataForEditing: 'Failed to load entry data for editing',
  salesEntryUpdatedSuccessfully: 'Sales entry updated successfully',
  failedToUpdateSalesEntry: 'Failed to update sales entry',
  failedToDeleteSales: 'Failed to delete sales',

  // Admin and user management
  adminPanel: 'Admin Panel',
  systemAdministration: 'System Administration',
  viewDistributorDashboard: 'View Distributor Dashboard',
  signOut: 'Sign Out',
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode',
  systemTheme: 'System Theme',

  // Shipments management
  shipmentsManagement: 'Shipments Management',
  trackPurchaseOrdersAndShipments: 'Track Purchase Orders and Shipments',
  newPurchase: 'New Purchase',
  emptyCylinderBuySell: 'Empty Cylinder Buy/Sell',
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
  units: 'Units',
  gas: 'Gas',
  unit: 'Unit',
  unitCost: 'Unit Cost',
  gasCost: 'Gas Cost',
  cylinderCost: 'Cylinder Cost',
  vehicle: 'Vehicle',
  markAsFulfilled: 'Mark as Fulfilled',
  totalItems: 'Total Items',
  totalCost: 'Total Cost',
  editPurchaseOrder: 'Edit Purchase Order',
  createNewPurchaseOrder: 'Create New Purchase Order',
  step: 'Step',
  orderInformation: 'Order Information',
  selectDriver: 'Select Driver',
  shipmentDate: 'Shipment Date',
  expectedDeliveryDate: 'Expected Delivery Date',
  invoiceNumber: 'Invoice Number',
  enterInvoiceNumber: 'Enter Invoice Number',
  paymentTerms: 'Payment Terms',
  cashOnDelivery: 'Cash on Delivery',
  net30Days: 'Net 30 Days',
  net60Days: 'Net 60 Days',
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
  shipmentDateRequired: 'Shipment date is required',
  atLeastOneLineItemRequired: 'At least one line item is required',
  creating: 'Creating',
  updatePurchaseOrder: 'Update Purchase Order',
  createPurchaseOrder: 'Create Purchase Order',
  transactionType: 'Transaction Type',
  buyEmptyCylinders: 'Buy Empty Cylinders',
  sellEmptyCylinders: 'Sell Empty Cylinders',
  addEmptyCylindersToInventory: 'Add Empty Cylinders to Inventory',
  removeEmptyCylindersFromInventory: 'Remove Empty Cylinders from Inventory',
  cylinderSize: 'Cylinder Size',
  emptyCylindersNote: 'Empty Cylinders Note',
  transactionDate: 'Transaction Date',
  enterTransactionDetails: 'Enter Transaction Details',
  buy: 'Buy',
  sell: 'Sell',

  // Analytics and performance
  comprehensiveProfitabilityAnalysis: 'Comprehensive Profitability Analysis',
  visualRepresentationProfitByProduct:
    'Visual Representation - Profit by Product',
  individualDriverPerformanceMetrics: 'Individual Driver Performance Metrics',
  comparativeAnalysisRevenueByDriver:
    'Comparative Analysis - Revenue by Driver',
  monthlyRevenue: 'Monthly Revenue',
  allExpenses: 'All Expenses',
  totalProfit: 'Total Profit',
  buyingPrice: 'Buying Price',
  commission: 'Commission',
  fixedCost: 'Fixed Cost',
  breakevenPrice: 'Breakeven Price',
  sellingPrice: 'Selling Price',
  costPerUnit: 'Cost per Unit',
  avgCostPerUnit: 'Average Cost per Unit',
  failedToLoadData: 'Failed to Load Data',
  errorLoadingData: 'Error Loading Data',

  // Date and time
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
  july2025: 'July 2025',
  june2025: 'June 2025',
  may2025: 'May 2025',
  april2025: 'April 2025',
  march2025: 'March 2025',
  february2025: 'February 2025',
  january2025: 'January 2025',
  december2024: 'December 2024',
  november2024: 'November 2024',
  october2024: 'October 2024',
  selectTime: 'Select Time',

  // Dashboard and live data
  failedToLoadDashboardData: 'Failed to Load Dashboard Data',
  failedToLoadDashboardDataRefresh: 'Failed to Load Dashboard Data - Refresh',
  errorLoadingCombinedDashboardData: 'Error Loading Combined Dashboard Data',
  sessionExpiredRedirectingToLogin: 'Session Expired - Redirecting to Login',
  realTimeOverview: 'Real-time Overview',
  orders: 'Orders',
  stockLevel: 'Stock Level',
  liveActivity: 'Live Activity',
  last15Minutes: 'Last 15 Minutes',
  targetProgress: 'Target Progress',
  performanceIndicators: 'Performance Indicators',
  inventoryHealth: 'Inventory Health',
  attentionNeeded: 'Attention Needed',
  good: 'Good',
  collectionRate: 'Collection Rate',
  profitMargin: 'Profit Margin',

  // Final batch of missing properties
  salesDetails: 'Sales Details',
  viewDetailedSalesBreakdown: 'View Detailed Sales Breakdown',
  salesBreakdown: 'Sales Breakdown',
  detailedSalesAnalytics: 'Detailed Sales Analytics',
  averageOrderValue: 'Average Order Value',
  driverPerformance: 'Driver Performance',
  topPerformersAndRankings: 'Top Performers and Rankings',
  driverRankings: 'Driver Rankings',
  performanceLeaderboard: 'Performance Leaderboard',
  detailedViewAndTrends: 'Detailed View and Trends',
  vsYesterday: 'vs Yesterday',
  lpgDistributor: 'LPG Distributor',
  welcomeBack: 'Welcome Back',
  role: 'Role',
  loadingDashboard: 'Loading Dashboard',
  fallbackDriverName1: 'Driver 1',
  fallbackDriverName2: 'Driver 2',
  fallbackDriverName3: 'Driver 3',
  fallbackDriverName4: 'Driver 4',
  salesCount: 'Sales Count',
  revenueAmount: 'Revenue Amount',
  performancePercentage: 'Performance Percentage',
  chartDataFallback: 'Chart Data',
  weeklyPerformance: 'Weekly Performance',
  dailyAverage: 'Daily Average',
  monthlyTarget: 'Monthly Target',
  quarterlyGrowth: 'Quarterly Growth',
  unknownDriver: 'Unknown Driver',
  completedSale: 'Completed Sale',
  driverCompletedSale: 'Driver completed sale',
  salesTrendUp: 'Sales trend up',
  salesTrendDown: 'Sales trend down',
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

  // Sales & Inventory
  quantity: 'পরিমাণ',
  unitPrice: 'একক মূল্য',
  discount: 'ছাড়',
  totalValue: 'মোট মূল্য',
  packageSales: 'প্যাকেজ বিক্রয়',
  refillSales: 'রিফিল বিক্রয়',
  cylinder: 'সিলিন্ডার',
  cylinders: 'সিলিন্ডার',
  product: 'পণ্য',
  products: 'পণ্যসমূহ',
  fullCylinders: 'পূর্ণ সিলিন্ডার',
  emptyCylinders: 'খালি সিলিন্ডার',
  stock: 'স্টক',
  purchase: 'ক্রয়',
  sale: 'বিক্রয়',
  retailDriver: 'খুচরা চালক',
  shipmentDrivers: 'চালান চালক',
  retailDrivers: 'খুচরা চালক',

  // Financial
  cash: 'নগদ',
  totalSales: 'মোট বিক্রয়',
  totalRevenue: 'মোট আয়',
  revenue: 'আয়',

  // Receivables page specific
  comingSoon: 'শীঘ্রই আসছে',
  exportReport: 'রিপোর্ট এক্সপোর্ট',
  exportReportFunctionality: 'রিপোর্ট এক্সপোর্ট কার্যকারিতা উন্নয়নাধীন',
  current: 'বর্তমান',
  dueSoon: 'শীঘ্রই প্রদেয়',
  overdue: 'মেয়াদোত্তীর্ণ',
  paid: 'পরিশোধিত',
  noDate: 'কোন তারিখ নেই',
  invalidDate: 'অবৈধ তারিখ',
  noTimestamp: 'কোন টাইমস্ট্যাম্প নেই',
  invalidTimestamp: 'অবৈধ টাইমস্ট্যাম্প',
  failedToFetchReceivables: 'বাকি আনতে ব্যর্থ',
  receivablesRecalculatedSuccessfully: 'বাকি সফলভাবে পুনর্গণনা করা হয়েছে',
  failedToRecalculateReceivables: 'বাকি পুনর্গণনা করতে ব্যর্থ',
  failedToFetchReceivablesChanges: 'বাকি পরিবর্তন আনতে ব্যর্থ',
  customerReceivableUpdatedSuccessfully: 'গ্রাহক বাকি সফলভাবে আপডেট করা হয়েছে',
  customerReceivableAddedSuccessfully: 'গ্রাহক বাকি সফলভাবে যোগ করা হয়েছে',
  failedToSaveCustomerReceivable: 'গ্রাহক বাকি সংরক্ষণ করতে ব্যর্থ',
  customerReceivableDeletedSuccessfully: 'গ্রাহক বাকি সফলভাবে মুছে ফেলা হয়েছে',
  failedToDeleteCustomerReceivable: 'গ্রাহক বাকি মুছতে ব্যর্থ',
  paymentRecordedSuccessfully: 'পেমেন্ট সফলভাবে রেকর্ড করা হয়েছে',
  failedToRecordPayment: 'পেমেন্ট রেকর্ড করতে ব্যর্থ',
  cylinderReturnRecordedSuccessfully:
    'সিলিন্ডার ফেরত সফলভাবে রেকর্ড করা হয়েছে',
  failedToRecordCylinderReturn: 'সিলিন্ডার ফেরত রেকর্ড করতে ব্যর্থ',
  editCustomerReceivable: 'গ্রাহক বাকি সম্পাদনা',
  addCustomerReceivable: 'গ্রাহক বাকি যোগ করুন',
  cashReceivable: 'নগদ বাকি',
  cylinderReceivable: 'সিলিন্ডার বাকি',
  enterNumberOfCylinders: 'সিলিন্ডারের সংখ্যা লিখুন',
  recordPayment: 'পেমেন্ট রেকর্ড করুন',
  recordCylinderReturn: 'সিলিন্ডার ফেরত রেকর্ড করুন',
  paymentAmount: 'পেমেন্টের পরিমাণ',
  enterPaymentAmount: 'পেমেন্টের পরিমাণ লিখুন',
  paymentMethod: 'পেমেন্ট পদ্ধতি',
  cylindersReturned: 'সিলিন্ডার ফেরত',
  recordReturn: 'ফেরত রেকর্ড করুন',
  validationError: 'বৈধতা ত্রুটি',
  customerReceivablesDontMatch: 'গ্রাহক বাকি মিলছে না',
  driverTotalReceivablesFromSales:
    'চালকের মোট বাকি বিক্রয় তথ্য থেকে আসে এবং সম্পাদনা করা যায় না',
  customerReceivableTotalsMustEqual:
    'গ্রাহক বাকির মোট প্রতিটি চালকের বিক্রয় মোটের সমান হতে হবে',
  cashMismatch: 'নগদ অমিল',
  customerTotal: 'গ্রাহক মোট',
  salesTotal: 'বিক্রয় মোট',
  difference: 'পার্থক্য',
  cylinderMismatch: 'সিলিন্ডার অমিল',
  customersWithOverduePayments: 'গ্রাহক(গণ) এর মেয়াদোত্তীর্ণ পেমেন্ট',
  requireImmediate: 'তাৎক্ষণিক প্রয়োজন',
  receivablesManagementSystemRules: 'বাকি ব্যবস্থাপনা সিস্টেম নিয়ম',
  driverTotalReceivables: 'চালকের মোট বাকি',
  automaticallyCalculatedFromSales:
    'বিক্রয় তথ্য থেকে স্বয়ংক্রিয়ভাবে গণনা (সম্পাদনাযোগ্য নয়)',
  customerReceivablesManuallyManaged:
    'প্রতিটি চালকের অধীনে প্রশাসকদের দ্বারা ম্যানুয়ালি পরিচালিত',
  validation: 'বৈধতা',
  customerTotalsMustEqualDriverSales:
    'গ্রাহক মোট চালকের বিক্রয় মোটের সমান হতে হবে',
  payments: 'পেমেন্ট',
  paymentsAutomaticallyAdded:
    'রেকর্ড করার সময় স্বয়ংক্রিয়ভাবে দৈনিক আমানতে যোগ',
  changesLogAllReceivableActions:
    'সমস্ত বাকি কার্যক্রম পরিবর্তনের ট্যাবে ট্র্যাক করা হয়',
  managerAccess: 'ম্যানেজার অ্যাক্সেস',
  youCanRecordPayments: 'আপনি পেমেন্ট রেকর্ড করতে পারেন এবং',
  salesCashReceivables: 'বিক্রয় নগদ বাকি',
  fromSalesData: 'বিক্রয় তথ্য থেকে',
  salesCylinderReceivables: 'বিক্রয় সিলিন্ডার বাকি',
  noReceivablesFound: 'কোনো বাকি পাওয়া যায়নি',
  noChangesRecorded: 'কোনো পরিবর্তন রেকর্ড করা হয়নি',
  receivablesChangesLog: 'বাকি পরিবর্তনের লগ',

  // Expense form specific
  amountPlaceholder: '০.০০',
  enterExpenseDescription: 'খরচের বিবরণ লিখুন',
  selectParentCategory: 'একটি প্যারেন্ট বিভাগ নির্বাচন করুন',
  selectCategory: 'একটি বিভাগ নির্বাচন করুন',
  expenseDate: 'খরচের তারিখ',
  receiptUrl: 'রসিদ URL',
  receiptUrlPlaceholder: 'https://example.com/receipt.pdf',
  submitting: 'জমা দেওয়া হচ্ছে...',

  loadingData: 'ডেটা লোড হচ্ছে...',
  noDataAvailable: 'কোনো ডেটা উপলব্ধ নেই',
  tryAgain: 'আবার চেষ্টা করুন',
  performance: 'কর্মক্ষমতা',
  allDrivers: 'সব চালক',
  totalReceivables: 'মোট বাকি',
  thisMonth: 'এই মাস',
  lastMonth: 'গত মাস',
  today: 'আজ',
  yesterday: 'গতকাল',
  week: 'সপ্তাহ',
  month: 'মাস',
  year: 'বছর',

  // Messages
  error: 'ত্রুটি',
  success: 'সফল',
  warning: 'সতর্কতা',
  info: 'তথ্য',
  operationSuccessful: 'অপারেশন সফল',
  operationFailed: 'অপারেশন ব্যর্থ',

  // Specific Features
  urgent: 'জরুরি',

  // Dashboard specific
  recordDailySales: 'দৈনিক বিক্রয় রেকর্ড করুন',
  trackPerformance: 'এবং পারফরম্যান্স ট্র্যাক করুন',
  monitorCylinderStock: 'সিলিন্ডার স্টক পর্যবেক্ষণ করুন',
  alerts: 'সতর্কতা',
  allGood: 'সব ঠিক আছে',
  manageDriversAndAssignments: 'চালক এবং অ্যাসাইনমেন্ট পরিচালনা করুন',
  manageTeam: 'দল পরিচালনা',
  manageSystemUsers: 'সিস্টেম ব্যবহারকারী পরিচালনা',
  manageSystemRoles: 'এবং ভূমিকা',
  teamAccess: 'দলের অ্যাক্সেস',
  trackCustomerPayments: 'গ্রাহক পেমেন্ট ট্র্যাক করুন',
  trackCustomerCredits: 'এবং ক্রেডিট',
  kPending: 'হাজার বাকি',
  assetsLiabilities: 'সম্পদ ও দায়',
  manageCompanyAssets: 'কোম্পানির সম্পদ পরিচালনা',
  manageLiabilities: 'এবং দায়',
  balanceSheet: 'ব্যালেন্স শীট',
  trackExpenses: 'খরচ ট্র্যাক করুন',
  manageBudgets: 'এবং বাজেট',
  pending: 'বাকি',
  reportsAnalytics: 'রিপোর্ট ও বিশ্লেষণ',
  loadingText: 'ড্যাশবোর্ড ডেটা লোড হচ্ছে...',
  retry: 'আবার চেষ্টা করুন',
  newSale: 'নতুন বিক্রয়',
  checkStock: 'স্টক চেক করুন',
  addExpense: 'খরচ যোগ করুন',
  updatePayment: 'পেমেন্ট আপডেট করুন',
  viewReports: 'রিপোর্ট দেখুন',
  recentActivity: 'সাম্প্রতিক কার্যকলাপ',
  rahmanSoldCylinders: 'রহমান ১৫টি সিলিন্ডার বিক্রি করেছেন',
  stockReplenished: 'স্টক পুনরায় পূরণ - ১০০টি সিলিন্ডার',
  paymentReceived: 'গ্রাহকের কাছ থেকে পেমেন্ট পেয়েছি',
  salesTrend: 'বিক্রয়ের প্রবণতা',
  last7Days: 'গত ৭ দিন',
  mon: 'সোম',
  tue: 'মঙ্গল',
  wed: 'বুধ',
  thu: 'বৃহঃ',
  fri: 'শুক্র',
  sat: 'শনি',
  sun: 'রবি',
  topDriverPerformance: 'শীর্ষ চালকের পারফরম্যান্স',
  lpgDistributorManagementSystem: 'এলপিজি ডিস্ট্রিবিউটর ম্যানেজমেন্ট সিস্টেম',

  // Additional missing keys from TypeScript errors
  addDriver: 'চালক যোগ করুন',
  activeDrivers: 'সক্রিয় চালক',
  driver: 'চালক',
  area: 'এলাকা',
  cashReceivables: 'নগদ বাকি',
  cylinderReceivables: 'সিলিন্ডার বাকি',
  cylindersOwedByCustomers: 'গ্রাহকদের কাছে সিলিন্ডার বাকি',
  cylindersOwedByCustomersBySize:
    'গ্রাহকদের কাছে সিলিন্ডার বাকি (সাইজ অনুযায়ী)',
  amountOwedByCustomers: 'গ্রাহকদের কাছে অর্থ বাকি',
  retail: 'খুচরা',
  shipment: 'চালান',
  noDataFound: 'কোন তথ্য পাওয়া যায়নি',
  create: 'তৈরি করুন',
  packageSale: 'প্যাকেজ বিক্রয়',
  refillSale: 'রিফিল বিক্রয়',
  currency: 'মুদ্রা',
  timezone: 'সময় অঞ্চল',
  language: 'ভাষা',
  saveSuccess: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে',
  saveError: 'সেটিংস সংরক্ষণ করতে ব্যর্থ',
  generalSettings: 'সাধারণ সেটিংস',
  loadingInventoryData: 'ইনভেন্টরি ডেটা লোড হচ্ছে...',
  failedToLoadInventoryData: 'ইনভেন্টরি ডেটা লোড করতে ব্যর্থ',
  realTimeInventoryTracking: 'রিয়েল-টাইম ইনভেন্টরি ট্র্যাকিং',
  exportFunctionalityComingSoon: 'এক্সপোর্ট ফিচার শীঘ্রই আসছে',
  criticalAlert: 'জরুরি সতর্কতা',
  productsOutOfStock: 'পণ্য স্টক শেষ',
  lowStockWarning: 'কম স্টকের সতর্কতা',
  productsBelowMinimumThreshold: 'পণ্য ন্যূনতম সীমার নিচে',
  currentStock: 'বর্তমান স্টক',
  todaysSales: 'আজকের বিক্রয়',
  cylindersSold: 'সিলিন্ডার বিক্রি',
  todaysPurchases: 'আজকের ক্রয়',
  cylindersReceived: 'সিলিন্ডার পাওয়া',
  totalCylinders: 'মোট সিলিন্ডার',
  allCylinders: 'সব সিলিন্ডার',
  currentFullCylinderInventory: 'বর্তমান পূর্ণ সিলিন্ডার ইনভেন্টরি',
  company: 'কোম্পানি',
  size: 'আকার',
  noFullCylindersInInventory: 'ইনভেন্টরিতে কোন পূর্ণ সিলিন্ডার নেই',
  emptyCylinderInventoryAvailability: 'খালি সিলিন্ডার ইনভেন্টরির উপলব্ধতা',
  emptyCylindersInHand: 'হাতে খালি সিলিন্ডার',
  noEmptyCylindersInInventory: 'ইনভেন্টরিতে কোন খালি সিলিন্ডার নেই',
  note: 'নোট',
  totalCylinderReceivables: 'মোট সিলিন্ডার বাকি',
  totalCylindersReceivables: 'মোট সিলিন্ডার বাকি',
  dailyInventoryTracking: 'দৈনিক ইনভেন্টরি ট্র্যাকিং',
  packagePurchase: 'প্যাকেজ ক্রয়',
  refillPurchase: 'রিফিল ক্রয়',
  emptyCylindersBuySell: 'খালি সিলিন্ডার কেনাবেচা',
  latest: 'সর্বশেষ',
  noDailyInventoryDataAvailable: 'দৈনিক ইনভেন্টরি ডেটা উপলব্ধ নেই',
  businessFormulaImplementation: 'ব্যবসায়িক সূত্র বাস্তবায়ন',
  dailyCalculations: 'দৈনিক গণনা',
  todaysFullCylinders: 'আজকের পূর্ণ সিলিন্ডার',
  yesterdaysFull: 'গতকালের পূর্ণ',
  todaysEmptyCylinders: 'আজকের খালি সিলিন্ডার',
  yesterdaysEmpty: 'গতকালের খালি',
  dataSources: 'ডেটা উৎস',
  packageRefillSales: 'প্যাকেজ ও রিফিল বিক্রয়',
  sumAllDriversSalesForDate: 'তারিখের জন্য সব চালকের বিক্রয়ের যোগফল',
  packageRefillPurchase: 'প্যাকেজ ও রিফিল ক্রয়',
  sumCompletedShipmentsFromShipmentsPage:
    'চালান পাতা থেকে সম্পূর্ণ চালানের যোগফল',
  sumCompletedEmptyCylinderShipments: 'সম্পূর্ণ খালি সিলিন্ডার চালানের যোগফল',
  allCalculationsUpdatedRealTime: 'সব গণনা রিয়েল-টাইমে আপডেট হয়',
  currentStockHealth: 'বর্তমান স্টকের অবস্থা',
  productsInGoodStock: 'ভাল স্টকে পণ্য',
  producentsWithLowStockWarning: 'কম স্টক সতর্কতা সহ পণ্য',
  productsInCriticalStock: 'গুরুতর স্টকে পণ্য',

  // Dashboard and reports
  cashDepositsByDriver: 'চালক অনুযায়ী নগদ জমা',
  includesReceivablePayments: '(বাকি পেমেন্ট সহ)',
  driverExpense: 'চালক খরচ',
  fuelExpense: 'জ্বালানি খরচ',
  maintenanceExpense: 'রক্ষণাবেক্ষণ খরচ',
  officeExpense: 'অফিস খরচ',
  transportExpense: 'পরিবহন খরচ',
  miscellaneousExpense: 'বিবিধ খরচ',
  generalExpense: 'সাধারণ খরচ',
  failedToLoadDailySalesReport: 'দৈনিক বিক্রয় রিপোর্ট লোড করতে ব্যর্থ',
  loadingDailySalesReport: 'দৈনিক বিক্রয় রিপোর্ট লোড হচ্ছে...',
  noReportDataAvailable: 'কোন রিপোর্ট ডেটা উপলব্ধ নেই',
  tryAgainOrSelectDate: 'আবার চেষ্টা করুন বা অন্য তারিখ নির্বাচন করুন',
  comprehensiveDailySalesReport: 'বিস্তৃত দৈনিক বিক্রয় রিপোর্ট',
  totalSalesValue: 'মোট বিক্রয় মূল্য',
  totalDeposited: 'মোট জমা',
  totalExpenses: 'মোট খরচ',
  availableCash: 'উপলব্ধ নগদ',
  totalCashReceivables: 'মোট নগদ বাকি',

  // Missing onboarding receivables translations
  noDriversAvailable: 'কোন চালক উপলব্ধ নেই',
  addDriversFirst: 'অনুগ্রহ করে প্রথমে চালক যোগ করুন',
  noRetailDriversAvailable: 'কোন খুচরা চালক উপলব্ধ নেই',
  addRetailDriversFirst: 'অনুগ্রহ করে প্রথমে খুচরা চালক যোগ করুন',
  receivablesSummary: 'বাকি সারসংক্ষেপ',

  // Admin onboarding
  manualBusinessOnboarding: 'ম্যানুয়াল ব্যবসায়িক অনবোর্ডিং',
  businessInformation: 'ব্যবসায়িক তথ্য',
  businessName: 'ব্যবসার নাম',
  businessNamePlaceholder: 'এবিসি এলপিজি ডিস্ট্রিবিউটর্স',
  subdomain: 'সাবডোমেইন',
  subdomainPlaceholder: 'abc-lpg',
  plan: 'পরিকল্পনা',
  freemium: 'ফ্রিমিয়াম',
  professional: 'পেশাদার',
  enterprise: 'এন্টারপ্রাইজ',
  adminUser: 'প্রশাসক ব্যবহারকারী',
  adminName: 'প্রশাসকের নাম',
  adminNamePlaceholder: 'জন ডো',
  adminEmail: 'প্রশাসকের ইমেইল',
  adminEmailPlaceholder: 'admin@abclpg.com',
  adminPassword: 'প্রশাসকের পাসওয়ার্ড',
  strongPassword: 'শক্তিশালী পাসওয়ার্ড',
  creatingBusiness: 'ব্যবসা তৈরি করা হচ্ছে...',
  onboardBusiness: 'ব্যবসা অনবোর্ড করুন',
  businessOnboardedSuccessfully: 'ব্যবসা সফলভাবে অনবোর্ড হয়েছে',
  businessCreatedWithAdmin:
    '{tenantName} প্রশাসক ব্যবহারকারী {userEmail} সহ তৈরি হয়েছে',
  failedToOnboardBusiness: 'ব্যবসা অনবোর্ড করতে ব্যর্থ',
  networkErrorOccurred: 'নেটওয়ার্ক ত্রুটি ঘটেছে',

  // API errors
  unauthorized: 'অননুমোদিত',
  userNotFound: 'ব্যবহারকারী পাওয়া যায়নি',
  onboardingAlreadyCompleted: 'অনবোর্ডিং ইতিমধ্যে সম্পন্ন',
  failedToCompleteOnboarding: 'অনবোর্ডিং সম্পন্ন করতে ব্যর্থ',
  failedToCheckOnboardingStatus: 'অনবোর্ডিং স্থিতি যাচাই করতে ব্যর্থ',

  changeInReceivablesCashCylinders: 'বাকিতে পরিবর্তন (নগদ ও সিলিন্ডার)',
  dailyDepositsExpenses: 'দৈনিক জমা ও খরচ',
  detailedBreakdownDepositsExpenses: 'জমা ও খরচের বিস্তারিত বিভাজন',
  deposits: 'জমা',
  particulars: 'বিবরণ',
  noDepositsFound: 'এই তারিখের জন্য কোন জমা পাওয়া যায়নি',
  totalDepositsCalculated: 'মোট জমা (গণনাকৃত)',
  noExpensesFound: 'এই তারিখের জন্য কোন খরচ পাওয়া যায়নি',
  totalExpensesCalculated: 'মোট খরচ (গণনাকৃত)',
  totalAvailableCash: 'মোট উপলব্ধ নগদ',
  totalDepositsIncludingSales: 'বিক্রয় সহ মোট জমা',

  // Sales and inventory forms
  customerName: 'গ্রাহকের নাম',

  // Sales form specific translations
  selectADriver: 'একজন চালক নির্বাচন করুন',
  enterCustomerName: 'গ্রাহকের নাম লিখুন',
  customerNamePlaceholder: 'গ্রাহকের নাম লিখুন (বাকি ট্র্যাকিংয়ের জন্য)',
  saleItems: 'বিক্রয় আইটেম',
  itemNumber: 'আইটেম',
  selectAProduct: 'একটি পণ্য নির্বাচন করুন',
  packagePrice: 'প্যাকেজ মূল্য',
  refillPrice: 'রিফিল মূল্য',
  itemTotal: 'আইটেম মোট',
  saleSummary: 'বিক্রয় সারসংক্ষেপ',
  paymentType: 'পেমেন্টের ধরন',
  paymentTypeRequired: 'পেমেন্টের ধরন প্রয়োজন',
  bankTransfer: 'ব্যাংক ট্রান্সফার',
  mfs: 'এমএফএস',
  mobileFinancialService: 'মোবাইল ফিন্যান্সিয়াল সার্ভিস',
  credit: 'ক্রেডিট',
  cylinderCredit: 'সিলিন্ডার ক্রেডিট',
  cashDeposited: 'নগদ জমা',
  cylinderDeposits: 'সিলিন্ডার জমা',
  cylinderDepositsBySize: 'সাইজ অনুযায়ী সিলিন্ডার জমা',
  cylindersDeposited: 'সিলিন্ডার জমা দেওয়া',
  maxQuantity: 'সর্বোচ্চ',
  additionalNotes: 'অতিরিক্ত নোট',
  additionalNotesPlaceholder: 'অতিরিক্ত নোট বা মন্তব্য...',
  totalQuantityLabel: 'মোট পরিমাণ',
  totalValueLabel: 'মোট মূল্য',
  totalDiscountLabel: 'মোট ছাড়',
  netValueLabel: 'নেট মূল্য',
  cashReceivableWarning: 'এই বিক্রয়ে নগদ বাকি তৈরি হবে',
  customerNameRecommended: 'ট্র্যাকিংয়ের জন্য গ্রাহকের নাম সুপারিশ করা হয়',
  cylinderReceivableWarning: 'এই বিক্রয়ে সিলিন্ডার বাকি তৈরি হবে:',
  cylindersRemaining: 'সিলিন্ডার বাকি',
  lowStockAlert: 'কম স্টক!',
  loadingFormData: 'ফর্ম ডেটা লোড হচ্ছে...',

  // Form validation messages
  driverRequired: 'চালক প্রয়োজন',
  productRequired: 'পণ্য প্রয়োজন',
  packageSaleCannotBeNegative: 'প্যাকেজ বিক্রয় নেগেটিভ হতে পারে না',
  refillSaleCannotBeNegative: 'রিফিল বিক্রয় নেগেটিভ হতে পারে না',
  packagePriceCannotBeNegative: 'প্যাকেজ মূল্য নেগেটিভ হতে পারে না',
  refillPriceCannotBeNegative: 'রিফিল মূল্য নেগেটিভ হতে পারে না',
  quantityAndPriceRequired:
    'প্রতিটি আইটেমের পরিমাণ > ০ এবং সংশ্লিষ্ট মূল্য > ০ থাকতে হবে',
  atLeastOneSaleItemRequired: 'কমপক্ষে একটি বিক্রয় আইটেম প্রয়োজন',
  discountCannotBeNegative: 'ছাড় নেগেটিভ হতে পারে না',
  cashDepositedCannotBeNegative: 'নগদ জমা নেগেটিভ হতে পারে না',
  cylinderDepositsCannotBeNegative: 'সিলিন্ডার জমা নেগেটিভ হতে পারে না',
  available: 'উপলব্ধ',
  for: 'জন্য',

  // Sales page specific translations
  readOnly: 'শুধুমাত্র পড়ার জন্য',
  areYouSure: 'আপনি কি নিশ্চিত',
  deleteConfirmation: 'এর সব বিক্রয় মুছে দিতে চান',
  salesEntries: 'বিক্রয় এন্ট্রি',
  cannotBeUndone: 'এবং এটি পূর্বাবস্থায় ফেরানো যাবে না',
  successfullyDeleted: 'সফলভাবে মুছে ফেলা হয়েছে',
  on: 'তারিখে',
  thisWillDelete: 'এটি মুছে দেবে',
  failedToLoadDailySalesData: 'দৈনিক বিক্রয় ডেটা লোড করতে ব্যর্থ',
  combinedSaleCreatedSuccessfully: 'সম্মিলিত বিক্রয় সফলভাবে তৈরি হয়েছে',
  failedToCreateSale: 'বিক্রয় তৈরি করতে ব্যর্থ',
  failedToLoadEntryDataForEditing:
    'সম্পাদনার জন্য এন্ট্রি ডেটা লোড করতে ব্যর্থ',
  salesEntryUpdatedSuccessfully: 'বিক্রয় এন্ট্রি সফলভাবে আপডেট হয়েছে',
  failedToUpdateSalesEntry: 'বিক্রয় এন্ট্রি আপডেট করতে ব্যর্থ',
  failedToDeleteSales: 'বিক্রয় মুছতে ব্যর্থ',

  // Settings and admin
  adminPanel: 'অ্যাডমিন প্যানেল',
  systemAdministration: 'সিস্টেম প্রশাসন',
  viewDistributorDashboard: 'ডিস্ট্রিবিউটর ড্যাশবোর্ড দেখুন',
  signOut: 'সাইন আউট',
  lightMode: 'হালকা মোড',
  darkMode: 'অন্ধকার মোড',
  systemTheme: 'সিস্টেম থিম',

  // Shipments and purchase orders
  shipmentsManagement: 'চালান ব্যবস্থাপনা',
  trackPurchaseOrdersAndShipments: 'ক্রয় অর্ডার ও চালান ট্র্যাক করুন',
  newPurchase: 'নতুন ক্রয়',
  emptyCylinderBuySell: 'খালি সিলিন্ডার কেনাবেচা',
  allShipments: 'সব চালান',
  outstandingOrders: 'বকেয়া অর্ডার',
  completedOrders: 'সম্পূর্ণ অর্ডার',
  allCompanies: 'সব কোম্পানি',
  allProducts: 'সব পণ্য',
  fromDate: 'শুরুর তারিখ',
  toDate: 'শেষ তারিখ',
  clearFilters: 'ফিল্টার পরিষ্কার করুন',
  loadingShipments: 'চালান লোড হচ্ছে...',
  noShipmentsFound: 'কোন চালান পাওয়া যায়নি',
  invoice: 'চালান',
  units: 'ইউনিট',
  gas: 'গ্যাস',
  unit: 'ইউনিট',
  unitCost: 'ইউনিট খরচ',
  gasCost: 'গ্যাস খরচ',
  cylinderCost: 'সিলিন্ডার খরচ',
  vehicle: 'যানবাহন',
  markAsFulfilled: 'সম্পূর্ণ হিসেবে চিহ্নিত করুন',
  totalItems: 'মোট আইটেম',
  totalCost: 'মোট খরচ',
  editPurchaseOrder: 'ক্রয় অর্ডার সম্পাদনা করুন',
  createNewPurchaseOrder: 'নতুন ক্রয় অর্ডার তৈরি করুন',
  step: 'ধাপ',
  of: 'এর',
  orderInformation: 'অর্ডার তথ্য',
  selectCompany: 'কোম্পানি নির্বাচন করুন',
  selectDriver: 'চালক নির্বাচন করুন',
  shipmentDate: 'চালানের তারিখ',
  expectedDeliveryDate: 'প্রত্যাশিত ডেলিভারি তারিখ',
  invoiceNumber: 'চালান নম্বর',
  enterInvoiceNumber: 'চালান নম্বর লিখুন',
  paymentTerms: 'পেমেন্ট শর্তাবলী',
  cashOnDelivery: 'ডেলিভারিতে নগদ',
  net30Days: 'নেট ৩০ দিন',
  net60Days: 'নেট ৬০ দিন',
  advancePayment: 'অগ্রিম পেমেন্ট',
  priority: 'অগ্রাধিকার',
  low: 'কম',
  normal: 'স্বাভাবিক',
  high: 'উচ্চ',
  vehicleNumber: 'যানবাহন নম্বর',
  enterVehicleNumber: 'যানবাহন নম্বর লিখুন',
  enterAdditionalNotes: 'অতিরিক্ত নোট লিখুন',
  addLineItem: 'লাইন আইটেম যোগ করুন',
  selectProduct: 'পণ্য নির্বাচন করুন',
  selectCompanyFirst: 'প্রথমে কোম্পানি নির্বাচন করুন',
  package: 'প্যাকেজ',
  refill: 'রিফিল',
  gasPrice: 'গ্যাসের দাম',
  cylinderPrice: 'সিলিন্ডারের দাম',
  taxRate: 'করের হার',
  lineTotalPreview: 'লাইন মোট প্রিভিউ',
  packageInfo: 'প্যাকেজ তথ্য',
  refillInfo: 'রিফিল তথ্য',
  addItem: 'আইটেম যোগ করুন',
  purchaseItems: 'ক্রয় আইটেম',
  qty: 'পরিমাণ',
  lineTotal: 'লাইন মোট',
  action: 'কার্য',
  editItem: 'আইটেম সম্পাদনা করুন',
  removeItem: 'আইটেম সরান',
  remove: 'সরান',
  totalPurchaseValue: 'মোট ক্রয় মূল্য',
  orderPreview: 'অর্ডার প্রিভিউ',
  orderSummary: 'অর্ডার সারসংক্ষেপ',
  totalQuantity: 'মোট পরিমাণ',
  companyRequired: 'কোম্পানি প্রয়োজন',
  shipmentDateRequired: 'চালানের তারিখ প্রয়োজন',
  atLeastOneLineItemRequired: 'কমপক্ষে একটি লাইন আইটেম প্রয়োজন',
  creating: 'তৈরি হচ্ছে...',
  updatePurchaseOrder: 'ক্রয় অর্ডার আপডেট করুন',
  createPurchaseOrder: 'ক্রয় অর্ডার তৈরি করুন',

  // Empty cylinder transactions
  transactionType: 'লেনদেনের ধরন',
  buyEmptyCylinders: 'খালি সিলিন্ডার কিনুন',
  sellEmptyCylinders: 'খালি সিলিন্ডার বিক্রি করুন',
  addEmptyCylindersToInventory: 'ইনভেন্টরিতে খালি সিলিন্ডার যোগ করুন',
  removeEmptyCylindersFromInventory: 'ইনভেন্টরি থেকে খালি সিলিন্ডার সরান',
  cylinderSize: 'সিলিন্ডারের আকার',
  selectCylinderSize: 'সিলিন্ডারের আকার নির্বাচন করুন',
  emptyCylindersNote: 'খালি সিলিন্ডার লেনদেনের নোট',
  transactionDate: 'লেনদেনের তারিখ',
  enterTransactionDetails: 'লেনদেনের বিবরণ লিখুন',
  buy: 'কিনুন',
  sell: 'বিক্রি করুন',

  // Analytics page specific translations
  comprehensiveProfitabilityAnalysis: 'ব্যাপক লাভজনকতা বিশ্লেষণ',
  visualRepresentationProfitByProduct:
    'পণ্য অনুযায়ী লাভের ভিজ্যুয়াল উপস্থাপনা',
  individualDriverPerformanceMetrics: 'ব্যক্তিগত চালক পারফরম্যান্স মেট্রিক্স',
  comparativeAnalysisRevenueByDriver: 'চালক অনুযায়ী আয়ের তুলনামূলক বিশ্লেষণ',
  monthlyRevenue: 'মাসিক আয়',
  allExpenses: 'সকল খরচ',
  totalProfit: 'মোট লাভ',
  buyingPrice: 'ক্রয় মূল্য',
  commission: 'কমিশন',
  fixedCost: 'স্থির খরচ',
  breakevenPrice: 'সমতা মূল্য',
  sellingPrice: 'বিক্রয় মূল্য',
  costPerUnit: 'প্রতি ইউনিট খরচ',
  avgCostPerUnit: 'গড় প্রতি ইউনিট খরচ',
  failedToLoadData: 'ডেটা লোড করতে ব্যর্থ',
  errorLoadingData: 'ডেটা লোড করতে ত্রুটি',
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

  // Dashboard error messages and loading states
  failedToLoadDashboardData: 'ড্যাশবোর্ড ডেটা লোড করতে ব্যর্থ',
  failedToLoadDashboardDataRefresh:
    'ড্যাশবোর্ড ডেটা লোড করতে ব্যর্থ। অনুগ্রহ করে পৃষ্ঠা রিফ্রেশ করুন।',
  errorLoadingCombinedDashboardData: 'সম্মিলিত ড্যাশবোর্ড ডেটা লোড করতে ত্রুটি',
  sessionExpiredRedirectingToLogin:
    'সেশনের মেয়াদ শেষ, লগইনে পুনঃনির্দেশিত হচ্ছে',

  // Mobile dashboard specific
  realTimeOverview: 'রিয়েল-টাইম ওভারভিউ',
  orders: 'অর্ডার',
  stockLevel: 'স্টক লেভেল',
  liveActivity: 'লাইভ কার্যকলাপ',
  last15Minutes: 'শেষ ১৫ মিনিট',
  targetProgress: 'লক্ষ্য অগ্রগতি',
  performanceIndicators: 'পারফরম্যান্স সূচক',
  inventoryHealth: 'ইনভেন্টরি স্বাস্থ্য',
  attentionNeeded: 'মনোযোগ প্রয়োজন',
  good: 'ভাল',
  collectionRate: 'সংগ্রহের হার',
  profitMargin: 'লাভের মার্জিন',
  salesDetails: 'বিক্রয় বিবরণ',
  viewDetailedSalesBreakdown: 'বিস্তারিত বিক্রয় বিভাজন দেখুন',
  salesBreakdown: 'বিক্রয় বিভাজন',
  detailedSalesAnalytics: 'বিস্তারিত বিক্রয় বিশ্লেষণ',
  averageOrderValue: 'গড় অর্ডার মূল্য',
  driverPerformance: 'চালক পারফরম্যান্স',
  topPerformersAndRankings: 'শীর্ষ পারফরমার এবং র‍্যাঙ্কিং',
  driverRankings: 'চালক র‍্যাঙ্কিং',
  performanceLeaderboard: 'পারফরম্যান্স লিডারবোর্ড',
  detailedViewAndTrends: 'বিস্তারিত দৃশ্য এবং প্রবণতা',
  vsYesterday: 'গতকালের তুলনায়',

  // Dashboard layout specific
  lpgDistributor: 'এলপিজি ডিস্ট্রিবিউটর',
  welcomeBack: 'স্বাগতম',
  role: 'ভূমিকা',
  loadingDashboard: 'লোড হচ্ছে...',

  // Dashboard fallback data and performance metrics
  fallbackDriverName1: 'রহমান আলী',
  translatedKeys: '',
  fallbackDriverName2: 'করিম হাসান',
  fallbackDriverName3: 'হাসান আহমেদ',
  fallbackDriverName4: 'আলী রহমান',
  salesCount: 'বিক্রয়',
  revenueAmount: 'আয়',
  performancePercentage: 'পারফরম্যান্স',
  chartDataFallback: 'নমুনা চার্ট ডেটা',
  weeklyPerformance: 'সাপ্তাহিক পারফরম্যান্স',
  dailyAverage: 'দৈনিক গড়',
  monthlyTarget: 'মাসিক লক্ষ্য',
  quarterlyGrowth: 'ত্রৈমাসিক বৃদ্ধি',

  // Dashboard API and activity messages
  unknownDriver: 'অজানা চালক',
  completedSale: 'বিক্রয় সম্পন্ন',
  driverCompletedSale: 'চালক বিক্রয় সম্পন্ন করেছেন',
  salesTrendUp: 'বৃদ্ধি',
  salesTrendDown: 'হ্রাস',

  // Driver management interface translations
  driverDetails: 'চালকের বিবরণ',
  addNewDriver: 'নতুন চালক যোগ করুন',
  editDriver: 'চালক সম্পাদনা করুন',
  updateDriver: 'চালক আপডেট করুন',
  deleteDriver: 'চালক মুছুন',
  driverName: 'চালকের নাম',
  driverType: 'চালকের ধরন',
  phoneNumber: 'ফোন নম্বর',
  emailAddress: 'ইমেইল ঠিকানা',
  licenseNumber: 'লাইসেন্স নম্বর',
  routeArea: 'রুট/এলাকা',
  joiningDate: 'যোগদানের তারিখ',
  performanceStatistics: 'পারফরম্যান্স পরিসংখ্যান',
  details: 'বিবরণ',
  deleting: 'মুছে ফেলা হচ্ছে...',
  salesValue: 'বিক্রয় মূল্য',
  noDailySalesDataFound:
    'খুচরা চালকদের জন্য কোন দৈনিক বিক্রয় ডেটা পাওয়া যায়নি',
  loadingDailySalesData: 'দৈনিক বিক্রয় ডেটা লোড হচ্ছে...',
  loadingDriverPerformance: 'চালকের পারফরম্যান্স লোড হচ্ছে...',

  // AddDriverForm translations
  personalInformation: 'ব্যক্তিগত তথ্য',
  fullName: 'পূর্ণ নাম',
  enterFullName: 'পূর্ণ নাম লিখুন',
  enterPhoneNumber: 'ফোন নম্বর লিখুন',
  enterEmailAddress: 'ইমেইল ঠিকানা লিখুন (ঐচ্ছিক)',
  optional: 'ঐচ্ছিক',
  enterLicenseNumber: 'লাইসেন্স নম্বর লিখুন',
  locationInformation: 'অবস্থানের তথ্য',
  enterFullAddress: 'সম্পূর্ণ ঠিকানা লিখুন',
  assignedArea: 'নির্ধারিত এলাকা',
  enterAssignedAreaRoute: 'নির্ধারিত এলাকা/রুট লিখুন',
  emergencyContact: 'জরুরি যোগাযোগ',
  contactName: 'যোগাযোগের নাম',
  enterEmergencyContactName: 'জরুরি যোগাযোগের নাম লিখুন',
  contactNumber: 'যোগাযোগ নম্বর',
  enterEmergencyContactNumber: 'জরুরি যোগাযোগ নম্বর লিখুন',
  statusAndNotes: 'অবস্থা ও নোট',
  selectStatus: 'অবস্থা নির্বাচন করুন',
  additionalNotesComments: 'অতিরিক্ত নোট বা মন্তব্য...',
  retailDriverDescription:
    'খুচরা চালকরা সরাসরি গ্রাহক বিক্রয় এবং ডেলিভারি পরিচালনা করেন',
  shipmentDriverDescription:
    'চালান চালকরা বাল্ক ট্রান্সফার এবং গুদাম অপারেশন পরিচালনা করেন',
  selectDriverType: 'চালকের ধরন নির্বাচন করুন',

  // Form validation messages for drivers
  nameMustBeAtLeast2Characters: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে',
  nameTooLong: 'নাম খুব বড়',
  phoneNumberMustBeAtLeast10Digits: 'ফোন নম্বর কমপক্ষে ১০ সংখ্যার হতে হবে',
  phoneNumberTooLong: 'ফোন নম্বর খুব বড়',
  invalidEmailAddress: 'অবৈধ ইমেইল ঠিকানা',
  licenseNumberMustBeAtLeast5Characters:
    'লাইসেন্স নম্বর কমপক্ষে ৫ অক্ষরের হতে হবে',
  licenseNumberTooLong: 'লাইসেন্স নম্বর খুব বড়',
  addressMustBeAtLeast10Characters: 'ঠিকানা কমপক্ষে ১০ অক্ষরের হতে হবে',
  addressTooLong: 'ঠিকানা খুব বড়',
  areaMustBeAtLeast2Characters: 'এলাকা কমপক্ষে ২ অক্ষরের হতে হবে',
  areaTooLong: 'এলাকা খুব বড়',
  emergencyContactMustBeAtLeast10Digits:
    'জরুরি যোগাযোগ কমপক্ষে ১০ সংখ্যার হতে হবে',
  emergencyContactTooLong: 'জরুরি যোগাযোগ খুব বড়',
  emergencyContactNameMustBeAtLeast2Characters:
    'জরুরি যোগাযোগের নাম কমপক্ষে ২ অক্ষরের হতে হবে',
  statusIsRequired: 'অবস্থা প্রয়োজন',
  driverTypeIsRequired: 'চালকের ধরন প্রয়োজন',

  // Driver deletion confirmation
  areYouSureDeleteDriver: 'আপনি কি নিশ্চিত যে চালক মুছে ফেলতে চান',
  thisActionCannotBeUndone: 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
  driverDeletedSuccessfully: 'চালক সফলভাবে মুছে ফেলা হয়েছে!',
  driverAddedSuccessfully: 'চালক সফলভাবে যোগ করা হয়েছে!',

  // Month names for driver page
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
  salesTrendStable: 'স্থিতিশীল',
  performanceTrendUp: 'উন্নতি',
  performanceTrendDown: 'অবনতি',
  performanceTrendStable: 'স্থিতিশীল',
  recentSaleActivity: 'সাম্প্রতিক বিক্রয় কার্যকলাপ',
  dashboardDataUpdated: 'ড্যাশবোর্ড ডেটা আপডেট হয়েছে',
  metricsLastUpdated: 'মেট্রিক্স সর্বশেষ আপডেট',
  liveDataFeed: 'লাইভ ডেটা ফিড',
  performanceAlert: 'পারফরম্যান্স সতর্কতা',
  stockAlert: 'স্টক সতর্কতা',
  systemNotification: 'সিস্টেম বিজ্ঞপ্তি',

  // Dashboard notifications and alerts
  newSalesActivity: 'নতুন বিক্রয় কার্যকলাপ',
  inventoryAlert: 'ইনভেন্টরি সতর্কতা',
  overduePayments: 'বকেয়া পেমেন্ট',
  targetAchieved: 'লক্ষ্য অর্জিত!',
  topPerformer: 'শীর্ষ পারফরমার',
  lowStock: 'কম স্টক',
  outOfStock: 'স্টক শেষ',
  overstock: 'অতিরিক্ত স্টক',
  movementAnomaly: 'চলাচলের অস্বাভাবিকতা',
  critical: 'গুরুতর',
  all: 'সব',
  allAlerts: 'সব সতর্কতা',
  criticalAlerts: 'গুরুতর সতর্কতা',
  warningAlerts: 'সতর্কতা সতর্কতা',
  infoAlerts: 'তথ্য সতর্কতা',
  failedToLoadInventoryAlerts: 'ইনভেন্টরি সতর্কতা লোড করতে ব্যর্থ',
  failedToLoadAlerts: 'সতর্কতা লোড করতে ব্যর্থ',

  // Inventory console messages
  fetchingCylindersSummaryData: 'সিলিন্ডার সারসংক্ষেপ ডেটা আনা হচ্ছে...',
  cylindersSummaryResponseStatus: 'সিলিন্ডার সারসংক্ষেপ রেসপন্স স্ট্যাটাস:',
  cylindersSummaryDataReceived: 'সিলিন্ডার সারসংক্ষেপ ডেটা পাওয়া গেছে:',
  cylindersSummaryApiError: 'সিলিন্ডার সারসংক্ষেপ API ত্রুটি:',
  errorFetchingInventoryData: 'ইনভেন্টরি ডেটা আনতে ত্রুটি:',
  errorFetchingDailyInventoryData: 'দৈনিক ইনভেন্টরি ডেটা আনতে ত্রুটি:',
  errorFetchingCylindersSummaryData: 'সিলিন্ডার সারসংক্ষেপ ডেটা আনতে ত্রুটি:',

  // Missing properties - providing Bengali translations (unique only)
  activeUsers: 'সক্রিয় ব্যবহারকারী',
  addUser: 'ব্যবহারকারী যোগ করুন',
  administrator: 'প্রশাসক',
  administrators: 'প্রশাসকগণ',
  ago: 'আগে',
  allCategories: 'সব ক্যাটেগরি',
  allStatus: 'সব স্ট্যাটাস',
  approved: 'অনুমোদিত',
  approvedExpenses: 'অনুমোদিত খরচ',
  approveExpense: 'খরচ অনুমোদন করুন',
  changesLog: 'পরিবর্তনের লগ',
  clear: 'পরিষ্কার',
  completeSystemAccessAndUserManagement:
    'সম্পূর্ণ সিস্টেম অ্যাক্সেস এবং ব্যবহারকারী ব্যবস্থাপনা',
  confirmDeleteUser: 'ব্যবহারকারী মুছে ফেলার নিশ্চিতকরণ',
  customers: 'গ্রাহকগণ',
  day: 'দিন',
  days: 'দিনসমূহ',
  deleteExpense: 'খরচ মুছুন',
  deleteUser: 'ব্যবহারকারী মুছুন',
  driverManagement: 'চালক ব্যবস্থাপনা',
  driverUpdatedSuccessfully: 'চালক সফলভাবে আপডেট হয়েছে',
  editExpense: 'খরচ সম্পাদনা করুন',
  editUser: 'ব্যবহারকারী সম্পাদনা করুন',
  expense: 'খরচ',
  expenseManagement: 'খরচ ব্যবস্থাপনা',
  failedToCreateUser: 'ব্যবহারকারী তৈরি করতে ব্যর্থ',
  failedToDeleteDriver: 'চালক মুছতে ব্যর্থ',
  failedToDeleteUser: 'ব্যবহারকারী মুছতে ব্যর্থ',
  failedToFetchUsers: 'ব্যবহারকারী আনতে ব্যর্থ',
  failedToUpdateDriver: 'চালক আপডেট করতে ব্যর্থ',
  failedToUpdateUser: 'ব্যবহারকারী আপডেট করতে ব্যর্থ',
  getStartedByAddingFirstExpense: 'প্রথম খরচ যোগ করে শুরু করুন',
  hour: 'ঘন্টা',
  hours: 'ঘন্টাসমূহ',
  individualDailySalesData: 'ব্যক্তিগত দৈনিক বিক্রয় ডেটা',
  justNow: 'এইমাত্র',
  lastLogin: 'শেষ লগইন',
  lastUpdated: 'সর্বশেষ আপডেট',
  manageCategories: 'ক্যাটেগরি ব্যবস্থাপনা',
  manager: 'ম্যানেজার',
  managers: 'ম্যানেজারগণ',
  needAdminPrivileges: 'প্রশাসনিক অধিকার প্রয়োজন',
  never: 'কখনও না',
  noUsersFound: 'কোন ব্যবহারকারী পাওয়া যায়নি',
  operations: 'অপারেশনসমূহ',
  pleaseLogInToAccessUserManagement:
    'ব্যবহারকারী ব্যবস্থাপনা অ্যাক্সেস করতে লগইন করুন',
  receivableManagement: 'বাকি ব্যবস্থাপনা',
  receivableRecords: 'বাকি রেকর্ডসমূহ',
  rejectExpense: 'খরচ প্রত্যাখ্যান করুন',
  rolePermissions: 'ভূমিকার অনুমতি',
  salesInventoryAndDriverManagement: 'বিক্রয়, ইনভেন্টরি এবং চালক ব্যবস্থাপনা',
  searchExpenses: 'খরচ অনুসন্ধান করুন',
  submittedBy: 'দ্বারা জমা',
  systemUsers: 'সিস্টেম ব্যবহারকারী',
  tasks: 'কাজসমূহ',
  totalUsers: 'মোট ব্যবহারকারী',
  trackExpensesAndManageBudgets: 'খরচ ট্র্যাক করুন এবং বাজেট ব্যবস্থাপনা করুন',
  updateUser: 'ব্যবহারকারী আপডেট করুন',
  updating: 'আপডেট হচ্ছে',
  user: 'ব্যবহারকারী',
  userDetails: 'ব্যবহারকারীর বিস্তারিত',
  userManagement: 'ব্যবহারকারী ব্যবস্থাপনা',
  viewDetails: 'বিস্তারিত দেখুন',
  viewingExpensesFor: 'খরচ দেখা হচ্ছে',
  viewReceipt: 'রসিদ দেখুন',

  // Final missing properties
  filterByDriverType: 'চালকের ধরন অনুযায়ী ফিল্টার করুন',
  from: 'থেকে',
  fullAccess: 'সম্পূর্ণ অ্যাক্সেস',
  inventoryManagement: 'ইনভেন্টরি ব্যবস্থাপনা',
  login: 'লগইন',
  testCredentials: 'পরীক্ষার পরিচয়পত্র',
  noActiveDriversFoundForThisPeriod:
    'এই সময়ের জন্য কোন সক্রিয় চালক পাওয়া যায়নি',
  notApplicable: 'প্রযোজ্য নয়',
  outstanding: 'বকেয়া',
  packageSalesQty: 'প্যাকেজ বিক্রয় পরিমাণ',
  parentCategory: 'প্যারেন্ট ক্যাটেগরি',
  pay: 'পেমেন্ট',
  pendingApproval: 'অনুমোদনের অপেক্ষায়',
  permissions: 'অনুমতি',
  refillSalesQty: 'রিফিল বিক্রয় পরিমাণ',
  refreshData: 'ডেটা রিফ্রেশ করুন',
  return: 'ফেরত',
  selectTime: 'সময় নির্বাচন করুন',
  to: 'পর্যন্ত',
  totalSalesQty: 'মোট বিক্রয় পরিমাণ',
  totalSalesThisMonth: 'এই মাসের মোট বিক্রয়',
  unknown: 'অজানা',
  updateExpense: 'খরচ আপডেট করুন',
  emptyCylinderReceivables: 'খালি সিলিন্ডার প্রাপ্য',
  emptyCylindersInStock: 'স্টকে খালি সিলিন্ডার',
  outstandingShipments: 'অসমাপ্ত চালান',
  noOutstandingOrders: 'কোন অসমাপ্ত অর্ডার নেই',

  // Interface properties that were not duplicated
  bn: 'বাংলা',
  en: 'ইংরেজি',
  locale: 'লোকেল',
  key: 'কী',
  value: 'মান',
  completionPercentage: 'সম্পূর্ণতার শতকরা',
  dataNotFound: 'ডেটা পাওয়া যায়নি',
  isComplete: 'সম্পূর্ণ',
  missingKeys: 'অনুপস্থিত কী',
  totalKeys: 'মোট কী',
  welcomeToOnboarding: 'welcomeToOnboarding', // TODO: Add Bengali translation
  setupYourBusinessData: 'setupYourBusinessData', // TODO: Add Bengali translation
  companyNames: 'companyNames', // TODO: Add Bengali translation
  productSetup: 'productSetup', // TODO: Add Bengali translation
  inventoryQuantities: 'inventoryQuantities', // TODO: Add Bengali translation
  driversSetup: 'driversSetup', // TODO: Add Bengali translation
  receivablesSetup: 'receivablesSetup', // TODO: Add Bengali translation
  skipOnboarding: 'skipOnboarding', // TODO: Add Bengali translation
  completing: 'completing', // TODO: Add Bengali translation
  completeSetup: 'completeSetup', // TODO: Add Bengali translation
  setupBusiness: 'setupBusiness', // TODO: Add Bengali translation
  addCompanyNames: 'addCompanyNames', // TODO: Add Bengali translation
  addCompaniesYouDistributeFor: 'addCompaniesYouDistributeFor', // TODO: Add Bengali translation
  addNewCompany: 'addNewCompany', // TODO: Add Bengali translation
  enterCompanyNamesLikeAygaz: 'enterCompanyNamesLikeAygaz', // TODO: Add Bengali translation
  companyName: 'companyName', // TODO: Add Bengali translation
  enterCompanyName: 'enterCompanyName', // TODO: Add Bengali translation
  companyNameRequired: 'companyNameRequired', // TODO: Add Bengali translation
  companyAlreadyExists: 'companyAlreadyExists', // TODO: Add Bengali translation
  addedCompanies: 'addedCompanies', // TODO: Add Bengali translation
  companiesYouDistributeFor: 'companiesYouDistributeFor', // TODO: Add Bengali translation
  noCompaniesAdded: 'noCompaniesAdded', // TODO: Add Bengali translation
  addAtLeastOneCompany: 'addAtLeastOneCompany', // TODO: Add Bengali translation
  setupProductsAndSizes: 'setupProductsAndSizes', // TODO: Add Bengali translation
  configureCylinderSizesAndProducts: 'configureCylinderSizesAndProducts', // TODO: Add Bengali translation
  cylinderSizes: 'cylinderSizes', // TODO: Add Bengali translation
  addCylinderSize: 'addCylinderSize', // TODO: Add Bengali translation
  addSizesLike12L20L: 'addSizesLike12L20L', // TODO: Add Bengali translation
  enterSizeLike12L: 'enterSizeLike12L', // TODO: Add Bengali translation
  enterDescription: 'enterDescription', // TODO: Add Bengali translation
  addSize: 'addSize', // TODO: Add Bengali translation
  cylinderSizeRequired: 'cylinderSizeRequired', // TODO: Add Bengali translation
  cylinderSizeAlreadyExists: 'cylinderSizeAlreadyExists', // TODO: Add Bengali translation
  addProduct: 'addProduct', // TODO: Add Bengali translation
  addProductsForEachCompany: 'addProductsForEachCompany', // TODO: Add Bengali translation
  productName: 'productName', // TODO: Add Bengali translation
  enterProductName: 'enterProductName', // TODO: Add Bengali translation
  currentPrice: 'currentPrice', // TODO: Add Bengali translation
  enterPrice: 'enterPrice', // TODO: Add Bengali translation
  productNameRequired: 'productNameRequired', // TODO: Add Bengali translation
  validPriceRequired: 'validPriceRequired', // TODO: Add Bengali translation
  productAlreadyExists: 'productAlreadyExists', // TODO: Add Bengali translation
  addedProducts: 'addedProducts', // TODO: Add Bengali translation
  addCylinderSizesAndProducts: 'addCylinderSizesAndProducts', // TODO: Add Bengali translation
  bothRequiredToProceed: 'bothRequiredToProceed', // TODO: Add Bengali translation
  setInitialInventory: 'setInitialInventory', // TODO: Add Bengali translation
  enterCurrentFullCylinderQuantities: 'enterCurrentFullCylinderQuantities', // TODO: Add Bengali translation
  fullCylinderInventory: 'fullCylinderInventory', // TODO: Add Bengali translation
  enterQuantityForEachProduct: 'enterQuantityForEachProduct', // TODO: Add Bengali translation
  noProductsAvailable: 'noProductsAvailable', // TODO: Add Bengali translation
  addProductsFirst: 'addProductsFirst', // TODO: Add Bengali translation
  totalProducts: 'totalProducts', // TODO: Add Bengali translation
  totalFullCylinders: 'totalFullCylinders', // TODO: Add Bengali translation
  setEmptyCylinderInventory: 'setEmptyCylinderInventory', // TODO: Add Bengali translation
  enterCurrentEmptyCylinderQuantities: 'enterCurrentEmptyCylinderQuantities', // TODO: Add Bengali translation
  emptyCylinderInventory: 'emptyCylinderInventory', // TODO: Add Bengali translation
  enterQuantityForEachSize: 'enterQuantityForEachSize', // TODO: Add Bengali translation
  noCylinderSizesAvailable: 'noCylinderSizesAvailable', // TODO: Add Bengali translation
  addCylinderSizesFirst: 'addCylinderSizesFirst', // TODO: Add Bengali translation
  totalSizes: 'totalSizes', // TODO: Add Bengali translation
  totalEmptyCylinders: 'totalEmptyCylinders', // TODO: Add Bengali translation
  addYourDrivers: 'addYourDrivers', // TODO: Add Bengali translation
  addDriversWhoWillSellProducts: 'addDriversWhoWillSellProducts', // TODO: Add Bengali translation
  enterDriverInformation: 'enterDriverInformation', // TODO: Add Bengali translation
  enterDriverName: 'enterDriverName', // TODO: Add Bengali translation
  shipmentDriver: 'shipmentDriver', // TODO: Add Bengali translation
  driverNameRequired: 'driverNameRequired', // TODO: Add Bengali translation
  driverAlreadyExists: 'driverAlreadyExists', // TODO: Add Bengali translation
  addedDrivers: 'addedDrivers', // TODO: Add Bengali translation
  driversInYourTeam: 'driversInYourTeam', // TODO: Add Bengali translation
  noContactInfo: 'noContactInfo', // TODO: Add Bengali translation
  noDriversAdded: 'noDriversAdded', // TODO: Add Bengali translation
  addAtLeastOneDriver: 'addAtLeastOneDriver', // TODO: Add Bengali translation
  setupReceivables: 'setupReceivables', // TODO: Add Bengali translation
  enterCurrentReceivablesForEachDriver: 'enterCurrentReceivablesForEachDriver', // TODO: Add Bengali translation
  driverReceivables: 'driverReceivables', // TODO: Add Bengali translation
  enterCashAndCylinderReceivables: 'enterCashAndCylinderReceivables', // TODO: Add Bengali translation
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
