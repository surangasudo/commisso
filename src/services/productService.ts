'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type DetailedProduct } from '@/lib/data';

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

const productsCollection = collection(db, 'products');

export async function getProducts(): Promise<DetailedProduct[]> {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => {
        const data = sanitizeData(doc.data());
        return { id: doc.id, ...data } as DetailedProduct
    });
}

export async function addProduct(product: Omit<DetailedProduct, 'id'>): Promise<DocumentData> {
    const productData = JSON.parse(JSON.stringify(product));
    return await addDoc(productsCollection, productData);
}

export async function deleteProduct(productId: string): Promise<void> {
    const productDoc = doc(db, 'products', productId);
    await deleteDoc(productDoc);
}
