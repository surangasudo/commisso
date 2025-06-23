







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

export const products: Product[] = [
  { id: 'prod-001', sku: 'AS0017-1', name: 'Acer Aspire E15 - Black', price: 350.00, category: 'Electronics', imageUrl: 'https://placehold.co/150x150.png', stock: 10 },
  { id: 'prod-002', sku: 'AS0017-2', name: 'Acer Aspire E15 - White', price: 350.00, category: 'Electronics', imageUrl: 'https://placehold.co/150x150.png', stock: 15 },
  { id: 'prod-003', sku: 'AS0064', name: 'Apple - Fuji', price: 1.50, category: 'Groceries', imageUrl: 'https://placehold.co/150x150.png', stock: 300 },
  { id: 'prod-004', sku: 'AS0015-1', name: 'Apple iPhone 8 - White', price: 399.00, category: 'Electronics', imageUrl: 'https://placehold.co/150x150.png', stock: 20 },
  { id: 'prod-005', sku: 'AS0015-2', name: 'Apple iPhone 8 - Gray', price: 399.00, category: 'Electronics', imageUrl: 'https://placehold.co/150x150.png', stock: 20 },
  { id: 'prod-006', sku: 'AS0018-1', name: 'Apple MacBook Air - 256GB', price: 999.00, category: 'Electronics', imageUrl: 'https://placehold.co/150x150.png', stock: 12 },
  { id: 'prod-007', sku: 'AS0063', name: 'Banana', price: 0.75, category: 'Groceries', imageUrl: 'https://placehold.co/150x150.png', stock: 400 },
  { id: 'prod-008', sku: 'AS0028', name: 'Barilla Pasta', price: 2.25, category: 'Groceries', imageUrl: 'https://placehold.co/150x150.png', stock: 150 },
  { id: 'prod-009', sku: 'CK-001', name: 'Butter Cookies', price: 5.50, category: 'Groceries', imageUrl: 'https://placehold.co/150x150.png', stock: 80 },
  { id: 'prod-010', sku: 'SK-002', name: 'Cushion Crew Socks', price: 8.00, category: 'Apparel', imageUrl: 'https://placehold.co/150x150.png', stock: 120 },
  { id: 'prod-011', sku: 'BK-003', name: 'Diary of a Wimpy Kid', price: 12.00, category: 'Books', imageUrl: 'https://placehold.co/150x150.png', stock: 45 },
  { id: 'prod-012', sku: 'BK-004', name: 'Etched in Sand', price: 15.00, category: 'Books', imageUrl: 'https://placehold.co/150x150.png', stock: 35 },
];

export type CommissionProfile = {
  id: string;
  name: string;
  entityType: 'Agent' | 'Sub-Agent' | 'Company' | 'Salesperson';
  phone: string;
  commission: {
    overall: number;
    categories?: { category: string; rate: number }[];
  };
};

export const commissionProfiles: CommissionProfile[] = [
  {
    id: 'agent-001',
    name: 'John Doe',
    entityType: 'Agent',
    phone: '123-456-7890',
    commission: {
      overall: 5,
      categories: [
        { category: 'Electronics', rate: 7 },
        { category: 'Apparel', rate: 10 },
      ],
    },
  },
  {
    id: 'agent-002',
    name: 'Jane Smith',
    entityType: 'Sub-Agent',
    phone: '098-765-4321',
    commission: {
      overall: 6,
    },
  },
  {
    id: 'agent-003',
    name: 'Global Corp',
    entityType: 'Company',
    phone: '555-111-2222',
    commission: {
      overall: 3,
      categories: [
        { category: 'Furniture', rate: 5 },
      ],
    },
  },
    {
    id: 'agent-004',
    name: 'Alex Ray',
    entityType: 'Salesperson',
    phone: '555-333-4444',
    commission: {
      overall: 4,
    },
  },
];

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

