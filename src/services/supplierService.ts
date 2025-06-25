'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData } from 'firebase/firestore';
import { type Supplier } from '@/lib/data';
import { sanitizeForClient } from '@/lib/firestore-utils';

const suppliersCollection = collection(db, 'suppliers');

export async function getSuppliers(): Promise<Supplier[]> {
  const snapshot = await getDocs(suppliersCollection);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return sanitizeForClient<Supplier[]>(data);
}

export async function addSupplier(supplier: Omit<Supplier, 'id'>): Promise<DocumentData> {
    return await addDoc(suppliersCollection, supplier);
}
