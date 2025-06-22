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
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
};

export const products: Product[] = [
  { id: 'prod-001', name: 'Espresso', price: 2.50, category: 'Coffee', imageUrl: 'https://placehold.co/150x150.png', stock: 100 },
  { id: 'prod-002', name: 'Latte', price: 3.50, category: 'Coffee', imageUrl: 'https://placehold.co/150x150.png', stock: 100 },
  { id: 'prod-003', name: 'Cappuccino', price: 3.50, category: 'Coffee', imageUrl: 'https://placehold.co/150x150.png', stock: 100 },
  { id: 'prod-004', name: 'Croissant', price: 2.75, category: 'Pastries', imageUrl: 'https://placehold.co/150x150.png', stock: 50 },
  { id: 'prod-005', name: 'Muffin', price: 2.25, category: 'Pastries', imageUrl: 'https://placehold.co/150x150.png', stock: 60 },
  { id: 'prod-006', name: 'Iced Tea', price: 3.00, category: 'Drinks', imageUrl: 'https://placehold.co/150x150.png', stock: 80 },
  { id: 'prod-007', name: 'Mineral Water', price: 1.50, category: 'Drinks', imageUrl: 'https://placehold.co/150x150.png', stock: 120 },
  { id: 'prod-008', name: 'Club Sandwich', price: 6.50, category: 'Food', imageUrl: 'https://placehold.co/150x150.png', stock: 30 },
  { id: 'prod-009', name: 'Caesar Salad', price: 7.00, category: 'Food', imageUrl: 'https://placehold.co/150x150.png', stock: 25 },
  { id: 'prod-010', name: 'Bagel with Cream Cheese', price: 3.25, category: 'Pastries', imageUrl: 'https://placehold.co/150x150.png', stock: 40 },
  { id: 'prod-011', name: 'Americano', price: 3.00, category: 'Coffee', imageUrl: 'https://placehold.co/150x150.png', stock: 90 },
  { id: 'prod-012', name: 'Hot Chocolate', price: 4.00, category: 'Drinks', imageUrl: 'https://placehold.co/150x150.png', stock: 70 },
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