export const suppliers: Supplier[] = [
    {
        id: 'sup-1',
        contactId: 'CO0003',
        businessName: 'Manhattan Clothing Ltd.',
        name: 'Philip',
        email: 'philip@manhattan.com',
        taxNumber: '54869310093',
        payTerm: 15,
        openingBalance: 0.00,
        advanceBalance: 0.00,
        addedOn: '01/03/2018',
        address: 'Linking Street, Phoenix, Arizona, USA',
        mobile: '(378) 400-1234',
        totalPurchaseDue: 0.00,
        totalPurchaseReturnDue: 0.00
    },
    {
        id: 'sup-2',
        contactId: '',
        businessName: 'Univer Suppliers, Jackson Hill',
        name: 'Jackson Hill',
        email: 'jackson@univer.com',
        taxNumber: '5459000655',
        payTerm: 45,
        openingBalance: 0.00,
        advanceBalance: 0.00,
        addedOn: '01/06/2018',
        address: 'Linking Street, Phoenix, Arizona, USA',
        mobile: '(378) 400-1234',
        totalPurchaseDue: 255986.00,
        totalPurchaseReturnDue: 0.00
    },
    {
        id: 'sup-3',
        contactId: '',
        businessName: 'Alpha Clothings, Michael',
        name: 'Michael',
        email: 'michael@alpha.com',
        taxNumber: '4590091535',
        payTerm: 15,
        openingBalance: 0.00,
        advanceBalance: 0.00,
        addedOn: '01/03/2018',
        address: 'Linking Street, Phoenix, Arizona, USA',
        mobile: '(378) 400-1234',
        totalPurchaseDue: 0.00,
        totalPurchaseReturnDue: 0.00
    },
    {
        id: 'sup-4',
        contactId: 'CN0004',
        businessName: 'Digital Ocean, Mike McCubbin',
        name: 'Mike McCubbin',
        email: 'mike@digitalocean.com',
        taxNumber: '52965489001',
        payTerm: 30,
        openingBalance: 0.00,
        advanceBalance: 0.00,
        addedOn: '01/06/2018',
        address: 'Linking Street, Phoenix, Arizona, USA',
        mobile: '(378) 400-1234',
        totalPurchaseDue: 0.00,
        totalPurchaseReturnDue: 0.00
    },
    {
        id: 'sup-5',
        contactId: 'CO0006',
        businessName: 'Essential Goods Inc.',
        name: 'Sarah Connor',
        email: 'sarah.c@essentialgoods.com',
        taxNumber: '1122334455',
        payTerm: 60,
        openingBalance: 0.00,
        advanceBalance: 0.00,
        addedOn: '05/10/2023',
        address: '123 Future Way, Cyber City, USA',
        mobile: '(555) 867-5309',
        totalPurchaseDue: 12500.00,
        totalPurchaseReturnDue: 0.00
    }
];

export type Customer = {
  id: string;
  contactId: string;
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

export const customers: Customer[] = [
    {
        id: 'cus-1',
        contactId: 'CO0001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        taxNumber: '123456789',
        customerGroup: 'Wholesale',
        openingBalance: 1000,
        addedOn: '01/01/2023',
        address: '123 Main St, Anytown, USA',
        mobile: '555-123-4567',
        totalSaleDue: 500,
        totalSaleReturnDue: 50,
    },
    {
        id: 'cus-2',
        contactId: 'CO0002',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        taxNumber: '987654321',
        customerGroup: 'Retail',
        openingBalance: 500,
        addedOn: '02/15/2023',
        address: '456 Oak Ave, Anytown, USA',
        mobile: '555-987-6543',
        totalSaleDue: 250,
        totalSaleReturnDue: 0,
    },
    {
        id: 'cus-3',
        contactId: 'CO0005',
        name: 'Walk-In Customer',
        email: null,
        taxNumber: '',
        customerGroup: 'Retail',
        openingBalance: 0,
        addedOn: '03/20/2023',
        address: 'N/A',
        mobile: 'N/A',
        totalSaleDue: 1200,
        totalSaleReturnDue: 100,
    },
    {
        id: 'cus-4',
        contactId: 'CO0004',
        name: 'Harry',
        email: 'harry@example.com',
        taxNumber: '111222333',
        customerGroup: 'Retail',
        openingBalance: 0,
        addedOn: '06/20/2025',
        address: 'N/A',
        mobile: 'N/A',
        totalSaleDue: 0,
        totalSaleReturnDue: 0,
    }
];

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
  totalUnitSold?: number;
  totalUnitTransferred?: number;
  totalUnitAdjusted?: number;
};

