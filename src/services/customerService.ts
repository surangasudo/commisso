
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type Customer } from '@/lib/data';

const customersCollection = collection(db, 'customers');

export async function getCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(customersCollection);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (value instanceof Timestamp) {
          data[key] = value.toDate().toISOString();
        }
      }
    }
    return { id: doc.id, ...data } as Customer;
  });
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<DocumentData> {
    const customerData = JSON.parse(JSON.stringify(customer));
    return await addDoc(customersCollection, customerData);
}
