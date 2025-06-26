
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type Supplier } from '@/lib/data';

const suppliersCollection = collection(db, 'suppliers');

export async function getSuppliers(): Promise<Supplier[]> {
  const snapshot = await getDocs(suppliersCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          contactId: docData.contactId,
          businessName: docData.businessName,
          name: docData.name,
          email: docData.email,
          taxNumber: docData.taxNumber,
          payTerm: docData.payTerm,
          openingBalance: docData.openingBalance,
          advanceBalance: docData.advanceBalance,
          addedOn: docData.addedOn?.toDate ? docData.addedOn.toDate().toISOString() : docData.addedOn,
          address: docData.address,
          mobile: docData.mobile,
          totalPurchaseDue: docData.totalPurchaseDue,
          totalPurchaseReturnDue: docData.totalPurchaseReturnDue,
          customField1: docData.customField1,
      } as Supplier;
  });
  return data;
}

export async function addSupplier(supplier: Omit<Supplier, 'id'>): Promise<DocumentData> {
    return await addDoc(suppliersCollection, supplier);
}

export async function deleteSupplier(id: string): Promise<void> {
    const docRef = doc(db, 'suppliers', id);
    await deleteDoc(docRef);
}
