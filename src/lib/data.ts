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
