'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData } from 'firebase/firestore';
import { type Supplier } from '@/lib/data';

const suppliersCollection = collection(db, 'suppliers');

export async function getSuppliers(): Promise<Supplier[]> {
  const snapshot = await getDocs(suppliersCollection);
  return snapshot.docs.map(doc => {
    const data = { id: doc.id, ...doc.data() };
    return JSON.parse(JSON.stringify(data)) as Supplier;
  });
}

export async function addSupplier(supplier: Omit<Supplier, 'id'>): Promise<DocumentData> {
    return await addDoc(suppliersCollection, supplier);
}
