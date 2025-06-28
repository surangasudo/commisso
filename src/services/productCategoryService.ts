
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';

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
