
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type Sale } from '@/lib/data';

const salesCollection = collection(db, 'sales');

export async function getSales(): Promise<Sale[]> {
  const snapshot = await getDocs(salesCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          date: docData.date?.toDate ? docData.date.toDate().toISOString() : docData.date,
          invoiceNo: docData.invoiceNo,
          customerName: docData.customerName,
          contactNumber: docData.contactNumber,
          location: docData.location,
          paymentStatus: docData.paymentStatus,
          paymentMethod: docData.paymentMethod,
          totalAmount: docData.totalAmount,
          totalPaid: docData.totalPaid,
          sellDue: docData.sellDue,
          sellReturnDue: docData.sellReturnDue,
          shippingStatus: docData.shippingStatus,
          totalItems: docData.totalItems,
          addedBy: docData.addedBy,
          sellNote: docData.sellNote,
          staffNote: docData.staffNote,
          shippingDetails: docData.shippingDetails,
          taxAmount: docData.taxAmount,
          items: docData.items,
      } as Sale;
  });
  return data;
}

export async function getSale(id: string): Promise<Sale | null> {
    const docRef = doc(db, 'sales', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const docData = docSnap.data();
        return {
            id: docSnap.id,
            date: docData.date?.toDate ? docData.date.toDate().toISOString() : docData.date,
            invoiceNo: docData.invoiceNo,
            customerName: docData.customerName,
            contactNumber: docData.contactNumber,
            location: docData.location,
            paymentStatus: docData.paymentStatus,
            paymentMethod: docData.paymentMethod,
            totalAmount: docData.totalAmount,
            totalPaid: docData.totalPaid,
            sellDue: docData.sellDue,
            sellReturnDue: docData.sellReturnDue,
            shippingStatus: docData.shippingStatus,
            totalItems: docData.totalItems,
            addedBy: docData.addedBy,
            sellNote: docData.sellNote,
            staffNote: docData.staffNote,
            shippingDetails: docData.shippingDetails,
            taxAmount: docData.taxAmount,
            items: docData.items,
        } as Sale;
    } else {
        return null;
    }
}

export async function addSale(sale: Omit<Sale, 'id'>): Promise<void> {
    await addDoc(salesCollection, sale);
}

export async function deleteSale(id: string): Promise<void> {
    const docRef = doc(db, 'sales', id);
    await deleteDoc(docRef);
}
