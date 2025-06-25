
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type StockAdjustment } from '@/lib/data';
import { sanitizeForClient } from '@/lib/firestore-utils';

const stockAdjustmentsCollection = collection(db, 'stockAdjustments');

export async function getStockAdjustments(): Promise<StockAdjustment[]> {
  const snapshot = await getDocs(stockAdjustmentsCollection);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return sanitizeForClient<StockAdjustment[]>(data);
}

export async function addStockAdjustment(adjustment: Omit<StockAdjustment, 'id'>): Promise<DocumentData> {
    return await addDoc(stockAdjustmentsCollection, adjustment);
}

export async function deleteStockAdjustment(id: string): Promise<void> {
    const docRef = doc(db, 'stockAdjustments', id);
    await deleteDoc(docRef);
}