export const detailedProducts: DetailedProduct[] = [
    { id: 'prod-1', image: 'https://placehold.co/40x40.png', name: 'Nike Fashion Sneaker', businessLocation: 'Awesome Shop', unitPurchasePrice: 121.00, sellingPrice: 165.00, currentStock: 10, productType: 'Variable', category: 'Accessories -- Shoes', brand: 'Nike', tax: 'VAT@10%', sku: 'AS0008', totalUnitSold: 5, totalUnitTransferred: 2, totalUnitAdjusted: 0 },
    { id: 'prod-2', image: 'https://placehold.co/40x40.png', name: 'NXT Men\'s Running Shoe', businessLocation: 'Awesome Shop', unitPurchasePrice: 165.00, sellingPrice: 165.00, currentStock: 8, productType: 'Variable', category: 'Accessories -- Shoes', brand: 'Nike', tax: 'VAT@10%', sku: 'AS0010', totalUnitSold: 12, totalUnitTransferred: 0, totalUnitAdjusted: 1 },
    { id: 'prod-3', image: 'https://placehold.co/40x40.png', name: 'Oreo Cookies', businessLocation: 'Awesome Shop', unitPurchasePrice: 5.00, sellingPrice: 6.25, currentStock: 100, productType: 'Single', category: 'Food & Grocery', brand: 'Oreo', tax: '', sku: 'AS0026', totalUnitSold: 50, totalUnitTransferred: 10, totalUnitAdjusted: 5 },
    { id: 'prod-4', image: 'https://placehold.co/40x40.png', name: 'Organic Egg', businessLocation: 'Awesome Shop', unitPurchasePrice: 10.00, sellingPrice: 12.50, currentStock: 50, productType: 'Single', category: 'Food & Grocery', brand: '', tax: '', sku: 'AS0065', totalUnitSold: 25, totalUnitTransferred: 0, totalUnitAdjusted: 0 },
    { id: 'prod-5', image: 'https://placehold.co/40x40.png', name: 'Pair Of Dumbbells', businessLocation: 'Awesome Shop', unitPurchasePrice: 10.00, sellingPrice: 12.50, currentStock: 140, productType: 'Single', category: 'Sports -- Exercise & Fitness', brand: 'Bowflex', tax: '', sku: 'AS0021', totalUnitSold: 20, totalUnitTransferred: 5, totalUnitAdjusted: 2 },
    { id: 'prod-6', image: 'https://placehold.co/40x40.png', name: 'Pinot Noir Red Wine', businessLocation: 'Awesome Shop', unitPurchasePrice: 35.00, sellingPrice: 43.75, currentStock: 30, productType: 'Single', category: 'Food & Grocery', brand: '', tax: '', sku: 'AS0057', totalUnitSold: 15, totalUnitTransferred: 0, totalUnitAdjusted: 0 },
    { id: 'prod-7', image: 'https://placehold.co/40x40.png', name: 'Puma Brown Sneaker', businessLocation: 'Awesome Shop', unitPurchasePrice: 182.00, sellingPrice: 182.00, currentStock: 15, productType: 'Variable', category: 'Accessories -- Shoes', brand: 'Puma', tax: 'VAT@10%', sku: 'AS0006', totalUnitSold: 10, totalUnitTransferred: 3, totalUnitAdjusted: 0 },
    { id: 'prod-8', image: 'https://placehold.co/40x40.png', name: 'PUMA Men\'s Black Sneaker', businessLocation: 'Awesome Shop', unitPurchasePrice: 148.50, sellingPrice: 148.50, currentStock: 12, productType: 'Variable', category: 'Accessories -- Shoes', brand: 'Puma', tax: 'VAT@10%', sku: 'AS0009', totalUnitSold: 8, totalUnitTransferred: 1, totalUnitAdjusted: 0 },
    { id: 'prod-9', image: 'https://placehold.co/40x40.png', name: 'Red Wine', businessLocation: 'Awesome Shop', unitPurchasePrice: 34.00, sellingPrice: 42.50, currentStock: 20, productType: 'Single', category: 'Food & Grocery', brand: '', tax: '', sku: 'AS0061', totalUnitSold: 10, totalUnitTransferred: 0, totalUnitAdjusted: 0 },
];

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
  purchaseStatus: 'Received' | 'Pending' | 'Ordered' | 'Partial';
  paymentStatus: 'Paid' | 'Due' | 'Partial';
  grandTotal: number;
  paymentDue: number;
  addedBy: string;
  taxAmount?: number;
  items: PurchaseItem[];
};

