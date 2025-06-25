
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, DocumentData, Timestamp } from 'firebase/firestore';
import { type DetailedProduct } from '@/lib/data';

const productsCollection = collection(db, 'products');

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

export async function getProducts(): Promise<DetailedProduct[]> {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...sanitizeData(doc.data()) } as DetailedProduct));
}

export async function addProduct(product: Omit<DetailedProduct, 'id'>): Promise<DocumentData> {
    // Firestore doesn't like undefined values, so let's clean the object
    const productData = JSON.parse(JSON.stringify(product));
    return await addDoc(productsCollection, productData);
}

export async function deleteProduct(productId: string): Promise<void> {
    const productDoc = doc(db, 'products', productId);
    await deleteDoc(productDoc);
}
