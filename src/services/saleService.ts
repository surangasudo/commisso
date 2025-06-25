'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData } from 'firebase/firestore';
import { type Sale } from '@/lib/data';

const salesCollection = collection(db, 'sales');

export async function getSales(): Promise<Sale[]> {
  const snapshot = await getDocs(salesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
}

export async function addSale(sale: Omit<Sale, 'id'>): Promise<DocumentData> {
    const saleData = JSON.parse(JSON.stringify(sale));
    return await addDoc(salesCollection, saleData);
}
