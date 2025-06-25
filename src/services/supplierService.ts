'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type Supplier } from '@/lib/data';

function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  if (typeof data === 'object' && data.constructor === Object) {
    const sanitizedObject: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObject[key] = sanitizeData(data[key]);
      }
    }
    return sanitizedObject;
  }
  return data;
}

const suppliersCollection = collection(db, 'suppliers');

export async function getSuppliers(): Promise<Supplier[]> {
  const snapshot = await getDocs(suppliersCollection);
  return snapshot.docs.map(doc => {
    const data = sanitizeData(doc.data());
    return { id: doc.id, ...data } as Supplier;
  });
}

export async function addSupplier(supplier: Omit<Supplier, 'id'>): Promise<DocumentData> {
    const supplierData = JSON.parse(JSON.stringify(supplier));
    return await addDoc(suppliersCollection, supplierData);
}
