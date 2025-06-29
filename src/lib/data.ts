

export type User = {
  id: string;
  username: string;
  name: string;
  role: 'Admin' | 'Cashier';
  email: string;
  status: 'Active' | 'Inactive';
};

export const users: User[] = [
    { id: 'user-001', username: 'admin', name: 'Mr Admin', role: 'Admin', email: 'admin@example.com', status: 'Active' },
    { id: 'user-002', username: 'admin-essentials', name: 'Mr Admin Essential', role: 'Admin', email: 'admin_essentials@example.com', status: 'Active' },
    { id: 'user-003', username: 'cashier', name: 'Mr Demo Cashier', role: 'Cashier', email: 'cashier@example.com', status: 'Active' },
    { id: 'user-004', username: 'demo-admin', name: 'Mr. Demo Admin', role: 'Admin', email: 'demoadmin@example.com', status: 'Active' },
    { id: 'user-005', username: 'superadmin', name: 'Mr. Super Admin', role: 'Admin', email: 'superadmin@example.com', status: 'Active' },
    { id: 'user-006', username: 'woocommerce_user', name: 'Mr. WooCommerce User', role: 'Admin', email: 'woo@example.com', status: 'Active' },
];


export type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
};

export type CommissionProfile = {
  id: string;
  name: string;
  entityType: 'Agent' | 'Sub-Agent' | 'Company' | 'Salesperson';
  phone: string;
  email?: string;
  bankDetails?: string;
  commission: {
    overall: number;
    categories?: { category: string; rate: number }[];
  };
  totalCommissionEarned: number;
  totalCommissionPaid: number;
};

export type Commission = {
    id: string;
    transaction_id: string;
    transaction_sell_line_id?: string;
    recipient_profile_id: string;
    recipient_entity_type: 'Agent' | 'Sub-Agent' | 'Company' | 'Salesperson';
    product_category_id?: string;
    calculation_base_amount: number;
    calculated_rate: number;
    commission_amount: number;
    status: 'Pending Approval' | 'Approved' | 'Paid' | 'Reversed';
    calculation_date: string; // ISO string
    approval_date?: string; // ISO string
    payment_date?: string; // ISO string
    payment_details?: string;
    payment_method?: string;
    approved_by_user_id?: string;
    paid_by_user_id?: string;
};

export type CommissionProfileWithSummary = CommissionProfile;


export type Supplier = {
  id: string;
  contactId: string;
  businessName: string;
  name: string;
  email: string | null;
  taxNumber: string;
  payTerm: number;
  openingBalance: number;
  advanceBalance: number;
  addedOn: string;
  address: string;
  mobile: string;
  totalPurchaseDue: number;
  totalPurchaseReturnDue: number;
  customField1?: string;
};

export type Customer = {
  id: string;
  contactId: string;
  customerId?: string;
  name: string;
  email: string | null;
  taxNumber: string;
  customerGroup: string;
  openingBalance: number;
  addedOn: string;
  address: string;
  mobile: string;
  totalSaleDue: number;
  totalSaleReturnDue: number;
  customField1?: string;
};

export type DetailedProduct = {
  id: string;
  image: string;
  name: string;
  businessLocation: string;
  unitPurchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  productType: 'Single' | 'Variable';
  category: string;
  brand: string;
  tax: string;
  sku: string;
  unit: string;
  totalUnitSold?: number;
  totalUnitTransferred?: number;
  totalUnitAdjusted?: number;
};

export type Variation = {
  id: string;
  name: string;
  values: string[];
};

export const variations: Variation[] = [
  { id: 'var-1', name: 'Color', values: ['Red', 'Green', 'Blue', 'Black', 'White'] },
  { id: 'var-2', name: 'Size', values: ['S', 'M', 'L', 'XL'] },
  { id: 'var-3', name: 'Material', values: ['Cotton', 'Polyester', 'Wool'] },
];

export type PurchaseItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  tax: number;
};

export type Purchase = {
  id: string;
  referenceNo: string;
  date: string;
  location: string;
  supplier: string;
  supplierId: string;
  purchaseStatus: 'Received' | 'Pending' | 'Ordered' | 'Partial';
  paymentStatus: 'Paid' | 'Due' | 'Partial';
  grandTotal: number;
  paymentDue: number;
  addedBy: string;
  taxAmount?: number;
  items: PurchaseItem[];
};

export type PurchaseReturn = {
  id: string;
  date: string;
  referenceNo: string;
  parentPurchase: string;
  location: string;
  supplier: string;
  paymentStatus: 'Paid' | 'Due' | 'Partial';
  grandTotal: number;
  paymentDue: number;
};

export type SaleItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  tax: number;
};

export type Sale = {
    id: string;
    date: string;
    invoiceNo: string;
    customerId: string | null;
    customerName: string;
    contactNumber: string;
    location: string;
    paymentStatus: 'Paid' | 'Due' | 'Partial';
    paymentMethod: string;
    totalAmount: number;
    totalPaid: number;
    sellDue: number;
    sellReturnDue: number;
    shippingStatus: string | null;
    totalItems: number;
    addedBy: string;
    sellNote: string | null;
    staffNote: string | null;
    shippingDetails: string | null;
    taxAmount?: number;
    items: SaleItem[];
    commissionAgentIds: string[] | null;
};

