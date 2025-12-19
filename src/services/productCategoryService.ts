
// use server removed

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';
import { type ProductCategory } from '@/lib/data';

const productCategoriesCollection = collection(db, 'productCategories');

export async function getProductCategories(): Promise<ProductCategory[]> {
  noStore();
  const snapshot = await getDocs(productCategoriesCollection);

  // Manually construct plain objects to ensure they are serializable
  const data: ProductCategory[] = snapshot.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name,
      code: d.code,
      parentId: d.parentId || null,
    };
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
