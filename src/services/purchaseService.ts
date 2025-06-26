'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type Purchase } from '@/lib/data';

const purchasesCollection = collection(db, 'purchases');

export async function getPurchases(): Promise<Purchase[]> {
  const snapshot = await getDocs(purchasesCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          ...docData,
          date: docData.date?.toDate ? docData.date.toDate().toISOString() : docData.date,
      } as Purchase;
  });
  return data;
}

export async function getPurchase(id: string): Promise<Purchase | null> {
    const docRef = doc(db, 'purchases', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
        } as Purchase;
    } else {
        return null;
    }
}

export async function addPurchase(purchase: Omit<Purchase, 'id'>): Promise<DocumentData> {
    // Firestore SDK handles plain JS objects and Date objects correctly.
    // No need to sanitize before writing.
    return await addDoc(purchasesCollection, purchase);
}

export async function deletePurchase(id: string): Promise<void> {
    const docRef = doc(db, 'purchases', id);
    await deleteDoc(docRef);
}
