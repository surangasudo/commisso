'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData } from 'firebase/firestore';
import { type Customer } from '@/lib/data';
import { sanitizeForClient } from '@/lib/firestore-utils';

const customersCollection = collection(db, 'customers');

export async function getCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(customersCollection);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return sanitizeForClient<Customer[]>(data);
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<DocumentData> {
    return await addDoc(customersCollection, customer);
}