export const purchases: Purchase[] = [
    { 
        id: 'pur-1', date: '06/22/2025 21:00', referenceNo: 'PO2018/0002', location: 'Awesome Shop', supplier: 'Univer Suppliers, Jackson Hill', purchaseStatus: 'Received', paymentStatus: 'Due', grandTotal: 235656.00, paymentDue: 235656.00, addedBy: 'Mr Admin', taxAmount: 11782.80,
        items: [
            { productId: 'prod-3', quantity: 200, unitPrice: 5.00, tax: 0 },
            { productId: 'prod-4', quantity: 150, unitPrice: 10.00, tax: 0 },
        ]
    },
    { 
        id: 'pur-2', date: '06/20/2025 21:00', referenceNo: 'PO2018/0001', location: 'Awesome Shop', supplier: 'Univer Suppliers, Jackson Hill', purchaseStatus: 'Received', paymentStatus: 'Due', grandTotal: 5180.00, paymentDue: 5180.00, addedBy: 'Mr Admin', taxAmount: 259.00,
        items: [
            { productId: 'prod-5', quantity: 50, unitPrice: 10.00, tax: 0 },
        ]
    },
    { 
        id: 'pur-3', date: '06/15/2025 21:00', referenceNo: '35001BCVD', location: 'Awesome Shop', supplier: 'Univer Suppliers, Jackson Hill', purchaseStatus: 'Received', paymentStatus: 'Due', grandTotal: 12100.00, paymentDue: 12100.00, addedBy: 'Mr Admin', taxAmount: 605.00,
        items: [
            { productId: 'prod-1', quantity: 10, unitPrice: 121.00, tax: 0 },
        ]
    },
    { 
        id: 'pur-4', date: '06/07/2025 21:00', referenceNo: '35001BCVX', location: 'Awesome Shop', supplier: 'Alpha Clothings, Michael', purchaseStatus: 'Received', paymentStatus: 'Paid', grandTotal: 55660.00, paymentDue: 0.00, addedBy: 'Mr Admin', taxAmount: 2783.00,
        items: [
             { productId: 'prod-7', quantity: 20, unitPrice: 182.00, tax: 0 },
             { productId: 'prod-8', quantity: 30, unitPrice: 148.50, tax: 0 },
        ]
    },
    { 
        id: 'pur-5', date: '06/07/2025 21:00', referenceNo: '35001BJGN', location: 'Awesome Shop', supplier: 'Digital Ocean, Mike McCubbin', purchaseStatus: 'Received', paymentStatus: 'Paid', grandTotal: 84700.00, paymentDue: 0.00, addedBy: 'Mr Admin', taxAmount: 4235.00,
        items: []
    },
    { 
        id: 'pur-6', date: '05/23/2025 21:00', referenceNo: '35001BCVJ', location: 'Awesome Shop', supplier: 'Univer Suppliers, Jackson Hill', purchaseStatus: 'Partial', grandTotal: 6050.00, paymentDue: 3050.00, addedBy: 'Mr Admin', taxAmount: 302.50,
        items: [
            { productId: 'prod-6', quantity: 10, unitPrice: 35.00, tax: 0 },
            { productId: 'prod-9', quantity: 15, unitPrice: 34.00, tax: 0 },
        ]
    },
    { 
        id: 'pur-7', date: '05/23/2025 21:00', referenceNo: '35001BCVK', location: 'Awesome Shop', supplier: 'Univer Suppliers, Jackson Hill', purchaseStatus: 'Received', paymentStatus: 'Paid', grandTotal: 2000.00, paymentDue: 0.00, addedBy: 'Mr Admin', taxAmount: 100.00,
        items: [
             { productId: 'prod-3', quantity: 40, unitPrice: 5.00, tax: 0 },
        ] 
    },
];

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

export const purchaseReturns: PurchaseReturn[] = [
    { id: 'pr-1', date: '06/23/2025 10:00', referenceNo: 'PR2025/0001', parentPurchase: 'PO2018/0002', location: 'Awesome Shop', supplier: 'Univer Suppliers, Jackson Hill', paymentStatus: 'Due', grandTotal: 150.00, paymentDue: 150.00 },
    { id: 'pr-2', date: '06/21/2025 14:30', referenceNo: 'PR2025/0002', parentPurchase: 'PO2018/0001', location: 'Awesome Shop', supplier: 'Univer Suppliers, Jackson Hill', paymentStatus: 'Paid', grandTotal: 200.00, paymentDue: 0.00 },
];

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
};

