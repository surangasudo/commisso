
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type Supplier } from '@/lib/data';

const suppliersCollection = collection(db, 'suppliers');

export async function getSuppliers(): Promise<Supplier[]> {
  const snapshot = await getDocs(suppliersCollection);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            if (data[key] instanceof Timestamp) {
                data[key] = data[key].toDate().toISOString();
            }
        }
    }
    return { id: doc.id, ...data } as Supplier;
  });
}

export async function addSupplier(supplier: Omit<Supplier, 'id'>): Promise<DocumentData> {
    const supplierData = JSON.parse(JSON.stringify(supplier));
    return await addDoc(suppliersCollection, supplierData);
}
