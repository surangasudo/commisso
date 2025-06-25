
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type Customer } from '@/lib/data';

const customersCollection = collection(db, 'customers');

const sanitizeData = (docData: DocumentData) => {
    const data = { ...docData };
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (data[key] instanceof Timestamp) {
          data[key] = data[key].toDate().toISOString();
        }
      }
    }
    return data;
}

export async function getCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(customersCollection);
  return snapshot.docs.map(doc => {
    return { id: doc.id, ...sanitizeData(doc.data()) } as Customer;
  });
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<DocumentData> {
    const customerData = JSON.parse(JSON.stringify(customer));
    return await addDoc(customersCollection, customerData);
}
