
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, DocumentData, runTransaction } from 'firebase/firestore';
import { type Purchase } from '@/lib/data';
import { processDoc } from '@/lib/firestore-utils';
import { unstable_noStore as noStore } from 'next/cache';

const purchasesCollection = collection(db, 'purchases');

export async function getPurchases(): Promise<Purchase[]> {
  noStore();
  const snapshot = await getDocs(purchasesCollection);
  return snapshot.docs.map(doc => processDoc<Purchase>(doc));
}

export async function getPurchase(id: string): Promise<Purchase | null> {
    noStore();
    const docRef = doc(db, 'purchases', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return processDoc<Purchase>(docSnap);
    } else {
        return null;
    }
}

export async function addPurchase(purchase: Omit<Purchase, 'id'>): Promise<void> {
    const dataToSave = {
        ...purchase,
        date: new Date(purchase.date),
    };
    
    await runTransaction(db, async (transaction) => {
        const supplierRef = doc(db, 'suppliers', purchase.supplierId);
        const supplierDoc = await transaction.get(supplierRef);
        if (!supplierDoc.exists()) {
            throw new Error(`Supplier with ID ${purchase.supplierId} not found.`);
        }

        const newPurchaseRef = doc(collection(db, 'purchases'));
        transaction.set(newPurchaseRef, dataToSave);
        
        const currentDue = supplierDoc.data().totalPurchaseDue || 0;
        transaction.update(supplierRef, {
            totalPurchaseDue: currentDue + purchase.paymentDue
        });

        for (const item of purchase.items) {
            const productRef = doc(db, 'products', item.productId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
                throw new Error(`Product not found: ${item.productId}`);
            }
            const currentStock = productDoc.data().currentStock || 0;
            transaction.update(productRef, {
                currentStock: currentStock + item.quantity
            });
        }
    });
}

export async function deletePurchase(id: string): Promise<void> {
    const docRef = doc(db, 'purchases', id);
    await deleteDoc(docRef);
}
