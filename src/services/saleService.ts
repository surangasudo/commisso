'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type Sale } from '@/lib/data';

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

const salesCollection = collection(db, 'sales');

export async function getSales(): Promise<Sale[]> {
  const snapshot = await getDocs(salesCollection);
  return snapshot.docs.map(doc => {
    const data = sanitizeData(doc.data());
    return { id: doc.id, ...data } as Sale;
  });
}

export async function addSale(sale: Omit<Sale, 'id'>): Promise<DocumentData> {
    const saleData = JSON.parse(JSON.stringify(sale));
    return await addDoc(salesCollection, saleData);
}
