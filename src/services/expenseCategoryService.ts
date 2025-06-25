'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData, Timestamp } from 'firebase/firestore';
import { type ExpenseCategory } from '@/lib/data';

const expenseCategoriesCollection = collection(db, 'expenseCategories');

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

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const snapshot = await getDocs(expenseCategoriesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...sanitizeData(doc.data()) } as ExpenseCategory));
}

export async function addExpenseCategory(category: Omit<ExpenseCategory, 'id'>): Promise<DocumentData> {
    const categoryData = JSON.parse(JSON.stringify(category));
    return await addDoc(expenseCategoriesCollection, categoryData);
}

export async function updateExpenseCategory(id: string, category: Partial<Omit<ExpenseCategory, 'id'>>): Promise<void> {
    const docRef = doc(db, 'expenseCategories', id);
    const categoryData = JSON.parse(JSON.stringify(category));
    await updateDoc(docRef, categoryData);
}

export async function deleteExpenseCategory(id: string): Promise<void> {
    const docRef = doc(db, 'expenseCategories', id);
    await deleteDoc(docRef);
}
