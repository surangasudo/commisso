'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type DetailedProduct } from '@/lib/data';

const productsCollection = collection(db, 'products');

export async function getProducts(): Promise<DetailedProduct[]> {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        return JSON.parse(JSON.stringify(data)) as DetailedProduct;
    });
}

export async function addProduct(product: Omit<DetailedProduct, 'id'>): Promise<DocumentData> {
    return await addDoc(productsCollection, product);
}

export async function deleteProduct(productId: string): Promise<void> {
    const productDoc = doc(db, 'products', productId);
    await deleteDoc(productDoc);
}
