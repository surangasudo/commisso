export type Profile = {
  id: string;
  name: string;
  type: 'Agent' | 'Sub-Agent' | 'Company' | 'Salesperson';
  email: string;
  phone: string;
  commissionRate: number;
  status: 'Active' | 'Inactive';
  categoryRates?: { category: string; rate: number }[];
  notificationPreference: 'Email' | 'SMS' | 'WhatsApp';
};

export type Commission = {
  id: string;
  transactionId: string;
  profileId: string;
  profileName: string;
  amount: number;
  commissionAmount: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Reversed';
  date: string;
};

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


export const profiles: Profile[] = [
  { id: 'usr-001', name: 'John Doe', type: 'Agent', email: 'john.doe@example.com', phone: '1234567890', commissionRate: 10, status: 'Active', notificationPreference: 'Email', categoryRates: [{ category: 'Electronics', rate: 5 }, { category: 'Furniture', rate: 12 }] },
  { id: 'usr-002', name: 'Jane Smith', type: 'Salesperson', email: 'jane.smith@example.com', phone: '0987654321', commissionRate: 5, status: 'Active', notificationPreference: 'SMS' },
  { id: 'usr-003', name: 'Global Corp', type: 'Company', email: 'contact@globalcorp.com', phone: '1122334455', commissionRate: 15, status: 'Active', notificationPreference: 'WhatsApp', categoryRates: [{ category: 'Software', rate: 20 }, { category: 'Hardware', rate: 8 }] },
  { id: 'usr-004', name: 'Peter Jones', type: 'Sub-Agent', email: 'peter.jones@example.com', phone: '5544332211', commissionRate: 8, status: 'Inactive', notificationPreference: 'Email' },
  { id: 'usr-005', name: 'Alice Williams', type: 'Salesperson', email: 'alice.w@example.com', phone: '6677889900', commissionRate: 5, status: 'Active', notificationPreference: 'SMS' },
];

export const commissions: Commission[] = [
  { id: 'com-001', transactionId: 'txn-101', profileId: 'usr-001', profileName: 'John Doe', amount: 1500, commissionAmount: 150, status: 'Paid', date: '2023-10-01' },
  { id: 'com-002', transactionId: 'txn-102', profileId: 'usr-002', profileName: 'Jane Smith', amount: 2500, commissionAmount: 125, status: 'Paid', date: '2023-10-02' },
  { id: 'com-003', transactionId: 'txn-103', profileId: 'usr-003', profileName: 'Global Corp', amount: 10000, commissionAmount: 1500, status: 'Approved', date: '2023-10-03' },
  { id: 'com-004', transactionId: 'txn-104', profileId: 'usr-001', profileName: 'John Doe', amount: 500, commissionAmount: 50, status: 'Approved', date: '2023-10-04' },
  { id: 'com-005', transactionId: 'txn-105', profileId: 'usr-005', profileName: 'Alice Williams', amount: 3200, commissionAmount: 160, status: 'Pending', date: '2023-10-05' },
  { id: 'com-006', transactionId: 'txn-106', profileId: 'usr-002', profileName: 'Jane Smith', amount: 800, commissionAmount: 40, status: 'Pending', date: '2023-10-06' },
  { id: 'com-007', transactionId: 'txn-107', profileId: 'usr-001', profileName: 'John Doe', amount: 1200, commissionAmount: 120, status: 'Reversed', date: '2023-09-15' },
  { id: 'com-008', transactionId: 'txn-108', profileId: 'usr-003', profileName: 'Global Corp', amount: 50000, commissionAmount: 7500, status: 'Pending', date: '2023-10-07' },
];
