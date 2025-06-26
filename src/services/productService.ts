
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type DetailedProduct } from '@/lib/data';

const productsCollection = collection(db, 'products');

export async function getProducts(): Promise<DetailedProduct[]> {
    const snapshot = await getDocs(productsCollection);
    const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
            id: doc.id,
            image: docData.image,
            name: docData.name,
            businessLocation: docData.businessLocation,
            unitPurchasePrice: docData.unitPurchasePrice,
            sellingPrice: docData.sellingPrice,
            currentStock: docData.currentStock,
            productType: docData.productType,
            category: docData.category,
            brand: docData.brand,
            tax: docData.tax,
            sku: docData.sku,
            unit: docData.unit,
            totalUnitSold: docData.totalUnitSold,
            totalUnitTransferred: docData.totalUnitTransferred,
            totalUnitAdjusted: docData.totalUnitAdjusted,
        } as DetailedProduct;
    });
    return data;
}

export async function getProduct(id: string): Promise<DetailedProduct | null> {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const docData = docSnap.data();
        const data = {
            id: docSnap.id,
            image: docData.image,
            name: docData.name,
            businessLocation: docData.businessLocation,
            unitPurchasePrice: docData.unitPurchasePrice,
            sellingPrice: docData.sellingPrice,
            currentStock: docData.currentStock,
            productType: docData.productType,
            category: docData.category,
            brand: docData.brand,
            tax: docData.tax,
            sku: docData.sku,
            unit: docData.unit,
            totalUnitSold: docData.totalUnitSold,
            totalUnitTransferred: docData.totalUnitTransferred,
            totalUnitAdjusted: docData.totalUnitAdjusted,
        } as DetailedProduct;
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
