'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type Sale } from '@/lib/data';

const salesCollection = collection(db, 'sales');

export async function getSales(): Promise<Sale[]> {
  const snapshot = await getDocs(salesCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          ...docData,
          date: docData.date?.toDate ? docData.date.toDate().toISOString() : docData.date,
      } as Sale;
  });
  return data;
}

export async function getSale(id: string): Promise<Sale | null> {
    const docRef = doc(db, 'sales', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
        } as Sale;
    } else {
        return null;
    }
}

export async function addSale(sale: Omit<Sale, 'id'>): Promise<void> {
    await addDoc(salesCollection, sale);
}

export async function deleteSale(id: string): Promise<void> {
    const docRef = doc(db, 'sales', id);
    await deleteDoc(docRef);
}
