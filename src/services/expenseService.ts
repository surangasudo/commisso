'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type Expense } from '@/lib/data';

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

const expensesCollection = collection(db, 'expenses');

export async function getExpenses(): Promise<Expense[]> {
  const snapshot = await getDocs(expensesCollection);
  return snapshot.docs.map(doc => {
    const data = sanitizeData(doc.data());
    return { id: doc.id, ...data } as Expense;
  });
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<DocumentData> {
    const expenseData = JSON.parse(JSON.stringify(expense));
    return await addDoc(expensesCollection, expenseData);
}

export async function deleteExpense(expenseId: string): Promise<void> {
    const expenseDoc = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseDoc);
}
