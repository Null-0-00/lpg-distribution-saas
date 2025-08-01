const fs = require('fs');
const path = require('path');

// Bengali translations for common terms and patterns
const bengaliTranslations = {
  // Common actions
  save: 'সংরক্ষণ',
  cancel: 'বাতিল',
  delete: 'মুছুন',
  edit: 'সম্পাদনা',
  add: 'যোগ করুন',
  search: 'অনুসন্ধান',
  filter: 'ফিল্টার',
  loading: 'লোড হচ্ছে',
  submit: 'জমা দিন',
  confirm: 'নিশ্চিত করুন',
  view: 'দেখুন',
  print: 'প্রিন্ট',
  download: 'ডাউনলোড',
  upload: 'আপলোড',
  refresh: 'রিফ্রেশ',
  export: 'এক্সপোর্ট',
  import: 'ইমপোর্ট',
  create: 'তৈরি করুন',
  update: 'আপডেট',
  remove: 'সরান',
  close: 'বন্ধ',
  open: 'খুলুন',
  next: 'পরবর্তী',
  previous: 'পূর্ববর্তী',
  back: 'পিছনে',
  forward: 'এগিয়ে',
  select: 'নির্বাচন করুন',
  choose: 'বেছে নিন',
  enter: 'প্রবেশ করান',
  clear: 'পরিষ্কার',
  reset: 'রিসেট',
  apply: 'প্রয়োগ করুন',
  approve: 'অনুমোদন',
  reject: 'প্রত্যাখ্যান',
  enable: 'সক্রিয় করুন',
  disable: 'নিষ্ক্রিয় করুন',
  activate: 'সক্রিয় করুন',
  deactivate: 'নিষ্ক্রিয় করুন',
  show: 'দেখান',
  hide: 'লুকান',
  expand: 'প্রসারিত করুন',
  collapse: 'সংকুচিত করুন',
  copy: 'কপি',
  paste: 'পেস্ট',
  cut: 'কাট',
  undo: 'পূর্বাবস্থায় ফিরুন',
  redo: 'পুনরায় করুন',

  // Common nouns
  name: 'নাম',
  email: 'ইমেইল',
  phone: 'ফোন',
  address: 'ঠিকানা',
  description: 'বিবরণ',
  amount: 'পরিমাণ',
  quantity: 'পরিমাণ',
  price: 'দাম',
  cost: 'খরচ',
  total: 'মোট',
  date: 'তারিখ',
  time: 'সময়',
  status: 'অবস্থা',
  type: 'ধরন',
  category: 'বিভাগ',
  product: 'পণ্য',
  service: 'সেবা',
  customer: 'গ্রাহক',
  user: 'ব্যবহারকারী',
  driver: 'চালক',
  company: 'কোম্পানি',
  business: 'ব্যবসা',
  order: 'অর্ডার',
  invoice: 'চালান',
  payment: 'পেমেন্ট',
  receipt: 'রসিদ',
  report: 'রিপোর্ট',
  data: 'তথ্য',
  information: 'তথ্য',
  details: 'বিস্তারিত',
  summary: 'সারসংক্ষেপ',
  overview: 'সংক্ষিপ্ত বিবরণ',
  dashboard: 'ড্যাশবোর্ড',
  settings: 'সেটিংস',
  profile: 'প্রোফাইল',
  account: 'অ্যাকাউন্ট',
  password: 'পাসওয়ার্ড',
  username: 'ব্যবহারকারীর নাম',
  login: 'লগইন',
  logout: 'লগআউট',
  register: 'নিবন্ধন',
  signup: 'সাইন আপ',
  signin: 'সাইন ইন',

  // Business terms
  sales: 'বিক্রয়',
  purchase: 'ক্রয়',
  inventory: 'মজুদ',
  stock: 'স্টক',
  warehouse: 'গুদাম',
  supplier: 'সরবরাহকারী',
  vendor: 'বিক্রেতা',
  distributor: 'পরিবেশক',
  retailer: 'খুচরা বিক্রেতা',
  wholesale: 'পাইকারি',
  retail: 'খুচরা',
  profit: 'লাভ',
  loss: 'ক্ষতি',
  revenue: 'আয়',
  expense: 'খরচ',
  income: 'আয়',
  expenditure: 'ব্যয়',
  budget: 'বাজেট',
  finance: 'অর্থ',
  accounting: 'হিসাবরক্ষণ',
  tax: 'কর',
  discount: 'ছাড়',
  commission: 'কমিশন',
  bonus: 'বোনাস',
  salary: 'বেতন',
  wage: 'মজুরি',

  // LPG specific terms
  cylinder: 'সিলিন্ডার',
  gas: 'গ্যাস',
  lpg: 'এলপিজি',
  refill: 'রিফিল',
  package: 'প্যাকেজ',
  empty: 'খালি',
  full: 'পূর্ণ',
  delivery: 'ডেলিভারি',
  shipment: 'চালান',
  transport: 'পরিবহন',
  vehicle: 'যানবাহন',
  route: 'রুট',
  area: 'এলাকা',
  zone: 'অঞ্চল',
  region: 'অঞ্চল',
  location: 'অবস্থান',
  destination: 'গন্তব্য',
  source: 'উৎস',
  origin: 'মূল',

  // Status terms
  active: 'সক্রিয়',
  inactive: 'নিষ্ক্রিয়',
  pending: 'অপেক্ষমাণ',
  approved: 'অনুমোদিত',
  rejected: 'প্রত্যাখ্যাত',
  completed: 'সম্পন্ন',
  cancelled: 'বাতিল',
  processing: 'প্রক্রিয়াকরণ',
  shipped: 'পাঠানো হয়েছে',
  delivered: 'ডেলিভার হয়েছে',
  returned: 'ফেরত',
  refunded: 'ফেরত দেওয়া হয়েছে',
  paid: 'পরিশোধিত',
  unpaid: 'অপরিশোধিত',
  overdue: 'বকেয়া',
  due: 'প্রদেয়',
  available: 'উপলব্ধ',
  unavailable: 'অনুপলব্ধ',
  online: 'অনলাইন',
  offline: 'অফলাইন',
  connected: 'সংযুক্ত',
  disconnected: 'সংযোগ বিচ্ছিন্ন',

  // Time related
  today: 'আজ',
  yesterday: 'গতকাল',
  tomorrow: 'আগামীকাল',
  week: 'সপ্তাহ',
  month: 'মাস',
  year: 'বছর',
  day: 'দিন',
  hour: 'ঘন্টা',
  minute: 'মিনিট',
  second: 'সেকেন্ড',
  morning: 'সকাল',
  afternoon: 'বিকাল',
  evening: 'সন্ধ্যা',
  night: 'রাত',
  now: 'এখন',
  later: 'পরে',
  soon: 'শীঘ্রই',
  recent: 'সাম্প্রতিক',
  latest: 'সর্বশেষ',
  current: 'বর্তমান',
  past: 'অতীত',
  future: 'ভবিষ্যৎ',

  // Common phrases
  please: 'অনুগ্রহ করে',
  'thank you': 'ধন্যবাদ',
  welcome: 'স্বাগতম',
  hello: 'হ্যালো',
  goodbye: 'বিদায়',
  yes: 'হ্যাঁ',
  no: 'না',
  ok: 'ঠিক আছে',
  okay: 'ঠিক আছে',
  sure: 'নিশ্চিত',
  maybe: 'হয়তো',
  perhaps: 'সম্ভবত',
  definitely: 'অবশ্যই',
  certainly: 'নিশ্চিতভাবে',
  absolutely: 'একেবারে',
  exactly: 'ঠিক',
  correct: 'সঠিক',
  wrong: 'ভুল',
  right: 'ডান',
  left: 'বাম',
  up: 'উপরে',
  down: 'নিচে',
  top: 'শীর্ষ',
  bottom: 'নিচ',
  first: 'প্রথম',
  last: 'শেষ',
  new: 'নতুন',
  old: 'পুরানো',
  good: 'ভাল',
  bad: 'খারাপ',
  best: 'সেরা',
  worst: 'সবচেয়ে খারাপ',
  better: 'আরও ভাল',
  worse: 'আরও খারাপ',
  more: 'আরও',
  less: 'কম',
  most: 'সবচেয়ে বেশি',
  least: 'সবচেয়ে কম',
  all: 'সব',
  none: 'কোনটিই না',
  some: 'কিছু',
  any: 'যেকোনো',
  every: 'প্রতিটি',
  each: 'প্রতিটি',
  both: 'উভয়',
  either: 'যেকোনো একটি',
  neither: 'কোনটিই না',
  other: 'অন্য',
  another: 'আরেকটি',
  same: 'একই',
  different: 'ভিন্ন',
  similar: 'অনুরূপ',
  equal: 'সমান',
  unequal: 'অসমান',
  high: 'উচ্চ',
  low: 'নিম্ন',
  big: 'বড়',
  small: 'ছোট',
  large: 'বড়',
  tiny: 'ক্ষুদ্র',
  huge: 'বিশাল',
  empty: 'খালি',
  full: 'পূর্ণ',
  open: 'খোলা',
  closed: 'বন্ধ',
  public: 'পাবলিক',
  private: 'ব্যক্তিগত',
  free: 'বিনামূল্যে',
  paid: 'পেইড',
  premium: 'প্রিমিয়াম',
  basic: 'মৌলিক',
  advanced: 'উন্নত',
  simple: 'সহজ',
  complex: 'জটিল',
  easy: 'সহজ',
  difficult: 'কঠিন',
  hard: 'কঠিন',
  soft: 'নরম',
  fast: 'দ্রুত',
  slow: 'ধীর',
  quick: 'দ্রুত',
  instant: 'তাৎক্ষণিক',
  immediate: 'তাৎক্ষণিক',
  urgent: 'জরুরি',
  important: 'গুরুত্বপূর্ণ',
  critical: 'সমালোচনামূলক',
  normal: 'স্বাভাবিক',
  regular: 'নিয়মিত',
  special: 'বিশেষ',
  unique: 'অনন্য',
  common: 'সাধারণ',
  rare: 'বিরল',
  popular: 'জনপ্রিয়',
  famous: 'বিখ্যাত',
  unknown: 'অজানা',
  known: 'পরিচিত',
  clear: 'পরিষ্কার',
  unclear: 'অস্পষ্ট',
  visible: 'দৃশ্যমান',
  invisible: 'অদৃশ্য',
  available: 'উপলব্ধ',
  unavailable: 'অনুপলব্ধ',
  ready: 'প্রস্তুত',
  'not ready': 'প্রস্তুত নয়',
  complete: 'সম্পূর্ণ',
  incomplete: 'অসম্পূর্ণ',
  finished: 'সমাপ্ত',
  unfinished: 'অসমাপ্ত',
  started: 'শুরু হয়েছে',
  stopped: 'বন্ধ হয়েছে',
  paused: 'বিরতি',
  resumed: 'পুনরায় শুরু',
  continued: 'অব্যাহত',
  ended: 'শেষ হয়েছে',
  begun: 'শুরু হয়েছে',
  ongoing: 'চলমান',
  upcoming: 'আসন্ন',
  scheduled: 'নির্ধারিত',
  planned: 'পরিকল্পিত',
  expected: 'প্রত্যাশিত',
  unexpected: 'অপ্রত্যাশিত',
  required: 'প্রয়োজনীয়',
  optional: 'ঐচ্ছিক',
  mandatory: 'বাধ্যতামূলক',
  forbidden: 'নিষিদ্ধ',
  allowed: 'অনুমতিপ্রাপ্ত',
  permitted: 'অনুমতিপ্রাপ্ত',
  denied: 'প্রত্যাখ্যাত',
  granted: 'মঞ্জুর',
  authorized: 'অনুমোদিত',
  unauthorized: 'অননুমোদিত',
  valid: 'বৈধ',
  invalid: 'অবৈধ',
  correct: 'সঠিক',
  incorrect: 'ভুল',
  true: 'সত্য',
  false: 'মিথ্যা',
  real: 'বাস্তব',
  fake: 'নকল',
  original: 'মূল',
  copy: 'কপি',
  duplicate: 'ডুপ্লিকেট',
  unique: 'অনন্য',
  standard: 'মানক',
  custom: 'কাস্টম',
  default: 'ডিফল্ট',
  automatic: 'স্বয়ংক্রিয়',
  manual: 'ম্যানুয়াল',
  system: 'সিস্টেম',
  user: 'ব্যবহারকারী',
  admin: 'অ্যাডমিন',
  guest: 'অতিথি',
  member: 'সদস্য',
  owner: 'মালিক',
  manager: 'ম্যানেজার',
  employee: 'কর্মচারী',
  staff: 'কর্মী',
  team: 'দল',
  group: 'গ্রুপ',
  organization: 'সংস্থা',
  department: 'বিভাগ',
  division: 'বিভাগ',
  section: 'বিভাগ',
  unit: 'ইউনিট',
  branch: 'শাখা',
  office: 'অফিস',
  headquarters: 'সদর দপ্তর',
  factory: 'কারখানা',
  plant: 'প্ল্যান্ট',
  facility: 'সুবিধা',
  building: 'ভবন',
  floor: 'তলা',
  room: 'রুম',
  hall: 'হল',
  space: 'স্থান',
  place: 'জায়গা',
  position: 'অবস্থান',
  site: 'সাইট',
  page: 'পৃষ্ঠা',
  screen: 'স্ক্রিন',
  window: 'উইন্ডো',
  tab: 'ট্যাব',
  menu: 'মেনু',
  option: 'অপশন',
  choice: 'পছন্দ',
  selection: 'নির্বাচন',
  preference: 'পছন্দ',
  setting: 'সেটিং',
  configuration: 'কনফিগারেশন',
  setup: 'সেটআপ',
  installation: 'ইনস্টলেশন',
  upgrade: 'আপগ্রেড',
  downgrade: 'ডাউনগ্রেড',
  version: 'সংস্করণ',
  release: 'রিলিজ',
  update: 'আপডেট',
  patch: 'প্যাচ',
  fix: 'ফিক্স',
  bug: 'বাগ',
  error: 'ত্রুটি',
  issue: 'সমস্যা',
  problem: 'সমস্যা',
  solution: 'সমাধান',
  answer: 'উত্তর',
  question: 'প্রশ্ন',
  help: 'সাহায্য',
  support: 'সহায়তা',
  assistance: 'সহায়তা',
  service: 'সেবা',
  feature: 'বৈশিষ্ট্য',
  function: 'ফাংশন',
  tool: 'টুল',
  utility: 'ইউটিলিটি',
  application: 'অ্যাপ্লিকেশন',
  program: 'প্রোগ্রাম',
  software: 'সফটওয়্যার',
  hardware: 'হার্ডওয়্যার',
  device: 'ডিভাইস',
  machine: 'মেশিন',
  equipment: 'সরঞ্জাম',
  instrument: 'যন্ত্র',
  component: 'উপাদান',
  part: 'অংশ',
  piece: 'টুকরা',
  item: 'আইটেম',
  object: 'অবজেক্ট',
  thing: 'জিনিস',
  stuff: 'জিনিসপত্র',
  material: 'উপাদান',
  substance: 'পদার্থ',
  element: 'উপাদান',
  factor: 'ফ্যাক্টর',
  aspect: 'দিক',
  feature: 'বৈশিষ্ট্য',
  characteristic: 'বৈশিষ্ট্য',
  property: 'সম্পত্তি',
  attribute: 'বৈশিষ্ট্য',
  quality: 'গুণমান',
  value: 'মান',
  worth: 'মূল্য',
  benefit: 'সুবিধা',
  advantage: 'সুবিধা',
  disadvantage: 'অসুবিধা',
  pro: 'পক্ষে',
  con: 'বিপক্ষে',
  positive: 'ইতিবাচক',
  negative: 'নেতিবাচক',
  neutral: 'নিরপেক্ষ',
  balanced: 'সুষম',
  fair: 'ন্যায্য',
  unfair: 'অন্যায্য',
  just: 'ন্যায্য',
  unjust: 'অন্যায্য',
  legal: 'আইনি',
  illegal: 'অবৈধ',
  lawful: 'আইনসম্মত',
  unlawful: 'আইনবিরোধী',
  official: 'অফিসিয়াল',
  unofficial: 'অনানুষ্ঠানিক',
  formal: 'আনুষ্ঠানিক',
  informal: 'অনানুষ্ঠানিক',
  professional: 'পেশাদার',
  personal: 'ব্যক্তিগত',
  business: 'ব্যবসায়িক',
  commercial: 'বাণিজ্যিক',
  industrial: 'শিল্প',
  residential: 'আবাসিক',
  domestic: 'গার্হস্থ্য',
  international: 'আন্তর্জাতিক',
  national: 'জাতীয়',
  local: 'স্থানীয়',
  regional: 'আঞ্চলিক',
  global: 'বিশ্বব্যাপী',
  worldwide: 'বিশ্বব্যাপী',
  universal: 'সর্বজনীন',
  general: 'সাধারণ',
  specific: 'নির্দিষ্ট',
  particular: 'বিশেষ',
  individual: 'ব্যক্তিগত',
  collective: 'সমষ্টিগত',
  joint: 'যৌথ',
  shared: 'ভাগাভাগি',
  common: 'সাধারণ',
  mutual: 'পারস্পরিক',
  reciprocal: 'পারস্পরিক',
  bilateral: 'দ্বিপাক্ষিক',
  multilateral: 'বহুপাক্ষিক',
  unilateral: 'একপাক্ষিক',
  single: 'একক',
  double: 'দ্বিগুণ',
  triple: 'তিনগুণ',
  multiple: 'একাধিক',
  several: 'কয়েকটি',
  many: 'অনেক',
  few: 'কয়েকটি',
  little: 'সামান্য',
  much: 'অনেক',
  lot: 'অনেক',
  plenty: 'প্রচুর',
  enough: 'যথেষ্ট',
  sufficient: 'পর্যাপ্ত',
  insufficient: 'অপর্যাপ্ত',
  adequate: 'পর্যাপ্ত',
  inadequate: 'অপর্যাপ্ত',
  excess: 'অতিরিক্ত',
  shortage: 'ঘাটতি',
  surplus: 'উদ্বৃত্ত',
  deficit: 'ঘাটতি',
  balance: 'ভারসাম্য',
  imbalance: 'ভারসাম্যহীনতা',
  stability: 'স্থিতিশীলতা',
  instability: 'অস্থিরতা',
  consistency: 'সামঞ্জস্য',
  inconsistency: 'অসামঞ্জস্য',
  reliability: 'নির্ভরযোগ্যতা',
  unreliability: 'অনির্ভরযোগ্যতা',
  dependability: 'নির্ভরযোগ্যতা',
  independence: 'স্বাধীনতা',
  dependence: 'নির্ভরতা',
  freedom: 'স্বাধীনতা',
  restriction: 'সীমাবদ্ধতা',
  limitation: 'সীমাবদ্ধতা',
  constraint: 'সীমাবদ্ধতা',
  boundary: 'সীমানা',
  limit: 'সীমা',
  range: 'পরিসীমা',
  scope: 'পরিধি',
  extent: 'পরিমাণ',
  degree: 'ডিগ্রি',
  level: 'স্তর',
  grade: 'গ্রেড',
  rank: 'র‍্যাঙ্ক',
  position: 'অবস্থান',
  status: 'অবস্থা',
  condition: 'অবস্থা',
  situation: 'পরিস্থিতি',
  circumstance: 'পরিস্থিতি',
  context: 'প্রসঙ্গ',
  background: 'পটভূমি',
  history: 'ইতিহাস',
  record: 'রেকর্ড',
  log: 'লগ',
  file: 'ফাইল',
  document: 'নথি',
  paper: 'কাগজ',
  form: 'ফর্ম',
  application: 'আবেদন',
  request: 'অনুরোধ',
  demand: 'চাহিদা',
  requirement: 'প্রয়োজনীয়তা',
  need: 'প্রয়োজন',
  want: 'চাওয়া',
  desire: 'ইচ্ছা',
  wish: 'ইচ্ছা',
  hope: 'আশা',
  expectation: 'প্রত্যাশা',
  goal: 'লক্ষ্য',
  objective: 'উদ্দেশ্য',
  target: 'লক্ষ্য',
  aim: 'লক্ষ্য',
  purpose: 'উদ্দেশ্য',
  intention: 'অভিপ্রায়',
  plan: 'পরিকল্পনা',
  strategy: 'কৌশল',
  approach: 'পদ্ধতি',
  method: 'পদ্ধতি',
  way: 'উপায়',
  means: 'উপায়',
  process: 'প্রক্রিয়া',
  procedure: 'পদ্ধতি',
  step: 'ধাপ',
  stage: 'পর্যায়',
  phase: 'পর্যায়',
  period: 'সময়কাল',
  duration: 'সময়কাল',
  length: 'দৈর্ঘ্য',
  width: 'প্রস্থ',
  height: 'উচ্চতা',
  depth: 'গভীরতা',
  size: 'আকার',
  dimension: 'মাত্রা',
  measurement: 'পরিমাপ',
  scale: 'স্কেল',
  proportion: 'অনুপাত',
  ratio: 'অনুপাত',
  percentage: 'শতাংশ',
  fraction: 'ভগ্নাংশ',
  decimal: 'দশমিক',
  number: 'সংখ্যা',
  figure: 'সংখ্যা',
  digit: 'অঙ্ক',
  count: 'গণনা',
  calculation: 'গণনা',
  computation: 'গণনা',
  result: 'ফলাফল',
  outcome: 'ফলাফল',
  consequence: 'পরিণতি',
  effect: 'প্রভাব',
  impact: 'প্রভাব',
  influence: 'প্রভাব',
  power: 'শক্তি',
  force: 'বল',
  strength: 'শক্তি',
  weakness: 'দুর্বলতা',
  advantage: 'সুবিধা',
  disadvantage: 'অসুবিধা',
  opportunity: 'সুযোগ',
  threat: 'হুমকি',
  risk: 'ঝুঁকি',
  danger: 'বিপদ',
  safety: 'নিরাপত্তা',
  security: 'নিরাপত্তা',
  protection: 'সুরক্ষা',
  defense: 'প্রতিরক্ষা',
  attack: 'আক্রমণ',
  offense: 'অপরাধ',
  crime: 'অপরাধ',
  violation: 'লঙ্ঘন',
  breach: 'লঙ্ঘন',
  infringement: 'লঙ্ঘন',
  compliance: 'সম্মতি',
  adherence: 'আনুগত্য',
  obedience: 'আনুগত্য',
  disobedience: 'অবাধ্যতা',
  rebellion: 'বিদ্রোহ',
  resistance: 'প্রতিরোধ',
  opposition: 'বিরোধিতা',
  support: 'সমর্থন',
  backing: 'সমর্থন',
  endorsement: 'সমর্থন',
  approval: 'অনুমোদন',
  disapproval: 'অসম্মতি',
  rejection: 'প্রত্যাখ্যান',
  acceptance: 'গ্রহণযোগ্যতা',
  agreement: 'চুক্তি',
  disagreement: 'মতবিরোধ',
  conflict: 'দ্বন্দ্ব',
  dispute: 'বিরোধ',
  argument: 'তর্ক',
  debate: 'বিতর্ক',
  discussion: 'আলোচনা',
  conversation: 'কথোপকথন',
  dialogue: 'সংলাপ',
  communication: 'যোগাযোগ',
  message: 'বার্তা',
  notification: 'বিজ্ঞপ্তি',
  alert: 'সতর্কতা',
  warning: 'সতর্কবাণী',
  reminder: 'অনুস্মারক',
  notice: 'নোটিশ',
  announcement: 'ঘোষণা',
  declaration: 'ঘোষণা',
  statement: 'বিবৃতি',
  comment: 'মন্তব্য',
  remark: 'মন্তব্য',
  observation: 'পর্যবেক্ষণ',
  note: 'নোট',
  memo: 'মেমো',
  letter: 'চিঠি',
  email: 'ইমেইল',
  call: 'কল',
  meeting: 'মিটিং',
  conference: 'সম্মেলন',
  session: 'সেশন',
  appointment: 'অ্যাপয়েন্টমেন্ট',
  schedule: 'সময়সূচী',
  calendar: 'ক্যালেন্ডার',
  agenda: 'এজেন্ডা',
  program: 'প্রোগ্রাম',
  event: 'ইভেন্ট',
  activity: 'কার্যকলাপ',
  action: 'কর্ম',
  task: 'কাজ',
  job: 'চাকরি',
  work: 'কাজ',
  duty: 'দায়িত্ব',
  responsibility: 'দায়বদ্ধতা',
  obligation: 'বাধ্যবাধকতা',
  commitment: 'প্রতিশ্রুতি',
  promise: 'প্রতিশ্রুতি',
  guarantee: 'গ্যারান্টি',
  warranty: 'ওয়ারেন্টি',
  assurance: 'আশ্বাস',
  confidence: 'আত্মবিশ্বাস',
  trust: 'বিশ্বাস',
  faith: 'বিশ্বাস',
  belief: 'বিশ্বাস',
  opinion: 'মতামত',
  view: 'দৃষ্টিভঙ্গি',
  perspective: 'দৃষ্টিভঙ্গি',
  viewpoint: 'দৃষ্টিভঙ্গি',
  standpoint: 'অবস্থান',
  position: 'অবস্থান',
  stance: 'অবস্থান',
  attitude: 'মনোভাব',
  approach: 'পদ্ধতি',
  behavior: 'আচরণ',
  conduct: 'আচরণ',
  manner: 'পদ্ধতি',
  style: 'স্টাইল',
  fashion: 'ফ্যাশন',
  trend: 'ট্রেন্ড',
  pattern: 'প্যাটার্ন',
  model: 'মডেল',
  example: 'উদাহরণ',
  instance: 'উদাহরণ',
  case: 'কেস',
  scenario: 'পরিস্থিতি',
  situation: 'পরিস্থিতি',
  condition: 'অবস্থা',
  state: 'রাজ্য',
  country: 'দেশ',
  nation: 'জাতি',
  government: 'সরকার',
  authority: 'কর্তৃপক্ষ',
  power: 'ক্ষমতা',
  control: 'নিয়ন্ত্রণ',
  management: 'ব্যবস্থাপনা',
  administration: 'প্রশাসন',
  leadership: 'নেতৃত্ব',
  guidance: 'নির্দেশনা',
  direction: 'দিকনির্দেশনা',
  instruction: 'নির্দেশ',
  command: 'কমান্ড',
  order: 'আদেশ',
  request: 'অনুরোধ',
  suggestion: 'পরামর্শ',
  recommendation: 'সুপারিশ',
  advice: 'পরামর্শ',
  tip: 'টিপ',
  hint: 'ইঙ্গিত',
  clue: 'সূত্র',
  sign: 'চিহ্ন',
  symbol: 'প্রতীক',
  mark: 'চিহ্ন',
  label: 'লেবেল',
  tag: 'ট্যাগ',
  title: 'শিরোনাম',
  heading: 'শিরোনাম',
  caption: 'ক্যাপশন',
  description: 'বিবরণ',
  explanation: 'ব্যাখ্যা',
  definition: 'সংজ্ঞা',
  meaning: 'অর্থ',
  sense: 'অর্থ',
  significance: 'তাৎপর্য',
  importance: 'গুরুত্ব',
  relevance: 'প্রাসঙ্গিকতা',
  connection: 'সংযোগ',
  relationship: 'সম্পর্ক',
  association: 'সংস্থা',
  partnership: 'অংশীদারিত্ব',
  collaboration: 'সহযোগিতা',
  cooperation: 'সহযোগিতা',
  teamwork: 'দলগত কাজ',
  unity: 'ঐক্য',
  harmony: 'সামঞ্জস্য',
  peace: 'শান্তি',
  war: 'যুদ্ধ',
  battle: 'যুদ্ধ',
  fight: 'লড়াই',
  struggle: 'সংগ্রাম',
  effort: 'প্রচেষ্টা',
  attempt: 'চেষ্টা',
  try: 'চেষ্টা',
  trial: 'পরীক্ষা',
  test: 'পরীক্ষা',
  exam: 'পরীক্ষা',
  assessment: 'মূল্যায়ন',
  evaluation: 'মূল্যায়ন',
  review: 'পর্যালোচনা',
  analysis: 'বিশ্লেষণ',
  study: 'অধ্যয়ন',
  research: 'গবেষণা',
  investigation: 'তদন্ত',
  inquiry: 'অনুসন্ধান',
  survey: 'সমীক্ষা',
  poll: 'জরিপ',
  vote: 'ভোট',
  election: 'নির্বাচন',
  choice: 'পছন্দ',
  decision: 'সিদ্ধান্ত',
  conclusion: 'উপসংহার',
  end: 'শেষ',
  finish: 'সমাপ্তি',
  completion: 'সমাপ্তি',
  achievement: 'অর্জন',
  accomplishment: 'সাফল্য',
  success: 'সাফল্য',
  failure: 'ব্যর্থতা',
  mistake: 'ভুল',
  fault: 'দোষ',
  blame: 'দোষ',
  credit: 'ক্রেডিট',
  praise: 'প্রশংসা',
  criticism: 'সমালোচনা',
  feedback: 'প্রতিক্রিয়া',
  response: 'প্রতিক্রিয়া',
  reply: 'উত্তর',
  answer: 'উত্তর',
  solution: 'সমাধান',
  resolution: 'সমাধান',
  fix: 'সমাধান',
  repair: 'মেরামত',
  maintenance: 'রক্ষণাবেক্ষণ',
  service: 'সেবা',
  care: 'যত্ন',
  attention: 'মনোযোগ',
  focus: 'ফোকাস',
  concentration: 'একাগ্রতা',
  dedication: 'নিবেদন',
  commitment: 'প্রতিশ্রুতি',
  loyalty: 'আনুগত্য',
  faithfulness: 'বিশ্বস্ততা',
  honesty: 'সততা',
  integrity: 'সততা',
  sincerity: 'আন্তরিকতা',
  genuineness: 'সত্যতা',
  authenticity: 'সত্যতা',
  originality: 'মৌলিকত্ব',
  creativity: 'সৃজনশীলতা',
  innovation: 'উদ্ভাবন',
  invention: 'আবিষ্কার',
  discovery: 'আবিষ্কার',
  finding: 'অনুসন্ধান',
  exploration: 'অন্বেষণ',
  adventure: 'অ্যাডভেঞ্চার',
  journey: 'যাত্রা',
  trip: 'ভ্রমণ',
  travel: 'ভ্রমণ',
  movement: 'আন্দোলন',
  motion: 'গতি',
  speed: 'গতি',
  velocity: 'বেগ',
  acceleration: 'ত্বরণ',
  deceleration: 'মন্দন',
  stop: 'থামুন',
  pause: 'বিরতি',
  break: 'বিরতি',
  rest: 'বিশ্রাম',
  sleep: 'ঘুম',
  wake: 'জাগা',
  awake: 'জাগ্রত',
  alert: 'সতর্ক',
  aware: 'সচেতন',
  conscious: 'সচেতন',
  unconscious: 'অচেতন',
  subconscious: 'অবচেতন',
  mind: 'মন',
  brain: 'মস্তিষ্ক',
  thought: 'চিন্তা',
  idea: 'ধারণা',
  concept: 'ধারণা',
  notion: 'ধারণা',
  understanding: 'বোঝাপড়া',
  comprehension: 'বোধগম্যতা',
  knowledge: 'জ্ঞান',
  wisdom: 'প্রজ্ঞা',
  intelligence: 'বুদ্ধিমত্তা',
  smartness: 'চতুরতা',
  cleverness: 'চতুরতা',
  skill: 'দক্ষতা',
  ability: 'ক্ষমতা',
  capability: 'সক্ষমতা',
  capacity: 'ক্ষমতা',
  potential: 'সম্ভাবনা',
  possibility: 'সম্ভাবনা',
  probability: 'সম্ভাবনা',
  chance: 'সুযোগ',
  luck: 'ভাগ্য',
  fortune: 'ভাগ্য',
  destiny: 'ভাগ্য',
  fate: 'ভাগ্য',
  future: 'ভবিষ্যৎ',
  past: 'অতীত',
  present: 'বর্তমান',
  now: 'এখন',
  then: 'তখন',
  when: 'কখন',
  where: 'কোথায়',
  what: 'কি',
  who: 'কে',
  why: 'কেন',
  how: 'কিভাবে',
  which: 'কোনটি',
  whose: 'কার',
  whom: 'কাকে',
};

