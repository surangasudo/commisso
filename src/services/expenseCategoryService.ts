
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type ExpenseCategory } from '@/lib/data';
import { unstable_noStore as noStore } from 'next/cache';
import { processDoc } from '@/lib/firestore-utils';

const expenseCategoriesCollection = collection(db, 'expenseCategories');

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  noStore();
  const snapshot = await getDocs(expenseCategoriesCollection);
  const data = snapshot.docs.map(doc => processDoc<ExpenseCategory>(doc));
  return data;
}

export async function addExpenseCategory(category: Omit<ExpenseCategory, 'id'>): Promise<void> {
    await addDoc(expenseCategoriesCollection, category);
}

export async function updateExpenseCategory(id: string, category: Partial<Omit<ExpenseCategory, 'id'>>): Promise<void> {
    const docRef = doc(db, 'expenseCategories', id);
    await updateDoc(docRef, category);
}

export async function deleteExpenseCategory(id: string): Promise<void> {
    const docRef = doc(db, 'expenseCategories', id);
    await deleteDoc(docRef);
}