export const sales: Sale[] = [
    { 
        id: 'sale-1', 
        date: '06/22/2025 21:00', 
        invoiceNo: 'AS0004', 
        customerName: 'Walk-In Customer', 
        contactNumber: '(378) 400-1234', 
        location: 'Awesome Shop', 
        paymentStatus: 'Paid', 
        paymentMethod: 'Cash', 
        totalAmount: 750.00, 
        totalPaid: 750.00, 
        sellDue: 0.00, 
        sellReturnDue: 0.00, 
        shippingStatus: 'Ordered', 
        totalItems: 1.00, 
        addedBy: 'Mr Admin', 
        sellNote: null, 
        staffNote: null, 
        shippingDetails: 'Standard Shipping', 
        taxAmount: 75.00,
        items: [{ productId: 'prod-5', quantity: 1, unitPrice: 750.00, tax: 0 }] 
    },
    { 
        id: 'sale-2', 
        date: '06/22/2025 21:00', 
        invoiceNo: 'AS0005', 
        customerName: 'Walk-In Customer', 
        contactNumber: '(378) 400-1234', 
        location: 'Awesome Shop', 
        paymentStatus: 'Paid', 
        paymentMethod: 'Cash', 
        totalAmount: 412.50, 
        totalPaid: 412.50, 
        sellDue: 0.00, 
        sellReturnDue: 0.00, 
        shippingStatus: 'Packed', 
        totalItems: 1.00, 
        addedBy: 'Mr Admin', 
        sellNote: null, 
        staffNote: null, 
        shippingDetails: 'Express Shipping', 
        taxAmount: 41.25,
        items: [{ productId: 'prod-9', quantity: 1, unitPrice: 412.50, tax: 0 }] 
    },
    { 
        id: 'sale-3', 
        date: '06/20/2025 21:00', 
        invoiceNo: 'AS0002', 
        customerName: 'Walk-In Customer', 
        contactNumber: '(378) 400-1234', 
        location: 'Awesome Shop', 
        paymentStatus: 'Paid', 
        paymentMethod: 'Cash', 
        totalAmount: 825.00, 
        totalPaid: 825.00, 
        sellDue: 0.00, 
        sellReturnDue: 0.00, 
        shippingStatus: 'Shipped', 
        totalItems: 1.00, 
        addedBy: 'Mr Admin', 
        sellNote: null, 
        staffNote: null, 
        shippingDetails: 'Courier', 
        taxAmount: 82.50,
        items: [{ productId: 'prod-1', quantity: 1, unitPrice: 825.00, tax: 0 }] 
    },
    { 
        id: 'sale-4', 
        date: '06/20/2025 21:00', 
        invoiceNo: 'AS0003', 
        customerName: 'Harry', 
        contactNumber: '(378) 400-1234', 
        location: 'Awesome Shop', 
        paymentStatus: 'Paid', 
        paymentMethod: 'Cash', 
        totalAmount: 7700.00, 
        totalPaid: 7700.00, 
        sellDue: 0.00, 
        sellReturnDue: 0.00, 
        shippingStatus: 'Delivered', 
        totalItems: 2.00, 
        addedBy: 'Mr Admin', 
        sellNote: null, 
        staffNote: null, 
        shippingDetails: 'Local Pickup', 
        taxAmount: 770.00,
        items: [
            { productId: 'prod-2', quantity: 1, unitPrice: 3850, tax: 0 },
            { productId: 'prod-8', quantity: 1, unitPrice: 3850, tax: 0 },
        ]
    },
];

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

export const drafts: Draft[] = [
    { id: 'draft-1', date: '06/22/2025 14:00', draftNo: 'DRFT0001', customerName: 'John Doe', location: 'Awesome Shop', totalAmount: 350.00, totalItems: 1, addedBy: 'Mr Admin' },
    { id: 'draft-2', date: '06/21/2025 11:30', draftNo: 'DRFT0002', customerName: 'Jane Smith', location: 'Awesome Shop', totalAmount: 1200.50, totalItems: 3, addedBy: 'Mr Admin' },
    { id: 'draft-3', date: '06/20/2025 09:00', draftNo: 'DRFT0003', customerName: 'Walk-In Customer', location: 'Awesome Shop', totalAmount: 85.00, totalItems: 2, addedBy: 'Cashier' },
];

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

