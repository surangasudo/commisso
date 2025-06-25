
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, DocumentData } from 'firebase/firestore';
import { type DetailedProduct } from '@/lib/data';

const productsCollection = collection(db, 'products');

export async function getProducts(): Promise<DetailedProduct[]> {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => {
        const data = JSON.parse(JSON.stringify(doc.data()));
        return { id: doc.id, ...data } as DetailedProduct
    });
}

export async function addProduct(product: Omit<DetailedProduct, 'id'>): Promise<DocumentData> {
    const productData = JSON.parse(JSON.stringify(product));
    return await addDoc(productsCollection, productData);
}

export async function deleteProduct(productId: string): Promise<void> {
    const productDoc = doc(db, 'products', productId);
    await deleteDoc(productDoc);
}
