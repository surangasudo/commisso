'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData, Timestamp } from 'firebase/firestore';
import { type Expense } from '@/lib/data';

const expensesCollection = collection(db, 'expenses');

export async function getExpenses(): Promise<Expense[]> {
  const snapshot = await getDocs(expensesCollection);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (value instanceof Timestamp) {
          data[key] = value.toDate().toISOString();
        }
      }
    }
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
