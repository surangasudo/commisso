
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type DetailedProduct } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';

const productsCollection = collection(db, 'products');

export async function getProducts(): Promise<DetailedProduct[]> {
    noStore();
    const snapshot = await getDocs(productsCollection);
    const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
            id: doc.id,
            image: docData.image || '',
            name: docData.name || '',
            businessLocation: docData.businessLocation || '',
            unitPurchasePrice: docData.unitPurchasePrice || 0,
            sellingPrice: docData.sellingPrice || 0,
            currentStock: docData.currentStock || 0,
            productType: docData.productType || 'Single',
            category: docData.category || '',
            brand: docData.brand || '',
            tax: docData.tax || '',
            sku: docData.sku || '',
            unit: docData.unit || 'Pieces',
            totalUnitSold: docData.totalUnitSold || 0,
            totalUnitTransferred: docData.totalUnitTransferred || 0,
            totalUnitAdjusted: docData.totalUnitAdjusted || 0,
        } as DetailedProduct;
    });
    return data;
}

export async function getProduct(id: string): Promise<DetailedProduct | null> {
    noStore();
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const docData = docSnap.data();
        const data = {
            id: docSnap.id,
            image: docData.image || '',
            name: docData.name || '',
            businessLocation: docData.businessLocation || '',
            unitPurchasePrice: docData.unitPurchasePrice || 0,
            sellingPrice: docData.sellingPrice || 0,
            currentStock: docData.currentStock || 0,
            productType: docData.productType || 'Single',
            category: docData.category || '',
            brand: docData.brand || '',
            tax: docData.tax || '',
            sku: docData.sku || '',
            unit: docData.unit || 'Pieces',
            totalUnitSold: docData.totalUnitSold || 0,
            totalUnitTransferred: docData.totalUnitTransferred || 0,
            totalUnitAdjusted: docData.totalUnitAdjusted || 0,
        } as DetailedProduct;
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
