
// use server removed

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type DetailedProduct } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';

const productsCollection = collection(db, 'products');

export async function getProducts(): Promise<DetailedProduct[]> {
    noStore();
    const snapshot = await getDocs(productsCollection);
    const data = snapshot.docs.map(doc => processDoc<DetailedProduct>(doc));
    return data;
}

export async function getProduct(id: string): Promise<DetailedProduct | null> {
    noStore();
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = processDoc<DetailedProduct>(docSnap)
        return data;
    } else {
        return null;
    }
}

export async function addProduct(product: Omit<DetailedProduct, 'id'>): Promise<void> {
    await addDoc(productsCollection, product);
}

export async function updateProduct(id: string, product: Partial<Omit<DetailedProduct, 'id'>>): Promise<void> {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, product);
}

export async function deleteProduct(productId: string): Promise<void> {
    const productDoc = doc(db, 'products', productId);
    await deleteDoc(productDoc);
}
