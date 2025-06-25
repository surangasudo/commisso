'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type Sale } from '@/lib/data';

function sanitizeData(data: any): any {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Firestore Timestamps have a toDate method
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

const salesCollection = collection(db, 'sales');

export async function getSales(): Promise<Sale[]> {
  const snapshot = await getDocs(salesCollection);
  return snapshot.docs.map(doc => {
    const data = sanitizeData(doc.data());
    return { id: doc.id, ...data } as Sale;
  });
}

export async function getSale(id: string): Promise<Sale | null> {
    const docRef = doc(db, 'sales', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = sanitizeData(docSnap.data());
        return { id: docSnap.id, ...data } as Sale;
    } else {
        return null;
    }
}

export async function addSale(sale: Omit<Sale, 'id'>): Promise<DocumentData> {
    const saleData = JSON.parse(JSON.stringify(sale));
    return await addDoc(salesCollection, saleData);
}

export async function deleteSale(id: string): Promise<void> {
    const docRef = doc(db, 'sales', id);
    await deleteDoc(docRef);
}