// Function to convert camelCase to readable text
function camelCaseToReadable(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Function to translate English text to Bengali
function translateToBengali(englishText) {
  const lowerText = englishText.toLowerCase();

  // Direct translation lookup
  if (bengaliTranslations[lowerText]) {
    return bengaliTranslations[lowerText];
  }

  // Try to find partial matches for compound words
  for (const [english, bengali] of Object.entries(bengaliTranslations)) {
    if (lowerText.includes(english)) {
      return lowerText.replace(new RegExp(english, 'gi'), bengali);
    }
  }

  // If no translation found, return a placeholder
  return `${englishText} (বাংলা অনুবাদ প্রয়োজন)`;
}

// Function to generate Bengali translation from property name
function generateBengaliTranslation(propertyName, englishValue) {
  // First try to translate the English value
  const translatedValue = translateToBengali(englishValue);

  // If we got a good translation, return it
  if (!translatedValue.includes('(বাংলা অনুবাদ প্রয়োজন)')) {
    return translatedValue;
  }

  // Otherwise, try to translate based on property name patterns
  const readable = camelCaseToReadable(propertyName);

  // Special patterns
  if (propertyName.includes('Placeholder')) {
    const base = propertyName.replace('Placeholder', '');
    const baseReadable = camelCaseToReadable(base);
    const translated = translateToBengali(baseReadable);
    return `${translated} লিখুন...`;
  }

  if (propertyName.includes('Required')) {
    const base = propertyName.replace('Required', '');
    const baseReadable = camelCaseToReadable(base);
    const translated = translateToBengali(baseReadable);
    return `${translated} প্রয়োজনীয়`;
  }

  if (propertyName.includes('Failed')) {
    const base = propertyName.replace(/^failedTo/, '').replace(/^Failed/, '');
    const baseReadable = camelCaseToReadable(base);
    const translated = translateToBengali(baseReadable);
    return `${translated} ব্যর্থ`;
  }

  if (propertyName.includes('Loading')) {
    const base = propertyName.replace('Loading', '');
    const baseReadable = camelCaseToReadable(base);
    const translated = translateToBengali(baseReadable);
    return `${translated} লোড হচ্ছে...`;
  }

  if (propertyName.includes('Error')) {
    const base = propertyName.replace('Error', '');
    const baseReadable = camelCaseToReadable(base);
    const translated = translateToBengali(baseReadable);
    return `${translated} ত্রুটি`;
  }

  if (propertyName.includes('Success')) {
    const base = propertyName.replace(/Success.*$/, '');
    const baseReadable = camelCaseToReadable(base);
    const translated = translateToBengali(baseReadable);
    return `${translated} সফল`;
  }

  // Try direct translation of the readable text
  return translateToBengali(readable);
}

try {
  console.log('Starting Bengali translation process...');

  // Read the translations file
  const translationsPath = path.join(__dirname, 'src/lib/i18n/translations.ts');
  const content = fs.readFileSync(translationsPath, 'utf8');

  // Find all Bengali placeholder values
  const placeholderRegex =
    /(\w+):\s*'(\w+_bn)',?\s*\/\/\s*TODO:\s*Add Bengali translation/g;
  const placeholders = [];
  let match;

  while ((match = placeholderRegex.exec(content)) !== null) {
    placeholders.push({
      property: match[1],
      placeholder: match[2],
      fullMatch: match[0],
    });
  }

  console.log(`Found ${placeholders.length} Bengali placeholders to translate`);

  if (placeholders.length === 0) {
    console.log('No Bengali placeholders found!');
    return;
  }

  // Get corresponding English values
  const englishTranslationsMatch = content.match(
    /const englishTranslations: Translations = \{([\s\S]*?)\};/
  );
  if (!englishTranslationsMatch) {
    throw new Error('Could not find English translations');
  }

  const englishContent = englishTranslationsMatch[1];

  // Process each placeholder
  let updatedContent = content;
  let translatedCount = 0;

  for (const placeholder of placeholders) {
    // Find the corresponding English value
    const englishMatch = englishContent.match(
      new RegExp(`${placeholder.property}:\\s*'([^']*)'`)
    );
    const englishValue = englishMatch ? englishMatch[1] : '';

    // Generate Bengali translation
    const bengaliTranslation = generateBengaliTranslation(
      placeholder.property,
      englishValue
    );

    // Replace the placeholder
    const newLine = `${placeholder.property}: '${bengaliTranslation}',`;
    updatedContent = updatedContent.replace(placeholder.fullMatch, newLine);

    translatedCount++;

    if (translatedCount % 100 === 0) {
      console.log(
        `Translated ${translatedCount}/${placeholders.length} properties...`
      );
    }
  }

  // Write the updated content
  fs.writeFileSync(translationsPath, updatedContent);

  console.log(
    `✅ Successfully translated ${translatedCount} Bengali properties!`
  );
  console.log('Bengali translation process completed.');
} catch (error) {
  console.error('❌ Error translating Bengali placeholders:', error.message);
  process.exit(1);
}