export const sellReturns: SellReturn[] = [
    { id: 'sr-1', date: '06/23/2025 11:00', invoiceNo: 'SRO-001', parentSale: 'AS0004', customerName: 'Walk-In Customer', location: 'Awesome Shop', paymentStatus: 'Due', totalAmount: 50.00, paymentDue: 50.00 },
    { id: 'sr-2', date: '06/21/2025 15:00', invoiceNo: 'SRO-002', parentSale: 'AS0003', customerName: 'Harry', location: 'Awesome Shop', paymentStatus: 'Paid', totalAmount: 100.00, paymentDue: 0.00 },
];

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

export const discounts: Discount[] = [];

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

export const stockTransfers: StockTransfer[] = [
  { id: 'st-1', date: '06/22/2025 11:08', referenceNo: 'ST2025/0001', locationFrom: 'Awesome Shop', locationTo: 'Warehouse A', status: 'In-Transit', shippingCharges: 50, totalAmount: 7700.00, addedBy: 'Mr Admin' },
  { id: 'st-2', date: '06/20/2025 15:30', referenceNo: 'ST2025/0002', locationFrom: 'Warehouse A', locationTo: 'Awesome Shop', status: 'Completed', shippingCharges: 25, totalAmount: 1250.00, addedBy: 'Mr Admin' },
  { id: 'st-3', date: '06/18/2025 09:00', referenceNo: 'ST2025/0003', locationFrom: 'Awesome Shop', locationTo: 'Warehouse B', status: 'Pending', shippingCharges: 75, totalAmount: 9800.50, addedBy: 'Mr Admin' },
];

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

export const stockAdjustments: StockAdjustment[] = [
  { id: 'sa-1', date: '06/22/2025 11:20', referenceNo: 'SA2025/0001', location: 'Awesome Shop', adjustmentType: 'Normal', totalAmount: 150.00, totalAmountRecovered: 0, reason: 'Stock correction', addedBy: 'Mr Admin' },
  { id: 'sa-2', date: '06/21/2025 10:00', referenceNo: 'SA2025/0002', location: 'Warehouse A', adjustmentType: 'Abnormal', totalAmount: 500.50, totalAmountRecovered: 450.00, reason: 'Damaged goods', addedBy: 'Mr Admin' },
];

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

export const expenses: Expense[] = [
  { id: 'exp-1', date: '06/22/2025 10:00', referenceNo: 'EXP2025/0001', location: 'Awesome Shop', expenseCategory: 'Office Supplies', subCategory: 'Stationery', paymentStatus: 'Paid', tax: 5.00, totalAmount: 55.00, paymentDue: 0.00, expenseFor: null, contact: null, addedBy: 'Mr Admin', expenseNote: 'Printer paper and pens' },
  { id: 'exp-2', date: '06/21/2025 12:30', referenceNo: 'EXP2025/0002', location: 'Awesome Shop', expenseCategory: 'Utilities', subCategory: 'Electricity Bill', paymentStatus: 'Paid', tax: 20.00, totalAmount: 220.00, paymentDue: 0.00, expenseFor: null, contact: null, addedBy: 'Mr Admin', expenseNote: 'Monthly electricity bill' },
  { id: 'exp-3', date: '06/20/2025 15:00', referenceNo: 'EXP2025/0003', location: 'Awesome Shop', expenseCategory: 'Marketing', subCategory: 'Online Ads', paymentStatus: 'Due', tax: 0, totalAmount: 500.00, paymentDue: 500.00, expenseFor: null, contact: null, addedBy: 'Mr Admin', expenseNote: 'Facebook campaign' },
  { id: 'exp-4', date: '06/19/2025 09:00', referenceNo: 'EXP2025/0004', location: 'Awesome Shop', expenseCategory: 'Repairs', subCategory: 'AC Maintenance', paymentStatus: 'Paid', tax: 10.00, totalAmount: 110.00, paymentDue: 0.00, expenseFor: null, contact: null, addedBy: 'Mr Admin', expenseNote: null },
];

export type ExpenseCategory = {
  id: string;
  name: string;
  code: string;
  parentId?: string | null;
};

