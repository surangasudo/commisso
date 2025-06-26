
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type ExpenseCategory } from '@/lib/data';

const expenseCategoriesCollection = collection(db, 'expenseCategories');

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const snapshot = await getDocs(expenseCategoriesCollection);
  const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
          id: doc.id,
          name: docData.name,
          code: docData.code,
          parentId: docData.parentId
      } as ExpenseCategory;
  });
  return data;
}

export async function addExpenseCategory(category: Omit<ExpenseCategory, 'id'>): Promise<DocumentData> {
    return await addDoc(expenseCategoriesCollection, category);
}

export async function updateExpenseCategory(id: string, category: Partial<Omit<ExpenseCategory, 'id'>>): Promise<void> {
    const docRef = doc(db, 'expenseCategories', id);
    await updateDoc(docRef, category);
}

export async function deleteExpenseCategory(id: string): Promise<void> {
    const docRef = doc(db, 'expenseCategories', id);
    await deleteDoc(docRef);
}
