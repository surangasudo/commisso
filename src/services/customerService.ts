
// use server removed

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData, runTransaction, query, where } from 'firebase/firestore';
import { type Customer } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';

const customersCollection = collection(db, 'customers');

export async function getCustomers(businessId?: string): Promise<Customer[]> {
  noStore();
  let q = query(customersCollection);
  if (businessId) {
    q = query(customersCollection, where('businessId', '==', businessId));
  }
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => processDoc<Customer>(doc));
  return data;
}

export async function addCustomer(customer: Omit<Customer, 'id'>, businessId?: string, prefix?: string): Promise<void> {
  const dataToSave = {
    ...customer,
    businessId: businessId || null
  };

  if (prefix) {
    await runTransaction(db, async (transaction) => {
      const counterRef = doc(db, 'counters', `customer_${prefix}`);
      const counterDoc = await transaction.get(counterRef);

      let nextCount = 1;
      if (counterDoc.exists()) {
        nextCount = counterDoc.data().count + 1;
      }

      const sequencePart = nextCount.toString().padStart(4, '0');
      const customId = `${prefix}-${sequencePart}`;

      const newDocRef = doc(customersCollection, customId);

      if (counterDoc.exists()) {
        transaction.update(counterRef, { count: nextCount });
      } else {
        transaction.set(counterRef, { count: nextCount });
      }

      transaction.set(newDocRef, { ...dataToSave, id: customId });
    });
  } else {
    await addDoc(customersCollection, dataToSave);
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  const docRef = doc(db, 'customers', id);
  await deleteDoc(docRef);
}