export type Draft = {
    id: string;
    date: string;
    draftNo: string;
    customerName: string;
    location: string;
    totalAmount: number;
    totalItems: number;
    addedBy: string;
};

export type SellReturn = {
  id: string;
  date: string;
  invoiceNo: string;
  parentSale: string;
  customerName: string;
  location: string;
  paymentStatus: 'Paid' | 'Due' | 'Partial';
  totalAmount: number;
  paymentDue: number;
};

export type Discount = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string | null;
  category: string;
  products: string[];
  brand: string;
  location: string;
  priority: number;
  discountType: 'Fixed' | 'Percentage';
  discountAmount: number;
  isActive: boolean;
};

export type StockTransfer = {
  id: string;
  date: string;
  referenceNo: string;
  locationFrom: string;
  locationTo: string;
  status: 'Pending' | 'In-Transit' | 'Completed';
  shippingCharges: number;
  totalAmount: number;
  addedBy: string;
};

export type StockAdjustment = {
  id: string;
  date: string;
  referenceNo: string;
  location: string;
  adjustmentType: 'Normal' | 'Abnormal';
  totalAmount: number;
  totalAmountRecovered: number;
  reason: string;
  addedBy: string;
};

export type Expense = {
  id: string;
  date: string;
  referenceNo: string;
  location: string;
  expenseCategory: string;
  subCategory: string | null;
  paymentStatus: 'Paid' | 'Due' | 'Partial';
  tax: number;
  totalAmount: number;
  paymentDue: number;
  expenseFor: string | null;
  contact: string | null;
  addedBy: string;
  expenseNote: string | null;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  code: string;
  parentId?: string | null;
};

export type ProfitData = {
    openingStockPurchase: number;
    openingStockSale: number;
    totalPurchase: number;
    totalStockAdjustment: number;
    totalExpense: number;
    totalPurchaseShipping: number;
    purchaseAdditionalExpense: number;
    totalTransferShipping: number;
    totalSellDiscount: number;
    totalCustomerReward: number;
    totalSellReturn: number;
    totalPayroll: number;
    totalProductionCost: number;
    closingStockPurchase: number;
    closingStockSale: number;
    totalSales: number;
    totalSellShipping: number;
    sellAdditionalExpenses: number;
    totalStockRecovered: number;
    totalPurchaseReturn: number;
    totalPurchaseDiscount: number;
    totalSellRoundOff: number;
    hmsTotal: number;
};

export type ProductProfit = { product: string; profit: number; };
export type CategoryProfit = { category: string; profit: number; };
export type BrandProfit = { brand: string; profit: number; };
export type LocationProfit = { location: string; profit: number; };
export type InvoiceProfit = { invoiceNo: string; customer: string; profit: number; };
export type DateProfit = { date: string; profit: number; };
export type CustomerProfit = { customer: string; profit: number; };
export type DayProfit = { day: string; profit: number; };
export type ServiceStaffProfit = { staffName: string; profit: number; };
export type AgentProfit = { agentName: string; profit: number; };
export type SubAgentProfit = { subAgentName: string; profit: number; };
export type CompanyProfit = { company: string; profit: number; };

export type RegisterLog = {
    id: string;
    openTime: string;
    closeTime: string | null;
    location: string;
    user: string;
    closingNote: string | null;
    status: 'Open' | 'Closed';
    totalCardSlips: number;
    totalCheques: number;
    totalCash: number;
    totalRefunds: number;
    totalExpenses: number;
    closingCash: number;
    openingCash: number;
};

export type ActivityLog = {
  id: string;
  date: string;
  user: string;
  action: string;
  subjectType: string;
  subjectId: string;
  note: string;
  ipAddress: string;
};

export type TaxRate = {
  id: string;
  name: string;
  rate: number;
};

export const initialTaxRates: TaxRate[] = [
  { id: 'tax-1', name: 'VAT@10%', rate: 10 },
  { id: 'tax-2', name: 'GST@5%', rate: 5 },
];

export type PaymentAccount = {
  id: string;
  name: string;
  accountNumber?: string;
  accountType: 'Savings' | 'Checking' | 'Credit Card' | 'Cash';
  openingBalance: number;
  balance: number;
  note?: string;
  isDefault?: boolean;
};

export type PaymentOption = {
  method: string;
  enabled: boolean;
  defaultAccount?: string;
};

export type BusinessLocation = {
  id: string;
  name: string;
  locationId: string;
  landmark: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
  mobile: string;
  alternateContactNumber?: string;
  email: string;
  website: string;
  invoiceSchemeForPos?: string;
  invoiceSchemeForSale?: string;
  invoiceLayoutForPos?: string;
  invoiceLayoutForSale?: string;
  defaultSellingPriceGroup?: string;
  customField1?: string;
  customField2?: string;
  customField3?: string;
  customField4?: string;
  posFeaturedProducts?: string;
  paymentOptions?: PaymentOption[];
};

