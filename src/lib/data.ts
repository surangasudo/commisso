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
        businessName: 'Univer Suppliers',
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
        businessName: 'Alpha Clothings',
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
        businessName: 'Digital Ocean',
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
        name: 'Walk-in Customer',
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
};

export const detailedProducts: DetailedProduct[] = [
    { id: 'prod-1', image: 'https://placehold.co/40x40.png', name: 'Nike Fashion Sneaker', businessLocation: 'Awesome Shop', unitPurchasePrice: 121.00, sellingPrice: 165.00, currentStock: 0, productType: 'Variable', category: 'Accessories -- Shoes', brand: 'Nike', tax: 'VAT@10%', sku: 'AS0008' },
    { id: 'prod-2', image: 'https://placehold.co/40x40.png', name: 'NXT Men\'s Running Shoe', businessLocation: 'Awesome Shop', unitPurchasePrice: 165.00, sellingPrice: 165.00, currentStock: 0, productType: 'Variable', category: 'Accessories -- Shoes', brand: 'Nike', tax: 'VAT@10%', sku: 'AS0010' },
    { id: 'prod-3', image: 'https://placehold.co/40x40.png', name: 'Oreo Cookies', businessLocation: 'Awesome Shop', unitPurchasePrice: 5.00, sellingPrice: 6.25, currentStock: 0, productType: 'Single', category: 'Food & Grocery', brand: 'Oreo', tax: '', sku: 'AS0026' },
    { id: 'prod-4', image: 'https://placehold.co/40x40.png', name: 'Organic Egg', businessLocation: 'Awesome Shop', unitPurchasePrice: 10.00, sellingPrice: 12.50, currentStock: 50, productType: 'Single', category: 'Food & Grocery', brand: '', tax: '', sku: 'AS0065' },
    { id: 'prod-5', image: 'https://placehold.co/40x40.png', name: 'Pair Of Dumbbells', businessLocation: 'Awesome Shop', unitPurchasePrice: 10.00, sellingPrice: 12.50, currentStock: 140, productType: 'Single', category: 'Sports -- Exercise & Fitness', brand: 'Bowflex', tax: '', sku: 'AS0021' },
    { id: 'prod-6', image: 'https://placehold.co/40x40.png', name: 'Pinot Noir Red Wine', businessLocation: 'Awesome Shop', unitPurchasePrice: 35.00, sellingPrice: 43.75, currentStock: 0, productType: 'Single', category: 'Food & Grocery', brand: '', tax: '', sku: 'AS0057' },
    { id: 'prod-7', image: 'https://placehold.co/40x40.png', name: 'Puma Brown Sneaker', businessLocation: 'Awesome Shop', unitPurchasePrice: 182.00, sellingPrice: 182.00, currentStock: 0, productType: 'Variable', category: 'Accessories -- Shoes', brand: 'Puma', tax: 'VAT@10%', sku: 'AS0006' },
    { id: 'prod-8', image: 'https://placehold.co/40x40.png', name: 'PUMA Men\'s Black Sneaker', businessLocation: 'Awesome Shop', unitPurchasePrice: 148.50, sellingPrice: 148.50, currentStock: 0, productType: 'Variable', category: 'Accessories -- Shoes', brand: 'Puma', tax: 'VAT@10%', sku: 'AS0009' },
    { id: 'prod-9', image: 'https://placehold.co/40x40.png', name: 'Red Wine', businessLocation: 'Awesome Shop', unitPurchasePrice: 34.00, sellingPrice: 42.50, currentStock: 20, productType: 'Single', category: 'Food & Grocery', brand: '', tax: '', sku: 'AS0061' },
];
