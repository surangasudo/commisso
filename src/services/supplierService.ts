
// use server removed

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData, query, where } from 'firebase/firestore';
import { type Supplier } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';

const suppliersCollection = collection(db, 'suppliers');

export async function getSuppliers(businessId?: string): Promise<Supplier[]> {
  noStore();
  let q = query(suppliersCollection);
  if (businessId) {
    q = query(suppliersCollection, where('businessId', '==', businessId));
  }
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => processDoc<Supplier>(doc));
  return data;
}

export async function addSupplier(supplier: Omit<Supplier, 'id'>, businessId?: string): Promise<void> {
  await addDoc(suppliersCollection, {
    ...supplier,
    businessId: businessId || null
  });
}

export async function deleteSupplier(id: string): Promise<void> {
  const docRef = doc(db, 'suppliers', id);
  await deleteDoc(docRef);
}
