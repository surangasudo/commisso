
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type StockAdjustment } from '@/lib/data';

const stockAdjustmentsCollection = collection(db, 'stockAdjustments');

export async function getStockAdjustments(): Promise<StockAdjustment[]> {
  const snapshot = await getDocs(stockAdjustmentsCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          ...docData,
          date: docData.date?.toDate ? docData.date.toDate().toISOString() : docData.date,
      } as StockAdjustment;
  });
  return data;
}

export async function addStockAdjustment(adjustment: Omit<StockAdjustment, 'id'>): Promise<DocumentData> {
    return await addDoc(stockAdjustmentsCollection, adjustment);
}

export async function deleteStockAdjustment(id: string): Promise<void> {
    const docRef = doc(db, 'stockAdjustments', id);
    await deleteDoc(docRef);
}
