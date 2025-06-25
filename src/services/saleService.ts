'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type Sale } from '@/lib/data';

const salesCollection = collection(db, 'sales');

export async function getSales(): Promise<Sale[]> {
  const snapshot = await getDocs(salesCollection);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (value instanceof Timestamp) {
          data[key] = value.toDate().toISOString();
        }
      }
    }
    return { id: doc.id, ...data } as Sale;
  });
}

export async function addSale(sale: Omit<Sale, 'id'>): Promise<DocumentData> {
    const saleData = JSON.parse(JSON.stringify(sale));
    return await addDoc(salesCollection, saleData);
}
