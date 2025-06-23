
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData } from 'firebase/firestore';
import { type Customer } from '@/lib/data';

const customersCollection = collection(db, 'customers');

export async function getCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(customersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<DocumentData> {
    const customerData = JSON.parse(JSON.stringify(customer));
    return await addDoc(customersCollection, customerData);
}