export type Currency = {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  isBaseCurrency?: boolean;
};

export type MoneyExchange = {
    id: string;
    date: string;
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    exchangeRate: number;
    convertedAmount: number;
    addedBy: string;
};

const defaultPaymentOptions: PaymentOption[] = [
    { method: 'Cash', enabled: true },
    { method: 'Card', enabled: true },
    { method: 'Cheque', enabled: true },
    { method: 'Bank Transfer', enabled: true },
    { method: 'Other', enabled: true },
    { method: 'Custom Payment 1', enabled: false },
    { method: 'Custom Payment 2', enabled: false },
    { method: 'Custom Payment 3', enabled: false },
    { method: 'Custom Payment 4', enabled: false },
    { method: 'Custom Payment 5', enabled: false },
    { method: 'Custom Payment 6', enabled: false },
    { method: 'Custom Payment 7', enabled: false },
];

export const businessLocations: BusinessLocation[] = [
  {
    id: 'loc-1',
    name: 'Awesome Shop',
    locationId: 'AS-001',
    landmark: 'Near Central Park',
    city: 'Phoenix',
    zipCode: '85001',
    state: 'Arizona',
    country: 'USA',
    mobile: '555-123-4567',
    email: 'contact@awesomeshop.com',
    website: 'https://www.awesomeshop.com',
    invoiceLayoutForSale: 'Default',
    paymentOptions: defaultPaymentOptions,
  },
   {
    id: 'loc-2',
    name: 'Warehouse A',
    locationId: 'WH-A',
    landmark: 'Industrial Area',
    city: 'Phoenix',
    zipCode: '85043',
    state: 'Arizona',
    country: 'USA',
    mobile: '555-111-2222',
    email: 'warehouse-a@awesomeshop.com',
    website: '',
    paymentOptions: defaultPaymentOptions,
  },
    {
    id: 'loc-3',
    name: 'Warehouse B',
    locationId: 'WH-B',
    landmark: 'South Mountain',
    city: 'Phoenix',
    zipCode: '85042',
    state: 'Arizona',
    country: 'USA',
    mobile: '555-333-4444',
    email: 'warehouse-b@awesomeshop.com',
    website: '',
    paymentOptions: defaultPaymentOptions,
  },
];
// The following arrays are now empty as data will come from Firestore.
// The empty arrays are kept for reference but are not used by the application pages anymore.
export const detailedProducts: DetailedProduct[] = [];
export const products: Product[] = [];
export const suppliers: Supplier[] = [];
export const commissionProfiles: CommissionProfile[] = [];
export const purchases: Purchase[] = [];
export const purchaseReturns: PurchaseReturn[] = [];
export const sales: Sale[] = [];
export const drafts: Draft[] = [];
export const sellReturns: SellReturn[] = [];
export const discounts: Discount[] = [];
export const stockTransfers: StockTransfer[] = [];
export const stockAdjustments: StockAdjustment[] = [];
export const expenses: Expense[] = [];
export const expenseCategories: ExpenseCategory[] = [];
export const profitData: ProfitData = {
  openingStockPurchase: 0.00,
  openingStockSale: 0.00,
  totalPurchase: 0.00,
  totalStockAdjustment: 0.00,
  totalExpense: 0.00,
  totalPurchaseShipping: 0.00,
  purchaseAdditionalExpense: 0.00,
  totalTransferShipping: 0.00,
  totalSellDiscount: 0.00,
  totalCustomerReward: 0.00,
  totalSellReturn: 0.00,
  totalPayroll: 0.00,
  totalProductionCost: 0.00,
  closingStockPurchase: 0.00,
  closingStockSale: 0.00,
  totalSales: 0.00,
  totalSellShipping: 0.00,
  sellAdditionalExpenses: 0.00,
  totalStockRecovered: 0.00,
  totalPurchaseReturn: 0.00,
  totalPurchaseDiscount: 0.00,
  totalSellRoundOff: 0.00,
  hmsTotal: 0.00,
};
export const productProfitData: ProductProfit[] = [];
export const categoryProfitData: CategoryProfit[] = [];
export const brandProfitData: BrandProfit[] = [];
export const locationProfitData: LocationProfit[] = [];
export const invoiceProfitData: InvoiceProfit[] = [];
export const dateProfitData: DateProfit[] = [];
export const customerProfitData: CustomerProfit[] = [];
export const dayProfitData: DayProfit[] = [];
export const serviceStaffProfitData: ServiceStaffProfit[] = [];
export const agentProfitData: AgentProfit[] = [];
export const subAgentProfitData: SubAgentProfit[] = [];
export const companyProfitData: CompanyProfit[] = [];
export const registerLogs: RegisterLog[] = [];
export const activityLogs: ActivityLog[] = [];
export const paymentAccounts: PaymentAccount[] = [];
