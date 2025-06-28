
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type Purchase } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

const purchasesCollection = collection(db, 'purchases');

export async function getPurchases(): Promise<Purchase[]> {
  noStore();
  const snapshot = await getDocs(purchasesCollection);
  return snapshot.docs.map(doc => processDoc<Purchase>(doc));
}

export async function getPurchase(id: string): Promise<Purchase | null> {
    noStore();
    const docRef = doc(db, 'purchases', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return processDoc<Purchase>(docSnap);
    } else {
        return null;
    }
}

export async function addPurchase(purchase: Omit<Purchase, 'id'>): Promise<void> {
    const dataToSave = {
        ...purchase,
        date: new Date(purchase.date),
    };
    await addDoc(purchasesCollection, dataToSave);
}

export async function deletePurchase(id: string): Promise<void> {
    const docRef = doc(db, 'purchases', id);
    await deleteDoc(docRef);
}
