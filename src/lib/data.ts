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

export const profiles: Profile[] = [
  { id: 'usr-001', name: 'John Doe', type: 'Agent', email: 'john.doe@example.com', phone: '1234567890', commissionRate: 10, status: 'Active', notificationPreference: 'Email' },
  { id: 'usr-002', name: 'Jane Smith', type: 'Salesperson', email: 'jane.smith@example.com', phone: '0987654321', commissionRate: 5, status: 'Active', notificationPreference: 'SMS' },
  { id: 'usr-003', name: 'Global Corp', type: 'Company', email: 'contact@globalcorp.com', phone: '1122334455', commissionRate: 15, status: 'Active', notificationPreference: 'WhatsApp' },
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
