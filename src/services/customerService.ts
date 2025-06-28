
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type Customer } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';

const customersCollection = collection(db, 'customers');

export async function getCustomers(): Promise<Customer[]> {
  noStore();
  const snapshot = await getDocs(customersCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          contactId: docData.contactId || '',
          name: docData.name || '',
          email: docData.email || null,
          taxNumber: docData.taxNumber || '',
          customerGroup: docData.customerGroup || '',
          openingBalance: docData.openingBalance || 0,
          addedOn: docData.addedOn || new Date().toLocaleDateString('en-CA'),
          address: docData.address || '',
          mobile: docData.mobile || '',
          totalSaleDue: docData.totalSaleDue || 0,
          totalSaleReturnDue: docData.totalSaleReturnDue || 0,
          customField1: docData.customField1 || ''
      } as Customer;
  });
  return data;
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<void> {
    await addDoc(customersCollection, customer);
}

export async function deleteCustomer(id: string): Promise<void> {
    const docRef = doc(db, 'customers', id);
    await deleteDoc(docRef);
}
