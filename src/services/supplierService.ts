
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type Supplier } from '@/lib/data';

const suppliersCollection = collection(db, 'suppliers');

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

export async function getSuppliers(): Promise<Supplier[]> {
  const snapshot = await getDocs(suppliersCollection);
  return snapshot.docs.map(doc => {
    return { id: doc.id, ...sanitizeData(doc.data()) } as Supplier;
  });
}

export async function addSupplier(supplier: Omit<Supplier, 'id'>): Promise<DocumentData> {
    const supplierData = JSON.parse(JSON.stringify(supplier));
    return await addDoc(suppliersCollection, supplierData);
}
