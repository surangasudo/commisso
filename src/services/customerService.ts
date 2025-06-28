
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type Customer } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';

const customersCollection = collection(db, 'customers');

export async function getCustomers(): Promise<Customer[]> {
  noStore();
  const snapshot = await getDocs(customersCollection);
  const data = snapshot.docs.map(doc => processDoc<Customer>(doc));
  return data;
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<void> {
    await addDoc(customersCollection, customer);
}

export async function deleteCustomer(id: string): Promise<void> {
    const docRef = doc(db, 'customers', id);
    await deleteDoc(docRef);
}
