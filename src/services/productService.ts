'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type DetailedProduct } from '@/lib/data';

const productsCollection = collection(db, 'products');

export async function getProducts(): Promise<DetailedProduct[]> {
    const snapshot = await getDocs(productsCollection);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DetailedProduct[];
    return data;
}

export async function getProduct(id: string): Promise<DetailedProduct | null> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as DetailedProduct;
        return data;
    } else {
        return null;
    }
}

export async function addProduct(product: Omit<DetailedProduct, 'id'>): Promise<DocumentData> {
    return await addDoc(productsCollection, product);
}

export async function updateProduct(id: string, product: Partial<Omit<DetailedProduct, 'id'>>): Promise<void> {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, product);
}

export async function deleteProduct(productId: string): Promise<void> {
    const productDoc = doc(db, 'products', productId);
    await deleteDoc(productDoc);
}