export const expenseCategories: ExpenseCategory[] = [
  { id: 'cat-exp-1', name: 'Office Supplies', code: 'OS', parentId: null },
  { id: 'cat-exp-2', name: 'Utilities', code: 'UTIL', parentId: null },
  { id: 'cat-exp-6', name: 'Electricity Bill', code: 'ELEC', parentId: 'cat-exp-2' },
  { id: 'cat-exp-7', name: 'Water Bill', code: 'WATR', parentId: 'cat-exp-2' },
  { id: 'cat-exp-3', name: 'Marketing', code: 'MKTG', parentId: null },
  { id: 'cat-exp-4', name: 'Repairs & Maintenance', code: 'R&M', parentId: null },
  { id: 'cat-exp-5', name: 'Salaries & Wages', code: 'PAY', parentId: null },
];

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

export const profitData: ProfitData = {
  openingStockPurchase: 0.00,
  openingStockSale: 0.00,
  totalPurchase: 386936.00,
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
  closingStockPurchase: 386936.00,
  closingStockSale: 471020.00,
  totalSales: 9687.50,
  totalSellShipping: 0.00,
  sellAdditionalExpenses: 0.00,
  totalStockRecovered: 0.00,
  totalPurchaseReturn: 0.00,
  totalPurchaseDiscount: 0.00,
  totalSellRoundOff: 0.00,
  hmsTotal: 0.00,
};

export const productProfitData: ProductProfit[] = [
    { product: 'Barilla Pasta (AS0028)', profit: 0.00 },
    { product: 'Butter Cookies (AS0027)', profit: 0.00 },
    { product: "Levi's Men's Slimmy Fit Jeans - Waist Size - 28 (AS0002-1)", profit: 0.00 },
    { product: "Levi's Men's Slimmy Fit Jeans - Waist Size 30 (AS0002-2)", profit: 0.00 },
    { product: 'Pair Of Dumbbells (AS0021)', profit: 0.00 },
];

export const categoryProfitData: CategoryProfit[] = [
    { category: 'Accessories -- Shoes', profit: 588.50 },
    { category: 'Food & Grocery', profit: 475.00 },
    { category: 'Sports -- Exercise & Fitness', profit: 125.00 },
    { category: 'Uncategorized', profit: 0.00 },
];

export const brandProfitData: BrandProfit[] = [
    { brand: 'Nike', profit: 300.00 },
    { brand: 'Puma', profit: 250.50 },
    { brand: 'Oreo', profit: 75.00 },
    { brand: 'Bowflex', profit: 125.00 },
    { brand: 'Unbranded', profit: 0.00 },
];

export const locationProfitData: LocationProfit[] = [
    { location: 'Awesome Shop', profit: 1182.00 },
];

export const invoiceProfitData: InvoiceProfit[] = [
    { invoiceNo: 'AS0004', customer: 'Walk-In Customer', profit: 75.00 },
    { invoiceNo: 'AS0005', customer: 'Walk-In Customer', profit: 41.25 },
    { invoiceNo: 'AS0002', customer: 'Walk-In Customer', profit: 82.50 },
    { invoiceNo: 'AS0003', customer: 'Harry', profit: 770.00 },
];

export const dateProfitData: DateProfit[] = [
    { date: '06/22/2025', profit: 825.00 },
    { date: '06/21/2025', profit: 0.00 },
    { date: '06/20/2025', profit: 8112.50 },
];

export const customerProfitData: CustomerProfit[] = [
    { customer: 'Walk-In Customer', profit: 198.75 },
    { customer: 'Harry', profit: 770.00 },
];

export const dayProfitData: DayProfit[] = [
    { day: 'Sunday', profit: 1500.00 },
    { day: 'Monday', profit: 2200.00 },
    { day: 'Tuesday', profit: 1800.00 },
    { day: 'Wednesday', profit: 2500.00 },
    { day: 'Thursday', profit: 3100.00 },
    { day: 'Friday', profit: 4200.00 },
    { day: 'Saturday', profit: 5500.00 },
];

export const serviceStaffProfitData: ServiceStaffProfit[] = [
    { staffName: 'Mr Admin', profit: 5500.00 },
    { staffName: 'Mr Demo Cashier', profit: 3250.75 },
];

export const agentProfitData: AgentProfit[] = [
    { agentName: 'John Doe', profit: 4500.00 },
    { agentName: 'Alex Ray', profit: 2800.50 },
];

