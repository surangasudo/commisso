'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';

export type ProductCategory = {
  id: string;
  name: string;
  code: string;
  parentId?: string | null;
};

const productCategoriesCollection = collection(db, 'productCategories');

export async function getProductCategories(): Promise<ProductCategory[]> {
  const snapshot = await getDocs(productCategoriesCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          name: docData.name || '',
          code: docData.code || '',
          parentId: docData.parentId || null
      } as ProductCategory;
  });
  return data;
}

export async function addProductCategory(category: Omit<ProductCategory, 'id'>): Promise<void> {
    await addDoc(productCategoriesCollection, category);
}

export async function updateProductCategory(id: string, category: Partial<Omit<ProductCategory, 'id'>>): Promise<void> {
    const docRef = doc(db, 'productCategories', id);
    await updateDoc(docRef, category);
}

export async function deleteProductCategory(id: string): Promise<void> {
    const docRef = doc(db, 'productCategories', id);
    await deleteDoc(docRef);
}
