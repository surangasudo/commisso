
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { type User } from '@/lib/data';

const usersCollection = collection(db, 'users');

export async function getUsers(): Promise<User[]> {
  // In a real app, this would be a Firestore call.
  // For this demo, we'll use a mock list.
  // This avoids having to populate a 'users' collection in Firestore for the demo.
  const mockUsers: User[] = [
    { id: 'user-001', username: 'admin', name: 'Mr Admin', role: 'Admin', email: 'admin@example.com', status: 'Active' },
    { id: 'user-002', username: 'admin-essentials', name: 'Mr Admin Essential', role: 'Admin', email: 'admin_essentials@example.com', status: 'Active' },
    { id: 'user-003', username: 'cashier', name: 'Mr Demo Cashier', role: 'Cashier', email: 'cashier@example.com', status: 'Active' },
  ];
  return Promise.resolve(mockUsers);
}
