
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
          invoiceNo: docData.invoiceNo || '',
          customerName: docData.customerName || '',
          contactNumber: docData.contactNumber || '',
          location: docData.location || '',
          paymentStatus: docData.paymentStatus || 'Due',
          paymentMethod: docData.paymentMethod || '',
          totalAmount: docData.totalAmount || 0,
          totalPaid: docData.totalPaid || 0,
          sellDue: docData.sellDue || 0,
          sellReturnDue: docData.sellReturnDue || 0,
          shippingStatus: docData.shippingStatus || null,
          totalItems: docData.totalItems || 0,
          addedBy: docData.addedBy || '',
          sellNote: docData.sellNote || null,
          staffNote: docData.staffNote || null,
          shippingDetails: docData.shippingDetails || null,
          taxAmount: docData.taxAmount || 0,
          items: docData.items || [],
          commissionAgentIds: docData.commissionAgentIds || null,
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
            invoiceNo: docData.invoiceNo || '',
            customerName: docData.customerName || '',
            contactNumber: docData.contactNumber || '',
            location: docData.location || '',
            paymentStatus: docData.paymentStatus || 'Due',
            paymentMethod: docData.paymentMethod || '',
            totalAmount: docData.totalAmount || 0,
            totalPaid: docData.totalPaid || 0,
            sellDue: docData.sellDue || 0,
            sellReturnDue: docData.sellReturnDue || 0,
            shippingStatus: docData.shippingStatus || null,
            totalItems: docData.totalItems || 0,
            addedBy: docData.addedBy || '',
            sellNote: docData.sellNote || null,
            staffNote: docData.staffNote || null,
            shippingDetails: docData.shippingDetails || null,
            taxAmount: docData.taxAmount || 0,
            items: docData.items || [],
            commissionAgentIds: docData.commissionAgentIds || null,
        } as Sale;
    } else {
        return null;
    }
}

export async function addSale(sale: Omit<Sale, 'id'>) {
    await addDoc(salesCollection, sale);
}

export async function deleteSale(id: string): Promise<void> {
    const docRef = doc(db, 'sales', id);
    await deleteDoc(docRef);
}
