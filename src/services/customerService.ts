'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type Customer } from '@/lib/data';

const customersCollection = collection(db, 'customers');

export async function getCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(customersCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id, 
          ...docData,
          // Convert Timestamp to ISO string if it exists
          addedOn: docData.addedOn?.toDate ? docData.addedOn.toDate().toISOString() : docData.addedOn,
      } as Customer;
  });
  return data;
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<DocumentData> {
    return await addDoc(customersCollection, customer);
}

export async function deleteCustomer(id: string): Promise<void> {
    const docRef = doc(db, 'customers', id);
    await deleteDoc(docRef);
}
