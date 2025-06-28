
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';

export type Brand = {
  id: string;
  name: string;
};

const brandsCollection = collection(db, 'brands');

// Default brands to seed
const defaultBrands: Omit<Brand, 'id'>[] = [
    { name: 'Apple' },
    { name: 'Nike' },
    { name: 'Sony' },
    { name: 'Generic' },
    { name: 'Puma' },
];

async function seedDefaultBrands(): Promise<void> {
    for (const brand of defaultBrands) {
        await addDoc(brandsCollection, brand);
    }
}

export async function getBrands(): Promise<Brand[]> {
  noStore();
  let snapshot = await getDocs(brandsCollection);

  // If the collection is empty, seed it with default data and re-fetch
  if (snapshot.empty) {
    await seedDefaultBrands();
    snapshot = await getDocs(brandsCollection);
  }

  const data = snapshot.docs.map(doc => processDoc<Brand>(doc));
  return data;
}

export async function addBrand(brand: Omit<Brand, 'id'>): Promise<void> {
    await addDoc(brandsCollection, brand);
}

export async function updateBrand(id: string, brand: Partial<Omit<Brand, 'id'>>): Promise<void> {
    const docRef = doc(db, 'brands', id);
    await updateDoc(docRef, brand);
}

export async function deleteBrand(id: string): Promise<void> {
    const docRef = doc(db, 'brands', id);
    await deleteDoc(docRef);
}
