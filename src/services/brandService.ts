
// use server removed

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';

export type Brand = {
  id: string;
  name: string;
};

const brandsCollection = collection(db, 'brands');

export async function getBrands(): Promise<Brand[]> {
  noStore();
  const snapshot = await getDocs(brandsCollection);
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
