'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type ExpenseCategory } from '@/lib/data';

function sanitizeData(data: any): any {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Firestore Timestamps have a toDate method
  if (typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitizedObject: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      sanitizedObject[key] = sanitizeData(data[key]);
    }
  }
  return sanitizedObject;
}

const expenseCategoriesCollection = collection(db, 'expenseCategories');

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const snapshot = await getDocs(expenseCategoriesCollection);
  return snapshot.docs.map(doc => {
    const data = sanitizeData(doc.data());
    return { id: doc.id, ...data } as ExpenseCategory
  });
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
