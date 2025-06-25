'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type Customer } from '@/lib/data';

function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  if (typeof data === 'object' && data.constructor === Object) {
    const sanitizedObject: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObject[key] = sanitizeData(data[key]);
      }
    }
    return sanitizedObject;
  }
  return data;
}

const customersCollection = collection(db, 'customers');

export async function getCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(customersCollection);
  return snapshot.docs.map(doc => {
    const data = sanitizeData(doc.data());
    return { id: doc.id, ...data } as Customer;
  });
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<DocumentData> {
    const customerData = JSON.parse(JSON.stringify(customer));
    return await addDoc(customersCollection, customerData);
}
