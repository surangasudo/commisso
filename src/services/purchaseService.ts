'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type Purchase } from '@/lib/data';

const purchasesCollection = collection(db, 'purchases');

export async function getPurchases(): Promise<Purchase[]> {
  const snapshot = await getDocs(purchasesCollection);
  return snapshot.docs.map(doc => {
    const data = { id: doc.id, ...doc.data() };
    return JSON.parse(JSON.stringify(data)) as Purchase;
  });
}

export async function getPurchase(id: string): Promise<Purchase | null> {
    const docRef = doc(db, 'purchases', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        return JSON.parse(JSON.stringify(data)) as Purchase;
    } else {
        return null;
    }
}

export async function addPurchase(purchase: Omit<Purchase, 'id'>): Promise<DocumentData> {
    return await addDoc(purchasesCollection, purchase);
}

export async function deletePurchase(id: string): Promise<void> {
    const docRef = doc(db, 'purchases', id);
    await deleteDoc(docRef);
}
