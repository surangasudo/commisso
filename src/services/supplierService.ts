
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type Supplier } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';

const suppliersCollection = collection(db, 'suppliers');

export async function getSuppliers(): Promise<Supplier[]> {
  noStore();
  const snapshot = await getDocs(suppliersCollection);
  const data = snapshot.docs.map(doc => processDoc<Supplier>(doc));
  return data;
}

export async function addSupplier(supplier: Omit<Supplier, 'id'>): Promise<void> {
    await addDoc(suppliersCollection, supplier);
}

export async function deleteSupplier(id: string): Promise<void> {
    const docRef = doc(db, 'suppliers', id);
    await deleteDoc(docRef);
}