export const subAgentProfitData: SubAgentProfit[] = [
    { subAgentName: 'Jane Smith', profit: 1850.50 },
    { subAgentName: 'Peter Jones', profit: 975.00 },
];

export const companyProfitData: CompanyProfit[] = [
    { company: 'Global Corp', profit: 25000.00 },
    { company: 'Innovate Inc.', profit: 18500.75 },
];

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

export const registerLogs: RegisterLog[] = [
    {
        id: 'reg-1',
        openTime: '06/22/2025 09:00',
        closeTime: '06/22/2025 17:00',
        location: 'Awesome Shop',
        user: 'Mr Admin',
        closingNote: 'All good.',
        status: 'Closed',
        totalCardSlips: 1250,
        totalCheques: 300,
        totalCash: 4500.75,
        totalRefunds: 50.00,
        totalExpenses: 25.50,
        openingCash: 100.00,
        closingCash: 4525.25,
    },
    {
        id: 'reg-2',
        openTime: '06/21/2025 09:05',
        closeTime: '06/21/2025 17:15',
        location: 'Awesome Shop',
        user: 'Mr Demo Cashier',
        closingNote: 'Slightly over.',
        status: 'Closed',
        totalCardSlips: 800,
        totalCheques: 150,
        totalCash: 2100.50,
        totalRefunds: 0.00,
        totalExpenses: 15.00,
        openingCash: 100.00,
        closingCash: 2186.00,
    },
    {
        id: 'reg-3',
        openTime: '06/23/2025 08:55',
        closeTime: null,
        location: 'Awesome Shop',
        user: 'Mr Admin',
        closingNote: null,
        status: 'Open',
        totalCardSlips: 0,
        totalCheques: 0,
        totalCash: 0,
        totalRefunds: 0.00,
        totalExpenses: 0.00,
        openingCash: 100.00,
        closingCash: 0,
    },
];

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

export const activityLogs: ActivityLog[] = [
  { id: 'log-1', date: '06/23/2025 10:15', user: 'Mr Admin', action: 'Sale Created', subjectType: 'Sale', subjectId: 'AS0005', note: '', ipAddress: '192.168.1.1' },
  { id: 'log-2', date: '06/23/2025 09:30', user: 'Mr Admin', action: 'Purchase Created', subjectType: 'Purchase', subjectId: 'PO2018/0002', note: '', ipAddress: '192.168.1.1' },
  { id: 'log-3', date: '06/22/2025 14:00', user: 'Mr Demo Cashier', action: 'User Logged In', subjectType: 'User', subjectId: 'cashier', note: '', ipAddress: '192.168.1.5' },
  { id: 'log-4', date: '06/22/2025 11:20', user: 'Mr Admin', action: 'Stock Adjustment Added', subjectType: 'Stock Adjustment', subjectId: 'SA2025/0001', note: 'Reason: Stock correction', ipAddress: '192.168.1.1' },
  { id: 'log-5', date: '06/22/2025 11:08', user: 'Mr Admin', action: 'Stock Transfer Added', subjectType: 'Stock Transfer', subjectId: 'ST2025/0001', note: 'From Awesome Shop to Warehouse A', ipAddress: '192.168.1.1' },
  { id: 'log-6', date: '06/21/2025 17:15', user: 'Mr Demo Cashier', action: 'Register Closed', subjectType: 'Register', subjectId: 'reg-2', note: 'Slightly over.', ipAddress: '192.168.1.5' },
  { id: 'log-7', date: '06/21/2025 10:00', user: 'Mr Admin', action: 'Product Deleted', subjectType: 'Product', subjectId: 'prod-old-123', note: 'Product: Old T-Shirt', ipAddress: '192.168.1.1' },
  { id: 'log-8', date: '06/20/2025 09:00', user: 'Mr Admin', action: 'User Logged In', subjectType: 'User', subjectId: 'admin', note: '', ipAddress: '192.168.1.1' },
];

export type TaxRate = {
  id: string;
  name: string;
  rate: number;
};

export const initialTaxRates: TaxRate[] = [
  { id: 'tax-1', name: 'VAT@10%', rate: 10 },
  { id: 'tax-2', name: 'GST@5%', rate: 5 },
];

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
  email: string;
  website: string;
};

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
  },
];
