'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type Sale } from '@/lib/data';
import { sanitizeForClient } from '@/lib/firestore-utils';

const salesCollection = collection(db, 'sales');

export async function getSales(): Promise<Sale[]> {
  const snapshot = await getDocs(salesCollection);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return sanitizeForClient<Sale[]>(data);
}

export async function getSale(id: string): Promise<Sale | null> {
    const docRef = doc(db, 'sales', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        return sanitizeForClient<Sale>(data);
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
