'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type DetailedProduct } from '@/lib/data';
import { sanitizeForClient } from '@/lib/firestore-utils';

const productsCollection = collection(db, 'products');

export async function getProducts(): Promise<DetailedProduct[]> {
    const snapshot = await getDocs(productsCollection);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return sanitizeForClient<DetailedProduct[]>(data);
}

export async function addProduct(product: Omit<DetailedProduct, 'id'>): Promise<DocumentData> {
    return await addDoc(productsCollection, product);
}

export async function deleteProduct(productId: string): Promise<void> {
    const productDoc = doc(db, 'products', productId);
    await deleteDoc(productDoc);
}
