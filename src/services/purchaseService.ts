
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type Purchase } from '@/lib/data';

const purchasesCollection = collection(db, 'purchases');

export async function getPurchases(): Promise<Purchase[]> {
  const snapshot = await getDocs(purchasesCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          date: docData.date,
          referenceNo: docData.referenceNo,
          location: docData.location,
          supplier: docData.supplier,
          purchaseStatus: docData.purchaseStatus,
          paymentStatus: docData.paymentStatus,
          grandTotal: docData.grandTotal,
          paymentDue: docData.paymentDue,
          addedBy: docData.addedBy,
          items: docData.items || [],
          taxAmount: docData.taxAmount,
      } as Purchase;
  });
  return data;
}

export async function getPurchase(id: string): Promise<Purchase | null> {
    const docRef = doc(db, 'purchases', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const docData = docSnap.data();
        return {
            id: docSnap.id,
            date: docData.date,
            referenceNo: docData.referenceNo,
            location: docData.location,
            supplier: docData.supplier,
            purchaseStatus: docData.purchaseStatus,
            paymentStatus: docData.paymentStatus,
            grandTotal: docData.grandTotal,
            paymentDue: docData.paymentDue,
            addedBy: docData.addedBy,
            items: docData.items || [],
            taxAmount: docData.taxAmount,
        } as Purchase;
    } else {
        return null;
    }
}

export async function addPurchase(purchase: Omit<Purchase, 'id'>): Promise<void> {
    await addDoc(purchasesCollection, purchase);
}

export async function deletePurchase(id: string): Promise<void> {
    const docRef = doc(db, 'purchases', id);
    await deleteDoc(docRef);
}
