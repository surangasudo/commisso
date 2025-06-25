'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type Purchase } from '@/lib/data';

function sanitizeData(data: any): any {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitizedObject: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      sanitizedObject[key] = sanitizeData(data[key]);
    }
  }
  return sanitizedObject;
}

const purchasesCollection = collection(db, 'purchases');

export async function getPurchases(): Promise<Purchase[]> {
  const snapshot = await getDocs(purchasesCollection);
  return snapshot.docs.map(doc => {
    const data = sanitizeData(doc.data());
    return { id: doc.id, ...data } as Purchase;
  });
}

export async function getPurchase(id: string): Promise<Purchase | null> {
    const docRef = doc(db, 'purchases', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = sanitizeData(docSnap.data());
        return { id: docSnap.id, ...data } as Purchase;
    } else {
        return null;
    }
}

export async function addPurchase(purchase: Omit<Purchase, 'id'>): Promise<DocumentData> {
    const purchaseData = JSON.parse(JSON.stringify(purchase));
    return await addDoc(purchasesCollection, purchaseData);
}

export async function deletePurchase(id: string): Promise<void> {
    const docRef = doc(db, 'purchases', id);
    await deleteDoc(docRef);
}
