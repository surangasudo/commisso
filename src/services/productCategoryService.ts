
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { unstable_noStore as noStore } from 'next/cache';

export type ProductCategory = {
  id: string;
  name: string;
  code: string;
  parentId?: string | null;
};

const productCategoriesCollection = collection(db, 'productCategories');

// Default categories to seed
const defaultCategories: Omit<ProductCategory, 'id'>[] = [
    { name: 'Electronics', code: 'ELEC' },
    { name: 'Clothing', code: 'CLOTH' },
    { name: 'Groceries', code: 'GROC' },
    { name: 'Books', code: 'BOOK' },
    { name: 'Sports', code: 'SPORT' },
    { name: 'Shoes', code: 'SHOE' },
];

async function seedDefaultCategories(): Promise<void> {
    const batch = db.batch();
    for (const category of defaultCategories) {
        const docRef = doc(productCategoriesCollection);
        batch.set(docRef, category);
    }
    await batch.commit();
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  noStore();
  let snapshot = await getDocs(productCategoriesCollection);

  // If the collection is empty, seed it with default data and re-fetch
  if (snapshot.empty) {
      await seedDefaultCategories();
      snapshot = await getDocs(productCategoriesCollection);
  }

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
