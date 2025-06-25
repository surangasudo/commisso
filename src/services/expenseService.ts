'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { type Expense } from '@/lib/data';

const expensesCollection = collection(db, 'expenses');

export async function getExpenses(): Promise<Expense[]> {
  const snapshot = await getDocs(expensesCollection);
  return snapshot.docs.map(doc => {
    const data = { id: doc.id, ...doc.data() };
    return JSON.parse(JSON.stringify(data)) as Expense;
  });
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<DocumentData> {
    return await addDoc(expensesCollection, expense);
}

export async function deleteExpense(expenseId: string): Promise<void> {
    const expenseDoc = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseDoc);
}
